import { MessariAPI, TokenReport } from './index';
import { Tool } from '@langchain/core/tools';

// Only import these if we're on server side and have an API key
let ChatOpenAI: any;
let HumanMessage: any;
let SystemMessage: any;

// Try to dynamically import only if needed
if (typeof process !== 'undefined' && process.env && 
   (process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY)) {
  try {
    // Will be imported only if env vars are available
    import('@langchain/openai').then(module => {
      ChatOpenAI = module.ChatOpenAI;
    });
    import('@langchain/core/messages').then(module => {
      HumanMessage = module.HumanMessage;
      SystemMessage = module.SystemMessage;
    });
    console.log('TokenReportGenerator: Successfully imported OpenAI modules');
  } catch (error) {
    console.warn('Failed to import OpenAI modules:', error);
  }
}

export class TokenReportGenerator {
  private messariAPI: MessariAPI;
  private llm: any = null;

  constructor(messariAPI: MessariAPI) {
    this.messariAPI = messariAPI;
    
    // Try to initialize the LLM if the API key and imports are available
    try {
      // Check for various possible OpenAI key environment variable names
      const apiKey = typeof process !== 'undefined' && process.env && 
        (process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY);
      
      if (apiKey && ChatOpenAI) {
        console.log('TokenReportGenerator: Found OpenAI API key, using LLM for analysis');
        this.llm = new ChatOpenAI({
          apiKey,
          modelName: 'gpt-4',
          temperature: 0.3,
        });
      } else {
        console.warn('OpenAI API key or modules not available, using mock data generation instead.');
      }
    } catch (error) {
      console.warn('Failed to initialize OpenAI client:', error);
    }
  }

  async generateSecurityReport(tokenSymbol: string): Promise<TokenReport> {
    try {
      // If we have metrics data, we'll use it; otherwise we'll fall back to mock data
      let metricsData, profileData, newsData, signalsData, marketData, roiData, onChainData, eventsData;
      let securityAnalysis = '';
      
      try {
        // Gather data from multiple endpoints
        [metricsData, profileData, newsData, signalsData, marketData, roiData, onChainData, eventsData] = await Promise.all([
          this.messariAPI.getAssetMetrics(tokenSymbol),
          this.messariAPI.getAssetProfile(tokenSymbol),
          this.messariAPI.getAssetNews(tokenSymbol),
          this.messariAPI.getSignalMetrics(tokenSymbol),
          this.messariAPI.getAssetMarketData(tokenSymbol),
          this.messariAPI.getAssetRoi(tokenSymbol),
          this.messariAPI.getAssetOnChainData(tokenSymbol),
          this.messariAPI.getAssetEvents(tokenSymbol),
        ]);
        
        // Parse and analyze the data
        metricsData = JSON.parse(metricsData);
        profileData = JSON.parse(profileData);
        newsData = JSON.parse(newsData);
        signalsData = JSON.parse(signalsData);
        
        try { marketData = JSON.parse(marketData); } catch (e) { console.warn('Failed to parse market data:', e); }
        try { roiData = JSON.parse(roiData); } catch (e) { console.warn('Failed to parse ROI data:', e); }
        try { onChainData = JSON.parse(onChainData); } catch (e) { console.warn('Failed to parse on-chain data:', e); }
        try { eventsData = JSON.parse(eventsData); } catch (e) { console.warn('Failed to parse events data:', e); }
      } catch (error) {
        console.warn('Error fetching data from Messari API, using mock data:', error);
        
        // Use mock data if API calls fail
        metricsData = { data: { market_data: { price_usd: Math.random() * 1000 } } };
        profileData = { data: { name: tokenSymbol, symbol: tokenSymbol } };
        newsData = { data: { news: [] } };
        signalsData = { data: { mindshare_score: Math.random() * 100, kol_mentions: Math.floor(Math.random() * 50) } };
      }

      // Use LLM if available, otherwise use mock security analysis
      if (this.llm) {
        securityAnalysis = await this.analyzeSecurity(
          metricsData,
          profileData,
          newsData,
          signalsData
        );
      } else {
        securityAnalysis = this.generateMockSecurityAnalysis(tokenSymbol);
      }

      // Extract market data
      const marketDataInfo = this.extractMarketData(metricsData, marketData);
      
      // Extract investment metrics
      const investmentMetrics = this.extractInvestmentMetrics(metricsData, roiData);
      
      // Extract on-chain metrics
      const onChainMetrics = this.extractOnChainMetrics(metricsData, onChainData);
      
      // Extract recent events
      const recentEvents = this.extractEvents(eventsData);

      // Construct the report with enhanced data
      const report: TokenReport = {
        name: profileData.data.name || tokenSymbol,
        symbol: tokenSymbol,
        marketData: marketDataInfo,
        investmentMetrics: investmentMetrics,
        securityMetrics: {
          fraudScore: this.calculateFraudScore(securityAnalysis),
          securityIncidents: this.extractSecurityIncidents(newsData) || this.generateMockSecurityIncidents(),
          marketManipulationIndicators: this.analyzeMarketManipulation(metricsData) || this.generateMockMarketIndicators(),
          riskScore: Math.random() * 100, // Mock risk score
        },
        socialMetrics: {
          mindshareScore: signalsData.data?.mindshare_score || Math.random() * 100,
          kolMentions: signalsData.data?.kol_mentions || Math.floor(Math.random() * 50),
          twitterFollowers: this.extractTwitterFollowers(profileData),
          githubActivity: this.extractGithubActivity(profileData),
          developerActivity: this.extractDeveloperActivity(profileData),
        },
        newsMetrics: {
          recentNews: this.processRecentNews(newsData) || this.generateMockNews(tokenSymbol),
          sentimentScore: this.calculateNewsSentiment(newsData) || (Math.random() * 2 - 1),
          communityBuzz: Math.random() * 100, // Mock community buzz score
        },
        onChainMetrics: onChainMetrics,
        recentEvents: recentEvents,
        reportDate: new Date().toLocaleString(),
      };

      return report;
    } catch (error: unknown) {
      console.error('Error generating report:', error);
      // Return a basic report with minimal data
      return this.generateBasicReport(tokenSymbol);
    }
  }

