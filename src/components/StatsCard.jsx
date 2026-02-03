import React from 'react';

const StatsCard = ({ icon: Icon, title, value, subtitle, trend, iconColor }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${iconColor || 'bg-blue-100'}`}>
              <Icon className={`w-5 h-5 ${iconColor ? 'text-white' : 'text-blue-500'}`} />
            </div>
            {trend && (
              <span className="text-sm font-medium text-green-500">{trend}</span>
            )}
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-sm text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;