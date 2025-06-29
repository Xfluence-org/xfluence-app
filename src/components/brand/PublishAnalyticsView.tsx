
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BarChart3, Eye, Heart, MessageCircle, Share } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PublishAnalyticsViewProps {
  taskId: string;
}

interface PublishedContent {
  id: string;
  published_url: string;
  platform: string;
  analytics_data: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  created_at: string;
}

const PublishAnalyticsView: React.FC<PublishAnalyticsViewProps> = ({ taskId }) => {
  const [publishedContent, setPublishedContent] = useState<PublishedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedContent();
  }, [taskId]);

  const fetchPublishedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('task_published_content')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPublishedContent(data || []);
    } catch (error) {
      console.error('Error fetching published content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Badge className="bg-pink-100 text-pink-800">Instagram</Badge>;
      case 'tiktok':
        return <Badge className="bg-black text-white">TikTok</Badge>;
      case 'twitter':
        return <Badge className="bg-blue-100 text-blue-800">Twitter</Badge>;
      default:
        return <Badge variant="outline">{platform}</Badge>;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DDCD3]"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Published Content & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {publishedContent.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No published content yet</p>
              <p className="text-sm mt-1">Waiting for influencer to publish and report content</p>
            </div>
          ) : (
            <div className="space-y-6">
              {publishedContent.map((content) => (
                <div key={content.id} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformBadge(content.platform || 'Unknown')}
                      <span className="text-sm text-gray-500">
                        Published on {new Date(content.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <a
                      href={content.published_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#1DDCD3] hover:text-[#1DDCD3]/80 text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Post
                    </a>
                  </div>

                  {content.analytics_data && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <Eye className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                        <div className="text-lg font-semibold">
                          {formatNumber(content.analytics_data.views || 0)}
                        </div>
                        <div className="text-xs text-gray-600">Views</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
                        <div className="text-lg font-semibold">
                          {formatNumber(content.analytics_data.likes || 0)}
                        </div>
                        <div className="text-xs text-gray-600">Likes</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <MessageCircle className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                        <div className="text-lg font-semibold">
                          {formatNumber(content.analytics_data.comments || 0)}
                        </div>
                        <div className="text-xs text-gray-600">Comments</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <Share className="h-5 w-5 text-green-500 mx-auto mb-1" />
                        <div className="text-lg font-semibold">
                          {formatNumber(content.analytics_data.shares || 0)}
                        </div>
                        <div className="text-xs text-gray-600">Shares</div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 rounded-lg p-3 text-sm">
                    <strong>Performance Summary:</strong> This content is performing{' '}
                    {(content.analytics_data?.views || 0) > 1000 ? 'very well' : 'moderately'} with good engagement rates.
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishAnalyticsView;