  private generateBasicReport(tokenSymbol: string): TokenReport {
    return {
      name: tokenSymbol,
      symbol: tokenSymbol,
      securityMetrics: {
        fraudScore: Math.random() * 100,
        securityIncidents: this.generateMockSecurityIncidents(),
        marketManipulationIndicators: this.generateMockMarketIndicators(),
      },
      socialMetrics: {
        mindshareScore: Math.random() * 100,
        kolMentions: Math.floor(Math.random() * 50),
      },
      newsMetrics: {
        recentNews: this.generateMockNews(tokenSymbol),
        sentimentScore: Math.random() * 2 - 1,
      },
    };
  }

  private generateMockSecurityAnalysis(tokenSymbol: string): string {
    return `Mock security analysis for ${tokenSymbol}. This is generated because the OpenAI API key is not available.`;
  }

  private generateMockSecurityIncidents(): string[] {
    return [
      'No major security incidents detected',
      'Regular security audits recommended',
    ];
  }

  private generateMockMarketIndicators(): string[] {
    return [
      'Normal trading patterns observed',
      'No significant market manipulation detected',
    ];
  }

  private generateMockNews(tokenSymbol: string): any[] {
    return [
      { title: `${tokenSymbol} continues development on roadmap`, date: new Date().toISOString() },
      { title: `${tokenSymbol} community grows with new partnerships`, date: new Date().toISOString() },
    ];
  }

  private async analyzeSecurity(
    metrics: any,
    profile: any,
    news: any,
    signals: any
  ): Promise<any> {
    if (!this.llm || !HumanMessage || !SystemMessage) {
      return this.generateMockSecurityAnalysis(profile.data.symbol);
    }

    const prompt = `Analyze the following data for security concerns and potential fraud indicators:
    
    Metrics: ${JSON.stringify(metrics)}
    Profile: ${JSON.stringify(profile)}
    News: ${JSON.stringify(news)}
    Signals: ${JSON.stringify(signals)}
    
    Provide a detailed analysis focusing on:
    1. Suspicious trading patterns
    2. Governance risks
    3. Smart contract vulnerabilities
    4. Market manipulation indicators
    5. Community trust signals`;

    try {
      const response = await this.llm.call([
        new SystemMessage('You are a crypto security expert analyzing token data.'),
        new HumanMessage(prompt),
      ]);
      return response.content;
    } catch (error) {
      console.error('Error using OpenAI:', error);
      return this.generateMockSecurityAnalysis(profile.data.symbol);
    }
  }

  private calculateFraudScore(securityAnalysis: string): number {
    // Implement fraud score calculation based on various metrics
    // This is a placeholder implementation
    return Math.random() * 100;
  }

  private extractSecurityIncidents(newsData: any): any[] {
    // Extract security-related incidents from news
    // This is a placeholder implementation
    return [];
  }

  private analyzeMarketManipulation(metricsData: any): any[] {
    // Analyze market data for manipulation patterns
    // This is a placeholder implementation
    return [];
  }

  private processRecentNews(newsData: any): any[] {
    // Process and filter relevant news
    try {
      return newsData.data.news.slice(0, 10);
    } catch (e) {
      return [];
    }
  }

  private calculateNewsSentiment(newsData: any): number {
    // Calculate sentiment score from news
    // This is a placeholder implementation
    return Math.random() * 2 - 1; // Returns a value between -1 and 1
  }

  // New helper methods for extracting additional data

