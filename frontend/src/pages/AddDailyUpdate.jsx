import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";

const AddDailyUpdate = () => {
    const [formData, setFormData] = useState({
        date: "",
        projectName: "",
        weather: "",
        progress: "",
        workDone: "",
        materialsUsed: "",
        manpower: "",
        equipmentUsed: "",
        issues: "",
        nextDayPlan: "",
        images: [],
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "images") {
            setFormData({ ...formData, images: [...files] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitted:", formData);
        alert("✅ Daily update added successfully!");
    };

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-8">
            <div className="flex items-center gap-4 mb-10">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                    <FiArrowLeft className="text-xl" />
                </button>
                <div>
                    {/* <h1 className="text-3xl font-bold text-gray-900">Add Daily Site Update</h1> */}
                    <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                       Add Daily Site Update
                    </h1>
                    <p className="text-gray-600">
                        Fill out all details for today’s site progress report
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white w-full rounded-3xl p-8 border border-gray-200 shadow-sm space-y-8"
            >
                {/* Basic Info */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4  border-blue-600 ">
                        Basic Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Project Name
                            </label>
                            <input
                                type="text"
                                name="projectName"
                                placeholder="e.g. Skyline Tower"
                                value={formData.projectName}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            />
                        </div>

                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Weather
                            </label>
                            <input
                                type="text"
                                name="weather"
                                placeholder="e.g. Sunny, 31°C"
                                value={formData.weather}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            />
                        </div> */}
                    </div>
                </div>

                {/* Work Info */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4  border-green-500 ">
                        Work Details
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Work Done Today
                            </label>
                            <textarea
                                name="workDone"
                                rows="3"
                                placeholder="Describe the completed work for today..."
                                value={formData.workDone}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Manpower Deployed
                                </label>
                                <input
                                    type="text"
                                    name="manpower"
                                    placeholder="e.g. 12 laborers, 2 masons, 1 foreman"
                                    value={formData.manpower}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Equipment Used
                                </label>
                                <input
                                    type="text"
                                    name="equipmentUsed"
                                    placeholder="e.g. Mixer, Crane, Vibrator"
                                    value={formData.equipmentUsed}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Materials Info */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4  border-amber-500 ">
                        Materials Used
                    </h2>
                    <textarea
                        name="materialsUsed"
                        placeholder="e.g. 20 cement bags, 15 steel rods, 5 cubic sand"
                        rows="3"
                        value={formData.materialsUsed}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                    />
                </div>

                {/* Remarks & Plan */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4  border-purple-500 ">
                        Remarks & Plan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Issues / Remarks
                            </label>
                            <textarea
                                name="issues"
                                rows="3"
                                placeholder="Any site issues or pending tasks..."
                                value={formData.issues}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Next Day Plan
                            </label>
                            <textarea
                                name="nextDayPlan"
                                rows="3"
                                placeholder="Work planned for tomorrow..."
                                value={formData.nextDayPlan}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Upload Photos */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4  border-pink-500 ">
                        Upload Site Photos
                    </h2>
                    <input
                        type="file"
                        name="images"
                        accept="image/*"
                        multiple
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2   file:px-4 hover:file:bg-blue-700"
                    />
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-8 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-all"
                    >
                        Submit Update
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddDailyUpdate;
