import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

export interface FilterOptions {
  status?: string;
  platform?: string;
  budgetRange?: [number, number];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  category?: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  userType?: 'brand' | 'influencer';
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
  userType = 'influencer'
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const statusOptions = userType === 'brand' 
    ? ['All', 'Published', 'Active', 'Completed', 'Archived']
    : ['All', 'Active', 'Completed', 'Invited'];

  const platformOptions = ['All', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'];
  const categoryOptions = ['All', 'Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness', 'Lifestyle'];

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof FilterOptions];
    if (key === 'budgetRange') {
      return value && (value[0] > 0 || value[1] < 10000);
    }
    return value && value !== 'all';
  }).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1a1f2e] flex items-center justify-between">
            Filter Campaigns
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Campaign Status</Label>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger id="status" className="bg-white/50 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status.toLowerCase()}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Platform Filter */}
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select 
              value={filters.platform || 'all'} 
              onValueChange={(value) => setFilters({ ...filters, platform: value })}
            >
              <SelectTrigger id="platform" className="bg-white/50 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map(platform => (
                  <SelectItem key={platform} value={platform === 'All' ? 'all' : platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={filters.category || 'all'} 
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger id="category" className="bg-white/50 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(category => (
                  <SelectItem key={category} value={category === 'All' ? 'all' : category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget Range Filter */}
          <div className="space-y-2">
            <Label>Budget Range</Label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">
                  ${filters.budgetRange?.[0] || 0}
                </span>
                <span className="text-sm text-gray-600">
                  ${filters.budgetRange?.[1] || 10000}+
                </span>
              </div>
              <Slider
                min={0}
                max={10000}
                step={100}
                value={filters.budgetRange || [0, 10000]}
                onValueChange={(value) => setFilters({ ...filters, budgetRange: [value[0], value[1]] })}
                className="w-full"
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Due Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-500">From</Label>
                <DatePicker
                  date={filters.dateRange?.from}
                  onDateChange={(date) => setFilters({ 
                    ...filters, 
                    dateRange: { ...filters.dateRange, from: date || undefined }
                  })}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">To</Label>
                <DatePicker
                  date={filters.dateRange?.to}
                  onDateChange={(date) => setFilters({ 
                    ...filters, 
                    dateRange: { ...filters.dateRange, to: date || undefined }
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="ghost" 
            onClick={handleReset}
            className="hover:bg-gray-100"
          >
            Reset All
          </Button>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;