
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  categories: string[];
  platforms: string[];
  compensationRange: {
    min: number;
    max: number;
  };
  deliverables: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApplyFilters }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [compensationMin, setCompensationMin] = useState<number>(0);
  const [compensationMax, setCompensationMax] = useState<number>(10000);

  const categories = ['Fitness', 'Lifestyle', 'Food', 'Drinks', 'Fashion', 'Beauty', 'Tech', 'Travel'];
  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      categories: selectedCategories,
      platforms: selectedPlatforms,
      compensationRange: {
        min: compensationMin,
        max: compensationMax
      },
      deliverables: []
    });
    onClose();
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedPlatforms([]);
    setCompensationMin(0);
    setCompensationMax(10000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#1a1f2e]">Filter Opportunities</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-[#1a1f2e] mb-3">Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-300 text-[#1DDCD3] focus:ring-[#1DDCD3]"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-sm font-medium text-[#1a1f2e] mb-3">Platforms</h3>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map(platform => (
                <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform)}
                    onChange={() => handlePlatformToggle(platform)}
                    className="rounded border-gray-300 text-[#1DDCD3] focus:ring-[#1DDCD3]"
                  />
                  <span className="text-sm text-gray-700">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Compensation Range */}
          <div>
            <h3 className="text-sm font-medium text-[#1a1f2e] mb-3">Compensation Range</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                <input
                  type="number"
                  value={compensationMin}
                  onChange={(e) => setCompensationMin(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DDCD3] text-[#1a1f2e]"
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                <input
                  type="number"
                  value={compensationMax}
                  onChange={(e) => setCompensationMax(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DDCD3] text-[#1a1f2e]"
                  placeholder="$10,000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClearFilters}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-[#1DDCD3] transition-all duration-200 font-medium"
          >
            Clear All
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 px-4 py-2 bg-[#1DDCD3] text-white rounded-lg hover:bg-[#00D4C7] transition-all duration-200 font-medium shadow-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
