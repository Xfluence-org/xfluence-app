
import React from 'react';
import { Search, Filter } from 'lucide-react';

interface CampaignSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
}

const CampaignSearch: React.FC<CampaignSearchProps> = ({
  searchQuery,
  onSearchChange,
  onFilterClick
}) => {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search campaigns"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-[#1a1f2e] placeholder-gray-500 shadow-lg transition-all duration-300"
        />
      </div>
      <button
        onClick={onFilterClick}
        className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 hover:border-purple-500/50 transition-all duration-300 flex items-center justify-center shadow-lg"
      >
        <Filter className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};

export default CampaignSearch;
