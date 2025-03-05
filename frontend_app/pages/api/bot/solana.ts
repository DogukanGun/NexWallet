import { createSolanaTools } from "@/solana-agent-kit";
import { SolanaAgentKit } from "../../../solana-agent-kit/agent"
import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/middleware/withAuth";
import { createAgent } from "../../../frontend_agent/agentHelpers";
import { HumanMessage } from "@langchain/core/messages";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { text, address } = req.body;
  const agent = new SolanaAgentKit(address, "https://api.mainnet-beta.solana.com", { OPENAI_API_KEY: process.env.OPENAI_API_KEY })
  agent.isUiMode = true;
  agent.onSignTransaction = async (transaction) => {
    console.log(transaction)
    res.send({ transaction })
    return transaction;
  }
  const tools = createSolanaTools(agent);

  const reactAgent = createAgent(
    { modelName: "gpt-4o-mini", temperature: 0.3 },
    tools,
    `You are a helpful agent that can interact onchain using the Solana Agent Kit. You are
      empowered to interact onchain using your tools. If you ever need funds, you can request them from the
      faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
      (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
      can't do with your currently available tools, you must say so, and encourage them to implement it
      themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
      concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.`,
      false
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
}

export default withAuth(handler); 
