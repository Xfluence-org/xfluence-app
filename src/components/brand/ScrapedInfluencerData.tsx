import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Heart, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ScrapedData {
  handle: string;
  followers: number;
  engagement_rate: number;
  avg_likes: number;
  avg_comments: number;
  profile_pic_url?: string;
  bio?: string;
  verified?: boolean;
}

interface ScrapedInfluencerDataProps {
  applicationMessage: string;
  handle: string;
}

const ScrapedInfluencerData: React.FC<ScrapedInfluencerDataProps> = ({
  applicationMessage,
  handle
}) => {
  let scrapedData: ScrapedData | null = null;
  let dataScrapedAt: string | null = null;

  try {
    const parsedMessage = JSON.parse(applicationMessage);
    scrapedData = parsedMessage.scrapedData;
    dataScrapedAt = parsedMessage.dataScrapedAt;
  } catch (error) {
    console.error('Error parsing application message:', error);
  }

  // If no scraped data yet, show loading state
  if (!scrapedData && dataScrapedAt === null) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing {handle} on Instagram...
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no scraped data but we tried, show minimal info
  if (!scrapedData) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {handle.replace('@', '').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium">{handle}</p>
              <p className="text-sm text-muted-foreground">Data analysis pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Profile Picture */}
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden">
            {scrapedData.profile_pic_url ? (
              <img 
                src={scrapedData.profile_pic_url} 
                alt={scrapedData.handle}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-white font-bold">
                {scrapedData.handle.replace('@', '').charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Main Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{scrapedData.handle}</h3>
              {scrapedData.verified && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
            </div>

            {scrapedData.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {scrapedData.bio}
              </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Users className="h-3 w-3" />
                  <span>Followers</span>
                </div>
                <p className="font-semibold text-sm">
                  {scrapedData.followers.toLocaleString()}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Engagement</span>
                </div>
                <p className="font-semibold text-sm">
                  {scrapedData.engagement_rate}%
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Heart className="h-3 w-3" />
                  <span>Avg Likes</span>
                </div>
                <p className="font-semibold text-sm">
                  {scrapedData.avg_likes.toLocaleString()}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>Avg Comments</span>
                </div>
                <p className="font-semibold text-sm">
                  {scrapedData.avg_comments.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Engagement Badge */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={
                scrapedData.engagement_rate >= 6 ? "default" :
                scrapedData.engagement_rate >= 3 ? "secondary" : "outline"
              }>
                {scrapedData.engagement_rate >= 6 ? "High Engagement" :
                 scrapedData.engagement_rate >= 3 ? "Good Engagement" : "Low Engagement"}
              </Badge>

              {dataScrapedAt && (
                <span className="text-xs text-muted-foreground">
                  Analyzed {new Date(dataScrapedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapedInfluencerData;