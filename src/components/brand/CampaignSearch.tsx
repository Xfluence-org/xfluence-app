
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CampaignSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CampaignSearch: React.FC<CampaignSearchProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Search Campaigns:</span>
      </div>
      
      <div className="flex-1 relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search by campaign title..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default CampaignSearch;
