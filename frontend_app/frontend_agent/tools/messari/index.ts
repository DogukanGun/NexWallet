import axios, { AxiosError } from 'axios';
import { Tool } from 'langchain/tools';

export interface MessariConfig {
  apiKey?: string;
  baseUrl?: string;
}

export interface TokenReport {
  name: string;
  symbol: string;
  securityMetrics: {
    fraudScore?: number;
    securityIncidents?: any[];
    marketManipulationIndicators?: any[];
  };
  socialMetrics: {
    mindshareScore?: number;
    kolMentions?: number;
  };
  newsMetrics: {
    recentNews?: any[];
    sentimentScore?: number;
  };
}

export class MessariAPI extends Tool {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: MessariConfig = {}) {
    super();
    this.apiKey = config.apiKey || process.env.MESSARI_KEY || '';
    if (!this.apiKey) {
      throw new Error('Messari API key is required. Set MESSARI_KEY environment variable or pass it in config.');
    }
    this.baseUrl = config.baseUrl || 'https://data.messari.io/api/v1';
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
}
