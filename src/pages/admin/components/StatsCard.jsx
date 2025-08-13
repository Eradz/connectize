import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusSmallIcon } from '@heroicons/react/24/outline';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon, 
  color = 'blue',
  subtitle,
  loading = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    pink: 'bg-pink-50 text-pink-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  const changeColorClasses = {
    positive: 'text-green-600 bg-green-100',
    negative: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100'
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          
          {change !== undefined && (
            <div className="mt-2 flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${changeColorClasses[changeType]}`}>
                {changeType === 'positive' && <ArrowTrendingUpIcon className="w-4 h-4" />}
                {changeType === 'negative' && <ArrowTrendingDownIcon className="w-4 h-4" />}
                {changeType === 'neutral' && <MinusSmallIcon className="w-4 h-4" />}
                <span className="ml-1">
                  {typeof change === 'number' ? `${change > 0 ? '+' : ''}${change}%` : change}
                </span>
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
            {typeof icon === 'string' ? (
              <span className="text-2xl">{icon}</span>
            ) : (
              <div className="w-6 h-6">{icon}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
