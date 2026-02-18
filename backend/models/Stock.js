import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    // ⭐ Total available stock (default = 0)
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ⭐ Total damaged stock (default = 0)
    damaged: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ⭐ Project-wise stock (by default empty array)
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
            min: 0,
          },
        },
      ],
      default: [], // ⭐ very important → always create empty array
    },
  },
  { timestamps: true }
);

export default mongoose.model("Stock", stockSchema);
