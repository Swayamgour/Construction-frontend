import React, { useEffect, useState } from "react";
import {
    useAddLabourMutation,
    useUpdateLabourMutation,
    useGetLabourByIdQuery
} from "../../Reduxe/Api";

import { X, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const LabourForm = ({ labourId, onClose, onSave }) => {
    const { data: labourData } = useGetLabourByIdQuery(labourId, {
        skip: !labourId
    });

    const [addLabour] = useAddLabourMutation();
    const [updateLabour] = useUpdateLabourMutation();

    const navigate = useNavigate();

    const initialState = {
        name: "",
        labourType: "Permanent Labour",
        category: "Labour",
        wageType: "Daily",
        dailyWage: "",
        monthlySalary: "",
        skillLevel: "Unskilled",
        phone: "",
        address: "",
        projectAssigned: "",
        status: "Active"
    };

    const [formData, setFormData] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const isEditMode = !!labourId;

    // Load Data in Edit Mode
    useEffect(() => {
        if (labourData?.data && isEditMode) {
            const labour = labourData.data;
            setFormData({
                ...labour,
                projectAssigned: labour.projectAssigned?._id || "",
                dailyWage: labour.dailyWage?.toString() || "",
                monthlySalary: labour.monthlySalary?.toString() || ""
            });
        }
    }, [labourData, isEditMode]);

    // Auto skillLevel for Operator
    useEffect(() => {
        if (formData.category === "Operator") {
            setFormData(prev => ({ ...prev, skillLevel: "Skilled" }));
        }
    }, [formData.category]);

    // Handle Change
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone") {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 10) return;
        }

        if (name === "dailyWage" || name === "monthlySalary") {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 6) return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.name || !formData.phone || !formData.address) {
            toast.error("Required fields missing!");
            return;
        }

        if (formData.phone.length !== 10) {
            toast.error("Phone number must be 10 digits!");
            return;
        }

        setIsLoading(true);

        try {
            if (isEditMode) {
                await updateLabour({
                    id: labourId,
                    ...formData,
                    dailyWage: Number(formData.dailyWage),
                    monthlySalary: Number(formData.monthlySalary)
                }).unwrap();

                toast.success("Updated Successfully");
                navigate(-1);
            } else {
                await addLabour({
                    ...formData,
                    dailyWage: Number(formData.dailyWage),
                    monthlySalary: Number(formData.monthlySalary),
                    projectAssigned: formData.projectAssigned || null
                }).unwrap();

                toast.success("Added Successfully");
                navigate(-1);
            }

            onSave();
            onClose();

        } catch (err) {
            // toast.error(err?.data?.message || "Error saving data!");
            console.log(err)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">

                <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {isEditMode ? "Edit Worker" : "Add New Worker"}
                    </h2>
                    <button onClick={() => navigate(-1)}>
                        <X size={22} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* NAME + PHONE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-semibold mb-1">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Phone *</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl"
                                />
                            </div>
                        </div>

                        {/* ADDRESS */}
                        <div>
                            <label className="block font-semibold mb-1">Address *</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-xl"
                            />
                        </div>

                        {/* Category + LabourType */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-semibold mb-1">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl"
                                >
                                    <option value="Labour">Labour</option>
                                    <option value="Mistri">Mistri</option>
                                    <option value="Operator">Operator</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Type</label>
                                <select
                                    name="labourType"
                                    value={formData.labourType}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl"
                                >
                                    <option>Permanent Labour</option>
                                    <option>Contract Labour</option>
                                    <option>Permanent Mistri</option>
                                    <option>Contract Mistri</option>
                                    <option>Permanent Operator</option>
                                    <option>Contract Operator</option>
                                </select>
                            </div>
                        </div>

                        {/* Skill */}
                        <div>
                            <label className="block font-semibold mb-1">Skill Level</label>
                            <select
                                name="skillLevel"
                                value={formData.skillLevel}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-xl"
                                disabled={formData.category === "Operator"} // auto-skilled
                            >
                                <option>Unskilled</option>
                                <option>Semi-skilled</option>
                                <option>Skilled</option>
                            </select>
                        </div>

                        {/* Wage */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-semibold mb-1">Wage Type</label>
                                <select
                                    name="wageType"
                                    value={formData.wageType}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl"
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                            </div>

                            {formData.wageType === "Daily" && (
                                <div>
                                    <label className="block font-semibold mb-1">Daily Wage</label>
                                    <input
                                        type="text"
                                        name="dailyWage"
                                        value={formData.dailyWage}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-xl"
                                    />
                                </div>
                            )}

                            {formData.wageType === "Monthly" && (
                                <div>
                                    <label className="block font-semibold mb-1">Monthly Salary</label>
                                    <input
                                        type="text"
                                        name="monthlySalary"
                                        value={formData.monthlySalary}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-xl"
                                    />
                                </div>
                            )}
                        </div>

                        {/* BUTTONS */}
                        <div className="flex justify-end gap-3">
                            {/* <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">
                                Cancel
                            </button> */}

                            <button type="submit" disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2">
                                {isLoading ? "Saving..." : <Save size={18} />}
                                {isEditMode ? "Update" : "Add Worker"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default LabourForm;
