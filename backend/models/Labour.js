import mongoose from "mongoose";

const labourSchema = new mongoose.Schema({
    labourId: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
        trim: true,
        uppercase: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },

    gender: { type: String, enum: ["Male", "Female", "Other"], default: null },
    age: { type: Number, default: null },

    // Labour / Mistri / Operator Type
    labourType: {
        type: String,
        enum: [
            "Permanent Labour",
            "Permanent Mistri",
            "Contract Labour",
            "Contract Mistri",
            "Permanent Operator",     // ✔ Added
            "Contract Operator"       // ✔ Added
        ],
        required: true
    },

    // Category
    category: {
        type: String,
        enum: ["Labour", "Mistri", "Operator"],  // ✔ Added Operator
        required: true
    },

    skillLevel: {
        type: String,
        enum: ["Unskilled", "Semi-skilled", "Skilled"],
        required: true
    },

    wageType: { type: String, enum: ["Daily", "Monthly"], required: true },

    dailyWage: { type: Number, default: null },
    monthlySalary: { type: Number, default: null },

    aadhaarNumber: { type: String, default: null },
    address: { type: String, required: true },

    status: { type: String, enum: ["Active", "Inactive", "Left"], default: "Active" },

    assignedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    joinDate: { type: Date },
    joiningDate: { type: Date },

    fatherName: { type: String, default: "" },
    alternatePhone: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    notes: { type: String, default: "" },
    skills: [{ type: String }],

    contractorName: { type: String },

    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },

    documents: {
        aadhaar: String,
        pan: String,
        photo: String
    }

}, { timestamps: true });

export const generateNextLabourId = async () => {
    const LabourModel = mongoose.models.Labour || mongoose.model("Labour", labourSchema);
    const existing = await LabourModel.find(
        { labourId: { $regex: /^LAB-CON-\d+$/i } },
        { labourId: 1 }
    ).lean();

    let maxNum = 0;
    for (const doc of existing) {
        const match = doc.labourId?.match(/^LAB-CON-(\d+)$/i);
        if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
    }

    const nextNum = maxNum + 1;
    return `LAB-CON-${String(nextNum).padStart(3, "0")}`;
};

export const backfillLabourIds = async () => {
    try {
        const LabourModel = mongoose.models.Labour || mongoose.model("Labour", labourSchema);
        const withoutId = await LabourModel.find({
            $or: [{ labourId: { $exists: false } }, { labourId: null }, { labourId: "" }],
        }).sort({ createdAt: 1 });

        if (withoutId.length === 0) return;

        const existing = await LabourModel.find(
            { labourId: { $regex: /^LAB-CON-\d+$/i } },
            { labourId: 1 }
        ).lean();

        let maxNum = 0;
        for (const doc of existing) {
            const match = doc.labourId?.match(/^LAB-CON-(\d+)$/i);
            if (match) {
                const num = parseInt(match[1], 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        }

        for (const l of withoutId) {
            maxNum += 1;
            l.labourId = `LAB-CON-${String(maxNum).padStart(3, "0")}`;
            await l.save();
        }
        console.log(`[Labour] Backfilled ${withoutId.length} labour records with sequential LAB-CON IDs`);
    } catch (err) {
        console.error("[Labour] Error backfilling labour IDs:", err.message);
    }
};

labourSchema.pre("validate", async function (next) {
    if (!this.labourId) {
        this.labourId = await generateNextLabourId();
    } else {
        this.labourId = this.labourId.trim().toUpperCase();
    }
    next();
});

export default mongoose.model("Labour", labourSchema);
