import Machine from "../models/Machine.js";
import MachineDocument from "../models/MachineDocument.js";
import { uploadToCloudinary } from "../utils/cloudUpload.js";
import { success, fail } from "../utils/apiResponse.js";
import { logAudit } from "../utils/audit.js";

/** POST /api/machinery/:id/documents — upload one structured document (RC/Insurance/PUC/...). */
export const addMachineDocument = async (req, res) => {
    try {
        const { type, documentNumber, issueDate, expiryDate, remarks } = req.body;
        if (!type) return fail(res, 400, "Document type is required");

        const machine = await Machine.findById(req.params.id);
        if (!machine) return fail(res, 404, "Machine not found");
        if (!req.file) return fail(res, 400, "A document file is required");

        const fileUrl = await uploadToCloudinary(req.file, `machine/documents/${type.replace(/\s+/g, "_")}`);

        const doc = await MachineDocument.create({
            machineId: machine._id,
            type,
            fileUrl,
            documentNumber: documentNumber || "",
            issueDate: issueDate || null,
            expiryDate: expiryDate || null,
            uploadedBy: req.user.id,
            remarks: remarks || "",
        });

        await logAudit({ module: "MachineDocument", entityId: doc._id, action: "uploaded", performedBy: req.user.id, meta: { type } });
        return success(res, 201, "Machine document uploaded", doc);
    } catch (error) {
        return fail(res, 500, "Error uploading machine document", error);
    }
};

/** GET /api/machinery/:id/documents — all structured documents for a machine. */
export const listMachineDocuments = async (req, res) => {
    try {
        const docs = await MachineDocument.find({ machineId: req.params.id }).sort({ type: 1, createdAt: -1 });
        return success(res, 200, "Machine documents fetched", docs);
    } catch (error) {
        return fail(res, 500, "Error fetching machine documents", error);
    }
};

/** PATCH /api/machinery/documents/:docId/verify — admin/manager verifies or rejects a document. */
export const verifyMachineDocument = async (req, res) => {
    try {
        const { verificationStatus, remarks } = req.body;
        const updateData = { 
            verificationStatus, 
            remarks: remarks || "",
            verifiedBy: req.user.id,
            verifiedAt: new Date()
        };
        const doc = await MachineDocument.findByIdAndUpdate(
            req.params.docId,
            updateData,
            { new: true }
        ).populate("verifiedBy", "name role");
        if (!doc) return fail(res, 404, "Document not found");
        await logAudit({ module: "MachineDocument", entityId: doc._id, action: `status:${verificationStatus}`, performedBy: req.user.id });
        return success(res, 200, "Document verification updated", doc);
    } catch (error) {
        return fail(res, 500, "Error verifying document", error);
    }
};

/** GET /api/machinery/documents/expiring?days=15 — documents expiring soon, for reminders/dashboard. */
export const getExpiringDocuments = async (req, res) => {
    try {
        const days = Number(req.query.days) || 15;
        const today = new Date();
        const until = new Date();
        until.setDate(until.getDate() + days);

        const docs = await MachineDocument.find({ expiryDate: { $gte: today, $lte: until } })
            .populate("machineId", "machineNumber machineType")
            .sort({ expiryDate: 1 });

        return success(res, 200, "Expiring documents fetched", docs);
    } catch (error) {
        return fail(res, 500, "Error fetching expiring documents", error);
    }
};
