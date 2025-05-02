import React, { useState } from 'react';
import { AgentSwapHandler } from './AgentSwapHandler';

export function AgentChat() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, {role: 'user', content: query}]);
    setLoading(true);
    
    // Simulate agent response (in a real app, this would be an API call)
    setTimeout(() => {
      // Generate an appropriate response based on the query
      let response = "I'm here to help. What would you like to know?";
      
      if (query.toLowerCase().includes('swap') || 
          query.toLowerCase().includes('exchange') || 
          query.toLowerCase().includes('trade')) {
        if (query.toLowerCase().includes('bnb') || 
            query.toLowerCase().includes('binance')) {
          response = "I can help you swap tokens on BNB Chain. Here's a swap interface for you:";
        } else {
          response = "I can help you swap tokens. I'll default to BNB Chain for now:";
        }
      }
      
      setMessages(prev => [...prev, {role: 'assistant', content: response}]);
      setLoading(false);
      setQuery('');
    }, 1000);
  };
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-4 border rounded-lg p-4 h-80 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 p-2 rounded ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100'}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="flex justify-center items-center gap-2 text-gray-500">
            <span>Thinking</span>
            <span className="animate-pulse">.</span>
            <span className="animate-pulse delay-100">.</span>
            <span className="animate-pulse delay-200">.</span>
          </div>
        )}
      </div>
      
      {/* Render swap widget based on last query */}
      {messages.length > 0 && messages[messages.length-1].role === 'assistant' && 
        <AgentSwapHandler query={messages[messages.length-2]?.content || ''} />
      }
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border rounded-md p-2"
          placeholder="Ask about swapping on BNB Chain..."
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
} 