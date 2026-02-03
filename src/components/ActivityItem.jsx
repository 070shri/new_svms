import React from 'react';

const ActivityItem = ({ icon: Icon, text, subtext, time, iconColor }) => {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`p-2 rounded-lg ${iconColor || 'bg-blue-100'} flex-shrink-0`}>
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{text}</p>
        {subtext && <p className="text-xs text-gray-500 mt-0.5">{subtext}</p>}
      </div>
      <span className="text-xs text-gray-500 flex-shrink-0">{time}</span>
    </div>
  );
};

export default ActivityItem;