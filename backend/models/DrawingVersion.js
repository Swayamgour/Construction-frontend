import mongoose from "mongoose";

/**
 * Every upload creates a NEW version document — old versions are never
 * overwritten or deleted, so v1/v2/v3 all remain independently accessible
 * (spec requirement). drawingRequestId + versionNumber together identify
 * a version; latestVersionNumber on DrawingRequest tracks the current tip.
 */
const drawingVersionSchema = new mongoose.Schema(
    {
        drawingRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "DrawingRequest", required: true, index: true },

        versionNumber: { type: Number, required: true },
        revisionNumber: { type: String, default: "" }, // e.g. "Rev-A"
        revisionDate: { type: Date, default: Date.now },

        drawingNumber: { type: String, default: "" },

        fileUrl: { type: String, required: true },
        fileName: { type: String, required: true },
        fileType: { type: String, default: "" }, // pdf, dwg, image, other

        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        remarks: { type: String, default: "" },
    },
    { timestamps: true }
);

drawingVersionSchema.index({ drawingRequestId: 1, versionNumber: 1 }, { unique: true });

export default mongoose.model("DrawingVersion", drawingVersionSchema);
