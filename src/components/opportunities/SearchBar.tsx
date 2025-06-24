
import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterClick: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onFilterClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="flex gap-4 mb-8">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search campaigns, categories, platform"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1DDCD3] focus:border-transparent text-[#1a1f2e] placeholder-gray-500 bg-white shadow-sm"
        />
      </div>
      <button
        onClick={onFilterClick}
        className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#1DDCD3] transition-all duration-200 flex items-center justify-center bg-white shadow-sm"
      >
        <Filter className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};

export default SearchBar;
