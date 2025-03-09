import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";
import { NextApiRequest, NextApiResponse } from "next";
import { createAgent } from "../../../frontend_agent/agentHelpers";
import { prisma } from '@/app/helper/PrismaHelper';
import { HumanMessage } from "@langchain/core/messages";
import { Coinbase } from "@coinbase/coinbase-sdk/dist/coinbase/coinbase";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { walletData, text, isOnchain, chain } = req.body;

    const wallet = await prisma.arbitrumWallets.findFirst({
        where: {
            wallet_address: walletData
        },
        select: {
            private_key: true,
            mnemonic: true
        }
    });

    if (!wallet) {
        return res.status(400).json({ error: 'Wallet not found' });
    }

    // Initialize CDP AgentKit
    const config = {
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        mnemonicPhrase: wallet.mnemonic ?? undefined,
        networkId: chain === 'base' ? Coinbase.networks.BaseMainnet : Coinbase.networks.EthereumMainnet,
    };
    const agentkit = await CdpAgentkit.configureWithWallet(config);
    const cdpToolkit = new CdpToolkit(agentkit);
    const tools = cdpToolkit.getTools();

    const reactAgent = createAgent(
        { modelName: "gpt-4o-mini", temperature: 0.3 },
        tools,
        "You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit...",
        isOnchain
    );

    let response = "";
    const stream = await reactAgent.stream(
        { messages: [new HumanMessage(text)] },
        { configurable: { thread_id: "CDP AgentKit" } },
    );

    for await (const chunk of stream) {
        if ("agent" in chunk) {
            console.log(chunk.agent.messages[0].content);
            response = chunk.agent.messages[0].content;
        } else if ("tools" in chunk) {
            console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
    }
    return res.send({ text: response });
};

export default handler;