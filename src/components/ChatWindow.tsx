// src/components/ChatWindow.tsx
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { Loader2 } from 'lucide-react';
import type { Message } from '../services/aiService';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const displayMessages = messages.filter(
    (msg): msg is Message & { role: 'user' | 'assistant' } => 
      msg.role === 'user' || msg.role === 'assistant'
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-2">
      <AnimatePresence mode="popLayout">
        {displayMessages.map((msg, index) => (
          <MessageBubble
            key={index}
            role={msg.role}
            content={msg.content}
          />
        ))}
      </AnimatePresence>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start mb-4"
        >
          <div className="bg-gray-800 rounded-2xl rounded-bl-md px-5 py-4 border border-gray-700 shadow-md">
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-400" />
              <span className="text-sm text-gray-400">MindMirror is thinking...</span>
            </div>
          </div>
        </motion.div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}