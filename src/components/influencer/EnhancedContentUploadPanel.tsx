import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface EnhancedContentUploadPanelProps {
  taskId: string;
  onUploadComplete?: () => void;
}

// Temporarily disabled component for marketplace hiding
const EnhancedContentUploadPanel: React.FC<EnhancedContentUploadPanelProps> = ({ taskId }) => {
  return (
    <Card className="border-gray-200 rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-[#1a1f2e]">Content Upload</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Content Upload Temporarily Unavailable</p>
        <p className="text-sm text-gray-500 mt-2">
          This feature is being updated for the beta release.
        </p>
      </CardContent>
    </Card>
  );
};

export default EnhancedContentUploadPanel;