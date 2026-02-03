import React from 'react';
import { Clock } from 'lucide-react';
import Button from './Button';

const VisitorCard = ({ visitor, onCheckOut }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
            {visitor.initials}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{visitor.name}</h3>
            <p className="text-sm text-gray-600">{visitor.company}</p>
          </div>
        </div>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
          {visitor.badge}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Purpose</span>
          <span className="font-medium text-gray-900">{visitor.purpose}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Host</span>
          <span className="font-medium text-gray-900">{visitor.host}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Check-in: {visitor.checkIn}</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => onCheckOut(visitor.id)}
      >
        Check Out
      </Button>
    </div>
  );
};

export default VisitorCard;