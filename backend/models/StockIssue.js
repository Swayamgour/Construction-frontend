import mongoose from "mongoose";

const stockIssueSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: [
            {
                itemId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Item",
                    required: true,
                },
                qty: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                remarks: {
                    type: String,
                    default: "",
                },
            }
        ],
    },
    { timestamps: true }
);

const StockIssue = mongoose.model("StockIssue", stockIssueSchema);

export default StockIssue;
