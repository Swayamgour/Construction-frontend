import React, { useState } from "react";
import { FaArrowLeft, FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AddTask = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        taskName: "",
        description: "",
        category: "",
        priority: "Medium",
        assignedTo: "",
        department: "",
        vendor: "",
        vendorContact: "",
        siteLocation: "",
        startDate: "",
        endDate: "",
        duration: "",
        materialRequired: "",
        estimatedCost: "",
        actualCost: "",
        progress: "",
        status: "Pending",
        remarks: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Auto calculate duration (days)
        if (name === "startDate" || name === "endDate") {
            const start = new Date(
                name === "startDate" ? value : formData.startDate
            );
            const end = new Date(name === "endDate" ? value : formData.endDate);
            if (start && end && end > start) {
                const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                setFormData((prev) => ({ ...prev, duration: `${diff} days` }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("New Task Added:", formData);
        alert("✅ Construction Task Added Successfully!");
        navigate("/tasks");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 md:px-8">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full hover:bg-slate-100 transition"
                        >
                            <FaArrowLeft className="text-slate-600" />
                        </button>
                        <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                            Add Tasks
                        </h1>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Task Name
                            </label>
                            <input
                                type="text"
                                name="taskName"
                                placeholder="Enter task title"
                                value={formData.taskName}
                                onChange={handleChange}
                                required
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select Category</option>
                                <option>Foundation Work</option>
                                <option>Electrical</option>
                                <option>Plumbing</option>
                                <option>Interior</option>
                                <option>Finishing</option>
                                <option>Painting</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="font-semibold text-slate-700 mb-2 block">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows="4"
                            placeholder="Describe the task details"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                    </div>

                    {/* Assignment */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Assigned To
                            </label>
                            <input
                                type="text"
                                name="assignedTo"
                                placeholder="Engineer / Supervisor"
                                value={formData.assignedTo}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Department / Team
                            </label>
                            <input
                                type="text"
                                name="department"
                                placeholder="E.g. Civil, Electrical"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                End Date
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Duration
                            </label>
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration}
                                readOnly
                                placeholder="Auto calculated"
                                className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-3"
                            />
                        </div>
                    </div>

                    {/* Vendor & Site */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Vendor / Contractor
                            </label>
                            <input
                                type="text"
                                name="vendor"
                                placeholder="Enter vendor name"
                                value={formData.vendor}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Vendor Contact
                            </label>
                            <input
                                type="text"
                                name="vendorContact"
                                placeholder="Contact number"
                                value={formData.vendorContact}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Site Location
                            </label>
                            <input
                                type="text"
                                name="siteLocation"
                                placeholder="Enter site name or address"
                                value={formData.siteLocation}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                            />
                        </div>
                    </div>

                    {/* Cost and Material */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Material Required
                            </label>
                            <input
                                type="text"
                                name="materialRequired"
                                placeholder="e.g. Cement, Steel, Tiles"
                                value={formData.materialRequired}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Estimated Cost (₹)
                            </label>
                            <input
                                type="number"
                                name="estimatedCost"
                                placeholder="Estimated amount"
                                value={formData.estimatedCost}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Actual Cost (₹)
                            </label>
                            <input
                                type="number"
                                name="actualCost"
                                placeholder="Actual spent"
                                value={formData.actualCost}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                            />
                        </div>
                    </div>

                    {/* Progress and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Progress (%)
                            </label>
                            <input
                                type="number"
                                name="progress"
                                placeholder="0 - 100"
                                value={formData.progress}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 mb-2 block">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                            >
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>On Hold</option>
                                <option>Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="font-semibold text-slate-700 mb-2 block">
                            Remarks / Notes
                        </label>
                        <textarea
                            name="remarks"
                            rows="3"
                            placeholder="Any special instructions or remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3"
                        ></textarea>
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all"
                        >
                            <FaPlusCircle />
                            Add Construction Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTask;
