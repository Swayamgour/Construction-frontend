import React from "react";
import Drawer from "../helper/Drawer";
import { useNavigate } from "react-router-dom";

export default function MaterialTransferDrawer({ isOpen, onClose }) {
    const materials = [
        {
            id: 1,
            name: "Bricks",
            details: {
                type: "Red Bricks",
                brand: "SHIVSHAKTI",
                weight: "400 Grams",
                color: "Brown",
                length: "20cm",
                breadth: "9cm",
                height: "8cm",
            },
            stockQty: "90 nos",
            deliveryQty: "500 nos",
            requestedQty: "500 nos",
            approvedQty: "0 nos",
            deliveredQty: "0 nos",
            fulfilled: false,
            delivered: false,
        },
        {
            id: 2,
            name: "Cement",
            details: {
                brand: "Dalmia",
            },
            stockQty: "90 bags",
            deliveryQty: "500 bags",
            requestedQty: "500 bags",
            approvedQty: "0 bags",
            deliveredQty: "0 bags",
            fulfilled: false,
            delivered: false,
        },
    ];
    // useNavigate
    const navigate = useNavigate();

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Material Transfer Request"
            widthClass="w-full md:w-3/4 lg:w-2/3"
        >
            <div className="bg-gray-50 min-h-full flex flex-col">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center border-b">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-800">MT001</h1>
                        <div className="flex space-x-2 mt-1">
                            <span className=" text-gray-400  border border-gray-200 text-xs px-2 py-1 rounded">
                                Not Fulfilled
                            </span>
                            <span className=" text-gray-400 border border-gray-200  text-xs px-2 py-1 rounded">
                                Not Delivered
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Open • Auto approved on 30 Sep 2025, 01:19 PM
                        </p>
                    </div>

                    <div className="flex space-x-3">
                        <button className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded border border-green-300 hover:bg-green-200">
                            Mark as Closed
                        </button>
                        <button onClick={() => navigate('/PurchaseOrder')} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                            Create PO
                        </button>
                    </div>
                </div>

                {/* Details Section */}
                <div className="bg-white rounded-none p-4 border-b grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Site Name</p>
                        <p className="font-semibold">S S Construction</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Created By</p>
                        <p className="font-semibold">shubham kumar | 30 Sep 2025, 01:19 PM</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Expected Delivery</p>
                        <p className="font-semibold">03 Oct 2025</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Assigned Users</p>
                        <p className="font-semibold">shubham kumar</p>
                    </div>
                </div>

                {/* Material Table */}
                <div className="flex-1 bg-white overflow-y-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 border">S. No.</th>
                                <th className="px-4 py-2 border">Material</th>
                                <th className="px-4 py-2 border">Requested Qty</th>
                                <th className="px-4 py-2 border">Approved Fulfilled Quantity</th>
                                <th className="px-4 py-2 border">Delivered Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-2 border">{index + 1}</td>
                                    <td className="px-4 py-2 border align-top">
                                        <p className="font-semibold text-blue-600">{item.name}</p>
                                        {item.details.type && (
                                            <p className="text-gray-500 text-xs mt-1">{item.details.type}</p>
                                        )}
                                        <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                            {item.details.brand && (
                                                <p>
                                                    Brand: <strong>{item.details.brand}</strong>
                                                </p>
                                            )}
                                            {item.details.weight && <p>Weight: {item.details.weight}</p>}
                                            {item.details.color && <p>Color: {item.details.color}</p>}
                                            {item.details.length && <p>Length: {item.details.length}</p>}
                                            {item.details.breadth && <p>Breadth: {item.details.breadth}</p>}
                                            {item.details.height && <p>Height: {item.details.height}</p>}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600">
                                            Stock Quantity: <strong>{item.stockQty}</strong>
                                            <br />
                                            Delivery Quantity: <strong>{item.deliveryQty}</strong>
                                        </div>
                                        <div className="flex space-x-2 mt-2">
                                            {!item.fulfilled && (
                                                <span className=" text-gray-500 border border-gray-200 px-2 py-1 rounded text-xs">
                                                    Not Fulfilled
                                                </span>
                                            )}
                                            {!item.delivered && (
                                                <span className=" text-gray-500 border border-gray-200 px-2 py-1 rounded text-xs">
                                                    Not Delivered
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 border align-top">{item.requestedQty}</td>
                                    <td className="px-4 py-2 border align-top">{item.approvedQty}</td>
                                    <td className="px-4 py-2 border align-top">{item.deliveredQty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t bg-white px-6 py-3 space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                        Close
                    </button>
                    <button className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Export PDF
                    </button>
                </div>
            </div>
        </Drawer>
    );
}
