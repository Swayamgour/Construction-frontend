// src/pages/DailyWorkReport.jsx
import React, { useEffect, useState } from "react";

export default function DailyWorkReport() {
    const [projects, setProjects] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [summary, setSummary] = useState("");
    const [progress, setProgress] = useState(0);
    const [labourUsed, setLabourUsed] = useState("");
    const [materialList, setMaterialList] = useState([{ name: "", qty: "", unit: "" }]);
    const [machines, setMachines] = useState([]);
    const [issues, setIssues] = useState("");
    const [files, setFiles] = useState([]);
    const [saving, setSaving] = useState(false);

    // ---------------------------
    // 🚀 Dummy Data
    // ---------------------------
    useEffect(() => {
        setProjects([
            { _id: "p1", name: "Tower Construction" },
            { _id: "p2", name: "Road Development" },
            { _id: "p3", name: "Mall Renovation" },
        ]);

        setMachines([
            { _id: "m1", name: "JCB", type: "Earth Mover" },
            { _id: "m2", name: "Dumper", type: "Load Carrier" },
            { _id: "m3", name: "Concrete Mixer", type: "Mixer" },
        ]);
    }, []);

    // ---------------------------
    // Add/Remove Material Rows
    // ---------------------------
    const addMaterialRow = () =>
        setMaterialList(prev => [...prev, { name: "", qty: "", unit: "" }]);

    const removeMaterialRow = (i) =>
        setMaterialList(prev => prev.filter((_, idx) => idx !== i));

    // ---------------------------
    // File Upload (Dummy Simulation)
    // ---------------------------
    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const uploadFiles = async () => {
        if (!files.length) return [];
        return files.map(f => f.name);
    };

    // ---------------------------
    // Submit Handler
    // ---------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!projectId) {
            alert("Select a project first!");
            return;
        }

        setSaving(true);

        const uploaded = await uploadFiles();

        const payload = {
            projectId,
            date,
            summary,
            progress: Number(progress),
            labourUsed,
            materialUsed: materialList,
            machinesUsed: machines.filter(m => m.checked)
                .map(m => ({ id: m._id, hours: m.hours || 0 })),
            issues,
            proofImages: uploaded,
        };

        console.log("Dummy Submitted Payload:", payload);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSaving(false);
        alert("Work Report Saved Successfully!");
    };

    // Machine Selection Toggle
    const toggleMachine = (id) => {
        setMachines(prev =>
            prev.map(m => (m._id === id ? { ...m, checked: !m.checked } : m))
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Daily Work Report</h1>
                    <p className="text-gray-600">Track and document your daily construction progress</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                        <h2 className="text-xl font-semibold text-white">Project Details</h2>
                        <p className="text-blue-100 text-sm">Fill in the daily work information</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Top Inputs */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Project <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                                    required
                                >
                                    <option value="">Select project</option>
                                    {projects.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Progress (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={progress}
                                        onChange={(e) => setProgress(e.target.value)}
                                        min={0}
                                        max={100}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                                    />
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        %
                                    </div>
                                </div>
                                {progress > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Work Summary
                            </label>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none shadow-sm"
                                rows={3}
                                placeholder="Describe the work completed today..."
                            />
                        </div>

                        {/* Labour */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Labour Used
                            </label>
                            <input
                                placeholder="e.g. 10 labour, 3 mistri, 2 supervisor"
                                value={labourUsed}
                                onChange={(e) => setLabourUsed(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                            />
                        </div>

                        {/* Materials */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">
                                    Materials Used
                                </label>
                                <button
                                    type="button"
                                    onClick={addMaterialRow}
                                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Material
                                </button>
                            </div>

                            <div className="space-y-3">
                                {materialList.map((m, i) => (
                                    <div key={i} className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <input
                                                placeholder="Material Name"
                                                value={m.name}
                                                onChange={(e) =>
                                                    setMaterialList((prev) =>
                                                        prev.map((r, idx) =>
                                                            idx === i ? { ...r, name: e.target.value } : r
                                                        )
                                                    )
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            />

                                            <input
                                                placeholder="Quantity"
                                                value={m.qty}
                                                onChange={(e) =>
                                                    setMaterialList((prev) =>
                                                        prev.map((r, idx) =>
                                                            idx === i ? { ...r, qty: e.target.value } : r
                                                        )
                                                    )
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            />

                                            <input
                                                placeholder="Unit"
                                                value={m.unit}
                                                onChange={(e) =>
                                                    setMaterialList((prev) =>
                                                        prev.map((r, idx) =>
                                                            idx === i ? { ...r, unit: e.target.value } : r
                                                        )
                                                    )
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>

                                        {materialList.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMaterialRow(i)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Machines */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Machines Used
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {machines.map((m) => (
                                    <div
                                        key={m._id}
                                        className={`border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer ${m.checked
                                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => toggleMachine(m._id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{m.name}</div>
                                                    <div className="text-sm text-gray-500">{m.type}</div>
                                                </div>
                                            </div>

                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${m.checked
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'border-gray-300'
                                                }`}>
                                                {m.checked && (
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>

                                        {m.checked && (
                                            <div className="mt-4 space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Usage Hours</label>
                                                <input
                                                    type="number"
                                                    value={m.hours || 0}
                                                    onChange={(e) =>
                                                        setMachines((prev) =>
                                                            prev.map((x) =>
                                                                x._id === m._id ? { ...x, hours: e.target.value } : x
                                                            )
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    min="0"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Issues */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Issues & Challenges
                            </label>
                            <textarea
                                value={issues}
                                onChange={(e) => setIssues(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none shadow-sm"
                                rows={2}
                                placeholder="Report any issues or challenges faced during work..."
                            />
                        </div>

                        {/* Proof Images */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Proof Images & Documents
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors duration-200">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <p className="text-gray-600 mb-2">Upload photos and documents as proof of work</p>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl cursor-pointer transition-colors duration-200 shadow-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Choose Files
                                </label>
                                {files.length > 0 && (
                                    <p className="text-sm text-gray-500 mt-3">
                                        {files.length} file(s) selected
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving Report...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Submit Work Report
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}