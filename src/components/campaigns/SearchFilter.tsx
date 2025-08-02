import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  placeholder?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  onFilterClick,
  placeholder = "Search campaigns..."
}) => {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-12 bg-white/10 backdrop-blur-md border-white/20 shadow-lg text-[#1a1f2e] placeholder-gray-500"
        />
      </div>
      <Button
        onClick={onFilterClick}
        variant="outline"
        className="h-12 px-6 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 hover:border-purple-500/50 transition-all duration-300 shadow-lg"
      >
        <Filter className="w-5 h-5 mr-2" />
        Filter
      </Button>
    </div>
  );
};

export default SearchFilter;