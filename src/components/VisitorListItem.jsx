import React from 'react';
import { Clock } from 'lucide-react';
import Button from './Button';

const VisitorListItem = ({ visitor, onCheckOut, showCheckOut = true }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
          {visitor.initials}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{visitor.name}</h3>
          <p className="text-sm text-gray-600">{visitor.company} • {visitor.purpose}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-gray-600">Host: {visitor.host}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Clock className="w-3 h-3" />
            <span>Since {visitor.checkIn}</span>
          </div>
        </div>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
          {visitor.badge}
        </span>
        {showCheckOut && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onCheckOut(visitor.id)}
          >
            Check Out
          </Button>
        )}
      </div>
    </div>
  );
};

export default VisitorListItem;