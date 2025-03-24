import { Character, settings } from "@elizaos/core";
import readline from "readline";

async function handleUserInput(input:string, agentId:string) {
    if (input.toLowerCase() === "exit") {
        process.exit(0);
    }

    try {
        const serverPort = parseInt(settings.SERVER_PORT || "3000");

        const response = await fetch(
            `http://localhost:${serverPort}/${agentId}/message`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: input,
                    userId: "user",
                    userName: "User",
                }),
            }
        );

        const data = await response.json();
        data.forEach((message: { text: string }) => console.log(`${"Agent"}: ${message.text}`));
    } catch (error) {
        console.error("Error fetching response:", error);
    }
}

export function startChat(characters: Character[]): (input:string) => void {
    async function chat(input:string) {
        const agentId = characters[0].name ?? "Agent";
        await handleUserInput(input, agentId);
        if (input.toLowerCase() !== "exit") {
            chat(input);
        }
    }

    return chat;
}