import { agent, createKnowledgeReactAgent } from "@/knowledge/createReactAgent";
import { withAuth } from "@/middleware/withAuth";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

type SolOP = {
    text: string,
    op: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    switch (method) {
        case 'GET':
            // Handle GET request

            break;

        case 'POST':
            // Handle POST request
            const { caption, messageHistory, chains, knowledge, isOnchain } = req.body;
            if (!caption || typeof caption !== "string" || !chains || !Array.isArray(chains)) {
                return res.status(400).json({ error: "Caption is required and should be a string, and chains must be an array." });
            }
            const openai = new OpenAI(
                {
                    apiKey: process.env.OPEN_AI_KEY
                }
            );
            const multichainMessage = {
                role: "system",
                content: `If the message is about executing a transaction in blockchain,
                and if which chain the transaction is to be executed is not mentioned, then you must ask which one of the following chains ${chains?.join(", ")} the transaction is to be executed on.
                If it is mentioned, then you must change \"{text:\${user_message}, op:tx}\" to \"{text:\${user_message}, op:tx, chain:\${chain}}\"`
            }
            const systemMessage = [{
                role: "system",
                content: "So user will send you a text." +
                    "Now you have to decide that message is about executing a transaction in " +
                    "blockchain or not.If it is, then only return this  (${user_message} represents user's message) " +
                    "\"{text:${user_message}, op:tx}\" . Otherwise, answer question normally.",
            }]
            if (chains.length > 1) {
                systemMessage.push(multichainMessage)
            }
            const completions = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    ...systemMessage,
                    ...messageHistory,
                    {
                        role: "user",
                        content: caption,
                    }
                ],
            })
            const message = completions.choices[0].message;
            if (!message) {
                return res.status(500).json({ error: "Failed to generate a response." });
            }

            if (!message.content) {
                return res.status(500).json({ error: "Failed to generate a response." });
            }
            try {
                console.log("Message content ", message.content)
                if (message.content.includes("tx")) {
                    console.log(message.content.includes("chain") ? message.content.split("chain:")[1].split("_ai")[0] : chains[0].id)
                    return res.status(200).json({
                        text: message.content || "",
                        audio: "",
                        op: message.content.includes("chain") ? message.content.split("chain:")[1].split("_ai")[0] : chains[0].id
                    });
                } else if(knowledge.length > 0){
                    const validAgents: agent[] = knowledge.filter((agent: string) => agent === 'cookie' || agent === 'eigenlayer');
                    const reactAgent = createKnowledgeReactAgent(
                        { modelName: "gpt-4o-mini", temperature: 0.3 },
                        "You are a helpful agent that can answer questions about the blockchain.",
                        validAgents,
                        isOnchain
                    );
                    const stream = await reactAgent.stream(
                        {
                            messages: [
                                new HumanMessage(caption)
                            ]
                        },
                        { configurable: { thread_id: "Cookie.Dao AgentKit" } },
                    );
                    let response = "";
                    console.log("Stream: ", stream)
                    for await (const chunk of stream) {
                        if ("agent" in chunk) {
                            console.log(chunk.agent.messages[0].content);
                            response = chunk.agent.messages[0].content;
                        } else if ("tools" in chunk) {
                            console.log(chunk.tools.messages[0].content);
                        }
                        console.log("-------------------");
                    }
                    console.log("Response: ", response)
                    message.content = response;
                }
            } catch (e) {
                console.log("Error: ", e)
                console.log("Not a transaction")
            }

            // Convert the message to speech
            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: message.content || "",
            });

            // Convert audio data to buffer and return it
            const buffer = Buffer.from(await mp3.arrayBuffer());
            const base64Audio = buffer.toString("base64");

            res.status(200).json({
                text: message.content || "",
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

