import React from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

const OverviewCard = ({ icon: Icon, title, count, change, type }) => {
  // **ATTRACTIVE CHANGE 3: More Vivid Colors**
  const accentColor = type === 'up' ? 'orange' : 'green';
  const accentClasses = type === 'up' 
    ? "text-orange-500 bg-orange-500/20" 
    : "text-green-500 bg-green-500/20";
    
  // **ATTRACTIVE CHANGE 4: Gradient Ring Styling**
  const ringGradient = type === 'up' 
    ? "bg-gradient-to-tr from-orange-400 to-orange-200"
    : "bg-gradient-to-tr from-green-400 to-green-200";

  return (
    // **ATTRACTIVE CHANGE 5: Premium Card Styling**
    <div className="p-5 bg-white rounded-2xl border border-gray-100/50 
                    shadow-xl shadow-gray-200/50 transform hover:scale-[1.02] transition-all duration-300 cursor-pointer">
      
      <div className="flex items-center justify-between">
        <div className="relative w-14 h-14 flex items-center justify-center">
          
          {/* Outer Ring Effect (The Key to the Modern Look) */}
          <div className={`absolute inset-0 rounded-full opacity-60 ${ringGradient}`} 
               style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 70% 100%, 0% 100%)' }} 
          ></div>
          
          <div className={`p-3 rounded-full z-10 ${accentClasses}`}>
            <Icon className="w-6 h-6 font-bold" />
          </div>
        </div>
        
        <div className={`flex items-center text-base font-semibold ${type === 'up' ? 'text-orange-500' : 'text-green-500'}`}>
          {type === 'up' ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
          {change}%
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{count}</p>
      </div>
    </div>
  );
};

export default OverviewCard;