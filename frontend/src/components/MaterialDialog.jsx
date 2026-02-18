import React, { useState } from "react";
import DialogBox from "../helper/DialogBox";
import { HiOutlineX } from "react-icons/hi";
import toast from "react-hot-toast";
import { useAddItemsMutation } from "../Reduxe/Api";

const ITEM_CATEGORIES = {
    material: {
        subcategories: {
            "Cement": [],
            "Steel": [],
            "Aggregates": [],
            "Bricks & Blocks": [],
            "Paints & Coatings": [],
            "Plumbing": [],
            "Electrical": [],
            "Wood & Furniture": [],
        }
    },

    machine: {
        subcategories: {
            "Construction Equipment": [],
            "Earth Moving": [],
            "Material Handling": [],
            "Concrete Equipment": [],
            "Power Tools": [],
        }
    }
};

function MaterialDialog({ isOpen, onClose, vendorId, data }) {

    // console.log(vendorId, data)

    const [form, setForm] = useState({
        name: data?.name || "",
        type: data?.type || "",
        category: data?.category || "",
        unit: data?.unit || "",
        hsnCode: data?.hsnCode || "",
        description: data?.description || "",
        isActive: data?.isActive ?? true,
        vendorId: vendorId,
    });

    const [addItem] = useAddItemsMutation()

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.name) return toast.error("Name is required");
        if (!form.type) return toast.error("Type is required");
        if (!form.category) return toast.error("Category is required");
        if (!form.unit) return toast.error("Unit is required");

        onSubmit(form); // final output
        onClose();
    };


    async function onSubmit(formData) {
        try {
            console.log("Submitted Data:", formData);

            const response = await addItem(formData).unwrap();  // ⬅️ correct RTK query call

            // If API responded successfully
            toast.success(data ? "Product updated successfully" : "Product added successfully");

        } catch (error) {
            console.log("Error:", error);

            // Optional: show error toast
            toast.error(error?.data?.message || "Something went wrong");
        }
    }

    return (
        <DialogBox isOpen={isOpen} onClose={onClose} title={null} className="relative">

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
                <HiOutlineX className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-center text-gray-800 mb-5">
                {data ? "Edit Product" : "Add Material / Machine"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* NAME + UNIT IN ONE ROW */}


                {/* TYPE SELECTOR */}
                <div>
                    <label className="text-sm font-medium text-slate-700">Select Type *</label>

                    <div className="flex gap-3 flex-wrap mt-2">
                        {["material", "machine"].map((typeValue) => (
                            <button
                                key={typeValue}
                                type="button"
                                onClick={() =>
                                    setForm((prev) => ({
                                        ...prev,
                                        type: typeValue,
                                        category: "" // reset category
                                    }))
                                }
                                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                        ${form.type === typeValue
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                        : "bg-white text-slate-700 border-slate-300 hover:bg-blue-50"
                                    }`}
                            >
                                {typeValue.charAt(0).toUpperCase() + typeValue.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CATEGORY SELECTOR */}
                {form.type ? (
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">
                            Select Category ({form.type})
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.keys(ITEM_CATEGORIES[form.type].subcategories).map((subcategory) => (
                                <div
                                    key={subcategory}
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            category: subcategory
                                        }))
                                    }
                                    className={`p-3 rounded-lg border cursor-pointer transition-all text-sm
                            ${form.category === subcategory
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-slate-800 border-slate-300 hover:bg-blue-100"
                                        }`}
                                >
                                    {subcategory}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">Please select type first...</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NAME */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Name *
                        </label>
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-gray-300 p-3 rounded-xl mt-1"
                        />
                    </div>

                    {/* UNIT */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Unit *</label>
                        <input
                            type="text"
                            placeholder="Bag / Kg / Ton / Piece"
                            value={form.unit}
                            onChange={(e) => setForm({ ...form, unit: e.target.value })}
                            className="w-full border border-gray-300 p-3 rounded-xl mt-1"
                        />
                    </div>
                </div>

                {/* HSN CODE + ACTIVE TOGGLE IN ONE ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* HSN */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">HSN Code</label>
                        <input
                            type="text"
                            placeholder="HSN Code"
                            value={form.hsnCode}
                            onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
                            className="w-full border border-gray-300 p-3 rounded-xl mt-1"
                        />
                    </div>

                    {/* ACTIVE TOGGLE */}
                    <div className="flex items-center gap-3 mt-7">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                            className="w-5 h-5"
                        />
                        <span className="text-gray-700">Is Active</span>
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div>
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                        placeholder="Write description..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full border border-gray-300 p-3 rounded-xl mt-1"
                    />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md"
                >
                    {data ? "Update" : "Save"}
                </button>

            </form>


        </DialogBox>
    );
}

export default MaterialDialog;
