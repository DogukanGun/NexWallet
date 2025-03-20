import { componentFactory, ComponentType } from "@/component_factory/factory";
import { createKnowledgeReactAgentV2 } from "@/frontend_agent/agent";
import { agent, createKnowledgeReactAgent } from "@/knowledge/createReactAgent";
import { withAuth } from "@/middleware/withAuth";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    switch (method) {
        case 'GET':
            // Handle GET request

            break;

        case 'POST':
            // Handle POST request
            const { caption, chains, wallet } = req.body;
            if (!caption || typeof caption !== "string" || !chains || !Array.isArray(chains)) {
                return res.status(400).json({ error: "Caption is required and should be a string, and chains must be an array." });
            }
            let response = "";
            const openai = new OpenAI(
                {
                    apiKey: process.env.OPEN_AI_KEY
                }
            );
            try {
                const agent = createKnowledgeReactAgentV2(
                    { modelName: "gpt-4o-mini", temperature: 0.5 },
                    `You are a helpful agent that can answer questions about the blockchain.
                    If an user asks you a questions about outside of these chains ${chains.join(", ")},
                    you must tell them in configuration the requested chain is not selected, so recommend 
                    them to select the chain in the configuration.
                    `,
                    ['cookie'],
                    false,
                    chains,
                    wallet
                );

                // Send the caption directly as the human message content
                // The agent will use the appropriate tools based on the content
                const stream = await agent.stream(
                    { messages: [new HumanMessage(caption), new SystemMessage(`The user's wallet address is ${wallet}.`)] },
                    { configurable: { thread_id: "Frontend Agent" } },
                );
                for await (const chunk of stream) {
                    if ("agent" in chunk) {
                        console.log("agent-from-chat", chunk.agent.messages);
                        response = chunk.agent.messages[0].content;
                    } else if ("tools" in chunk) {
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
                            } else if (tempResponse.includes("component")) {
                                console.log("component", tempResponse);
                                const component = tempResponse.split("component:")[1].trim();
                                const params = JSON.parse(tempResponse.split("params:")[1].trim());
                                return res.status(200).json({ component: component, params: params });
                            }

                        } catch (e) {
                            console.error("Error parsing tool response:", e);
                            // Use the raw response if JSON parsing fails
                            return res.send({ text: tempResponse });
                        }
                    }
                    console.log("-------------------");
                }
                console.log("response", response);
            } catch (e) {
                console.log("Error: ", e)
                console.log("Not a transaction")
            }

            if (response.includes("component")) {
                console.log("response", response);
                const component = response.split("component:")[1].trim();
                const params = JSON.parse(response.split("params:")[1].trim());
                return res.status(200).json({ component: component, params: params });
            }

            // Convert the message to speech
            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: response,
            });

            // Convert audio data to buffer and return it
            const buffer = Buffer.from(await mp3.arrayBuffer());
            const base64Audio = buffer.toString("base64");

            res.status(200).json({
                text: response,
                audio: base64Audio,
                op: ""
            });
            break;

        default:
            // Handle unsupported methods
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}
export default withAuth(handler);

