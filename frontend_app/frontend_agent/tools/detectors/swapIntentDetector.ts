import { Tool } from "langchain/tools";
import { z } from "zod";

export class SwapIntentDetector extends Tool {
    name = "swap_intent_detector";
    description = `Use this tool to detect if a user's query is about swapping or exchanging tokens.
    This tool helps identify when a user wants to swap tokens on supported chains like BNB Chain.
    
    Input:
    text: string, e.g., "I want to swap BNB for BUSD"
    
    Output:
    A JSON object with:
    - isSwapIntent: boolean indicating if the query contains a swap intent
    - detectedChain: string indicating the detected blockchain (if any)
    - fromToken: string indicating the source token (if detected)
    - toToken: string indicating the destination token (if detected)
    `;
    
    args_schema = z.object({
        text: z.string()
    });

    constructor() {
        super();
    }

    async _call(input: z.infer<typeof this.args_schema>) {
        const { text } = input;
        const inputText = text.toLowerCase();
        
        // Check for swap intent keywords
        const swapKeywords = ['swap', 'exchange', 'trade', 'convert', 'switch', 'change'];
        const isSwapIntent = swapKeywords.some(keyword => inputText.includes(keyword));
        
        if (!isSwapIntent) {
            return JSON.stringify({
                isSwapIntent: false,
                detectedChain: null,
                fromToken: null,
                toToken: null
            });
        }
        
        // Try to detect which chain is being referenced
        const chainKeywords = {
            bnb: ['bnb', 'binance', 'bsc', 'binance smart chain'],
            eth: ['eth', 'ethereum', 'mainnet'],
            base: ['base', 'coinbase base'],
            sol: ['sol', 'solana'],
            polygon: ['polygon', 'matic']
        };
        
        let detectedChain = null;
        for (const [chain, keywords] of Object.entries(chainKeywords)) {
            if (keywords.some(keyword => inputText.includes(keyword))) {
                detectedChain = chain;
                break;
            }
        }
        
        // Default to BNB Chain if no chain specified but tokens indicate it
        if (!detectedChain) {
            const bnbTokens = ['busd', 'cake', 'bnb', 'usdt', 'safemoon'];
            if (bnbTokens.some(token => inputText.includes(token))) {
                detectedChain = 'bnb';
            }
        }
        
        // Try to detect from/to tokens using common patterns
        // Like "swap X for Y" or "exchange X to Y"
        let fromToken = null;
        let toToken = null;
        
        // Common tokens for detection
        const tokenSymbols = {
            bnb: 'bnb',
            eth: 'eth',
            sol: 'sol',
            usdt: 'usdt',
            usdc: 'usdc',
            busd: 'busd',
            cake: 'cake',
            dot: 'dot',
            avax: 'avax',
            matic: 'matic',
            link: 'link',
            uni: 'uni',
            shib: 'shib',
            doge: 'doge'
        };
        
        // Pattern: "swap X for Y" or "convert X to Y"
        const patterns = [
            /swap\s+(\w+)\s+(?:for|to)\s+(\w+)/i,
            /exchange\s+(\w+)\s+(?:for|to)\s+(\w+)/i,
            /convert\s+(\w+)\s+(?:to|into)\s+(\w+)/i,
            /trade\s+(\w+)\s+(?:for|to)\s+(\w+)/i
        ];
        
        for (const pattern of patterns) {
            const match = inputText.match(pattern);
            if (match && match.length >= 3) {
                fromToken = match[1].toLowerCase();
                toToken = match[2].toLowerCase();
                break;
            }
        }
        
        // Normalize token names
        if (fromToken) {
            for (const [symbol, key] of Object.entries(tokenSymbols)) {
                if (fromToken.includes(key)) {
                    fromToken = symbol;
                    break;
                }
            }
        }
        
        if (toToken) {
            for (const [symbol, key] of Object.entries(tokenSymbols)) {
                if (toToken.includes(key)) {
                    toToken = symbol;
                    break;
                }
            }
        }
        
        return JSON.stringify({
            isSwapIntent,
            detectedChain,
            fromToken,
            toToken
        });
    }
} 