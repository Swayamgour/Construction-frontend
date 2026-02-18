// ... imports

const ChartBox = ({ title, children, className = '' }) => {
  return (
    // **ATTRACTIVE CHANGE 6: Consistent Premium Box Style**
    <div className={`p-6 bg-white rounded-2xl border border-gray-100/50 
                    shadow-xl shadow-gray-200/50 relative ${className}`}>
      
      {/* Box Header (Sort/Download buttons are now more stylized) */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center space-x-3">
          
          {/* Sort By Dropdown */}
          {(title === 'New Employees' || title === 'Salary Statistics') && (
            <div className="flex items-center text-sm text-gray-600 space-x-1">
              <span className="hidden sm:inline">Sort by</span>
              <button className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                Years <FiChevronDown className="ml-1 w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Download Button */}
          <button className="p-2 text-gray-500 bg-gray-100 rounded-full hover:bg-orange-100 hover:text-orange-500 transition-all">
            <FiDownload className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Box Content */}
      <div className="relative pt-2">
        {children}
      </div>
    </div>
  );
};

// ... export