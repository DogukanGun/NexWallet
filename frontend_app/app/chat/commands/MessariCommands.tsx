import React from 'react';
import { Message } from 'ai';
import { MessariAPI } from '@/frontend_agent/tools/messari';
import { MessariPDFTool } from '@/frontend_agent/tools/messari/pdfGenerator';

/**
 * A command handler for direct Messari PDF generation
 * This bypasses the agent and directly calls the PDF tool
 */
export async function handleMessariCommand(
  messages: Message[],
  setMessages: (messages: Message[]) => void,
  input: string
): Promise<boolean> {
  // Check if this is a Messari PDF generation request
  const pdfRegex = /(?:generate|create)(?:\s+a)?(?:\s+security)?(?:\s+report)?(?:\s+pdf)?(?:\s+for)?\s+([A-Za-z]{2,5})(?:\s+token)?|(?:([A-Za-z]{2,5})(?:\s+token)?\s+(?:security\s+)?(?:report|pdf))/i;
  const tokenMatch = input.match(pdfRegex);
  
  // If not a PDF command, return false to let other handlers process it
  if (!tokenMatch) {
    return false;
  }
  
  // Extract the token symbol from the first or second capture group
  const tokenSymbol = (tokenMatch[1] || tokenMatch[2] || '').toUpperCase();
  
  if (!tokenSymbol) {
    return false;
  }
  
  console.log(`MessariCommands: Detected request for PDF generation for ${tokenSymbol}`);
  
  // Add an immediate response message showing that we're generating the PDF
  const userMessage: Message = {
    id: 'user-' + Date.now(),
    role: 'user',
    content: input
  };
  
  const processingMessage: Message = {
    id: 'processing-' + Date.now(),
    role: 'assistant',
    content: `Generating security report PDF for ${tokenSymbol}. Please wait...`
  };
  
  setMessages([
    ...messages,
    userMessage,
    processingMessage
  ]);
  
  try {
    // Create MessariAPI instance and PDF tool
    console.log('MessariCommands: Creating MessariAPI instance');
    try {
      const messariAPI = new MessariAPI();
      const pdfTool = new MessariPDFTool(messariAPI);
      
      // Call the PDF tool directly with explicit error handling
      console.log('MessariCommands: Calling PDF tool');
      try {
        const result = await pdfTool._call(tokenSymbol);
        console.log('MessariCommands: PDF generation complete');
        
        // Verify the result contains valid PDF data
        try {
          JSON.parse(result);
          
          // If we got here, the result is valid JSON
          setMessages([
            ...messages,
            userMessage,
            {
              id: 'result-' + Date.now(),
              role: 'assistant' as const,
              content: result
            }
          ]);
          
          return true;
        } catch (jsonError) {
          // Not valid JSON, likely an error message
          throw new Error(`Invalid PDF data: ${result}`);
        }
      } catch (pdfError) {
        throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`);
      }
    } catch (apiError) {
      throw new Error(`Error initializing Messari API: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
    }
  } catch (error) {
    console.error('Error generating PDF report:', error);
    
    // Update with error message and suggestion
    setMessages([
      ...messages,
      userMessage,
      {
        id: 'error-' + Date.now(),
        role: 'assistant' as const,
        content: `There was an error generating the PDF report: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try one of these tokens instead: BTC, ETH, AVAX, or MATIC`
      }
    ]);
    
    // We still handled this command, even though it errored
    return true;
  }
} 