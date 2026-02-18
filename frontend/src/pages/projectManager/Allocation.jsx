// src/pages/Allocation.jsx
import React, { useEffect, useState } from "react";

export default function Allocation() {
    const [projects, setProjects] = useState([]);
    const [labours, setLabours] = useState([]);
    const [machines, setMachines] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [allocLabour, setAllocLabour] = useState([]);
    const [allocMachine, setAllocMachine] = useState([]);
    const [activeTab, setActiveTab] = useState("labour");

    // ------------------------------
    // 🚀 Dummy Data Loaded on Mount
    // ------------------------------
    useEffect(() => {
        setProjects([
            { _id: "p1", name: "Tower Construction", progress: 65, color: "bg-blue-500" },
            { _id: "p2", name: "Road Development", progress: 80, color: "bg-green-500" },
            { _id: "p3", name: "Mall Renovation", progress: 45, color: "bg-purple-500" }
        ]);

        setLabours([
            { _id: "l1", name: "Ramesh", labourType: "Skilled Labour", avatar: "👷", available: true },
            { _id: "l2", name: "Suresh", labourType: "Mason", avatar: "🧱", available: true },
            { _id: "l3", name: "Mahesh", labourType: "Helper", avatar: "👷‍♂️", available: false },
            { _id: "l4", name: "Priya", labourType: "Supervisor", avatar: "👩‍💼", available: true },
            { _id: "l5", name: "Anil", labourType: "Electrician", avatar: "⚡", available: true }
        ]);

        setMachines([
            { _id: "m1", name: "JCB Excavator", type: "Earth Mover", icon: "🚜", available: true },
            { _id: "m2", name: "Concrete Mixer", type: "Mixer", icon: "🧱", available: true },
            { _id: "m3", name: "Tower Crane", type: "Lifter", icon: "🏗️", available: false },
            { _id: "m4", name: "Dump Truck", type: "Transport", icon: "🚛", available: true },
            { _id: "m5", name: "Bulldozer", type: "Earth Mover", icon: "🚜", available: true }
        ]);
    }, []);

    // ------------------------------
    // Add Allocation Rows
    // ------------------------------
    const addLabourAlloc = () =>
        setAllocLabour(prev => [...prev, { labourId: "", fromDate: "", toDate: "", qty: 1, notes: "" }]);

    const addMachineAlloc = () =>
        setAllocMachine(prev => [...prev, { machineId: "", fromDate: "", toDate: "", hours: 8, notes: "" }]);

    // ------------------------------
    // Remove Allocation Rows
    // ------------------------------
    const removeLabourAlloc = (index) =>
        setAllocLabour(prev => prev.filter((_, i) => i !== index));

    const removeMachineAlloc = (index) =>
        setAllocMachine(prev => prev.filter((_, i) => i !== index));

    // ------------------------------
    // Submit Allocation (Dummy)
    // ------------------------------
    const submitAlloc = () => {
        if (!selectedProject) {
            alert("Please select a project first!");
            return;
        }

        const payload = {
            projectId: selectedProject,
            labours: allocLabour,
            machines: allocMachine,
        };

        console.log("Allocation Payload:", payload);

        // Simulate API call
        setTimeout(() => {
            alert("Resources allocated successfully!");
            setAllocLabour([]);
            setAllocMachine([]);
        }, 1000);
    };

    const getSelectedProject = () => projects.find(p => p._id === selectedProject);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Resource Allocation</h1>
                            <p className="text-gray-600 mt-2">Assign labour and machinery to projects</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Selected Project</div>
                            <div className="text-lg font-semibold text-gray-900">
                                {getSelectedProject()?.name || "None"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Selection Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Select Project</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {projects.map(project => (
                            <div
                                key={project._id}
                                onClick={() => setSelectedProject(project._id)}
                                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${selectedProject === project._id
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                    <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>Progress</span>
                                    <span className="font-medium">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className={`h-2 rounded-full ${project.color}`}
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Allocation Tabs */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab("labour")}
                                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === "labour"
                                        ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg">👷</span>
                                    Labour Allocation
                                    {allocLabour.length > 0 && (
                                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                            {allocLabour.length}
                                        </span>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("machine")}
                                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${activeTab === "machine"
                                        ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg">🚜</span>
                                    Machine Allocation
                                    {allocMachine.length > 0 && (
                                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                            {allocMachine.length}
                                        </span>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Labour Allocation */}
                        {activeTab === "labour" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Assign Labour</h3>
                                    <button
                                        onClick={addLabourAlloc}
                                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors duration-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Labour
                                    </button>
                                </div>

                                {allocLabour.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-2xl">
                                        <div className="text-6xl mb-4">👷</div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No labour assigned</h4>
                                        <p className="text-gray-500">Start by adding labour to this project</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {allocLabour.map((a, i) => {
                                            const selectedLabour = labours.find(l => l._id === a.labourId);
                                            return (
                                                <div key={i} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-200">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <h4 className="font-semibold text-gray-900">Labour #{i + 1}</h4>
                                                        <button
                                                            onClick={() => removeLabourAlloc(i)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">Select Labour</label>
                                                            <select
                                                                value={a.labourId}
                                                                onChange={e => setAllocLabour(prev => prev.map((x, idx) => idx === i ? { ...x, labourId: e.target.value } : x))}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                            >
                                                                <option value="">Choose labour...</option>
                                                                {labours.map(l => (
                                                                    <option key={l._id} value={l._id} disabled={!l.available}>
                                                                        {l.avatar} {l.name} • {l.labourType} {!l.available && "(Unavailable)"}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {selectedLabour && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <span className={`w-2 h-2 rounded-full ${selectedLabour.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                                    {selectedLabour.available ? 'Available' : 'Currently assigned'}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">Quantity</label>
                                                            <input
                                                                type="number"
                                                                value={a.qty}
                                                                min={1}
                                                                onChange={e => setAllocLabour(prev => prev.map((x, idx) => idx === i ? { ...x, qty: e.target.value } : x))}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">From Date</label>
                                                            <input
                                                                type="date"
                                                                value={a.fromDate}
                                                                onChange={e => setAllocLabour(prev => prev.map((x, idx) => idx === i ? { ...x, fromDate: e.target.value } : x))}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">To Date</label>
                                                            <input
                                                                type="date"
                                                                value={a.toDate}
                                                                onChange={e => setAllocLabour(prev => prev.map((x, idx) => idx === i ? { ...x, toDate: e.target.value } : x))}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Add special instructions..."
                                                            value={a.notes}
                                                            onChange={e => setAllocLabour(prev => prev.map((x, idx) => idx === i ? { ...x, notes: e.target.value } : x))}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Machine Allocation */}
                        {activeTab === "machine" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Assign Machinery</h3>
                                    <button
                                        onClick={addMachineAlloc}
                                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors duration-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Machine
                                    </button>
                                </div>

                                {allocMachine.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-2xl">
                                        <div className="text-6xl mb-4">🚜</div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No machinery assigned</h4>
                                        <p className="text-gray-500">Start by adding machinery to this project</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {allocMachine.map((a, i) => {
                                            const selectedMachine = machines.find(m => m._id === a.machineId);
                                            return (
                                                <div key={i} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-200">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <h4 className="font-semibold text-gray-900">Machine #{i + 1}</h4>
                                                        <button
                                                            onClick={() => removeMachineAlloc(i)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">Select Machine</label>
                                                            <select
                                                                value={a.machineId}
                                                                onChange={e => setAllocMachine(prev => prev.map((x, idx) => idx === i ? { ...x, machineId: e.target.value } : x))}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                            >
                                                                <option value="">Choose machine...</option>
                                                                {machines.map(m => (
                                                                    <option key={m._id} value={m._id} disabled={!m.available}>
                                                                        {m.icon} {m.name} • {m.type} {!m.available && "(Unavailable)"}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {selectedMachine && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <span className={`w-2 h-2 rounded-full ${selectedMachine.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                                    {selectedMachine.available ? 'Available' : 'Currently in use'}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">Daily Hours</label>
                                                            <input
                                                                type="number"
                                                                value={a.hours}
                                                                min={1}
                                                                max={24}
                                                                onChange={e => setAllocMachine(prev => prev.map((x, idx) => idx === i ? { ...x, hours: e.target.value } : x))}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">From Date</label>
                                                            <input
                                                                type="date"
                                                                value={a.fromDate}
                                                                onChange={e => setAllocMachine(prev => prev.map((x, idx) => idx === i ? { ...x, fromDate: e.target.value } : x))}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">To Date</label>
                                                            <input
                                                                type="date"
                                                                value={a.toDate}
                                                                onChange={e => setAllocMachine(prev => prev.map((x, idx) => idx === i ? { ...x, toDate: e.target.value } : x))}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Add special instructions..."
                                                            value={a.notes}
                                                            onChange={e => setAllocMachine(prev => prev.map((x, idx) => idx === i ? { ...x, notes: e.target.value } : x))}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        onClick={submitAlloc}
                        disabled={!selectedProject || (allocLabour.length === 0 && allocMachine.length === 0)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Allocation
                    </button>
                </div>
            </div>
        </div>
    );
}