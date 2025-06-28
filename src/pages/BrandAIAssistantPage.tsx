
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import BrandSidebar from '@/components/brand/BrandSidebar';
import { useAuth } from '@/hooks/use-auth';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const BrandAIAssistantPage = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. I can help you with campaign strategies, influencer recommendations, and marketing insights. How can I assist you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response (replace with actual AI integration later)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I understand your request. While I\'m currently in demo mode, I can help you with campaign planning, audience analysis, and content strategy recommendations. What specific area would you like to focus on?',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <BrandSidebar userName={profile?.name} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600 mt-1">Get intelligent insights for your campaigns</p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-3xl p-4 ${
                message.isUser 
                  ? 'bg-[#1DDCD3] text-white ml-12' 
                  : 'bg-white border-gray-200 mr-12'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span className={`text-xs mt-2 block ${
                  message.isUser ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-3xl p-4 bg-white border-gray-200 mr-12">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-gray-500 text-sm ml-2">AI is typing...</span>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="flex space-x-4">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your campaigns, influencers, or marketing strategy..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandAIAssistantPage;
