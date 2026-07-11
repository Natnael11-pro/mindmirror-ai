// src/components/InputBar.tsx
import { useState } from 'react';
import { Send } from 'lucide-react';

interface InputBarProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function InputBar({ onSend, isLoading }: InputBarProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="flex items-end gap-2 bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-700 focus-within:border-blue-500/50 transition-colors">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Share what's on your mind..."
          rows={1}
          className="flex-1 bg-transparent px-3 py-2 outline-none text-gray-100 placeholder-gray-500 resize-none max-h-32 min-h-[44px]"
          disabled={isLoading}
          style={{ height: 'auto' }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
        >
          <Send size={18} className="text-white" />
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-2 text-center">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
}