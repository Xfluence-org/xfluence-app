import React, { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import BrandSidebar from '@/components/brand/BrandSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, Send, Sparkles, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const BrandAIAssistantPage = () => {
  const { user, profile, loading } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1DDCD3]"></div>
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <BrandSidebar userName={profile?.name} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="p-8 pb-4 flex-shrink-0">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1DDCD3]/10 rounded-lg">
                <Sparkles className="h-8 w-8 text-[#1DDCD3]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1a1f2e]">AI Marketing Assistant</h1>
                <p className="text-gray-600">Your intelligent partner for campaign success</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 flex-1 overflow-hidden">
          <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-[#1DDCD3]/5 to-[#1DDCD3]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bot className="h-8 w-8 text-[#1DDCD3]" />
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Assistant</CardTitle>
                    <CardDescription className="text-xs">Always here to help</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
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
                            <div className="w-8 h-8 rounded-full bg-[#1DDCD3]/10 flex items-center justify-center">
                              <Bot className="h-5 w-5 text-[#1DDCD3]" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            message.sender === 'user'
                              ? 'bg-[#1DDCD3] text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.sender === 'assistant' ? (
                            <div className="prose prose-sm max-w-none">
                              <div 
                                className="text-sm leading-relaxed [&>h3]:text-base [&>h3]:font-bold [&>h3]:mt-4 [&>h3]:mb-3 [&>h3]:text-gray-900 [&>ul]:space-y-2 [&>ul]:ml-0 [&>ul]:list-none [&>ul>li]:pl-0 [&>hr]:my-4 [&>hr]:border-gray-300 [&>p]:mb-3 [&>p]:text-gray-700 [&_strong]:font-semibold [&_strong]:text-gray-900"
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
                          <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                            {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[70%]">
                        <div className="w-8 h-8 rounded-full bg-[#1DDCD3]/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-[#1DDCD3] animate-pulse" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-gray-100 min-w-[80px]">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-[#1DDCD3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-[#1DDCD3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-[#1DDCD3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-xs text-gray-500 animate-pulse">Thinking</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t p-4 bg-gray-50 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputMessage.trim()) {
                      const newMessage: Message = {
                        id: Date.now().toString(),
                        content: inputMessage,
                        sender: 'user',
                        timestamp: new Date()
                      };
                      setMessages([...messages, newMessage]);
                      setInputMessage('');
                      
                      // Simulate AI typing with realistic delay
                      setIsTyping(true);
                      
                      // Add a 20 second delay to simulate thinking
                      const thinkingTime = 20000; // 20 seconds
                      
                      setTimeout(() => {
                        setIsTyping(false);
                        const aiResponse: Message = {
                          id: (Date.now() + 1).toString(),
                          content: `Predicting the reach and results of your campaign requires assessing metrics from the video and influencer profile alongside broader campaign factors. Here's an analysis and prediction:

---

### **Influencer Metrics (Based on Provided Data)**

1. **Reach:** ~2,890 unique accounts per post.
2. **Engagement Rate:** ~7.16%.
3. **Impressions-to-Reach Ratio:** ~1.18 (indicates good visibility beyond the initial audience).

---

### **Video-Specific Predictions**

1. **Predicted Reach (per reel/post):**

   * Instagram reels typically outperform posts due to algorithm preferences.
   * With a well-optimized reel:

     * **Baseline Reach:** ~3,000–4,500 accounts.
     * **Viral Potential:** ~6,000–8,000 accounts if boosted by engagement or trending sounds.

2. **Engagement Predictions:**

   * **Reel:** Higher engagement due to dynamic content, ~8–12% engagement rate.
   * **Post:** Moderate engagement, ~6–9% engagement rate.
   * **Engagement Volume:** ~250–500 likes/comments/shares combined.

3. **Conversion Potential:**

   * Average conversion rates for influencer campaigns in skincare: ~2–4%.
   * Expected conversions: ~60–120 actions (clicks, purchases, etc.), depending on CTA clarity and audience relevance.

---

### **Campaign-Level Predictions**

1. **Total Campaign Reach:**

   * If 5 influencers post reels, with an average reach of ~4,000:
     $5 \times 4,000 = 20,000$ unique accounts.
   * Adjust for overlap (~10% audience overlap):
     Final Reach: ~18,000 unique accounts.

2. **Total Engagement Volume:**

   * ~10% engagement rate average across reels/posts.
     $18,000 \times 10\% = 1,800$ likes/comments/shares.

3. **Conversions:**

   * ~3% average conversion rate:
     $1,800 \times 3\% = 54$ purchases or clicks.

---

### **Factors Affecting Results**

1. **Boosting Strategy:** Paid promotions can increase reach by 2–3x.
2. **Relevance of Influencer Audience:** High audience-product fit may yield better engagement and conversions.
3. **Seasonality:** Campaign timing (e.g., holidays) can boost engagement and purchasing intent.

---

### **Predicted Campaign Results**

* **Reach:** ~18,000–24,000 unique accounts.
* **Engagement:** ~1,800–2,400 likes/comments/shares.
* **Conversions:** ~50–100 actions (clicks or purchases).

Would you like suggestions for optimizing reach or engagement further?`,
                          sender: 'assistant',
                          timestamp: new Date()
                        };
                        setMessages(prev => [...prev, aiResponse]);
                      }, thinkingTime);
                    }
                  }}
                  className="flex gap-3"
                >
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me about campaigns, influencers, or marketing strategies..."
                    className="flex-1 bg-white border-gray-200 focus:border-[#1DDCD3] focus:ring-[#1DDCD3]/20"
                    disabled={isTyping}
                  />
                  <Button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-[#1DDCD3] hover:bg-[#1DDCD3]/90 disabled:opacity-50"
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