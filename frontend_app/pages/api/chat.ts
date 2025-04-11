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
            const { caption, chains, wallet, llmId } = req.body;
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
                    { modelName: llmId || "gpt-4o-mini", temperature: 0.5 },
                    `You are a helpful agent that can answer questions about the blockchain.
                    If an user asks you a questions about outside of these chains ${chains.join(", ")},
                    you must tell them in configuration the requested chain is not selected, so recommend 
                    them to select the chain in the configuration.
                    `,
                    ['cookie'],
                    llmId === "llama_onchain" || llmId === "deepseek_onchain",
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
                            } else if (tempResponse.includes('component:')) {
                                console.log("Found component in response:", tempResponse);
                                try {
                                    // More robust handling of component responses
                                    // If the response contains an error message, check if it's from the voice component tool
                                    if (tempResponse.includes("Failed to process voice component request")) {
                                        console.log("Detected error from voice component tool, using fallback components");
                                        // Return a fallback form with default components for sending SOL
                                        return res.status(200).json({
                                            components: [
                                                {
                                                    name: "receiver_wallet_address",
                                                    type: "input_box",
                                                    validation: "string",
                                                    placeholder: "Enter receiver's wallet address",
                                                    required: true
                                                },
                                                {
                                                    name: "amount",
                                                    type: "input_box", 
                                                    validation: "number",
                                                    placeholder: "Enter amount in SOL",
                                                    required: true
                                                }
                                            ],
                                            params: {
                                                action: "send_sol",
                                                known_values: {}
                                            },
                                            text: "Please provide the required information to complete the transaction."
                                        });
                                    }
                                    
                                    // Try to extract component and params parts
                                    const [componentPart, paramsPart] = tempResponse.split('\nparams:').map((part: string) => part.trim());
                                    const componentJson = componentPart.replace('component:', '').trim();
                                    
                                    console.log("Component part:", componentJson);
                                    console.log("Params part:", paramsPart);
                                    
                                    // Parse the components and params, with better error handling
                                    try {
                                        const components = JSON.parse(componentJson);
                                        const params = paramsPart ? JSON.parse(paramsPart) : {};

                                        console.log("Successfully parsed components:", components);
                                        console.log("Successfully parsed params:", params);

                                        return res.status(200).json({ 
                                            components,
                                            params,
                                            text: "Please provide the required information to complete the transaction."
                                        });
                                    } catch (parseError: any) {
                                        console.error("JSON parse error:", parseError);
                                        console.log("componentJson:", componentJson);
                                        console.log("paramsPart:", paramsPart);
                                        
                                        // Attempt fallback parsing
                                        if (componentJson.includes('[') && componentJson.includes(']')) {
                                            try {
                                                // Try to extract valid JSON
                                                const jsonMatch = componentJson.match(/(\[.*\])/);
                                                if (jsonMatch && jsonMatch[1]) {
                                                    const fallbackComponents = JSON.parse(jsonMatch[1]);
                                                    console.log("Fallback parsing succeeded:", fallbackComponents);
                                                    
                                                    return res.status(200).json({
                                                        components: fallbackComponents,
                                                        params: { 
                                                            action: "send_sol",
                                                            known_values: {}
                                                        },
                                                        text: "Please provide the required information to complete the transaction."
                                                    });
                                                }
                                            } catch (fallbackError) {
                                                console.error("Fallback parsing failed:", fallbackError);
                                            }
                                        }
                                        
                                        return res.status(400).json({ 
                                            error: "Failed to parse component response",
                                            details: parseError.message,
                                            text: "There was an error processing your request. Please try again."
                                        });
                                    }
                                } catch (e: any) {
                                    console.error("Error parsing component response:", e);
                                    console.log("Raw response:", tempResponse);
                                    return res.status(400).json({ 
                                        error: "Failed to parse component response",
                                        details: e.message,
                                        text: "There was an error processing your request. Please try again."
                                    });
                                }
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
            return res.status(200).json({
                text: response,
                audio: "",
                op: ""
            });
        default:
            // Handle unsupported methods
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}
export default withAuth(handler);

