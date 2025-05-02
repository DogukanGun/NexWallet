import PDFDocument from 'pdfkit-browserify';
import { TokenReport } from './index';
import { Tool } from '@langchain/core/tools';
import { MessariAPI } from './index';
import OpenAI from 'openai';

// Utility function to format large numbers with abbreviations (K, M, B, T)
function formatLargeNumber(num: number): string {
  if (num === undefined || num === null) return 'N/A';
  
  if (num >= 1_000_000_000_000) {
    return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
  } else if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  } else if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  } else {
    return `$${num.toFixed(2)}`;
  }
}

// Dynamically import blob-stream only in browser
let blobStream: any = null;
if (typeof window !== 'undefined') {
  // We're in a browser
  try {
    // @ts-ignore - Module might not be available at compile time
    import('blob-stream').then(module => {
      blobStream = module.default || module;
    });
  } catch (e) {
    console.warn('Failed to load blob-stream:', e);
  }
}

export class PDFReportGenerator {
  private openai: OpenAI;
  
  constructor() {
    // Initialize OpenAI client with API key from environment
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY,
    });
  }
  
  private async generateAISummary(report: TokenReport): Promise<string> {
    try {
      // Create a prompt with the token data
      const prompt = `
        Generate a concise expert summary (150-200 words) of this cryptocurrency token analysis:
        
        Token: ${report.name} (${report.symbol})
        Market Cap: ${report.marketData?.market_cap_usd !== undefined ? formatLargeNumber(report.marketData.market_cap_usd) : 'Unknown'}
        Price: ${report.marketData?.price_usd !== undefined ? '$' + report.marketData.price_usd.toFixed(2) : 'Unknown'}
        24h Change: ${report.marketData?.percent_change_24h !== undefined ? report.marketData.percent_change_24h.toFixed(2) + '%' : 'Unknown'}
        7d Change: ${report.marketData?.percent_change_7d !== undefined ? report.marketData.percent_change_7d.toFixed(2) + '%' : 'Unknown'}
        Fraud Risk Score: ${report.securityMetrics?.fraudScore !== undefined ? report.securityMetrics.fraudScore.toFixed(2) + '/100' : 'Unknown'}
        Social Mindshare: ${report.socialMetrics?.mindshareScore !== undefined ? report.socialMetrics.mindshareScore.toFixed(2) : 'Unknown'}
        News Sentiment: ${report.newsMetrics?.sentimentScore !== undefined ? report.newsMetrics.sentimentScore.toFixed(2) : 'Unknown'}
        
        Provide an objective analysis of the token's strengths, weaknesses, and key considerations for investors.
      `;
      
      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a cryptocurrency expert providing objective analysis of token performance and security metrics." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 250,
      });
      
      return completion.choices[0].message.content || "AI summary unavailable.";
    } catch (error) {
      console.error("Error generating AI summary:", error);
      return "AI-powered analysis could not be generated at this time.";
    }
  }

  async generateReport(report: TokenReport): Promise<Uint8Array> {
    // Get AI summary
    const aiSummary = await this.generateAISummary(report);
    
    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          bufferPages: true
        });
        
        // Collect PDF data
        const chunks: Uint8Array[] = [];
        // @ts-ignore - pdfkit-browserify has different typings than regular pdfkit
        doc.on('data', (chunk) => {
          chunks.push(new Uint8Array(chunk));
        });
        
        doc.on('end', () => {
          // Concatenate chunks into a single Uint8Array
          const totalLength = chunks.reduce((acc, val) => acc + val.length, 0);
          const result = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
          }
          resolve(result);
        });

        // Header
        doc
          .fontSize(25)
          .text(`Security Analysis Report: ${report.name} (${report.symbol})`, {
            align: 'center',
          })
          .moveDown(1);
        
        // Report metadata
        doc
          .fontSize(10)
          .text(`Generated on: ${report.reportDate || new Date().toLocaleString()}`, {
            align: 'center'
          })
          .moveDown(2);
          
        // AI Summary Section
        doc
          .fontSize(20)
          .text('AI Expert Review', { underline: true })
          .moveDown();
          
        doc
          .fontSize(12)
          .fillColor('#444444')
          .text(aiSummary)
          .moveDown(2);

        // Market Data Section (if available)
        if (report.marketData) {
          doc
            .fontSize(20)
            .text('Market Overview', { underline: true })
            .moveDown();

          const marketData = report.marketData;
          doc.fontSize(14);

          // Price information
          if (marketData.price_usd !== undefined) {
            doc.text(`Current Price: $${marketData.price_usd.toFixed(2)} USD`).moveDown(0.5);
          }
          
          // Market cap
          if (marketData.market_cap_usd !== undefined) {
            const formattedMarketCap = formatLargeNumber(marketData.market_cap_usd);
            doc.text(`Market Cap: ${formattedMarketCap}`).moveDown(0.5);
          }
          
          // 24h volume
          if (marketData.volume_24h_usd !== undefined) {
            const formattedVolume = formatLargeNumber(marketData.volume_24h_usd);
            doc.text(`24h Volume: ${formattedVolume}`).moveDown(0.5);
          }
          
          // Price changes
          if (marketData.percent_change_24h !== undefined) {
            const changeColor = marketData.percent_change_24h >= 0 ? '#007700' : '#FF0000';
            doc.fillColor(changeColor)
              .text(`24h Change: ${marketData.percent_change_24h.toFixed(2)}%`)
              .fillColor('#000000')
              .moveDown(0.5);
          }
          
          if (marketData.percent_change_7d !== undefined) {
            const changeColor = marketData.percent_change_7d >= 0 ? '#007700' : '#FF0000';
            doc.fillColor(changeColor)
              .text(`7d Change: ${marketData.percent_change_7d.toFixed(2)}%`)
              .fillColor('#000000')
              .moveDown(0.5);
          }
          
          // Supply information
          if (marketData.circulating_supply !== undefined) {
            doc.text(`Circulating Supply: ${formatLargeNumber(marketData.circulating_supply)} ${report.symbol}`).moveDown(0.5);
          }
          
          if (marketData.total_supply !== undefined) {
            doc.text(`Total Supply: ${formatLargeNumber(marketData.total_supply)} ${report.symbol}`).moveDown(1);
          }
          
          // Market Analysis
          doc.fontSize(12)
            .fillColor('#444444')
            .text('Analysis:', { underline: true })
            .moveDown(0.2);
            
          // Generate market analysis based on the data
          const marketCap = marketData.market_cap_usd ?? 0;
          const volume24h = marketData.volume_24h_usd ?? 0;
          const change24h = marketData.percent_change_24h ?? 0;
          const change7d = marketData.percent_change_7d ?? 0;

          const marketCapTier = marketCap > 10000000000 ? 'large-cap' : 
                                marketCap > 1000000000 ? 'mid-cap' : 'small-cap';
          const volumeToMcRatio = marketCap > 0 ? volume24h / marketCap : 0;
          const liquidityAssessment = volumeToMcRatio > 0.1 ? 'high' : volumeToMcRatio > 0.05 ? 'moderate' : 'low';
          
          let priceAnalysis = '';
          if (change24h > 5 && change7d > 10) {
            priceAnalysis = 'showing strong positive momentum';
          } else if (change24h < -5 && change7d < -10) {
            priceAnalysis = 'in a significant downtrend';
          } else if (Math.abs(change24h) < 2 && Math.abs(change7d) < 5) {
            priceAnalysis = 'relatively stable recently';
          } else {
            priceAnalysis = 'showing mixed signals';
          }
          
          const circulationRatio = marketData.circulating_supply && marketData.total_supply ? 
                                  (marketData.circulating_supply / marketData.total_supply) : 0;
          const supplyNote = circulationRatio > 0.8 ? 'Most tokens are in circulation, suggesting limited future inflation risk.' : 
                            circulationRatio > 0.5 ? 'Moderate portion of tokens in circulation, with some potential for future selling pressure.' :
                            'Large portion of tokens not yet in circulation, which could create selling pressure if released.';
          
          doc.text(`${report.symbol} is a ${marketCapTier} token ${priceAnalysis}. The token shows ${liquidityAssessment} liquidity based on trading volume relative to market cap. ${supplyNote}`)
            .moveDown(1);
        }

        // Investment Metrics (if available)
        if (report.investmentMetrics) {
          doc
            .fontSize(20)
            .text('Investment Metrics', { underline: true })
            .moveDown();

          const investmentMetrics = report.investmentMetrics;
          doc.fontSize(14);
          
          // ROI metrics
          if (investmentMetrics.roi_30d !== undefined) {
            const roiColor = investmentMetrics.roi_30d >= 0 ? '#007700' : '#FF0000';
            doc.fillColor(roiColor)
              .text(`30-Day ROI: ${investmentMetrics.roi_30d.toFixed(2)}%`)
              .fillColor('#000000')
              .moveDown(0.5);
          }
          
          if (investmentMetrics.roi_90d !== undefined) {
            const roiColor = investmentMetrics.roi_90d >= 0 ? '#007700' : '#FF0000';
            doc.fillColor(roiColor)
              .text(`90-Day ROI: ${investmentMetrics.roi_90d.toFixed(2)}%`)
              .fillColor('#000000')
              .moveDown(0.5);
          }
          
          if (investmentMetrics.roi_1y !== undefined) {
            const roiColor = investmentMetrics.roi_1y >= 0 ? '#007700' : '#FF0000';
            doc.fillColor(roiColor)
              .text(`1-Year ROI: ${investmentMetrics.roi_1y.toFixed(2)}%`)
              .fillColor('#000000')
              .moveDown(0.5);
          }
          
          // Volatility
          if (investmentMetrics.volatility_30d !== undefined) {
            doc.text(`30-Day Volatility: ${investmentMetrics.volatility_30d.toFixed(2)}%`).moveDown(1);
          }
          
          // Investment Analysis
          doc.fontSize(12)
            .fillColor('#444444')
            .text('Analysis:', { underline: true })
            .moveDown(0.2);
          
          // Generate investment analysis based on the data
          let performanceAnalysis = '';
          const roi30d = investmentMetrics.roi_30d ?? 0;
          const roi90d = investmentMetrics.roi_90d ?? 0;
          const roi1y = investmentMetrics.roi_1y ?? 0;
          const volatility = investmentMetrics.volatility_30d ?? 0;

          if (roi30d > 0 && roi90d > 0 && roi1y > 0) {
            performanceAnalysis = 'strong gains across all timeframes';
          } else if (roi30d < 0 && roi90d < 0 && roi1y < 0) {
            performanceAnalysis = 'losses across all observed periods';
          } else if (roi30d > 0 && roi90d < 0) {
            performanceAnalysis = 'recent recovery after a period of decline';
          } else if (roi30d < 0 && roi90d > 0) {
            performanceAnalysis = 'recent decline despite medium-term growth';
          } else {
            performanceAnalysis = 'mixed results across different timeframes';
          }
          
          const volatilityAssessment = volatility > 15 ? 'high' : 
                                      volatility > 7 ? 'moderate' : 'low';
          
          doc.text(`${report.symbol} has shown ${performanceAnalysis}. The token exhibits ${volatilityAssessment} volatility, which ${volatilityAssessment === 'high' ? 'may present both higher risk and opportunity for traders' : volatilityAssessment === 'moderate' ? 'indicates a balanced risk profile' : 'suggests more stable price action'}. ${roi1y > 20 ? 'Long-term performance has been particularly strong.' : roi1y < 0 ? 'Long-term holders have experienced losses.' : 'Long-term performance has been modest.'}`)
            .moveDown(1);
        }

        // Security Metrics Section
        doc
          .fontSize(20)
          .text('Security Analysis', { underline: true })
          .moveDown();

        doc.fontSize(14);
        
        // Fraud Risk Score with color-coding
        if (report.securityMetrics.fraudScore !== undefined) {
          const fraudScore = report.securityMetrics.fraudScore;
          let riskLevel = '';
          let scoreColor = '#000000';
          
          if (fraudScore < 25) {
            riskLevel = 'Low Risk';
            scoreColor = '#007700';
          } else if (fraudScore < 50) {
            riskLevel = 'Moderate Risk';
            scoreColor = '#FFA500';
          } else if (fraudScore < 75) {
            riskLevel = 'High Risk';
            scoreColor = '#FF6600';
          } else {
            riskLevel = 'Very High Risk';
            scoreColor = '#FF0000';
          }
          
          doc.text(`Fraud Risk Score: `)
             .fillColor(scoreColor)
             .text(`${fraudScore.toFixed(2)}/100 - ${riskLevel}`, { continued: false })
             .fillColor('#000000')
             .moveDown();
        }
        
        // Security Incidents
        if (report.securityMetrics.securityIncidents?.length) {
          doc
            .fontSize(16)
            .text('Security Incidents:')
            .moveDown();

          report.securityMetrics.securityIncidents.forEach((incident) => {
            doc
              .fontSize(12)
              .text(`• ${incident}`)
              .moveDown(0.5);
          });
        }

        // Market Manipulation
        if (report.securityMetrics.marketManipulationIndicators?.length) {
          doc
            .moveDown()
            .fontSize(16)
            .text('Market Manipulation Indicators:')
            .moveDown();

          report.securityMetrics.marketManipulationIndicators.forEach((indicator) => {
            doc
              .fontSize(12)
              .text(`• ${indicator}`)
              .moveDown(0.5);
          });
        }
        
        // Security Analysis
        doc.fontSize(12)
          .fillColor('#444444')
          .text('Analysis:', { underline: true })
          .moveDown(0.2);
        
        // Generate security analysis based on the data
        const fraudScore = report.securityMetrics.fraudScore ?? 0;
        const securityIncidents = report.securityMetrics.securityIncidents ?? [];
        const marketManipulationIndicators = report.securityMetrics.marketManipulationIndicators ?? [];

        const fraudRiskAnalysis = fraudScore < 25 ? 
          `${report.symbol} shows low fraud risk indicators, suggesting reliable token mechanics and team transparency.` :
          fraudScore < 50 ?
          `${report.symbol} shows moderate fraud risk factors that warrant additional due diligence.` :
          fraudScore < 75 ?
          `${report.symbol} displays several high-risk indicators that raise significant concerns about token security.` :
          `${report.symbol} exhibits multiple critical risk factors suggesting potential fraudulent activity.`;
          
        const incidentAnalysis = securityIncidents.length > 0 ?
          `The project has experienced ${securityIncidents.length} security incident(s), which ${securityIncidents.length > 2 ? 'indicates significant vulnerability concerns.' : 'should be evaluated carefully within the context of the project\'s maturity.'}` :
          `No documented security incidents were found, which is a positive indicator for the project's security practices.`;
          
        const manipulationAnalysis = marketManipulationIndicators.length > 0 ?
          `There ${marketManipulationIndicators.length === 1 ? 'is' : 'are'} ${marketManipulationIndicators.length} potential market manipulation indicator(s) detected, suggesting possible price or liquidity manipulation.` :
          `No clear market manipulation indicators were detected in the analysis period.`;
          
        doc.text(`${fraudRiskAnalysis} ${incidentAnalysis} ${manipulationAnalysis}`)
          .moveDown(1);

        // On-chain Metrics Section (if available)
        if (report.onChainMetrics) {
          doc
            .moveDown()
            .fontSize(20)
            .text('On-Chain Analysis', { underline: true })
            .moveDown();
          
          const onChainData = report.onChainMetrics;
          doc.fontSize(14);
          
          if (onChainData.activeAddresses !== undefined) {
            doc.text(`Active Addresses: ${formatLargeNumber(onChainData.activeAddresses)}`).moveDown(0.5);
          }
          
          if (onChainData.transactions_24h !== undefined) {
            doc.text(`24h Transactions: ${formatLargeNumber(onChainData.transactions_24h)}`).moveDown(0.5);
          }
          
          if (onChainData.averageTransactionValue !== undefined) {
            doc.text(`Avg Transaction Value: $${onChainData.averageTransactionValue.toFixed(2)}`).moveDown(0.5);
          }
          
          if (onChainData.networkUtilization !== undefined) {
            doc.text(`Network Utilization: ${onChainData.networkUtilization.toFixed(2)}%`).moveDown(1);
          }
          
          // On-chain Analysis
          doc.fontSize(12)
            .fillColor('#444444')
            .text('Analysis:', { underline: true })
            .moveDown(0.2);
          
          // Generate on-chain analysis based on the data
          const activeAddresses = onChainData.activeAddresses ?? 0;
          const transactions24h = onChainData.transactions_24h ?? 0;
          const avgTxValue = onChainData.averageTransactionValue ?? 0;
          const networkUtil = onChainData.networkUtilization ?? 0;

          const activityAssessment = activeAddresses > 100000 ? 'very high' : 
                                    activeAddresses > 10000 ? 'high' : 
                                    activeAddresses > 1000 ? 'moderate' : 'low';
                                      
          const transactionAssessment = transactions24h > 100000 ? 'very high' : 
                                       transactions24h > 10000 ? 'high' : 
                                       transactions24h > 1000 ? 'moderate' : 'low';
                                         
          const averageValueAssessment = avgTxValue > 10000 ? 'primarily by whales/institutions' : 
                                        avgTxValue > 1000 ? 'by a mix of retail and larger investors' : 
                                        'mainly by retail users';
                                          
          const utilizationInsight = networkUtil > 80 ? 'network congestion could be a concern during peak usage' : 
                                    networkUtil > 50 ? 'network shows healthy utilization' : 
                                    'network has significant unused capacity';
            
          doc.text(`On-chain data shows ${activityAssessment} user activity with ${transactionAssessment} transaction volume. The network appears to be used ${averageValueAssessment}. With ${networkUtil.toFixed(2)}% network utilization, ${utilizationInsight}.`)
            .moveDown(1);
        }

        // Social Metrics Section
        doc
          .moveDown()
          .fontSize(20)
          .text('Social Analysis', { underline: true })
          .moveDown();

        doc.fontSize(14);
        
        if (report.socialMetrics.mindshareScore !== undefined) {
          doc.text(`Mindshare Score: ${report.socialMetrics.mindshareScore?.toFixed(2) || 'N/A'}`).moveDown(0.5);
        }
        
        if (report.socialMetrics.kolMentions !== undefined) {
          doc.text(`KOL Mentions: ${report.socialMetrics.kolMentions || 'N/A'}`).moveDown(0.5);
        }
        
        if (report.socialMetrics.twitterFollowers !== undefined) {
          doc.text(`Twitter Followers: ${formatLargeNumber(report.socialMetrics.twitterFollowers)}`).moveDown(0.5);
        }
        
        if (report.socialMetrics.githubActivity !== undefined) {
          doc.text(`GitHub Activity: ${report.socialMetrics.githubActivity}`).moveDown(0.5);
        }
        
        if (report.socialMetrics.developerActivity !== undefined) {
          doc.text(`Developer Activity: ${report.socialMetrics.developerActivity}`).moveDown(1);
        }
        
        // Social Analysis
        doc.fontSize(12)
          .fillColor('#444444')
          .text('Analysis:', { underline: true })
          .moveDown(0.2);
        
        // Generate social analysis based on the data
        const mindshareScore = report.socialMetrics.mindshareScore ?? 0;
        const twitterFollowers = report.socialMetrics.twitterFollowers ?? 0;
        const githubActivity = report.socialMetrics.githubActivity ?? 0;
        const developerActivity = report.socialMetrics.developerActivity ?? 0;
        const kolMentions = report.socialMetrics.kolMentions ?? 0;

        const mindshareAssessment = mindshareScore > 75 ? 'exceptional' : 
                                   mindshareScore > 50 ? 'strong' : 
                                   mindshareScore > 25 ? 'moderate' : 'limited';
                                   
        const communityAssessment = twitterFollowers > 1000000 ? 'massive' : 
                                   twitterFollowers > 100000 ? 'large' : 
                                   twitterFollowers > 10000 ? 'moderate' : 'small';
                                   
        const devAssessment = (githubActivity > 70 || developerActivity > 70) ? 'active' : 
                             (githubActivity > 40 || developerActivity > 40) ? 'moderate' : 'limited';
          
        const kolInsight = kolMentions > 20 ? 'significant attention from key influencers' : 
                          kolMentions > 5 ? 'moderate influencer attention' : 
                          'limited influencer coverage';
          
        doc.text(`${report.symbol} has ${mindshareAssessment} social media presence with a ${communityAssessment} community. The project shows ${devAssessment} development activity and receives ${kolInsight}. ${devAssessment === 'active' ? 'Strong development activity typically indicates ongoing project improvement and commitment.' : devAssessment === 'moderate' ? 'Moderate development suggests continued project evolution.' : 'Limited development activity may be a concern for long-term project viability.'}`)
          .moveDown(1);

        // News Analysis Section
        doc
          .fontSize(20)
          .text('News Analysis', { underline: true })
          .moveDown();

        doc.fontSize(14);
        
        if (report.newsMetrics.sentimentScore !== undefined) {
          const sentimentScore = report.newsMetrics.sentimentScore;
          let sentimentText = '';
          let sentimentColor = '#000000';
          
          if (sentimentScore < -0.5) {
            sentimentText = 'Very Negative';
            sentimentColor = '#FF0000';
          } else if (sentimentScore < 0) {
            sentimentText = 'Negative';
            sentimentColor = '#FF6600';
          } else if (sentimentScore < 0.5) {
            sentimentText = 'Neutral';
            sentimentColor = '#FFA500';
          } else {
            sentimentText = 'Positive';
            sentimentColor = '#007700';
          }
          
          doc.text(`Sentiment Score: `)
             .fillColor(sentimentColor)
             .text(`${sentimentScore.toFixed(2)} - ${sentimentText}`, { continued: false })
             .fillColor('#000000')
             .moveDown();
        }
        
        if (report.newsMetrics.communityBuzz !== undefined) {
          doc.text(`Community Buzz: ${report.newsMetrics.communityBuzz.toFixed(2)}`).moveDown(1);
        }

        if (report.newsMetrics.recentNews?.length) {
          doc
            .fontSize(16)
            .text('Recent News:')
            .moveDown();

          report.newsMetrics.recentNews.forEach((news) => {
            doc
              .fontSize(12)
              .text(`• ${news.title || news}`)
              .moveDown(0.5);
          });
        }
        
        // News Analysis
        doc.fontSize(12)
          .fillColor('#444444')
          .text('Analysis:', { underline: true })
          .moveDown(0.2);
        
        // Generate news analysis based on the data
        const sentimentScore = report.newsMetrics.sentimentScore ?? 0;
        const communityBuzz = report.newsMetrics.communityBuzz ?? 0;
        const recentNews = report.newsMetrics.recentNews ?? [];

        const sentimentAssessment = sentimentScore > 0.5 ? 'overwhelmingly positive' : 
                                   sentimentScore > 0 ? 'generally positive' : 
                                   sentimentScore > -0.5 ? 'mixed to negative' : 'strongly negative';
                                   
        const buzzAssessment = communityBuzz > 8 ? 'extremely high' : 
                              communityBuzz > 6 ? 'high' : 
                              communityBuzz > 4 ? 'moderate' : 'low';
                              
        const newsInsight = recentNews.length > 5 ? 
                           'significant media coverage recently' : 
                           recentNews.length > 0 ? 
                           'some media coverage' : 'limited recent media coverage';
          
        doc.text(`Current news sentiment for ${report.symbol} is ${sentimentAssessment}, with ${buzzAssessment} community discussion volume. The project has received ${newsInsight}. ${sentimentScore > 0 && communityBuzz > 5 ? 'The combination of positive sentiment and high engagement often correlates with price appreciation.' : sentimentScore < 0 && communityBuzz > 5 ? 'High buzz with negative sentiment may indicate controversial developments that could impact price negatively.' : ''}`)
          .moveDown(1);

        // Recent Events Section (if available)
        if (report.recentEvents?.upcoming?.length || report.recentEvents?.past?.length) {
          doc
            .moveDown()
            .fontSize(20)
            .text('Recent & Upcoming Events', { underline: true })
            .moveDown();
          
          // Upcoming events
          if (report.recentEvents.upcoming?.length) {
            doc
              .fontSize(16)
              .text('Upcoming Events:')
              .moveDown();
            
            report.recentEvents.upcoming.forEach((event) => {
              doc
                .fontSize(12)
                .text(`• ${event.title || event.name || event}`)
                .moveDown(0.5);
            });
          }
          
          // Past events
          if (report.recentEvents.past?.length) {
            doc
              .fontSize(16)
              .text('Past Events:')
              .moveDown();
            
            report.recentEvents.past.forEach((event) => {
              doc
                .fontSize(12)
                .text(`• ${event.title || event.name || event}`)
                .moveDown(0.5);
            });
          }
        }

        // Footer
        doc
          .moveDown(2)
          .fontSize(10)
          .text('Generated using Messari API', {
            align: 'center',
          })
          .text('Data provided for informational purposes only - Not financial advice', {
            align: 'center',
          })
          .moveDown(0.5)
          .text(`Report date: ${new Date().toLocaleString()}`, {
            align: 'center',
          });

        // Finalize the PDF and end the stream
        doc.end();

      } catch (error) {
        console.error('Error generating PDF:', error);
        reject(error);
      }
    });
  }
}

