import React, { useState } from "react";
import { X, Edit2 } from "lucide-react";
import Drawer from "../helper/Drawer";

export default function AddBillingDetailsDrawer({ isOpen, onClose }) {
    const [selected, setSelected] = useState("new");
    const [editItem, setEditItem] = useState(null); // item to edit
    const [editedData, setEditedData] = useState({ name: "", address: "", gstin: "" });

    const billingList = [
        {
            id: "new",
            label: "Add new billing details",
            isNew: true,
        },
        {
            id: 1,
            name: "SC Payables",
            address: "few24, Andaman & Nicobar Islands",
            gstin: "cwde24",
        },
        {
            id: 2,
            name: "SC Payables",
            address: "qfe, Andaman & Nicobar Islands",
            gstin: "qfeefevvevevev",
        },
        {
            id: 3,
            name: "SC Payables",
            address: "asc, Andaman & Nicobar Islands",
            gstin: "ascc",
        },
        {
            id: 4,
            name: "SC Payables",
            address: "cwcwwc, Andaman & Nicobar Islands",
            gstin: "1gf3fqbefhewf",
        },
    ];

    const handleEdit = (item) => {
        setEditItem(item);
        if (!item) {
            setEditedData({ name: "", address: "", gstin: "" });
            return;
        } else {

            setEditedData({
                name: item.name,
                address: item.address,
                gstin: item.gstin,
            });
        }
    };

    const handleSaveEdit = () => {
        console.log("Updated Data:", editedData);
        setEditItem(null); // close popup
    };

    return (
        <>
            {/* Main Drawer */}
            <Drawer
                isOpen={isOpen}
                onClose={onClose}
                title="Add Billing Details"
                widthClass="w-full md:w-2/3 lg:w-1/2"
            >
                <div className="flex flex-col h-full">
                    {/* Billing List */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                        {billingList.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-start justify-between border-b pb-3"
                            >
                                <label className="flex items-start space-x-3 w-full cursor-pointer">
                                    <input
                                        type="radio"
                                        name="billing"
                                        checked={selected === item.id}
                                        onChange={() => setSelected(item.id)}
                                        className="mt-1 accent-blue-600"
                                    />
                                    <div>
                                        {item.isNew ? (
                                            <p onClick={() => handleEdit(item)} className="text-blue-600 font-medium text-sm">
                                                ➕ Add new billing details
                                            </p>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-gray-800">
                                                    {item.name}
                                                </p>
                                                <p className="text-gray-600 text-sm">{item.address}</p>
                                                <p className="text-gray-500 text-sm">
                                                    <span className="font-semibold">GSTIN:</span>{" "}
                                                    {item.gstin}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </label>

                                {!item.isNew && (
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-1 hover:bg-gray-100 rounded-md"
                                    >
                                        <Edit2 className="h-4 w-4 text-gray-500" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end border-t px-6 py-3 space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Save
                        </button>
                    </div>
                </div>
            </Drawer>

            {/* Edit Popup Modal */}
            {editItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-3 border-b">
                            <h2 className="text-lg font-semibold text-gray-800">Edit Billing Details</h2>
                            <button onClick={() => setEditItem(null)}>
                                <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-4 space-y-3">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editedData.name}
                                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={editedData.address}
                                    onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">GSTIN</label>
                                <input
                                    type="text"
                                    value={editedData.gstin}
                                    onChange={(e) => setEditedData({ ...editedData, gstin: e.target.value })}
                                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end border-t px-5 py-3 space-x-3">
                            <button
                                onClick={() => setEditItem(null)}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
