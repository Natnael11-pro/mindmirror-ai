// src/components/MessageBubble.tsx
import { motion } from 'framer-motion';
import React, { useState, useRef } from 'react';
import { Copy, Check, Download, Printer } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

// Helper function to parse markdown tables and add Download/Print buttons
function parseMarkdownTable(markdown: string): React.ReactNode {
  const lines = markdown.split('\n').filter(line => line.trim());
  const rows: string[][] = [];
  
  lines.forEach(line => {
    if (line.includes('|')) {
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      if (cells.length > 0) {
        rows.push(cells);
      }
    }
  });
  
  if (rows.length < 2) return null; // Need at least header + separator
  
  const headers = rows[0];
  const dataRows = rows.slice(2); // Skip header and separator row

  const downloadAsCSV = () => {
    const csvRows = [
      headers.map(h => `"${h.replace(/\*\*/g, '').replace(/"/g, '""')}"`),
      ...dataRows.map(row => row.map(cell => `"${cell.replace(/\*\*/g, '').replace(/"/g, '""')}"`))
    ];
    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mindmirror_plan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="my-3">
      {/* Action Buttons for Table */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={downloadAsCSV}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download size={14} />
          Download CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-blue-600/20">
              {headers.map((header, idx) => (
                <th key={idx} className="border-b border-gray-700 px-4 py-2.5 text-left font-semibold text-blue-300">
                  {header.replace(/\*\*/g, '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800/30'}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="border-b border-gray-700/50 px-4 py-2.5 text-gray-300 last:border-b-0">
                    {cell.replace(/\*\*/g, '').replace(/<br>/g, ' • ')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function to convert URLs to clickable links
function renderContentWithLinks(content: string) {
  const urlRegex = /https?:\/\/[^\s<\])"'`]+/g;
  const parts = content.split(urlRegex);
  const matches = content.match(urlRegex) || [];
  const result: React.JSX.Element[] = [];
  let matchIndex = 0;
  
  parts.forEach((part, index) => {
    if (part) {
      result.push(<span key={`text-${index}`}>{part}</span>);
    }
    if (matchIndex < matches.length) {
      const url = matches[matchIndex].trim();
      const cleanUrl = url.replace(/[.,;:!?]+$/, '');
      result.push(
        <a key={`link-${index}`} href={cleanUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline break-all">
          {cleanUrl}
        </a>
      );
      matchIndex++;
    }
  });
  return result;
}

// Main content parser - handles markdown formatting
function parseContent(content: string): React.ReactNode[] {
  const blocks = content.split('\n\n');
  const elements: React.ReactNode[] = [];
  
  blocks.forEach((block, index) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return;
    
    // Check for markdown table
    if (trimmedBlock.includes('|') && trimmedBlock.split('\n').some(line => line.includes('|'))) {
      const tableElement = parseMarkdownTable(trimmedBlock);
      if (tableElement) {
        elements.push(tableElement);
        return;
      }
    }
    
    // Check for headers
    if (trimmedBlock.startsWith('## ')) {
      elements.push(
        <h3 key={index} className="text-lg font-bold text-blue-400 mt-4 mb-2">
          {renderContentWithLinks(trimmedBlock.replace('## ', ''))}
        </h3>
      );
      return;
    }
    
    if (trimmedBlock.startsWith('### ')) {
      elements.push(
        <h4 key={index} className="text-base font-bold text-blue-300 mt-3 mb-2">
          {renderContentWithLinks(trimmedBlock.replace('### ', ''))}
        </h4>
      );
      return;
    }
    
    // Check for bullet points or numbered lists
    if (trimmedBlock.includes('\n') && (trimmedBlock.includes('- ') || trimmedBlock.match(/^\d+\./))) {
      const lines = trimmedBlock.split('\n');
      const listItems = lines.map((line, idx) => {
        const cleanedLine = line.replace(/^[\d-]+\.\s*/, '').replace(/^- /, '');
        return (
          <li key={idx} className="mb-1 ml-4">
            {renderContentWithLinks(cleanedLine)}
          </li>
        );
      });
      elements.push(
        <ul key={index} className="list-disc list-inside space-y-1 my-2 text-gray-300">
          {listItems}
        </ul>
      );
      return;
    }
    
    // Regular paragraph
    elements.push(
      <p key={index} className="mb-3 leading-relaxed text-gray-300">
        {renderContentWithLinks(trimmedBlock)}
      </p>
    );
  });
  
  return elements;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!contentRef.current) return;
    
    // Open a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print this response.');
      return;
    }

    // Get the rendered HTML content
    const htmlContent = contentRef.current.innerHTML;
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Write a clean, professional print template
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MindMirror AI - Printed Plan</title>
        <style>
          body { 
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
            padding: 40px; 
            color: #1f2937; 
            line-height: 1.6; 
            max-width: 800px;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 20px; 
          }
          .header h1 { font-size: 28px; color: #111827; margin: 0; font-weight: 700; }
          .header p { color: #6b7280; font-size: 14px; margin-top: 8px; }
          
          h3 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 24px; font-size: 18px; }
          h4 { color: #4b5563; margin-top: 16px; font-size: 16px; }
          p { margin-bottom: 16px; font-size: 15px; }
          
          table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }
          th { background-color: #f3f4f6; color: #1f2937; padding: 12px; text-align: left; border: 1px solid #d1d5db; font-weight: 600; }
          td { padding: 12px; border: 1px solid #d1d5db; color: #374151; }
          tr:nth-child(even) { background-color: #f9fafb; }
          
          ul { margin: 16px 0; padding-left: 24px; }
          li { margin-bottom: 8px; font-size: 15px; }
          a { color: #2563eb; text-decoration: none; }
          
          .no-print { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
          }
          .print-btn {
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: background 0.2s;
          }
          .print-btn:hover { background: #1d4ed8; }

          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
            a { text-decoration: none; color: #000; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MindMirror AI</h1>
          <p>Generated on ${dateStr}</p>
        </div>
        <div class="content">
          ${htmlContent}
        </div>
        <div class="no-print">
          <button class="print-btn" onclick="window.print()">🖨️ Print This Document</button>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 12px;">Tip: In the print dialog, select "Save as PDF" to keep a digital copy.</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait a moment for styles to apply, then trigger print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}
    >
      <div
        className={`relative max-w-[90%] lg:max-w-[80%] rounded-2xl px-5 py-4 shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
            : 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700'
        }`}
      >
        {/* Message Content */}
        <div ref={contentRef} className="text-sm leading-relaxed break-words">
          {isUser ? (
            content
          ) : (
            parseContent(content)
          )}
        </div>

        {/* Action Buttons (Only for Assistant) */}
        {!isUser && (
          <div className="absolute -bottom-8 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 bg-gray-800/90 hover:bg-gray-800 px-2.5 py-1.5 rounded-md border border-gray-700 transition-colors"
              title="Copy response"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 bg-gray-800/90 hover:bg-gray-800 px-2.5 py-1.5 rounded-md border border-gray-700 transition-colors"
              title="Print response"
            >
              <Printer size={14} />
              Print
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}