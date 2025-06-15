import OpenAI from 'openai';
import axios from 'axios';
import { config } from '../config/config';
import { Escrow, EscrowStatus } from '../models/Escrow';
import { contractService } from './contractService';

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY
    });
  }

  async verifyReceipt(escrowId: string) {
    try {
      const escrow = await Escrow.findById(escrowId);
      
      if (!escrow || !escrow.receiptFileUrl || !escrow.receiptRequirements) {
        throw new Error('Invalid escrow or missing receipt data');
      }

      // Download the receipt file
      const fileBuffer = await this.downloadFile(escrow.receiptFileUrl);
      
      // Convert to base64 for OpenAI Vision API
      const base64Image = fileBuffer.toString('base64');
      
      // Analyze the receipt with AI
      const verificationResult = await this.analyzeReceiptWithAI(
        base64Image,
        escrow.receiptRequirements,
        {
          fiatAmount: escrow.fiatAmount,
          fiatCurrency: escrow.fiatCurrency,
          bankDetails: escrow.bankDetails
        }
      );

      // Update escrow with AI verification result
      escrow.aiVerificationResult = {
        isVerified: verificationResult.isVerified,
        confidence: verificationResult.confidence,
        reason: verificationResult.reason,
        verifiedAt: new Date()
      };

      if (verificationResult.isVerified && verificationResult.confidence >= 0.8) {
        // High confidence verification - auto-approve
        escrow.status = EscrowStatus.COMPLETED;
        escrow.completedAt = new Date();
        
        // Submit to blockchain
        const contractResult = await contractService.verifyAndRelease(
          escrow.requestId,
          true
        );
        
        if (contractResult.success) {
          escrow.transactionHash = contractResult.transactionHash;
        }
      } else if (verificationResult.confidence < 0.5) {
        // Low confidence - auto-reject
        escrow.status = EscrowStatus.REFUNDED;
        
        const contractResult = await contractService.verifyAndRelease(
          escrow.requestId,
          false
        );
        
        if (contractResult.success) {
          escrow.transactionHash = contractResult.transactionHash;
        }
      }
      // Medium confidence (0.5-0.8) requires manual review

      await escrow.save();

      return {
        success: true,
        verificationResult
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to verify receipt'
      };
    }
  }

  private async downloadFile(fileUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
        timeout: 30000 // 30 seconds timeout
      });
      
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Failed to download file: ${fileUrl}`);
    }
  }

  private async analyzeReceiptWithAI(
    base64Image: string,
    requirements: string,
    escrowDetails: {
      fiatAmount: number;
      fiatCurrency: string;
      bankDetails: string;
    }
  ) {
    try {
      const prompt = `
You are an expert bank transfer receipt analyzer. Analyze the provided receipt image and verify if it meets the following requirements:

REQUIREMENTS:
${requirements}

EXPECTED DETAILS:
- Amount: ${escrowDetails.fiatAmount / 100} ${escrowDetails.fiatCurrency}
- Bank Details: ${escrowDetails.bankDetails}

Please analyze the receipt image and check:
1. Does the transfer amount match exactly?
2. Are the bank details (IBAN/account) correct?
3. Is the transfer date recent (within last 24-48 hours)?
4. Are all required fields visible and legible?
5. Does it appear to be a genuine bank transfer receipt?

Respond in JSON format:
{
  "isVerified": boolean,
  "confidence": number (0-1),
  "reason": "detailed explanation",
  "amountMatch": boolean,
  "bankDetailsMatch": boolean,
  "dateRecent": boolean,
  "authentic": boolean
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1 // Low temperature for consistent analysis
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Parse JSON response
      const result = JSON.parse(content);
      
      return {
        isVerified: result.isVerified || false,
        confidence: result.confidence || 0,
        reason: result.reason || 'No detailed analysis provided',
        details: {
          amountMatch: result.amountMatch || false,
          bankDetailsMatch: result.bankDetailsMatch || false,
          dateRecent: result.dateRecent || false,
          authentic: result.authentic || false
        }
      };
    } catch (error: any) {
      // Fallback to conservative verification
      return {
        isVerified: false,
        confidence: 0,
        reason: `AI analysis failed: ${error.message}`,
        details: {
          amountMatch: false,
          bankDetailsMatch: false,
          dateRecent: false,
          authentic: false
        }
      };
    }
  }

  async getVerificationStatus(escrowId: string) {
    try {
      const escrow = await Escrow.findById(escrowId);
      
      if (!escrow) {
        return {
          success: false,
          error: 'Escrow not found'
        };
      }

      return {
        success: true,
        data: {
          status: escrow.status,
          aiVerificationResult: escrow.aiVerificationResult,
          receiptSubmitted: !!escrow.receiptFileUrl
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get verification status'
      };
    }
  }
}

export const aiService = new AIService(); 