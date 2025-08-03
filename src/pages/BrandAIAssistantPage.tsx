import React, { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import BrandSidebar from '@/components/brand/BrandSidebar';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { aiAssistantService } from '@/services/aiAssistant';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const BrandAIAssistantPage = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI Marketing Assistant. I can help you with campaign strategies, influencer recommendations, content ideas, and market insights. How can I assist you today?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | undefined>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages, isTyping]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile?.user_type === 'Influencer') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <BrandSidebar userName={profile?.name} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="p-8 pb-4 flex-shrink-0">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary/10 rounded-lg backdrop-blur-sm border border-brand-primary/20">
                <Sparkles className="h-8 w-8 text-brand-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">AI Marketing Assistant</h1>
                <p className="text-muted-foreground">Your intelligent partner for campaign success</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 flex-1 overflow-hidden">
          <Card className="h-full flex flex-col overflow-hidden glass border-white/20">
            <CardHeader className="border-b bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bot className="h-8 w-8 text-brand-primary" />
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-brand-primary rounded-full border-2 border-background" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-card-foreground">AI Assistant</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Always here to help</CardDescription>
                  </div>
                </div>
                  <Badge className="bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                    Online
                  </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
              <div ref={scrollAreaRef} className="flex-1 overflow-y-auto scroll-smooth">
                <div className="p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[70%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-shrink-0 ${message.sender === 'user' ? 'order-2' : ''}`}>
                          {message.sender === 'assistant' ? (
                            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center backdrop-blur-sm border border-brand-primary/20">
                              <Bot className="h-5 w-5 text-brand-primary" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            message.sender === 'user'
                              ? 'bg-brand-primary text-brand-primary-foreground'
                              : 'bg-card text-card-foreground border border-border'
                          }`}
                        >
                          {message.sender === 'assistant' ? (
                            <div className="prose prose-sm max-w-none">
                              <div 
                                className="text-sm leading-relaxed [&>h3]:text-base [&>h3]:font-bold [&>h3]:mt-4 [&>h3]:mb-3 [&>h3]:text-foreground [&>ul]:space-y-2 [&>ul]:ml-0 [&>ul]:list-none [&>ul>li]:pl-0 [&>hr]:my-4 [&>hr]:border-border [&>p]:mb-3 [&>p]:text-card-foreground [&_strong]:font-semibold [&_strong]:text-foreground"
                                dangerouslySetInnerHTML={{ 
                                  __html: message.content
                                    .split('\n').map(line => {
                                      // Handle headers
                                      if (line.startsWith('### **')) {
                                        return line.replace(/### \*\*(.+)\*\*/, '<h3>$1</h3>');
                                      }
                                      // Handle horizontal rules
                                      if (line === '---') {
                                        return '<hr/>';
                                      }
                                      // Handle main bullet points
                                      if (line.startsWith('* **') && line.includes(':**')) {
                                        return '<p class="mb-2">• ' + line.substring(2).replace(/\*\*(.+?):\*\*/, '<strong>$1:</strong>') + '</p>';
                                      }
                                      // Handle sub-bullet points (indented)
                                      if (line.startsWith('  * ')) {
                                        return '<p class="ml-6 mb-1 text-sm">◦ ' + line.substring(4) + '</p>';
                                      }
                                      // Handle **Why?** section
                                      if (line === '**Why?**') {
                                        return '<p class="font-bold mt-2 mb-2">Why?</p>';
                                      }
                                      // Handle regular paragraphs with bold
                                      if (line.length > 0) {
                                        return '<p>' + line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</p>';
                                      }
                                      return '';
                                    }).join('')
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          )}
                          <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-brand-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[70%]">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center backdrop-blur-sm border border-brand-primary/20">
                          <Bot className="h-5 w-5 text-brand-primary animate-pulse" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-card border border-border min-w-[80px]">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-xs text-muted-foreground animate-pulse">Thinking</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-border p-4 bg-muted/50 flex-shrink-0">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (inputMessage.trim()) {
                      const newMessage: Message = {
                        id: Date.now().toString(),
                        content: inputMessage,
                        sender: 'user',
                        timestamp: new Date()
                      };
                      
                      // Add user message to UI
                      setMessages(prev => [...prev, newMessage]);
                      setInputMessage('');
                      setIsTyping(true);
                      
                      try {
                        // Format conversation history for the API
                        const conversationHistory = aiAssistantService.formatConversationHistory(
                          [...messages.slice(1), newMessage] // Skip the initial greeting
                        );
                        
                        // Call the AI assistant
                        const response = await aiAssistantService.sendMessage(
                          conversationHistory,
                          currentCampaignId
                        );
                        
                        if (response.error) {
                          throw new Error(response.error);
                        }
                        
                        // Add AI response to messages
                        const aiResponse: Message = {
                          id: (Date.now() + 1).toString(),
                          content: response.message,
                          sender: 'assistant',
                          timestamp: new Date()
                        };
                        
                        setMessages(prev => [...prev, aiResponse]);
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: error instanceof Error ? error.message : "Failed to get AI response",
                          variant: "destructive"
                        });
                        
                        // Add error message to chat
                        const errorMessage: Message = {
                          id: (Date.now() + 1).toString(),
                          content: "I'm sorry, I encountered an error. Please try again.",
                          sender: 'assistant',
                          timestamp: new Date()
                        };
                        setMessages(prev => [...prev, errorMessage]);
                      } finally {
                        setIsTyping(false);
                      }
                    }
                  }}
                  className="flex gap-3"
                >
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me about campaigns, influencers, or marketing strategies..."
                    className="flex-1 bg-background border-border focus:border-brand-primary focus:ring-brand-primary/20"
                    disabled={isTyping}
                  />
                  <Button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrandAIAssistantPage;