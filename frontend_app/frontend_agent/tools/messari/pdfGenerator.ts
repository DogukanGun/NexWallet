import PDFDocument from 'pdfkit';
import { TokenReport } from './index';

export class PDFReportGenerator {
  private doc: InstanceType<typeof PDFDocument>;

  constructor() {
    this.doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });
  }

  async generateReport(report: TokenReport): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      this.doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      this.doc.on('end', () => resolve(Buffer.concat(chunks)));
      this.doc.on('error', reject);

      // Header
      this.doc
        .fontSize(25)
        .text(`Security Analysis Report: ${report.name} (${report.symbol})`, {
          align: 'center',
        })
        .moveDown(2);

      // Security Metrics Section
      this.doc
        .fontSize(20)
        .text('Security Analysis', { underline: true })
        .moveDown();

      this.doc
        .fontSize(14)
        .text(`Fraud Risk Score: ${report.securityMetrics.fraudScore?.toFixed(2) || 'N/A'}/100`)
        .moveDown();

      // Security Incidents
      if (report.securityMetrics.securityIncidents?.length) {
        this.doc
          .fontSize(16)
          .text('Security Incidents:')
          .moveDown();

        report.securityMetrics.securityIncidents.forEach((incident) => {
          this.doc
            .fontSize(12)
            .text(`• ${incident}`)
            .moveDown(0.5);
        });
      }

      // Market Manipulation
      if (report.securityMetrics.marketManipulationIndicators?.length) {
        this.doc
          .moveDown()
          .fontSize(16)
          .text('Market Manipulation Indicators:')
          .moveDown();

        report.securityMetrics.marketManipulationIndicators.forEach((indicator) => {
          this.doc
            .fontSize(12)
            .text(`• ${indicator}`)
            .moveDown(0.5);
        });
      }

      // Social Metrics Section
      this.doc
        .moveDown()
        .fontSize(20)
        .text('Social Analysis', { underline: true })
        .moveDown();

      this.doc
        .fontSize(14)
        .text(`Mindshare Score: ${report.socialMetrics.mindshareScore || 'N/A'}`)
        .moveDown()
        .text(`KOL Mentions: ${report.socialMetrics.kolMentions || 'N/A'}`)
        .moveDown(2);

      // News Analysis Section
      this.doc
        .fontSize(20)
        .text('News Analysis', { underline: true })
        .moveDown();

      this.doc
        .fontSize(14)
        .text(`Sentiment Score: ${report.newsMetrics.sentimentScore?.toFixed(2) || 'N/A'}`)
        .moveDown();

      if (report.newsMetrics.recentNews?.length) {
        this.doc
          .fontSize(16)
          .text('Recent News:')
          .moveDown();

        report.newsMetrics.recentNews.forEach((news) => {
          this.doc
            .fontSize(12)
            .text(`• ${news.title || news}`)
            .moveDown(0.5);
        });
      }

      // Footer
      this.doc
        .moveDown(2)
        .fontSize(10)
        .text('Generated using Messari API', {
          align: 'center',
        })
        .text(new Date().toLocaleString(), {
          align: 'center',
        });

      this.doc.end();
    });
  }
} 