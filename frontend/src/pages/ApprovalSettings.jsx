import React, { useState } from "react";
import { Users, X } from "lucide-react"; // npm install lucide-react

const approvals = [
    {
        title: "Indent Approver",
        description: "Approval of all users mandatory",
        note: "to validate the indent created.",
    },
    {
        title: "Purchase Order Approver",
        description: "Approval of all users mandatory",
        note: "to validate the Purchase Order created.",
    },
    {
        title: "Subcontractor Material Issue Approver",
        description: "Approval of all users mandatory",
        note: "to validate the material issue created.",
    },
    {
        title: "Subcontractor Material Return Approver",
        description: "Approval of all users mandatory",
        note: "to validate the material return created.",
    },
    {
        title: "Site to Site Material Issue Approver",
        description: "Approval of all users mandatory",
        note: "to validate the material issue created.",
    },
];

export default function ApprovalSettings() {
    const [openModal, setOpenModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState("");

    const approversList = [
        "Mayurkumar Makwana",
        "Chaitali Mhaske",
        "Lokesh",
        "Akshat Agrawal",
        "Rishav",
    ];

    const filtered = approversList.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
    );

    const openPopup = (item) => {
        setSelectedItem(item);
        setOpenModal(true);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-xl sm:text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                    Approval Settings
                </h1>
            </div>

            <p className="mb-2">Material Module Settings</p>

            <div className="space-y-6">
                {approvals.map((item, idx) => (
                    <div key={idx} className="border rounded-md bg-white shadow-sm p-5">
                        <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{item.description}</p>

                        <div
                            onClick={() => openPopup(item)}
                            className="border rounded-md p-4 flex flex-wrap md:flex-nowrap items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer transition"
                        >
                            <Users className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium whitespace-nowrap">
                                Add Approvers
                            </span>
                            <span className="text-gray-700 text-sm break-words md:ml-1">
                                {item.note}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {openModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-sm p-5 relative">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                Add Approver - {selectedItem?.title}
                            </h2>
                            <button
                                onClick={() => setOpenModal(false)}
                                className="hover:text-gray-800"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Indent</label>
                            <input
                                type="text"
                                placeholder="Search approver..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full border rounded-md p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />

                            {/* Dropdown */}
                            <div className="border rounded-md max-h-40 overflow-y-auto shadow-sm">
                                {filtered.map((name) => (
                                    <div
                                        key={name}
                                        onClick={() => {
                                            setSelected(name);
                                            setSearch(name);
                                        }}
                                        className={`p-2 cursor-pointer hover:bg-blue-100 ${selected === name ? "bg-blue-50" : ""
                                            }`}
                                    >
                                        {name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setOpenModal(false)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
