import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

// Routes
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

// New modules
import labourManagementRoutes from "./routes/labourManagementRoutes.js";
import projectLabourRoutes from "./routes/projectLabourRoutes.js";
import drawingRoutes from "./routes/drawingRoutes.js";
import machineManagementRoutes from "./routes/machineManagementRoutes.js";
import eodRoutes from "./routes/eodRoutes.js";
import delayRoutes from "./routes/delayRoutes.js";
import projectDelayRoutes from "./routes/projectDelayRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import erpReportRoutes from "./routes/erpReportRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import { startAutoAbsentScheduler } from "./services/autoAbsentScheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ========================================
// DATABASE
// ========================================

connectDB();

// ========================================
// GLOBAL MIDDLEWARE
// ========================================

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// STATIC UPLOADS
// ========================================

// Backend:
// C:\projets\erp\backend\uploads
//
// Browser URL:
// http://localhost:5000/uploads/...

const uploadsPath = path.join(__dirname, "uploads");

console.log("📁 Uploads directory:", uploadsPath);

app.use(
    "/uploads",
    express.static(uploadsPath, {
        fallthrough: false,
    })
);

// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);

app.use("/api/project", projectRoutes);

app.use("/api/vendor", vendorRoutes);

app.use("/api/item", itemRoutes);

app.use("/api/assignLabour", labourRoutes);

app.use("/api/mr", materialRequestRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/labour", labourManagementRoutes);

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

// ========================================
// NEW MODULE ROUTES
// ========================================

app.use("/api/projects", projectLabourRoutes);

app.use("/api/projects", projectDelayRoutes);

app.use("/api/drawings", drawingRoutes);

app.use("/api/machinery", machineManagementRoutes);

app.use("/api/eod", eodRoutes);

app.use("/api/delays", delayRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/audit", auditRoutes);

app.use("/api/reports", erpReportRoutes);

app.use("/api/purchase-orders", purchaseOrderRoutes);

// ========================================
// API HEALTH CHECK
// ========================================

app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Construction Management API",
        version: "1.0.0",
    });
});

// ========================================
// 404 API HANDLER
// ========================================

// app.use("/api/*", (req, res) => {
//     res.status(404).json({
//         success: false,
//         message: "API endpoint not found",
//         path: req.originalUrl,
//     });
// });

// ========================================
// ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
    console.error("❌ SERVER ERROR:", err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

// ========================================
// START SERVER
// ========================================

// Inventory & Stock Management Consolidated Workflow Active
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("========================================");
    console.log("🚀 Construction ERP Backend Started");
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
    console.log("========================================");
    startAutoAbsentScheduler();
});