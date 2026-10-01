import mongoose from "mongoose";

const fileArray = {
    type: [String],
    default: [],
};

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

        // PROJECT INCHARGE
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
            },
        ],

        labours: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Labour",
            },
        ],

        // CONSULTANTS / VENDORS
        consultantArchitect: String,
        structuralConsultant: String,
        subcontractorVendor: String,

        // DOCUMENTS / ATTACHMENTS
        // Every field is an array so multiple files can be uploaded.
        files: {
            workOrderFile: fileArray,
            siteLayoutFile: fileArray,
            drawingsFile: fileArray,
            clientKycFile: fileArray,
            projectPhotosFile: fileArray,
            notesFile: fileArray,
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
