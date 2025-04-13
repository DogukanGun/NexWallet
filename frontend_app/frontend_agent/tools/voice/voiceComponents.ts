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
    description = `Use this tool to generate form components when user input requires additional information.
    Input should be a JSON string containing:
    {
        action: string,          // The action being performed (e.g., "send_sol", "transfer_token")
        missing_fields: string[], // Fields that need to be collected from the user
        known_values: {          // Values already known from the voice input
            [key: string]: any
        }
    }`;

    async _call(input: string): Promise<string> {
        try {
            let request;
            console.log("Original input:", input);

            try {
                // First attempt to parse the input as JSON
                const parsed = typeof input === 'string' ? JSON.parse(input) : input;
                
                // Handle different formats of input
                if (parsed.args) {
                    // Handle case where OpenAI puts the args in an args property
                    request = parsed.args;
                    console.log("Found args in parsed input:", request);
                } else if (parsed.action) {
                    // Direct format with action property
                    request = parsed;
                    console.log("Found direct action in parsed input:", request);
                } else if (parsed.missing_fields || parsed.known_values) {
                    // Partial format with some properties
                    request = {
                        action: 'send_sol', // Default action
                        ...parsed
                    };
                    console.log("Found partial format, using default action:", request);
                } else {
                    // Try to infer format from available properties
                    console.log("Couldn't determine format directly, attempting to infer");
                    request = {
                        action: 'send_sol',
                        missing_fields: [],
                        known_values: {}
                    };
                }

                // Special handling for string representations from LLM responses
                // Handle [Array] placeholders
                if (typeof request.missing_fields === 'string') {
                    if (request.missing_fields === '[Array]') {
                        request.missing_fields = ['receiver_wallet_address', 'amount'];
                    } else if (request.missing_fields.startsWith('[') && request.missing_fields.endsWith(']')) {
                        try {
                            request.missing_fields = JSON.parse(request.missing_fields);
                        } catch (e) {
                            request.missing_fields = ['receiver_wallet_address', 'amount'];
                        }
                    }
                }

                // Handle [Object] placeholders
                if (typeof request.known_values === 'string') {
                    if (request.known_values === '[Object]') {
                        request.known_values = {};
                    } else if (request.known_values.startsWith('{') && request.known_values.endsWith('}')) {
                        try {
                            request.known_values = JSON.parse(request.known_values);
                        } catch (e) {
                            request.known_values = {};
                        }
                    }
                }
            } catch (e) {
                // If JSON parsing fails, try to parse as a text command
                console.error('Initial parse error:', e);
                console.log('Raw input was:', input);
                
                // Default to send_sol with basic fields
                const text = typeof input === 'string' ? input.toLowerCase() : '';
                if (text.includes('send') && text.includes('sol')) {
                    request = {
                        action: 'send_sol',
                        missing_fields: ['receiver_wallet_address', 'amount'],
                        known_values: {}
                    };
                    console.log("Parsed as send SOL command from text");
                } else {
                    // Last resort default
                    request = {
                        action: 'send_sol',
                        missing_fields: ['receiver_wallet_address', 'amount'],
                        known_values: {}
                    };
                    console.log("Using default send SOL config as fallback");
                }
            }

            // Always ensure these fields exist
            if (!request.action) request.action = 'send_sol';
            if (!request.missing_fields) request.missing_fields = ['receiver_wallet_address', 'amount'];
            if (!request.known_values) request.known_values = {};

            // Log final processed request
            console.log('Final processed request:', JSON.stringify(request, null, 2));

            const components: ComponentConfig[] = [];
            
            const addComponentIfMissing = (field: string, componentConfig: ComponentConfig) => {
                if (Array.isArray(request.missing_fields) && 
                    request.missing_fields.includes(field) && 
                    (!request.known_values || request.known_values[field] === undefined)) {
                    components.push(componentConfig);
                }
            };

            switch (request.action) {
                case 'send_sol':
                case 'transfer_sol':
                    if (!request.known_values?.amount) {
                        components.push({
                            name: "amount",
                            type: "input_box",
                            validation: "number",
                            placeholder: "Enter amount in SOL",
                            required: true
                        });
                    }
                    
                    if (!request.known_values?.receiver_wallet_address) {
                        components.push({
                            name: "receiver_wallet_address",
                            type: "input_box",
                            validation: "string",
                            placeholder: "Enter receiver's wallet address",
                            required: true
                        });
                    }
                    break;

                case 'send_token':
                case 'transfer_token':
                    addComponentIfMissing('token_address', {
                        name: "token_address",
                        type: "input_box",
                        validation: "string",
                        placeholder: "Enter token mint address",
                        required: true
                    });
                    
                    addComponentIfMissing('receiver_wallet_address', {
                        name: "receiver_wallet_address",
                        type: "input_box",
                        validation: "string",
                        placeholder: "Enter receiver's wallet address",
                        required: true
                    });
                    
                    addComponentIfMissing('amount', {
                        name: "amount",
                        type: "input_box",
                        validation: "number",
                        placeholder: "Enter amount",
                        required: true
                    });
                    break;

                case 'stake':
                    addComponentIfMissing('validator_address', {
                        name: "validator_address",
                        type: "input_box",
                        validation: "string",
                        placeholder: "Enter validator address",
                        required: true
                    });
                    
                    addComponentIfMissing('stake_amount', {
                        name: "stake_amount",
                        type: "input_box",
                        validation: "number",
                        placeholder: "Enter amount to stake in SOL",
                        required: true
                    });
                    break;

                case 'swap':
                    addComponentIfMissing('token_from', {
                        name: "token_from",
                        type: "input_box",
                        validation: "string",
                        placeholder: "Enter token to swap from",
                        required: true
                    });
                    
                    addComponentIfMissing('token_to', {
                        name: "token_to",
                        type: "input_box",
                        validation: "string",
                        placeholder: "Enter token to swap to",
                        required: true
                    });
                    
                    addComponentIfMissing('amount', {
                        name: "amount",
                        type: "input_box",
                        validation: "number",
                        placeholder: "Enter amount to swap",
                        required: true
                    });
                    break;

                case 'mint_nft':
                case 'create_nft':
                    addComponentIfMissing('nft_name', {
                        name: "nft_name",
                        type: "input_box",
                        validation: "string",
                        placeholder: "Enter NFT name",
                        required: true
                    });
                    
                    addComponentIfMissing('description', {
                        name: "description",
                        type: "text_area",
                        validation: "string",
                        placeholder: "Enter NFT description",
                        required: true
                    });
                    
                    addComponentIfMissing('image_url', {
                        name: "image_url",
                        type: "input_box",
                        validation: "string",
                        placeholder: "Enter image URL or upload",
                        required: true
                    });
                    break;

                default:
                    throw new Error(`Unsupported action: ${request.action}`);
            }

            const response = {
                components,
                params: {
                    action: request.action,
                    known_values: request.known_values || {}
                }
            };

            // Format the response exactly as expected by the API endpoint
            return `component: ${JSON.stringify(response.components)}
params: ${JSON.stringify(response.params)}`;
        } catch (error: unknown) {
            console.error('Error in VoiceComponentTool:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to process voice component request: ${error.message}`);
            } else {
                throw new Error('Failed to process voice component request: Unknown error');
            }
        }
    }
}