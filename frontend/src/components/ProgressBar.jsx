import React from 'react';

const ProgressBar = ({ team, percentage, color }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span className="font-medium">{team}</span>
        <span className="font-bold">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;