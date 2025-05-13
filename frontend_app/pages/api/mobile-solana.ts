import { withAuth } from "@/middleware/withAuth";
import { NextApiRequest, NextApiResponse } from "next";
import { AskSolanaSdkAgent } from "@/frontend_agent/tools/solona/askSolanaAgent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StructuredToolInterface } from "@langchain/core/tools";
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
        let tools: StructuredToolInterface[] = [];
        tools.push(new AskSolanaSdkAgent(wallet));
        const agent = createAgent({ modelName: "gpt-4o-mini", temperature: 0.5 }, tools, 
            `You are a helpful agent that can answer questions about the blockchain.
            If an user asks you a questions about outside of Solana chain,
            you must tell them mobile app only supports Solana chain.
            `, false);

        // Create a direct instance of the Solana agent
        const solanaAgent = new AskSolanaSdkAgent(wallet);
        const stream = await agent.stream(
            { messages: [new HumanMessage(message), new SystemMessage(`The user's wallet address is ${wallet}.`)] },
            { configurable: { thread_id: "Frontend Agent" } },
        );

        let response = "";
        for await (const chunk of stream) {
            if ("agent" in chunk) {
                console.log("agent-from-chat", chunk.agent.messages);
                response = chunk.agent.messages[0].content;
            }else if ("tools" in chunk) {
                console.log("tools-from-chat", chunk.tools.messages);
                let tempResponse = chunk.tools.messages[0].content;
                // Try to parse as JSON first (for Solana transactions)
                try {
                    if (tempResponse.includes('transaction')) {
                        // Try to extract JSON from the response content
                        console.log("onchain transaction");
                        const jsonMatches = tempResponse.match(/({[^{}]*})/);
                        if (jsonMatches && jsonMatches[1]) {
                            const jsonStr = jsonMatches[1];
                            const parsedResponse = JSON.parse(jsonStr);
                            console.log("parsedResponse", parsedResponse);
                            if (parsedResponse.transaction) {
                                tempResponse = parsedResponse.message || "Transaction created successfully";
                                console.log("transaction", parsedResponse.transaction);
                                // Return transaction directly to the client for processing
                                return res.status(200).json({
                                    text: tempResponse,
                                    transaction: parsedResponse.transaction,
                                    audio: null,
                                    op: "solana" // Set to 'solana' to trigger handleSolAi in the UI
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error parsing tool response:", e);
                    // Use the raw response if JSON parsing fails
                    return res.send({ text: tempResponse });
                }
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