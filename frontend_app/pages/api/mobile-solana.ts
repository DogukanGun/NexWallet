import { withAuth } from "@/middleware/withAuth";
import { NextApiRequest, NextApiResponse } from "next";
import { createSolanaTools } from "@/solana-agent-kit";
import { SolanaAgentKit } from "../../solana-agent-kit/agent";
import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "@/frontend_agent/agentHelpers";

/**
 * Mobile-optimized API endpoint that only uses Solana functionality
 * This endpoint is streamlined to have minimal dependencies and faster response times
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'POST':
      const { message, wallet } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ 
          error: "Message is required and should be a string." 
        });
      }
      console.log("message", message);

      if (!wallet || typeof wallet !== "string") {
        return res.status(400).json({ 
          error: "Wallet address is required and should be a string." 
        });
      }
      console.log("wallet", wallet);
      try {
        console.log("Mobile Solana API request:", { message, wallet });
        
        const agent = new SolanaAgentKit(wallet, "https://api.mainnet-beta.solana.com", { OPENAI_API_KEY: process.env.OPENAI_API_KEY });
        agent.isUiMode = true;
        agent.onSignTransaction = async (transaction) => {
          console.log("transaction", transaction);
          res.status(200).json({
            text: "Transaction created successfully",
            transaction: transaction,
            audio: null,
            op: "solana"
          });
          return transaction;
        };

        const tools = createSolanaTools(agent);
        const reactAgent = createAgent(
          { modelName: "gpt-4o-mini", temperature: 0.5 },
          tools,
          `You are a helpful agent that can answer questions about the blockchain.
          If an user asks you a questions about outside of Solana chain,
          you must tell them mobile app only supports Solana chain.`,
          false
        );

        let response = "";
        const stream = await reactAgent.stream(
          { messages: [new HumanMessage(message)] },
          { configurable: { thread_id: "Frontend Agent" } },
        );

        for await (const chunk of stream) {
          if ("agent" in chunk) {
            console.log("agent-from-chat", chunk.agent.messages);
            response = chunk.agent.messages[0].content;
          }
        }

        return res.status(200).json({ text: response });
      } catch (error) {
        console.error("Error in Mobile Solana API:", error);
        return res.status(500).json({ 
          error: "An error occurred while processing your request",
          text: error instanceof Error ? error.message : "Unknown error",
          success: false
        });
      }
      break;

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withAuth(handler); 