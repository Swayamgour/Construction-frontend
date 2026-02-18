import React, { useState } from "react";
import { useGetProjectsQuery } from "../../Reduxe/Api";

export default function DailyWorkReportForm() {
    const [formData, setFormData] = useState({
        projectId: "",
        taskId: "",
        workDescription: "",
        progressPercent: 0,
        laboursUsed: [{ labourId: "", hours: "" }],
        machinesUsed: [{ machineId: "", hours: "" }],
        materialsUsed: [{ materialName: "", qty: "", unit: "" }],
        startTime: "",
        endTime: "",
        attachments: [],
    });

    const { data } = useGetProjectsQuery()
    console.log(data)

    // HANDLE INPUT CHANGE
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ADD/REMOVE ROWS FOR DYNAMIC FIELDS
    const addRow = (field) => {
        setFormData({
            ...formData,
            [field]: [...formData[field], {}],
        });
    };

    const removeRow = (field, index) => {
        const updated = [...formData[field]];
        updated.splice(index, 1);
        setFormData({ ...formData, [field]: updated });
    };

    // FORM SUBMIT
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("FINAL PAYLOAD:", formData);

        // TODO: axios.post("/api/report", formData)
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md mt-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">
                Daily Work Report
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* PROJECT */}
                <div>
                    <label className="block font-medium mb-1">Project</label>
                    <input
                        name="projectId"
                        onChange={handleChange}
                        placeholder="Enter Project ID"
                        className="w-full p-3 border rounded-lg"
                    />
                </div>

                {/* TASK */}
                <div>
                    <label className="block font-medium mb-1">Task</label>
                    <input
                        name="taskId"
                        onChange={handleChange}
                        placeholder="Enter Task ID"
                        className="w-full p-3 border rounded-lg"
                    />
                </div>

                {/* WORK DESCRIPTION */}
                <div>
                    <label className="block font-medium mb-1">Work Description</label>
                    <textarea
                        name="workDescription"
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg"
                        placeholder="Describe today’s work..."
                    ></textarea>
                </div>

                {/* PROGRESS PERCENT */}
                <div>
                    <label className="block font-medium mb-1">Progress (%)</label>
                    <input
                        type="number"
                        name="progressPercent"
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg"
                        placeholder="0 - 100"
                    />
                </div>

                {/* LABOURS USED */}
                <div>
                    <div className="flex justify-between">
                        <label className="font-medium mb-1">Labours Used</label>
                        <button
                            type="button"
                            onClick={() => addRow("laboursUsed")}
                            className="text-blue-600"
                        >
                            + Add Labour
                        </button>
                    </div>

                    {formData.laboursUsed.map((item, index) => (
                        <div key={index} className="flex gap-3 mb-2">
                            <input
                                placeholder="Labour ID"
                                className="p-3 border rounded-lg w-1/2"
                                onChange={(e) => {
                                    const updated = [...formData.laboursUsed];
                                    updated[index].labourId = e.target.value;
                                    setFormData({ ...formData, laboursUsed: updated });
                                }}
                            />
                            <input
                                placeholder="Hours"
                                className="p-3 border rounded-lg w-1/2"
                                onChange={(e) => {
                                    const updated = [...formData.laboursUsed];
                                    updated[index].hours = e.target.value;
                                    setFormData({ ...formData, laboursUsed: updated });
                                }}
                            />

                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => removeRow("laboursUsed", index)}
                                    className="text-red-600"
                                >
                                    X
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* MACHINES USED */}
                <div>
                    <div className="flex justify-between">
                        <label className="font-medium mb-1">Machines Used</label>
                        <button
                            type="button"
                            onClick={() => addRow("machinesUsed")}
                            className="text-blue-600"
                        >
                            + Add Machine
                        </button>
                    </div>

                    {formData.machinesUsed.map((item, index) => (
                        <div key={index} className="flex gap-3 mb-2">
                            <input
                                placeholder="Machine ID"
                                className="p-3 border rounded-lg w-1/2"
                                onChange={(e) => {
                                    const updated = [...formData.machinesUsed];
                                    updated[index].machineId = e.target.value;
                                    setFormData({ ...formData, machinesUsed: updated });
                                }}
                            />
                            <input
                                placeholder="Hours"
                                className="p-3 border rounded-lg w-1/2"
                                onChange={(e) => {
                                    const updated = [...formData.machinesUsed];
                                    updated[index].hours = e.target.value;
                                    setFormData({ ...formData, machinesUsed: updated });
                                }}
                            />

                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => removeRow("machinesUsed", index)}
                                    className="text-red-600"
                                >
                                    X
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* MATERIALS USED */}
                <div>
                    <div className="flex justify-between">
                        <label className="font-medium mb-1">Materials Used</label>
                        <button
                            type="button"
                            onClick={() => addRow("materialsUsed")}
                            className="text-blue-600"
                        >
                            + Add Material
                        </button>
                    </div>

                    {formData.materialsUsed.map((item, index) => (
                        <div key={index} className="flex gap-3 mb-2">
                            <input
                                placeholder="Material Name"
                                className="p-3 border rounded-lg w-1/3"
                                onChange={(e) => {
                                    const updated = [...formData.materialsUsed];
                                    updated[index].materialName = e.target.value;
                                    setFormData({ ...formData, materialsUsed: updated });
                                }}
                            />
                            <input
                                placeholder="Qty"
                                className="p-3 border rounded-lg w-1/3"
                                onChange={(e) => {
                                    const updated = [...formData.materialsUsed];
                                    updated[index].qty = e.target.value;
                                    setFormData({ ...formData, materialsUsed: updated });
                                }}
                            />
                            <input
                                placeholder="Unit (kg, bag, etc)"
                                className="p-3 border rounded-lg w-1/3"
                                onChange={(e) => {
                                    const updated = [...formData.materialsUsed];
                                    updated[index].unit = e.target.value;
                                    setFormData({ ...formData, materialsUsed: updated });
                                }}
                            />

                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => removeRow("materialsUsed", index)}
                                    className="text-red-600"
                                >
                                    X
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* START & END TIME */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium mb-1">Start Time</label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1">End Time</label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>
                </div>

                {/* ATTACHMENTS */}
                <div>
                    <label className="block font-medium mb-1">Attachments (URLs)</label>
                    <textarea
                        name="attachments"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                attachments: e.target.value.split("\n"),
                            })
                        }
                        placeholder="One image URL per line"
                        className="w-full p-3 border rounded-lg"
                    ></textarea>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
                >
                    Submit Report
                </button>
            </form>
        </div>
    );
}
