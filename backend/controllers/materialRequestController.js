import MaterialRequest from "../models/MaterialRequest.js";

// ADD MATERIAL REQUEST
export const addMaterialRequest = async (req, res) => {
    try {
        const { projectId, requiredDate, items } = req.body;

        if (!projectId) {
            return res.status(400).json({ message: "projectId is required" });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "At least 1 item is required" });
        }

        // Validate each item
        for (const it of items) {
            if (!it.itemId || !it.requestedQty) {
                return res.status(400).json({
                    message: "Each item must include itemId and requestedQty"
                });
            }
        }

        const newReq = await MaterialRequest.create({
            projectId,
            requiredDate,
            items,
            requestedBy: req.user.id
        });

        res.status(201).json({
            message: "Material Request submitted",
            data: newReq
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating MR",
            error: error.message
        });
    }
};




// GET MATERIAL REQUESTS
export const getMaterialRequests = async (req, res) => {
    try {
        const userRole = req.user.role; // admin, manager, supervisor
        const userId = req.user.id;     // logged in user id

        let query = {};

        // Supervisor: only own requests
        if (userRole === "supervisor") {
            query = { requestedBy: userId };
        }



        const requests = await MaterialRequest.find(query)
            .populate("projectId", "projectName projectCode")
            .populate("items.itemId", "name type unit")   // <-- FIXED
            .populate("requestedBy", "name role")
            .sort({
                status: -1,
                createdAt: -1
            });
        res.status(200).json(requests);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching Material Requests",
            error: error.message
        });
    }
};



export const getPendingRequests = async (req, res) => {
    try {
        const pending = await MaterialRequest.find({ status: "pending" })
            .populate("projectId", "projectName")
            .populate("itemId", "name unit")
            .populate("requestedBy", "name role");

        res.status(200).json({ message: "Pending MRs", data: pending });
    } catch (error) {
        res.status(500).json({ message: "Error fetching pending requests", error: error.message });
    }
};






export const rejectMaterialRequest = async (req, res) => {
    try {
        const mrId = req.params.id;

        const updated = await MaterialRequest.findByIdAndUpdate(
            mrId,
            {
                status: "rejected",
                approvedBy: req.user.id,
                approvalDate: new Date()
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "MR not found" });

        res.status(200).json({ message: "MR Rejected", data: updated });

    } catch (error) {
        res.status(500).json({ message: "Error rejecting MR", error: error.message });
    }
};


export const approveMaterialRequest = async (req, res) => {
    try {
        const mrId = req.params.id;
        const { poMode, vendorId, items, deliveryDate, paymentTerms } = req.body;

        const mr = await MaterialRequest.findById(mrId);
        if (!mr) return res.status(404).json({ message: "MR not found" });

        let finalItems = [...mr.items];

        // ⭐ SINGLE VENDOR MODE → vendorId items me daalo
        if (poMode === "single") {
            finalItems = finalItems.map((it, i) => ({
                ...it._doc,
                vendorId: vendorId,
                unitPrice: items[i]?.unitPrice || 0,
                gst: items[i]?.gst || 0,
                discount: items[i]?.discount || 0,
                amount:
                    (it.requestedQty * (items[i]?.unitPrice || 0)) +
                    ((it.requestedQty * (items[i]?.unitPrice || 0)) * (items[i]?.gst || 0)) / 100 -
                    ((it.requestedQty * (items[i]?.unitPrice || 0)) * (items[i]?.discount || 0)) / 100
            }));
        }
        else {
            // ⭐ ITEM WISE / GROUP / MANUAL MODE
            finalItems = finalItems.map((it, i) => ({
                ...it._doc,
                vendorId: items[i]?.vendorId || null,
                unitPrice: items[i]?.unitPrice || 0,
                gst: items[i]?.gst || 0,
                discount: items[i]?.discount || 0,
                amount:
                    (it.requestedQty * (items[i]?.unitPrice || 0)) +
                    ((it.requestedQty * (items[i]?.unitPrice || 0)) * (items[i]?.gst || 0)) / 100 -
                    ((it.requestedQty * (items[i]?.unitPrice || 0)) * (items[i]?.discount || 0)) / 100
            }));
        }

        const totalAmount = finalItems.reduce((t, a) => t + a.amount, 0);

        const updated = await MaterialRequest.findByIdAndUpdate(
            mrId,
            {
                status: "approved",
                poMode,
                vendorId: poMode === "single" ? vendorId : null,
                items: finalItems,
                deliveryDate,
                paymentTerms,
                totalAmount,
                poNumber: "PO-" + Date.now(),
                approvedBy: req.user.id,
                approvalDate: new Date()
            },
            { new: true }
        );

        return res.status(200).json({
            message: "PO Generated Successfully",
            PO: updated
        });

    } catch (error) {
        return res.status(500).json({ message: "Approval error", error: error.message });
    }
};




export const getPurchaseOrder = async (req, res) => {
    try {
        const mrId = req.params.id;

        const mr = await MaterialRequest.findById(mrId)
            .populate("projectId", "projectName projectCode locationMapLink")
            .populate("items.itemId", "name type unit")
            .populate("items.vendorId", "companyName phone email address")
            .populate("vendorId", "companyName phone email address")   // single vendor mode 
            .populate("approvedBy", "name role");

        if (!mr) {
            return res.status(404).json({
                message: "Material Request / PO not found"
            });
        }

        if (mr.status !== "approved") {
            return res.status(400).json({
                message: "PO not generated. Request not approved yet.",
            });
        }

        return res.status(200).json({
            message: "PO Details Fetched Successfully",
            po: {
                poNumber: mr.poNumber,
                approvalDate: mr.approvalDate,
                project: mr.projectId,
                items: mr.items,
                totalAmount: mr.totalAmount,
                paymentTerms: mr.paymentTerms,
                deliveryDate: mr.deliveryDate,
                poMode: mr.poMode,
                vendor: mr.vendorId,        // populated vendor object
                approvedBy: mr.approvedBy
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching PO",
            error: error.message
        });
    }
};


export const getSingleMaterialRequest = async (req, res) => {
    try {
        const mrId = req.params.id;

        const mr = await MaterialRequest.findById(mrId)
            .populate("projectId", "projectName projectCode")
            .populate("items.itemId", "name unit type")
            .populate("items.vendorId", "companyName phone email")
            .populate("requestedBy", "name role")
            .populate("approvedBy", "name role");

        if (!mr) {
            return res.status(404).json({ message: "Material Request not found" });
        }

        res.status(200).json(
            mr
        );

    } catch (error) {
        res.status(500).json({
            message: "Error fetching MR",
            error: error.message
        });
    }
};





