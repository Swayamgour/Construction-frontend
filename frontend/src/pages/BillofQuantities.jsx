
import React, { useState } from 'react';
import { FiChevronRight, FiEye } from 'react-icons/fi';
import BoQUpload from '../components/BoQUpload'
import RecordPaymentDrawer from '../components/RecordPaymentDrawer';
import PaymentHistory from '../components/PaymentHistory';

const SRPrimeDashboard = () => {
    // Sample data matching your image
    const tableData = [
        {
            itemCode: '1.01',
            description: 'Providing and applying white cement based potty of average thickness / mm. of approved brand and ...',
            totalProjectQuantity: '3664 sqm',
            achievedQuantity: '3664 sqm',
            plannedCostAmount: '₹3,55,041.60',
            saleAmount: '₹3,55,408.00',
            salePrice: '₹97.00'
        },
        {
            itemCode: '1.02',
            description: 'P.O.P. Punning-Providing and applying 6-10 mm tbk. P.O.P. punning over ...',
            totalProjectQuantity: '1370 sqm',
            achievedQuantity: '1370 sqm',
            plannedCostAmount: '₹3,56,104.10',
            saleAmount: '₹3,56,200.00',
            salePrice: '₹260.00'
        }
    ];

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [show, setShow] = useState(false);


    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    return (
        <>
            {tableData?.length === 0 ? (
                <BoQUpload />
            ) : show ? (
                <PaymentHistory setShow={setShow} />
            ) : (
                <div className="min-h-screen  p-4 sm:p-3 md:p-4 lg:p-6 ">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">


                            <div className="  flex justify-between items-center ">
                                {/* <h2 className="text-xl font-semibold text-gray-900">BOQ</h2> */}
                                <h1 className="text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent ">
                                    BOQ
                                </h1>
                                <button onClick={toggleDrawer} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Record Money Received
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Payment Summary */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 border-b-4 border-b-blue-600 shadow-md">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Payment received till date:</p>
                                        <p className="text-2xl font-bold text-gray-900">₹46,68,340.00</p>
                                    </div>
                                    <button onClick={() => setShow(!show)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm">
                                        View history
                                        <FiChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Current Margin */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 border-b-4 border-b-green-600 shadow-md"> {/* Changed to green for a 'profit/margin' feel */}
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Margin</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm text-gray-600">Sale (Achieved Gty):</span>
                                            <span className="text-green-600 text-sm font-medium">48.3%</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">₹1,29,61,056.00</p>
                                    </div>

                                    <div className="border-t border-gray-100 pt-3">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm text-gray-600">Payable recorded + Petty spends:</span>
                                            <span className="text-green-600 text-sm font-medium">18.31% vs Planned</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">₹2,44,05,904.80</p>
                                    </div>


                                </div>
                            </div>

                            {/* Planned Margin */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 border-b-4 border-b-yellow-500 shadow-md"> {/* Changed to yellow/amber for a 'planning' feel */}
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned Margin</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm text-gray-600">Total Sale Amount:</span>
                                            <span className="text-green-600 text-sm font-medium">0.01%</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">₹6,80,90,945.00</p>
                                    </div>

                                    <div className="border-t border-gray-100 pt-3">
                                        <div className="mb-1">
                                            <span className="text-sm text-gray-600">Total Planned Cost Amount:</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">₹6,80,88,215.91</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Market Columns Table */}
                        <div className=" py-4 border-b border-gray-200  ">
                            <h3 className="text-lg font-semibold ">Market Columns</h3>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">

                            <div className="overflow-x-auto">
                                <table className="w-full ">
                                    <thead className=" bg-blue-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-400">
                                                Item Code
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-400">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-400">
                                                Total Project Quantity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-400">
                                                Achieved Quantity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-400">
                                                Planned Cost Amount (Johnson Gty)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-400">
                                                Sale Amount (Johnson Gty)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-400">
                                                Sale Price
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {tableData.map((row, index) => (
                                            <tr key={index} className="hover: transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                                                    {row.itemCode}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <span className="flex-1">{row.description}</span>
                                                        <FiChevronRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                                                    {row.totalProjectQuantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                                                    {row.achievedQuantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                                                    {row.plannedCostAmount}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                                                    {row.saleAmount}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {row.salePrice}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Additional Actions */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover: transition-colors font-medium">
                                Export Data
                            </button>
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                Generate Report
                            </button>
                        </div>
                    </div>
                    <RecordPaymentDrawer
                        isOpen={isDrawerOpen}
                        onClose={toggleDrawer}
                    />
                </div>)}
        </>
    );
};

export default SRPrimeDashboard;