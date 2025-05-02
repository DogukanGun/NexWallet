import React, { useState, useEffect } from 'react';

interface PDFViewerProps {
  base64Data: string;
  fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ base64Data, fileName }) => {
  const [error, setError] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      // Instead of using iframe with data URL, convert to Blob and create object URL
      // This works better in most browsers
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setObjectUrl(url);
      
      // Clean up object URL when component unmounts
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('Error creating PDF object URL:', err);
      setError('Error displaying PDF preview');
    }
  }, [base64Data]);

  const downloadPDF = () => {
    try {
      if (!objectUrl) {
        throw new Error('PDF not ready yet');
      }
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div className="w-full rounded-md overflow-hidden border border-gray-700 bg-gray-900">
      <div className="flex items-center justify-between p-3 bg-gray-800">
        <span className="text-white font-medium truncate">{fileName}</span>
        <button 
          onClick={downloadPDF}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
        >
          Download
        </button>
      </div>
      <div className="p-4">
        <div className="mb-3 text-gray-300 text-sm">
          <p>PDF Report Ready for Download</p>
          <p className="text-xs text-gray-400 mt-1">Click the button above to download your report</p>
        </div>
        
        {error ? (
          <div className="w-full h-[400px] flex items-center justify-center border border-gray-700 rounded-md bg-gray-800">
            <div className="text-center">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={downloadPDF}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
              >
                Try Download Again
              </button>
            </div>
          </div>
        ) : (
          objectUrl ? (
            <iframe 
              src={objectUrl}
              className="w-full h-[400px] border border-gray-700 rounded-md bg-white"
              title={fileName}
              onError={() => setError('Failed to load PDF preview')}
            />
          ) : (
            <div className="w-full h-[400px] flex items-center justify-center border border-gray-700 rounded-md bg-gray-800">
              <div className="text-center">
                <div className="animate-pulse text-blue-400">Loading PDF...</div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PDFViewer; 