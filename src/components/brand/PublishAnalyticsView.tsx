
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, ExternalLink, TrendingUp, Users, Heart, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PublishAnalyticsViewProps {
  taskId: string;
}

interface PublishedContent {
  id: string;
  published_url: string;
  platform: string;
  analytics_data: any;
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
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Loading analytics...</p>
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
          {publishedContent.length > 0 ? (
            <div className="space-y-6">
              {publishedContent.map((content) => (
                <Card key={content.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-purple-100 text-purple-800">
                            {content.platform}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Published {new Date(content.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <a
                          href={content.published_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Published Content
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    {/* Analytics Data */}
                    {content.analytics_data ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                          <div className="text-lg font-semibold text-gray-900">
                            {formatNumber(content.analytics_data.reach || 0)}
                          </div>
                          <div className="text-xs text-gray-600">Reach</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Users className="h-5 w-5 text-green-500 mx-auto mb-1" />
                          <div className="text-lg font-semibold text-gray-900">
                            {formatNumber(content.analytics_data.impressions || 0)}
                          </div>
                          <div className="text-xs text-gray-600">Impressions</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
                          <div className="text-lg font-semibold text-gray-900">
                            {formatNumber(content.analytics_data.likes || 0)}
                          </div>
                          <div className="text-xs text-gray-600">Likes</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <MessageCircle className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                          <div className="text-lg font-semibold text-gray-900">
                            {formatNumber(content.analytics_data.comments || 0)}
                          </div>
                          <div className="text-xs text-gray-600">Comments</div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          Analytics data will be available once the influencer provides performance metrics.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  No published content yet
                </h3>
                <p className="text-gray-600">
                  The influencer will publish their content after it's approved. 
                  Analytics will appear here once they submit the published URLs.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishAnalyticsView;
