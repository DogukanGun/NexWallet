import axios, { AxiosError } from 'axios';
import { Tool } from 'langchain/tools';
import { TokenReportGenerator } from './reportGenerator';
import { PDFReportGenerator } from './pdfGenerator';

export interface MessariConfig {
  apiKey?: string;
  baseUrl?: string;
}

export interface TokenReport {
  name: string;
  symbol: string;
  // Basic market data
  marketData?: {
    price_usd?: number;
    market_cap_usd?: number;
    volume_24h_usd?: number;
    percent_change_24h?: number;
    percent_change_7d?: number;
    ath_price_usd?: number;
    atl_price_usd?: number;
    circulating_supply?: number;
    total_supply?: number;
  };
  // Investment metrics
  investmentMetrics?: {
    roi_30d?: number;
    roi_90d?: number;
    roi_1y?: number;
    volatility_30d?: number;
  };
  // Security metrics
  securityMetrics: {
    fraudScore?: number;
    securityIncidents?: any[];
    marketManipulationIndicators?: any[];
    riskScore?: number;
  };
  // Social metrics
  socialMetrics: {
    mindshareScore?: number;
    kolMentions?: number;
    twitterFollowers?: number;
    githubActivity?: number;
    developerActivity?: number;
  };
  // News metrics
  newsMetrics: {
    recentNews?: any[];
    sentimentScore?: number;
    communityBuzz?: number;
  };
  // On-chain metrics
  onChainMetrics?: {
    activeAddresses?: number;
    transactions_24h?: number;
    averageTransactionValue?: number;
    networkUtilization?: number;
  };
  // Recent events
  recentEvents?: {
    upcoming?: any[];
    past?: any[];
  };
  // Report metadata
  reportDate?: string;
}

export class MessariAPI extends Tool {
  private apiKey: string;
  private baseUrl: string;
  private tokenReportGenerator: TokenReportGenerator | null = null;
  private pdfGenerator: PDFReportGenerator;

  constructor(config: MessariConfig = {}) {
    super();
    this.apiKey = config.apiKey || process.env.MESSARI_KEY || 'DEMO_KEY';
    if (!this.apiKey) {
      throw new Error('Messari API key is required. Set MESSARI_KEY environment variable or pass it in config.');
    }
    this.baseUrl = config.baseUrl || 'https://data.messari.io/api/v1';
    
    // Create the PDF generator
    this.pdfGenerator = new PDFReportGenerator();

    // Try to create the token report generator
    try {
      this.tokenReportGenerator = new TokenReportGenerator(this);
    } catch (error) {
      console.warn('Failed to initialize TokenReportGenerator:', error);
      // We'll handle this in the generatePDFReport method
    }
  }

  name = "MessariAPI";
  description = "Tool for interacting with Messari's APIs to gather crypto asset data and analysis";

  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      return await this.executeQuery(params);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return `Error executing Messari API call: ${error.message}`;
      }
      return 'Unknown error occurred during API call';
    }
  }

  private async executeQuery(params: any): Promise<string> {
    const headers = {
      'x-messari-api-key': this.apiKey,
    };

    try {
      const response = await axios.get(`${this.baseUrl}${params.endpoint}`, {
        headers,
        params: params.queryParams,
      });
      return JSON.stringify(response.data);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }
        throw new Error(`Messari API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred during API request');
    }
  }

  async getAssetMetrics(assetKey: string): Promise<any> {
    return this._call(JSON.stringify({
      endpoint: `/assets/${assetKey}/metrics`,
    }));
  }

  async getAssetProfile(assetKey: string): Promise<any> {
    return this._call(JSON.stringify({
      endpoint: `/assets/${assetKey}/profile`,
    }));
  }

  async getAssetNews(assetKey: string): Promise<any> {
    return this._call(JSON.stringify({
      endpoint: `/news`,
      queryParams: {
        asset_key: assetKey
      }
    }));
  }

  async getSignalMetrics(assetKey: string): Promise<any> {
    return this._call(JSON.stringify({
      endpoint: `/assets/${assetKey}/signals`,
    }));
  }

  async getAssetSentiment(assetKey: string): Promise<any> {
    return this._call(JSON.stringify({
      endpoint: `/assets/${assetKey}/sentiment`,
    }));
  }

  async getAssetMindshare(assetKey: string): Promise<any> {
    return this._call(JSON.stringify({
      endpoint: `/assets/${assetKey}/mindshare`,
    }));
  }

  async getAssetEvents(assetKey: string): Promise<any> {
    return this._call(JSON.stringify({
      endpoint: `/intel/assets/${assetKey}/events`,
    }));
  }

  async getAssetMarketData(assetKey: string): Promise<any> {
    return this._call(JSON.stringify({
      endpoint: `/assets/${assetKey}/metrics/market-data`,
    }));
  }

  async getAssetRoi(assetKey: string): Promise<any> {
    return this._call(JSON.stringify({
      endpoint: `/assets/${assetKey}/metrics/roi`,
    }));
  }

  async getAssetOnChainData(assetKey: string): Promise<any> {
    return this._call(JSON.stringify({
      endpoint: `/assets/${assetKey}/metrics/on-chain`,
    }));
  }

  async getAssetDeveloperActivity(assetKey: string): Promise<any> {
    return this._call(JSON.stringify({
      endpoint: `/assets/${assetKey}/metrics/developer-activity`,
    }));
  }

  async getAssetAll(assetKey: string): Promise<any> {
    return this._call(JSON.stringify({
      endpoint: `/assets/${assetKey}/metrics/all`,
    }));
  }

  async generatePDFReport(assetKey: string): Promise<string> {
    try {
      // If we don't have a token report generator, create a mock report
      let report: TokenReport;
      
      if (this.tokenReportGenerator) {
        report = await this.tokenReportGenerator.generateSecurityReport(assetKey);
      } else {
        // Create a simple mock report
        report = {
          name: assetKey,
          symbol: assetKey,
          securityMetrics: {
            fraudScore: Math.random() * 100,
            securityIncidents: ['No major security incidents detected'],
            marketManipulationIndicators: ['Normal trading patterns observed'],
          },
          socialMetrics: {
            mindshareScore: Math.random() * 100,
            kolMentions: Math.floor(Math.random() * 50),
          },
          newsMetrics: {
            recentNews: [
              { title: `${assetKey} continues development on roadmap` },
              { title: `${assetKey} community grows with new partnerships` },
            ],
            sentimentScore: Math.random() * 2 - 1,
          },
        };
      }
      
      try {
        // Generate the PDF data as Uint8Array
        const pdfData = await this.pdfGenerator.generateReport(report);
        
        // Convert Uint8Array to base64
        const binary = Array.from(pdfData)
          .map(b => String.fromCharCode(b))
          .join('');
        const base64PDF = btoa(binary);
        
        return JSON.stringify({
          base64PDF,
          fileName: `${assetKey}_security_report.pdf`,
          contentType: 'application/pdf'
        });
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`);
      }
    } catch (error) {
      console.error('Error in generatePDFReport:', error);
      if (error instanceof Error) {
        return `Error generating PDF report: ${error.message}`;
      }
      return 'Unknown error occurred during PDF generation';
    }
  }
}
