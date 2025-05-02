import React, { useState } from 'react';
import { MessariAPI } from './index';
import { TokenReportGenerator } from './reportGenerator';
import { PDFReportGenerator } from './pdfGenerator';

interface TokenSecurityReportProps {
  initialTokenSymbol?: string;
}

export const TokenSecurityReport: React.FC<TokenSecurityReportProps> = ({ initialTokenSymbol = '' }) => {
  const [tokenSymbol, setTokenSymbol] = useState(initialTokenSymbol);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  const generateReport = async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const messariAPI = new MessariAPI();
      const reportGenerator = new TokenReportGenerator(messariAPI);
      const report = await reportGenerator.generateSecurityReport(symbol);
      setReport(report);

      // Generate PDF
      const pdfGenerator = new PDFReportGenerator();
      const pdfBuffer = await pdfGenerator.generateReport(report);

      // Create download link
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${symbol}_security_report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter token symbol (e.g., SOL)"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          className="px-4 py-2 border rounded-lg mr-2"
        />
        <button
          onClick={() => tokenSymbol && generateReport(tokenSymbol)}
          disabled={loading || !tokenSymbol}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}

      {report && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">
            {report.name} ({report.symbol}) Security Report
          </h2>

          {/* Security Metrics */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Security Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">Fraud Risk Score</p>
                <p className="text-2xl">{report.securityMetrics.fraudScore?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Social Metrics */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Social Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">Mindshare Score</p>
                <p className="text-2xl">{report.socialMetrics.mindshareScore || 'N/A'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">KOL Mentions</p>
                <p className="text-2xl">{report.socialMetrics.kolMentions || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* News Analysis */}
          <div>
            <h3 className="text-xl font-semibold mb-2">News Analysis</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Sentiment Score</p>
              <p className="text-2xl">{report.newsMetrics.sentimentScore?.toFixed(2) || 'N/A'}</p>
            </div>
            {report.newsMetrics.recentNews?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recent News</h4>
                <ul className="list-disc pl-5">
                  {report.newsMetrics.recentNews.map((news: any, index: number) => (
                    <li key={index} className="mb-2">
                      {news.title || news}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 