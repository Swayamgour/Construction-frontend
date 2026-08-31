import mongoose from "mongoose";

/**
 * Inter-project stock transfer fulfilling a StockRequest ("Option 1" in the
 * spec). Never silently mutates Stock — always creates this record alongside
 * the Stock/StockLedger updates (see controllers/stockTransferController.js).
 */
const stockTransferSchema = new mongoose.Schema(
    {
        stockRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "StockRequest", default: null },

        sourceProjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        destinationProjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },

        materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },

        requestedQuantity: { type: Number, required: true },
        transferredQuantity: { type: Number, required: true },

        transferDate: { type: Date, default: Date.now },

        initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

        status: {
            type: String,
            enum: ["Initiated", "InTransit", "Received", "Cancelled"],
            default: "Initiated",
        },

        remarks: { type: String, default: "" },

        sourceStockBalanceAfter: { type: Number, default: null },
        destinationStockBalanceAfter: { type: Number, default: null },
    },
    { timestamps: true }
);

export default mongoose.model("StockTransfer", stockTransferSchema);
