import mongoose from "mongoose";

const stockLedgerSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },

    transactionType: {
        type: String,
        enum: ["GRN", "ISSUE", "TRANSFER", "RETURN", "CONSUMPTION"],
        required: true
    },


    referenceId: { type: mongoose.Schema.Types.ObjectId },  // GRN ID / Issue ID / Return ID
    referenceNumber: { type: String }, // GRN-001, MIS-002 etc.

    qtyIn: { type: Number, default: 0 },
    qtyOut: { type: Number, default: 0 },
    balanceQty: { type: Number, default: 0 },

    remarks: { type: String },

}, { timestamps: true });

export default mongoose.model("StockLedger", stockLedgerSchema);
