import mongoose from "mongoose";

/**
 * Drawing/document request system — none existed previously.
 * A dedicated "drawing_manager" role has been added to config/roles.js
 * and models/User.js's role enum specifically for this module: it
 * receives drawing requests, reviews them, and uploads versions.
 * "admin" retains full override access (god-mode) on every drawing route.
 */
const drawingRequestSchema = new mongoose.Schema(
    {
        requestNumber: { type: String, unique: true, index: true },
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },

        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        drawingCategory: { type: String, required: true }, // e.g. Structural, Architectural, MEP
        drawingTitle: { type: String, required: true },
        description: { type: String, default: "" },

        requiredDate: { type: Date, default: null },
        priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
        remarks: { type: String, default: "" },

        status: {
            type: String,
            enum: ["REQUESTED", "UNDER_REVIEW", "UPLOADED", "APPROVED", "REJECTED", "DELIVERED"],
            default: "REQUESTED",
            index: true,
        },

        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // drawing manager handling it
        latestVersionNumber: { type: Number, default: 0 },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

drawingRequestSchema.pre("validate", function (next) {
    if (!this.requestNumber) this.requestNumber = `DRW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    next();
});

export default mongoose.model("DrawingRequest", drawingRequestSchema);
