import React, { useState } from 'react';
import { Send, Plus, MessageSquare, Trash2 } from 'lucide-react';
import BrandSidebar from '@/components/brand/BrandSidebar';
import { useAuth } from '@/hooks/use-auth';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const BrandAIAssistant = () => {
  const { profile } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: '1',
      title: 'Campaign Strategy Help',
      messages: [
        {
          id: '1',
          content: 'How can I create an effective influencer marketing campaign for a tech product launch?',
          role: 'user',
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: '2',
          content: 'Great question! For a tech product launch, here are key strategies:\n\n1. **Target the right influencers**: Look for tech reviewers, early adopters, and industry experts\n2. **Create compelling content**: Provide hands-on demos, unboxing experiences, and real-world use cases\n3. **Timing is crucial**: Start building buzz 2-3 weeks before launch\n4. **Multi-platform approach**: Utilize YouTube for detailed reviews, Instagram for visual appeal, and Twitter for real-time updates\n\nWould you like me to elaborate on any of these points?',
          role: 'assistant',
          timestamp: new Date(Date.now() - 3500000)
        }
      ],
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3500000)
    }
  ]);

  const [activeThreadId, setActiveThreadId] = useState<string>('1');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeThread = threads.find(t => t.id === activeThreadId);

  const createNewThread = () => {
    const newThread: Thread = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setThreads([newThread, ...threads]);
    setActiveThreadId(newThread.id);
  };

  const deleteThread = (threadId: string) => {
    const updatedThreads = threads.filter(t => t.id !== threadId);
    setThreads(updatedThreads);
    if (activeThreadId === threadId && updatedThreads.length > 0) {
      setActiveThreadId(updatedThreads[0].id);
    } else if (updatedThreads.length === 0) {
      createNewThread();
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeThread) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    // Update thread with user message
    const updatedThreads = threads.map(thread => {
      if (thread.id === activeThreadId) {
        const updatedThread = {
          ...thread,
          messages: [...thread.messages, userMessage],
          updatedAt: new Date(),
          title: thread.messages.length === 0 ? inputMessage.slice(0, 30) + '...' : thread.title
        };
        return updatedThread;
      }
      return thread;
    });
    setThreads(updatedThreads);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm here to help you with your influencer marketing campaigns! This is a demo response. In a real implementation, this would connect to an AI service to provide intelligent assistance with campaign strategy, content ideas, influencer selection, and performance optimization.",
        role: 'assistant',
        timestamp: new Date()
      };

      setThreads(prev => prev.map(thread => {
        if (thread.id === activeThreadId) {
          return {
            ...thread,
            messages: [...thread.messages, aiMessage],
            updatedAt: new Date()
          };
        }
        return thread;
      }));
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BrandSidebar />
      
      <div className="flex-1 ml-64 flex">
        {/* Thread Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={createNewThread}
              className="w-full flex items-center gap-3 px-4 py-3 bg-[#1DDCD3] text-white rounded-lg hover:bg-[#00D4C7] transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Conversation
            </button>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  activeThreadId === thread.id
                    ? 'bg-[#1DDCD3] text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveThreadId(thread.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{thread.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread(thread.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-xs opacity-70 mt-1">
                  {thread.updatedAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <h1 className="text-xl font-bold text-[#1a1f2e]">AI Assistant</h1>
            <p className="text-sm text-gray-600">Get help with your influencer marketing campaigns</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeThread?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-[#1DDCD3] text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-3xl px-4 py-3 rounded-2xl bg-white border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your influencer marketing campaigns..."
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#1DDCD3] focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="p-3 bg-[#1DDCD3] text-white rounded-lg hover:bg-[#00D4C7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandAIAssistant;
