import dotenv from "dotenv";
dotenv.config();   // ← MUST be first

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// routes import


import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import materialRequestRoutes from "./routes/materialRequestRoutes.js";
import labourRoutes from "./routes/labourRoutes.js";
import machineRoutes from "./routes/machineRoutes.js";
import machineAllocationRoutes from "./routes/machineAllocationRoutes.js";
import machineUsageRoutes from "./routes/machineUsageRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import grnRoutes from "./routes/grnRoutes.js";
import consumptionRoutes from "./routes/consumptionRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import ganttRoutes from "./routes/ganttRoutes.js";
// import assignWorkRoutes from "./routes/assignWorkRoutes.js";
// import { cloudinary } from "./config/cloudinary.js";
import cloudinary from "./config/cloudinary.js";




const app = express();

connectDB();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/assignLabour", labourRoutes);
app.use("/api/mr", materialRequestRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/machine/allocation", machineAllocationRoutes);
app.use("/api/machine/usage", machineUsageRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/grn", grnRoutes);
app.use("/api/consumption", consumptionRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/gantt", ganttRoutes);
// app.use("/api/", consumptionRoutes);

// Fixed the root route - you can't use JSX in Express
app.get("/", (req, res) => {
    res.send("<h1>Hello World!</h1>");
});

// Alternatively, you can send JSON
app.get("/api", (req, res) => {

    res.json({
        message: "Welcome to Construction Management API",
        version: "1.0.0"
    });
});

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));