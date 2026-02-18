import React, { useState } from 'react';
import BoQSidebar from './BoQSidebar';



const BoQUpload = ({}) => {
    // const [isMenuOpen, setIsMenuOpen] = useState(false); // State for the three-dot menu


  

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-sans">
            <div className="max-w-7xl mx-auto ">
                {/* Header Section */}


                {/* Main Content Grid */}
                <div className="flex flex-col gap-8">
                    {/* Left Column - Upload Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-8 h-full">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload BoQ</h2>

                            {/* Upload Box */}
                            <div onClick={toggleDrawer} className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                <div className="max-w-xs mx-auto">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 mb-2">
                                        <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        CSV, XLSX, or PDF files (Max. 10MB)
                                    </p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 my-8"></div>

                            {/* Additional Info */}
                            <div className="text-center">
                                <p className="text-gray-500 text-sm">
                                    Need a template? <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">Download sample BoQ</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Features */}
                    <div className="flex  gap-4 ">
                        {/* Feature 1 */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 w-1/3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                BoQ vs Budget: Stay in Control
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Get a clear breakdown of BoQ vs Budget costs and manage your budget effectively.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 w-1/3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Track Payments Received
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Easily monitor all payments received from your clients in one place.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 w-1/3">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Stay on Top of Your Work
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Keep track of your tasks and gain real-time visibility.
                            </p>
                        </div>
                    </div>
                </div>


            </div>

            <BoQSidebar
                isOpen={isDrawerOpen}
                onClose={toggleDrawer}
            />
        </div>
    );
};

export default BoQUpload;