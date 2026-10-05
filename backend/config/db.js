import mongoose from "mongoose";
import { runInventoryDataMigration } from "../utils/migrateInventoryData.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
        // Run migration automatically in background
        runInventoryDataMigration().catch((e) => console.warn("Migration notice:", e.message));
    } catch (error) {
        console.log("DB Error", error);
    }
};

export default connectDB;
