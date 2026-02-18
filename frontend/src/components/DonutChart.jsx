import React from 'react';
import { FiThumbsUp } from 'react-icons/fi';

const DonutChart = ({ percentage }) => {
  const dashOffset = 314 * (1 - percentage / 100); // Circumference is approx 314 for r=50

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <svg className="w-48 h-48 transform -rotate-90">
        {/* Background Circle */}
        <circle 
          r="50" cx="100" cy="100" 
          fill="transparent" 
          stroke="#f3f4f6" 
          strokeWidth="20"
          className="shadow-inner"
        />
        {/* Gradient Arc (simulating the UI gradient) */}
        <circle 
          r="50" cx="100" cy="100" 
          fill="transparent" 
          stroke="url(#donutGradient)" 
          strokeWidth="20"
          strokeDasharray="314"
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: "#f97316", stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: "#fb923c", stopOpacity: 1}} />
          </linearGradient>
        </defs>
      </svg>
      {/* Center Content */}
      <div className="absolute flex flex-col items-center justify-center">
        <div className="p-3 bg-white shadow-xl rounded-full text-orange-500 mb-2">
            <FiThumbsUp className="w-5 h-5"/>
        </div>
        <p className="text-3xl font-bold text-gray-800">{percentage}%</p>
      </div>
    </div>
  );
};

export default DonutChart;