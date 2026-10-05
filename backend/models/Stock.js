import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      unique: true,
      index: true,
    },

    // Total available usable stock across all locations
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total damaged stock across all locations
    damaged: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Location-wise / Project-wise balances
    projectBalances: {
      type: [
        {
          projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
          },
          qty: {
            type: Number,
            default: 0,
            min: 0, // Usable stock in store/site
          },
          issuedBuffer: {
            type: Number,
            default: 0,
            min: 0, // Issued to task/site activity, not yet consumed
          },
          damaged: {
            type: Number,
            default: 0,
            min: 0, // Damaged stock at this project
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Stock", stockSchema);
