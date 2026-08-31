import mongoose from "mongoose";

const stockLedgerSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },

    transactionType: {
        type: String,
        // ⭐ Extended (additive only) for the new Stock Request / Transfer /
        // Procurement / Inventory modules. Existing values are untouched so
        // current GRN/consumption flows keep writing valid ledger rows.
        enum: [
            "GRN", "ISSUE", "TRANSFER", "RETURN", "CONSUMPTION",
            "TRANSFER_IN", "TRANSFER_OUT", "PROCUREMENT_RECEIPT",
            "OPENING", "DAMAGE", "ADJUSTMENT",
        ],
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
