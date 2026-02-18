import React, { useState } from "react";
import toast from "react-hot-toast";
import {
    useGetProjectsQuery,
    useCreateMaterialRequestMutation,
    useGetAllItemsQuery,
} from "../../Reduxe/Api";

import {
    FaBox,
    FaCalculator,
    FaWeightHanging,
    FaCalendarAlt,
    FaExclamationTriangle,
    FaClipboardList,
    FaTrash
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function MaterialRequest() {

    const { data: projects } = useGetProjectsQuery();
    const { data: items } = useGetAllItemsQuery();

    const [createRequest, { isLoading }] = useCreateMaterialRequestMutation();
    const navigate = useNavigate();

    const [projectId, setProjectId] = useState("");
    const [requiredDate, setRequiredDate] = useState("");

    // ⭐ MULTIPLE ITEMS ARRAY
    const [mrItems, setMrItems] = useState([
        { itemId: "", requestedQty: "", unit: "", priority: "medium", purpose: "" }
    ]);

    // Add New Row
    const addItemRow = () => {
        setMrItems([
            ...mrItems,
            { itemId: "", requestedQty: "", unit: "", priority: "medium", purpose: "" }
        ]);
    };

    // Remove Row
    const removeItemRow = (index) => {
        const updated = [...mrItems];
        updated.splice(index, 1);
        setMrItems(updated);
    };

    // Handle value change
    const handleItemChange = (index, field, value) => {
        const updated = [...mrItems];
        updated[index][field] = value;

        // auto-set unit when item changes
        if (field === "itemId") {
            const selected = items?.items?.find(i => i._id === value);
            updated[index].unit = selected?.unit || "";
        }

        setMrItems(updated);
    };

    // Submit Request
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!projectId) return toast.error("Project is required.");
        if (!mrItems.length) return toast.error("Add at least one item.");

        if (mrItems.some(i => !i.itemId || !i.requestedQty)) {
            return toast.error("Each item must have an Item and Quantity.");
        }

        try {
            await createRequest({
                projectId,
                requiredDate,
                items: mrItems,
            }).unwrap();

            toast.success("Material Request Sent Successfully!");
            navigate("/StockOverView");

        } catch (error) {
            toast.error(error?.data?.message || "Request Failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">

                <div className="bg-white rounded-2xl shadow-xl p-8">

                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <FaClipboardList className="text-blue-600" />
                        New Material Request
                    </h2>

                    {/* PROJECT */}
                    <div className="mt-6">
                        <label className="font-semibold">Select Project</label>
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="w-full border p-3 rounded-xl mt-1"
                        >
                            <option value="">Choose project...</option>
                            {projects?.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.projectName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* DATE */}
                    <div className="mt-4">
                        <label className="font-semibold flex items-center gap-2">
                            <FaCalendarAlt /> Required Date
                        </label>
                        <input
                            type="date"
                            value={requiredDate}
                            onChange={(e) => setRequiredDate(e.target.value)}
                            className="w-full border p-3 rounded-xl mt-1"
                        />
                    </div>

                    {/* MULTIPLE ITEMS */}
                    <div className="mt-6 space-y-6">
                        {mrItems.map((row, index) => {

                            return (
                                <div key={index} className="p-5 bg-gray-100 rounded-xl border relative">

                                    {mrItems.length > 1 && (
                                        <button
                                            onClick={() => removeItemRow(index)}
                                            className="absolute top-2 right-2 text-red-500"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}

                                    {/* ITEM */}
                                    <label className="font-semibold flex items-center gap-2">
                                        <FaBox className="text-orange-500" /> Select Item
                                    </label>

                                    <select
                                        value={row.itemId}
                                        onChange={(e) => {

                                            const selectedId = e.target.value;

                                            // check duplicate
                                            if (mrItems.some((i, idx) => i.itemId === selectedId && idx !== index)) {
                                                toast.error("This item is already selected!");
                                                return;
                                            }

                                            handleItemChange(index, "itemId", selectedId);
                                        }}
                                        className="w-full border p-3 rounded-xl mt-2"
                                    >
                                        <option value="">Choose Item...</option>

                                        {items?.items?.map((i) => (
                                            <option
                                                key={i._id}
                                                value={i._id}
                                                disabled={
                                                    mrItems.some((it, idx2) =>
                                                        it.itemId === i._id && idx2 !== index
                                                    )
                                                }
                                            >
                                                {i.name} ({i.unit})
                                            </option>
                                        ))}
                                    </select>

                                    {/* QTY & UNIT */}
                                    <div className="grid grid-cols-2 gap-4 mt-4">

                                        <div>
                                            <label className="font-semibold flex items-center gap-2">
                                                <FaCalculator /> Quantity
                                            </label>
                                            <input
                                                type="number"
                                                value={row.requestedQty}
                                                onChange={(e) =>
                                                    handleItemChange(index, "requestedQty", e.target.value)
                                                }
                                                className="w-full border p-3 rounded-xl mt-1"
                                                placeholder="Enter qty..."
                                            />
                                        </div>

                                        <div>
                                            <label className="font-semibold flex items-center gap-2">
                                                <FaWeightHanging /> Unit
                                            </label>
                                            <input
                                                type="text"
                                                value={row.unit}
                                                readOnly
                                                className="w-full border p-3 rounded-xl bg-gray-200 mt-1"
                                            />
                                        </div>

                                    </div>

                                    {/* PRIORITY */}
                                    <div className="mt-4">
                                        <label className="font-semibold flex items-center gap-2">
                                            <FaExclamationTriangle /> Priority
                                        </label>
                                        <select
                                            value={row.priority}
                                            onChange={(e) =>
                                                handleItemChange(index, "priority", e.target.value)
                                            }
                                            className="w-full border p-3 rounded-xl mt-1"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    {/* PURPOSE */}
                                    <div className="mt-4">
                                        <label className="font-semibold">Purpose</label>
                                        <textarea
                                            value={row.purpose}
                                            onChange={(e) =>
                                                handleItemChange(index, "purpose", e.target.value)
                                            }
                                            className="w-full border p-3 rounded-xl mt-1"
                                            rows="2"
                                            placeholder="Where will it be used?"
                                        />
                                    </div>

                                </div>
                            );
                        })}

                        {/* ADD BUTTON */}
                        <button
                            type="button"
                            onClick={addItemRow}
                            className="w-full p-3 bg-blue-100 border border-blue-400 text-blue-700 font-semibold rounded-xl hover:bg-blue-200"
                        >
                            + Add Another Item
                        </button>
                    </div>

                    {/* SUBMIT */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full mt-6 p-4 bg-blue-600 text-white rounded-xl text-lg font-bold"
                    >
                        {isLoading ? "Submitting..." : "Submit Material Request"}
                    </button>

                </div>
            </div>
        </div>
    );
}
