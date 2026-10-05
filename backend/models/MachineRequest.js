import mongoose from "mongoose";

/**
 * Project-level request for machinery, with a full staged-timestamp
 * movement history (spec explicitly requires separate dates for approval
 * vs dispatch vs site arrival — never a single collapsed date).
 */
const machineRequestSchema = new mongoose.Schema(
    {
        requestNumber: { type: String, unique: true, index: true },
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },

        machineType: { type: String, required: true },
        requiredMachine: { type: String, default: "" }, // free-text spec, e.g. "20-ton excavator"
        quantity: { type: Number, default: 1, min: 1 },

        requiredFromDate: { type: Date, required: true },
        requiredToDate: { type: Date, default: null },

        reason: { type: String, default: "" },
        priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
        attachments: [{ type: String }],

        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        status: {
            type: String,
            enum: [
                "REQUESTED",
                "ADMIN_REVIEW",
                "APPROVED",
                "REJECTED",
                "CANCELLED",
                "ALLOCATED",
                "DISPATCHED",
                "RECEIVED_AT_SITE",
                "SITE_REJECTED",
                "ACTIVE",
                "RELEASED",
            ],
            default: "REQUESTED",
            index: true,
        },

        // machine linked once allocated
        machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", default: null },

        // ⭐ Vendor / Rental procurement fields (if no internal machine is available)
        isVendorProcured: { type: Boolean, default: false },
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
        vendorMachineNumber: { type: String, default: "" },
        rentalRate: { type: Number, default: 0 },
        rateType: { type: String, enum: ["PER_HOUR", "PER_DAY", "PER_MONTH", "FIXED_CONTRACT"], default: "PER_DAY" },
        contractStart: { type: Date, default: null },
        contractEnd: { type: Date, default: null },
        operatorProvidedBy: {
            type: String,
            enum: ["Company", "Vendor"],
            default: "Company",
            set: (v) => (!v ? "Company" : String(v).toUpperCase() === "COMPANY" ? "Company" : "Vendor"),
        },

        // ⭐ Movement timestamps — never collapsed into one "date" field
        requestedAt: { type: Date, default: Date.now },
        approvedAt: { type: Date, default: null },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        allocatedAt: { type: Date, default: null },
        dispatchedAt: { type: Date, default: null },
        dispatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        expectedSiteArrival: { type: Date, default: null },

        // ⭐ Site Arrival Inspection & Acceptance / Rejection
        receivedAtSite: { type: Date, default: null },
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        arrivalMeterReading: { type: Number, default: null },
        arrivalFuelLevel: { type: Number, default: null },
        arrivalCondition: { type: String, enum: ["Good", "Fair", "Damaged", "Defective"], default: "Good" },
        arrivalPhotos: [{ type: String }],
        arrivalRemarks: { type: String, default: "" },

        siteRejectedAt: { type: Date, default: null },
        siteRejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        siteRejectionReason: { type: String, default: "" },

        releasedAt: { type: Date, default: null },
        releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

        remarks: { type: String, default: "" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

machineRequestSchema.pre("validate", function (next) {
    if (!this.requestNumber) this.requestNumber = `MR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    next();
});

export default mongoose.model("MachineRequest", machineRequestSchema);
