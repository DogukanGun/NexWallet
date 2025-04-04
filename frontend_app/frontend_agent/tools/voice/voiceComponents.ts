import { Tool } from "langchain/tools";

interface ComponentConfig {
    name: string;
    type: string;
    validation: string;
    placeholder?: string;
    required?: boolean;
}

export class VoiceComponentTool extends Tool {
    name = "voice_component_tool";
    description = `Use this tool to when user ask to do something with voice commands and 
    the previous action needs something from the user.
    Input (input is a JSON string):
    actions: string[], e.g., ["send sol", "transfer token"]
    `;

    async _call(input: string): Promise<string> {
        const inputFormat = JSON.parse(input);
        const actions = inputFormat.actions;
        let components: ComponentConfig[] = [];

        // Send or transfer SOL
        if (actions.includes('send sol') || actions.includes('transfer sol')) {
            components = [
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
            ];
        }
        // Send or transfer any SPL token
        else if (actions.includes('send token') || actions.includes('transfer token')) {
            components = [
                {
                    name: "token_address",
                    type: "input_box",
                    validation: "string",
                    placeholder: "Enter token mint address",
                    required: true
                },
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
                    placeholder: "Enter amount",
                    required: true
                }
            ];
        }
        // Mint NFT
        else if (actions.includes('mint nft') || actions.includes('create nft')) {
            components = [
                {
                    name: "nft_name",
                    type: "input_box",
                    validation: "string",
                    placeholder: "Enter NFT name",
                    required: true
                },
                {
                    name: "description",
                    type: "text_area",
                    validation: "string",
                    placeholder: "Enter NFT description",
                    required: true
                },
                {
                    name: "image_url",
                    type: "input_box",
                    validation: "string",
                    placeholder: "Enter image URL or upload",
                    required: true
                }
            ];
        }
        // Create new wallet
        else if (actions.includes('create wallet') || actions.includes('new wallet')) {
            components = [
                {
                    name: "wallet_name",
                    type: "input_box",
                    validation: "string",
                    placeholder: "Enter wallet name (optional)",
                    required: false
                }
            ];
        }
        // Stake SOL
        else if (actions.includes('stake')) {
            components = [
                {
                    name: "validator_address",
                    type: "input_box",
                    validation: "string",
                    placeholder: "Enter validator address",
                    required: true
                },
                {
                    name: "stake_amount",
                    type: "input_box",
                    validation: "number",
                    placeholder: "Enter amount to stake in SOL",
                    required: true
                }
            ];
        }
        // Swap tokens
        else if (actions.includes('swap')) {
            components = [
                {
                    name: "token_from",
                    type: "input_box",
                    validation: "string",
                    placeholder: "Enter token to swap from",
                    required: true
                },
                {
                    name: "token_to",
                    type: "input_box",
                    validation: "string",
                    placeholder: "Enter token to swap to",
                    required: true
                },
                {
                    name: "amount",
                    type: "input_box",
                    validation: "number",
                    placeholder: "Enter amount to swap",
                    required: true
                }
            ];
        }
        // Connect wallet
        else if (actions.includes('connect')) {
            components = [
                {
                    name: "wallet_type",
                    type: "select",
                    validation: "string",
                    placeholder: "Select wallet type",
                    required: true
                }
            ];
        }

        // Return the components as a JSON string
        return JSON.stringify(components, null, 2);
    }
}