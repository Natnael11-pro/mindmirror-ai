// src/components/MessageBubble.tsx
import { motion } from 'framer-motion';
import React from 'react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

// Helper function to convert URLs to clickable links
function renderContentWithLinks(content: string) {
  // Better regex that avoids markdown formatting
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
      // Clean up URL - remove trailing punctuation
      const cleanUrl = url.replace(/[.,;:!?]+$/, '');
      
      result.push(
        <a
          key={`link-${index}`}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline break-all"
        >
          {cleanUrl}
        </a>
      );
      matchIndex++;
    }
  });
  
  return result;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[85%] lg:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
            : 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700'
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {renderContentWithLinks(content)}
        </div>
      </div>
    </motion.div>
  );
}