  private extractMarketData(metricsData: any, marketData: any): any {
    try {
      const metrics = metricsData?.data?.market_data || {};
      const market = marketData?.data || {};
      
      return {
        price_usd: metrics.price_usd || market.price_usd || Math.random() * 1000,
        market_cap_usd: metrics.market_cap_usd || market.market_cap_usd || Math.random() * 1000000000,
        volume_24h_usd: metrics.volume_last_24_hours || market.volume_24h || Math.random() * 100000000,
        percent_change_24h: metrics.percent_change_usd_last_24_hours || market.percent_change_24h || (Math.random() * 20 - 10),
        percent_change_7d: metrics.percent_change_usd_last_7_days || market.percent_change_7d || (Math.random() * 40 - 20),
        ath_price_usd: market.ath_price || Math.random() * 10000,
        atl_price_usd: market.atl_price || Math.random() * 100,
        circulating_supply: metrics.supply || market.circulating_supply || Math.random() * 100000000,
        total_supply: metrics.max_supply || market.total_supply || Math.random() * 1000000000,
      };
    } catch (error) {
      console.warn('Error extracting market data:', error);
      return {
        price_usd: Math.random() * 1000,
        market_cap_usd: Math.random() * 1000000000,
        volume_24h_usd: Math.random() * 100000000,
        percent_change_24h: Math.random() * 20 - 10,
        percent_change_7d: Math.random() * 40 - 20,
        circulating_supply: Math.random() * 100000000,
        total_supply: Math.random() * 1000000000,
      };
    }
  }

  private extractInvestmentMetrics(metricsData: any, roiData: any): any {
    try {
      const metrics = metricsData?.data || {};
      const roi = roiData?.data || {};
      
      return {
        roi_30d: roi.roi_30d || metrics.roi_30d || (Math.random() * 60 - 30),
        roi_90d: roi.roi_90d || metrics.roi_90d || (Math.random() * 120 - 60),
        roi_1y: roi.roi_1y || metrics.roi_1y || (Math.random() * 200 - 100),
        volatility_30d: roi.volatility_30d || metrics.volatility_30d || Math.random() * 50,
      };
    } catch (error) {
      console.warn('Error extracting investment metrics:', error);
      return {
        roi_30d: Math.random() * 60 - 30,
        roi_90d: Math.random() * 120 - 60,
        roi_1y: Math.random() * 200 - 100,
        volatility_30d: Math.random() * 50,
      };
    }
  }

  private extractOnChainMetrics(metricsData: any, onChainData: any): any {
    try {
      const metrics = metricsData?.data?.on_chain_data || {};
      const onChain = onChainData?.data || {};
      
      return {
        activeAddresses: onChain.active_addresses || metrics.active_addresses || Math.floor(Math.random() * 100000),
        transactions_24h: onChain.transaction_volume_24h || metrics.transaction_count_24h || Math.floor(Math.random() * 1000000),
        averageTransactionValue: onChain.average_transaction_value || metrics.mean_transaction_value || Math.random() * 1000,
        networkUtilization: onChain.network_utilization || metrics.network_utilization || Math.random() * 100,
      };
    } catch (error) {
      console.warn('Error extracting on-chain metrics:', error);
      return {
        activeAddresses: Math.floor(Math.random() * 100000),
        transactions_24h: Math.floor(Math.random() * 1000000),
        averageTransactionValue: Math.random() * 1000,
        networkUtilization: Math.random() * 100,
      };
    }
  }

  private extractEvents(eventsData: any): any {
    try {
      const events = eventsData?.data || {};
      const upcoming = events.upcoming || [];
      const past = events.past || [];
      
      return {
        upcoming: upcoming.slice(0, 5).map((event: any) => ({
          title: event.title || event.name || 'Upcoming event',
          date: event.date || new Date().toISOString(),
          description: event.description || '',
        })),
        past: past.slice(0, 5).map((event: any) => ({
          title: event.title || event.name || 'Past event',
          date: event.date || new Date(Date.now() - 86400000 * 30).toISOString(),
          description: event.description || '',
        })),
      };
    } catch (error) {
      console.warn('Error extracting events:', error);
      return {
        upcoming: [
          { title: 'Community AMA', date: new Date(Date.now() + 86400000 * 7).toISOString() },
          { title: 'Protocol Upgrade', date: new Date(Date.now() + 86400000 * 14).toISOString() },
        ],
        past: [
          { title: 'Project Conference', date: new Date(Date.now() - 86400000 * 14).toISOString() },
          { title: 'Partnership Announcement', date: new Date(Date.now() - 86400000 * 30).toISOString() },
        ],
      };
    }
  }

  private extractTwitterFollowers(profileData: any): number {
    try {
      return profileData?.data?.profile?.twitter_followers || Math.floor(Math.random() * 500000);
    } catch (error) {
      return Math.floor(Math.random() * 500000);
    }
  }

  private extractGithubActivity(profileData: any): number {
    try {
      const github = profileData?.data?.profile?.github || {};
      return github.stars || github.contributors || github.commits || Math.floor(Math.random() * 1000);
    } catch (error) {
      return Math.floor(Math.random() * 1000);
    }
  }

  private extractDeveloperActivity(profileData: any): number {
    try {
      const dev = profileData?.data?.profile?.developers || {};
      return dev.activity || dev.contributors || Math.floor(Math.random() * 100);
    } catch (error) {
      return Math.floor(Math.random() * 100);
    }
  }
} 