export class MessariPDFTool extends Tool {
  private messariAPI: MessariAPI;

  constructor(messariAPI: MessariAPI) {
    super();
    this.messariAPI = messariAPI;
  }

  name = "MessariPDFTool";
  description = "Tool ONLY for generating token security reports in PDF format. Input MUST be a cryptocurrency token symbol like 'BTC', 'ETH', 'SOL', etc. DO NOT use for wallet addresses or contract addresses. This specifically generates reports about token security metrics, not wallet analysis.";

  private extractTokenSymbol(input: string): string | null {
    // Common token symbols to look for
    const commonTokens = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC', 'DOT', 'ADA', 'XRP', 'DOGE', 'SHIB', 'LINK', 'UNI', 'AAVE'];
    
    // Clean and uppercase the input
    const cleanedInput = input.toUpperCase();
    
    // Try to find an exact token symbol in the input
    for (const token of commonTokens) {
      if (cleanedInput.includes(token)) {
        return token;
      }
    }
    
    // Try to extract based on patterns
    // Look for token symbol patterns like "XYZ token" or "token XYZ"
    const tokenPatterns = [
      /\b([A-Z]{2,5})\s+token\b/i,      // "SOL token"
      /\btoken\s+([A-Z]{2,5})\b/i,       // "token SOL"
      /\breport\s+for\s+([A-Z]{2,5})\b/i // "report for SOL"
    ];
    
    for (const pattern of tokenPatterns) {
      const match = cleanedInput.match(pattern);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    }
    
    // If all else fails, just take the first word that looks like a token symbol
    const words = cleanedInput.split(/\s+/);
    for (const word of words) {
      // Token symbols are usually 2-5 uppercase letters
      if (/^[A-Z]{2,5}$/.test(word)) {
        return word;
      }
    }
    
    // Fallback to the first word if no token symbol found
    if (words.length > 0) {
      return words[0];
    }
    
    return null;
  }

  async _call(input: string): Promise<string> {
    try {
      // Extract the token symbol from the input
      const tokenSymbol = this.extractTokenSymbol(input);
      if (!tokenSymbol) {
        return "Please provide a valid token symbol like BTC, ETH, or SOL to generate a PDF report.";
      }
      
      // Generate the PDF report
      console.log(`Generating PDF report for ${tokenSymbol}...`);
      const result = await this.messariAPI.generatePDFReport(tokenSymbol);
      console.log(`PDF report for ${tokenSymbol} generated successfully.`);
      
      // Validate that the result contains the expected PDF data
      try {
        const jsonResult = JSON.parse(result);
        if (!jsonResult.base64PDF || !jsonResult.fileName) {
          throw new Error("Invalid PDF data format");
        }
      } catch (parseError) {
        // If the result is not valid JSON with PDF data, it's probably an error message
        return `Failed to generate PDF: ${result}`;
      }
      
      return result;
    } catch (error) {
      console.error('Error in MessariPDFTool:', error);
      if (error instanceof Error) {
        return `Error generating PDF report: ${error.message}`;
      }
      return 'Unknown error occurred during PDF generation';
    }
  }
} 