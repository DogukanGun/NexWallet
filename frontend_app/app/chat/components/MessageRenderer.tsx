import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeDisplayBlock from './code-display-block';
import PDFViewer from '@/app/components/PDFViewer';

interface MessageRendererProps {
  content: string;
}

/**
 * Extract valid JSON from a string that might contain text mixed with JSON
 * @param text - The string to extract JSON from
 * @returns The parsed JSON object or null if no valid JSON found
 */
function extractJSON(text: string): any | null {
  // Look for potential JSON objects (between curly braces)
  const jsonRegex = /{[\s\S]*?}/g;
  const matches = text.match(jsonRegex);
  
  if (!matches) return null;
  
  // Try to parse each potential JSON object
  for (const match of matches) {
    try {
      const parsed = JSON.parse(match);
      // If this is a PDF object, return it immediately
      if (parsed.base64PDF && parsed.fileName) {
        return parsed;
      }
    } catch (e) {
      // Skip invalid JSON
      continue;
    }
  }
  
  return null;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ content }) => {
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Try to find a valid PDF JSON object in the content
  let pdfData = extractJSON(content);
  
  // Handle PDF content
  if (pdfData && pdfData.base64PDF && pdfData.fileName) {
    try {
      return (
        <PDFViewer 
          base64Data={pdfData.base64PDF} 
          fileName={pdfData.fileName}
        />
      );
    } catch (e) {
      console.error('Error displaying PDF:', e);
      setPdfError('Failed to display PDF. Please try downloading it.');
    }
  }

  // Display PDF error if there was a problem
  if (pdfError) {
    return <div className="text-red-500">{pdfError}</div>;
  }

  // Handle error messages that come from PDF generation
  if (content.includes('Error generating PDF report:')) {
    return (
      <div className="text-red-500">
        {content}
        <div className="mt-4">
          <p className="text-white">Please try again with a different token symbol.</p>
        </div>
      </div>
    );
  }

  // Handle regular text/markdown with code blocks
  return (
    <>
      {content.split("```").map((part, index) => {
        if (index % 2 === 0) {
          return (
            <Markdown key={index} remarkPlugins={[remarkGfm]}>
              {part}
            </Markdown>
          );
        } else {
          return (
            <pre className="whitespace-pre-wrap" key={index}>
              <CodeDisplayBlock code={part} lang="" />
            </pre>
          );
        }
      })}
    </>
  );
};

export default MessageRenderer; 