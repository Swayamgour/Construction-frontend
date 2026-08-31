import mongoose from "mongoose";

/**
 * Configurable delay categories (spec: "create configurable delay
 * categories") — a lookup collection instead of a hard-coded enum, so
 * admin can add/rename categories without a code deploy. Seed data for
 * the default list mentioned in the spec is in scripts/seedDelayCategories.js.
 */
const delayCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model("DelayCategory", delayCategorySchema);
