import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: ["material", "machine"], required: true },
        category: { type: String, required: true },
        unit: { type: String, required: true },

        hsnCode: { type: String, default: null },
        itemCode: { type: String, default: null, trim: true },
        description: { type: String, default: null },

        minStock: { type: Number, default: 0, min: 0 },
        reorderLevel: { type: Number, default: 0, min: 0 },

        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export default mongoose.model("Item", itemSchema);

