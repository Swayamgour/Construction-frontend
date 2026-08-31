import mongoose from "mongoose";

/**
 * Full history of a labour's project assignments/transfers.
 * The existing Labour.assignedProjects array only stores a flat list of
 * currently-linked projects with no dates/history — this model is additive
 * and does NOT replace it (labourController.js keeps working as-is).
 *
 * Exactly one assignment per labour should have status "Active" at a time
 * (enforced in the controller, not at the schema level, so partial legacy
 * data never breaks validation).
 */
const labourAssignmentSchema = new mongoose.Schema(
    {
        labourId: { type: mongoose.Schema.Types.ObjectId, ref: "Labour", required: true, index: true },
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },

        previousProjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
        previousAssignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "LabourAssignment", default: null },

        assignmentDate: { type: Date, required: true, default: Date.now },
        releaseDate: { type: Date, default: null },
        transferDate: { type: Date, default: null },

        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        transferredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

        transferReason: { type: String, default: "" },
        remarks: { type: String, default: "" },

        status: {
            type: String,
            enum: ["Active", "Released", "Transferred"],
            default: "Active",
            index: true,
        },
    },
    { timestamps: true }
);

// A labour can only have ONE active assignment at any time.
labourAssignmentSchema.index(
    { labourId: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: "Active" } }
);

export default mongoose.model("LabourAssignment", labourAssignmentSchema);
