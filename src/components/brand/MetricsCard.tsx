
import React from 'react';
import { Activity, DollarSign, FileText, TrendingUp } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, subtitle, trend, icon }) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon === 'campaigns' && <FileText className="w-6 h-6" />}
            {icon === 'budget' && <DollarSign className="w-6 h-6" />}
            {icon === 'active' && <Activity className="w-6 h-6" />}
            {icon === 'reach' && <TrendingUp className="w-6 h-6" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;
