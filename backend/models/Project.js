import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        // BASIC PROJECT DETAILS
        projectName: { type: String, required: true },
        clientName: String,
        projectCode: String,
        projectType: String,
        workScope: String,
        contractType: String,

        // LOCATION DETAILS
        siteLocation: String,
        currentLocation: String,
        city: String,
        state: String,
        pinCode: String,
        siteArea: String,
        builtUpArea: String,
        landmark: String,
        latitude: { type: Number },
        longitude: { type: Number },
        locationMapLink: String,

        // CLIENT / COMPANY DETAILS
        companyName: String,
        gst: String,
        ownerName: String,
        authorizedPerson: String,
        designation: String,
        contactNumber: String,
        email: String,
        alternateContact: String,

        // PROJECT DATES
        workOrderDate: String,
        expectedStartDate: String,
        actualStartDate: String,
        expectedCompletionDate: String,
        actualCompletionDate: String,
        projectDuration: String,

        // PROJECT INCHARGE (USER)
        projectIncharge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // ASSIGNED MANAGER
        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        supervisors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null
            }
        ],

        labours: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Labour",   // ✅ Correct Fix
                default: null
            }
        ],



        // CONSULTANTS
        consultantArchitect: String,
        structuralConsultant: String,
        subcontractorVendor: String,

        // DOCUMENTS
        files: {
            workOrderFile: String,
            siteLayoutFile: String,
            drawingsFile: String,
            clientKycFile: String,
            projectPhotosFile: String,
            notesFile: String,
        },

        // CREATED BY ADMIN
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
