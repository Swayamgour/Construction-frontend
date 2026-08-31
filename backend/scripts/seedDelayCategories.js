/**
 * One-time seed for the default delay categories listed in the feature
 * spec (section 18). Safe to re-run — uses upsert, so it never creates
 * duplicates.
 *
 * Run with:  node scripts/seedDelayCategories.js
 */
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import DelayCategory from "../models/DelayCategory.js";

const DEFAULT_CATEGORIES = [
    "Material shortage",
    "Labour shortage",
    "Machinery unavailable",
    "Machinery breakdown",
    "Weather",
    "Client approval pending",
    "Drawing pending",
    "Vendor delay",
    "Site issue",
    "Government approval",
    "Payment issue",
    "Safety issue",
    "Design change",
    "Technical issue",
    "Other",
];

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    for (const name of DEFAULT_CATEGORIES) {
        await DelayCategory.updateOne({ name }, { $setOnInsert: { name, isActive: true } }, { upsert: true });
    }
    console.log(`Seeded ${DEFAULT_CATEGORIES.length} delay categories.`);
    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
