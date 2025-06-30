import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Hash, AtSign, Clock, FileText, Upload, Share2, ChevronDown, ChevronUp } from 'lucide-react';

interface FormattedContentRequirementsProps {
  content: string;
}

const FormattedContentRequirements: React.FC<FormattedContentRequirementsProps> = ({ content }) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Parse the content to extract different sections
  const parseContent = (text: string) => {
    const sections = {
      posts: '',
      stories: '',
      reels: '',
      guidelines: '',
      submission: ''
    };

    // Extract Posts section
    const postsMatch = text.match(/\*\*Posts[^*]*\*\*([^*]+(?:\*(?!\*)[^*]*)*)/);
    if (postsMatch) sections.posts = postsMatch[1].trim();

    // Extract Stories section
    const storiesMatch = text.match(/\*\*Stories[^*]*\*\*([^*]+(?:\*(?!\*)[^*]*)*)/);
    if (storiesMatch) sections.stories = storiesMatch[1].trim();

    // Extract Reels section
    const reelsMatch = text.match(/\*\*Reels[^*]*\*\*([^*]+(?:\*(?!\*)[^*]*)*)/);
    if (reelsMatch) sections.reels = reelsMatch[1].trim();

    // Extract General Guidelines
    const guidelinesMatch = text.match(/General Guidelines:([^]*?)Submission Process:/);
    if (guidelinesMatch) sections.guidelines = guidelinesMatch[1].trim();

    // Extract Submission Process
    const submissionMatch = text.match(/Submission Process:([^]*?)$/);
    if (submissionMatch) sections.submission = submissionMatch[1].trim();

    return sections;
  };

  const formatBulletPoints = (text: string) => {
    return text
      .split('\n')
      .filter(line => line.trim())
      .map((line, index) => {
        const cleanLine = line.replace(/^[-\d.]\s*/, '').trim();
        return cleanLine ? (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>{cleanLine}</span>
          </li>
        ) : null;
      })
      .filter(Boolean);
  };

  const CollapsibleBulletPoints = ({ 
    items, 
    sectionKey, 
    maxItems = 3 
  }: { 
    items: React.ReactNode[], 
    sectionKey: string, 
    maxItems?: number 
  }) => {
    const isExpanded = expandedSections[sectionKey];
    const hasMore = items.length > maxItems;
    const displayedItems = isExpanded ? items : items.slice(0, maxItems);

    return (
      <>
        <ul className="space-y-2">
          {displayedItems}
        </ul>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSection(sectionKey)}
            className="mt-2 text-xs text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show {items.length - maxItems} more
              </>
            )}
          </Button>
        )}
      </>
    );
  };

  const sections = parseContent(content);

  return (
    <div className="space-y-6">
      {/* Content Types */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Posts */}
        {sections.posts && (
          <Card className="p-4 border-blue-200 bg-blue-50/50 min-h-[200px] flex flex-col">
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Posts</h4>
                  <p className="text-xs text-blue-700">3 required</p>
                </div>
              </div>
              <div className="flex-1">
                <CollapsibleBulletPoints 
                  items={formatBulletPoints(sections.posts)} 
                  sectionKey="posts" 
                />
              </div>
            </div>
          </Card>
        )}

        {/* Stories */}
        {sections.stories && (
          <Card className="p-4 border-purple-200 bg-purple-50/50 min-h-[200px] flex flex-col">
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">Stories</h4>
                  <p className="text-xs text-purple-700">5 required</p>
                </div>
              </div>
              <div className="flex-1">
                <CollapsibleBulletPoints 
                  items={formatBulletPoints(sections.stories)} 
                  sectionKey="stories" 
                />
              </div>
            </div>
          </Card>
        )}

        {/* Reels */}
        {sections.reels && (
          <Card className="p-4 border-pink-200 bg-pink-50/50 min-h-[200px] flex flex-col">
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Share2 className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-pink-900">Reels</h4>
                  <p className="text-xs text-pink-700">2 required</p>
                </div>
              </div>
              <div className="flex-1">
                <CollapsibleBulletPoints 
                  items={formatBulletPoints(sections.reels)} 
                  sectionKey="reels" 
                />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* General Guidelines */}
      {sections.guidelines && (
        <Card className="p-4 border-amber-200 bg-amber-50/50">
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-900 flex items-center gap-2">
              <Hash className="h-5 w-5" />
              General Guidelines
            </h4>
            <CollapsibleBulletPoints 
              items={formatBulletPoints(sections.guidelines)} 
              sectionKey="guidelines" 
              maxItems={4}
            />
          </div>
        </Card>
      )}

      {/* Submission Process */}
      {sections.submission && (
        <Card className="p-4 border-green-200 bg-green-50/50">
          <div className="space-y-3">
            <h4 className="font-semibold text-green-900 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submission Process
            </h4>
            <div className="space-y-2">
              {sections.submission
                .split('\n')
                .filter(line => line.trim())
                .map((line, index) => {
                  const stepMatch = line.match(/^(\d+)\.\s*(.+)/);
                  if (stepMatch) {
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          {stepMatch[1]}
                        </Badge>
                        <span className="text-sm text-gray-700">{stepMatch[2]}</span>
                      </div>
                    );
                  }
                  return null;
                })
                .filter(Boolean)}
            </div>
          </div>
        </Card>
      )}

      {/* Hashtags and Mentions */}
      <div className="flex flex-wrap gap-2">
        {content.includes('#BrandCampaign') && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Hash className="h-3 w-3 mr-1" />
            BrandCampaign
          </Badge>
        )}
        {content.includes('#AuthenticReviews') && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Hash className="h-3 w-3 mr-1" />
            AuthenticReviews
          </Badge>
        )}
        {content.includes('@brand') && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <AtSign className="h-3 w-3 mr-1" />
            brand
          </Badge>
        )}
      </div>
    </div>
  );
};

export default FormattedContentRequirements;