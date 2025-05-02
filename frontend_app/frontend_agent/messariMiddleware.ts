/**
 * Messari tool selection middleware
 * 
 * This helps the agent decide when to use Messari tools vs other tools
 */

export const createMessariPDFContextModifier = (): string => {
  return `
IMPORTANT TOOL SELECTION INSTRUCTIONS:

When a user asks for a PDF report, security report, or analysis of a cryptocurrency TOKEN (like BTC, ETH, SOL):
1. Use the MessariPDFTool, which specifically handles cryptocurrency TOKEN symbols
2. DO NOT use other tools like AskSolanaSdkAgent for PDF generation
3. MessariPDFTool expects a simple token symbol like "SOL" or "BTC"

When a user asks about a specific WALLET ADDRESS or CONTRACT ADDRESS:
1. Use blockchain-specific tools like AskSolanaSdkAgent
2. DO NOT use MessariPDFTool for wallet addresses

PDF REPORT VS DATA DISTINCTION:
- For PDF reports about tokens: MessariPDFTool
- For raw token data/metrics: MessariAPI
- For wallet address information: Blockchain tools (not MessariPDFTool)
`;
}; 