
import React from 'react';

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
    <div className="interactive-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                trend.isPositive 
                  ? 'text-green-400 bg-green-400/10' 
                  : 'text-red-400 bg-red-400/10'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-3xl opacity-80 ml-4">{icon}</div>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;
