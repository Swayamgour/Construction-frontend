import MaterialRequest from "../models/MaterialRequest.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import StockRequest from "../models/StockRequest.js";
import Item from "../models/Item.js";

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

        // Mirror each item to StockRequest collection so that both systems stay in sync
        try {
            for (const it of items) {
                const itemDoc = await Item.findById(it.itemId);
                if (itemDoc) {
                    await StockRequest.create({
                        projectId,
                        requestedBy: req.user.id,
                        requestedByRole: req.user.role || "manager",
                        materialId: it.itemId,
                        materialName: itemDoc.name,
                        category: itemDoc.category || "",
                        quantity: Number(it.requestedQty),
                        unit: it.unit || itemDoc.unit || "unit",
                        requiredDate: requiredDate || new Date(),
                        priority: it.priority || "Medium",
                        purpose: it.purpose || `MR-${newReq._id}`,
                        description: it.remarks || "",
                        status: "PENDING_ADMIN_REVIEW",
                        createdBy: req.user.id,
                    });
                }
            }
        } catch (syncErr) {
            console.warn("StockRequest sync error:", syncErr.message);
        }

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

        // Sync linked StockRequest records to REJECTED
        try {
            await StockRequest.updateMany(
                { projectId: updated.projectId, materialId: { $in: updated.items.map(i => i.itemId) }, status: "PENDING_ADMIN_REVIEW" },
                { $set: { status: "REJECTED", reviewedBy: req.user.id, reviewedAt: new Date() } }
            );
        } catch (srErr) {
            console.warn("StockRequest reject sync note:", srErr.message);
        }

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
        const poNumber = "PO-" + Date.now();

        // Create official PurchaseOrder document(s) so PO appears in Purchase Orders screen and can be received via GRN
        let createdPo = null;
        try {
            if (poMode === "single" && vendorId) {
                const poItems = finalItems.map(it => ({
                    itemId: it.itemId,
                    qty: Number(it.requestedQty || 0),
                    unit: it.unit || "",
                    rate: Number(it.unitPrice || 0),
                    amount: Number(it.amount || 0),
                    tax: Number(it.gst || 0),
                    discount: Number(it.discount || 0),
                    total: Number(it.amount || 0),
                    materialRequestId: mr._id,
                    receivedQty: 0,
                }));
                createdPo = await PurchaseOrder.create({
                    projectId: mr.projectId,
                    vendorId,
                    items: poItems,
                    subtotal: totalAmount,
                    grandTotal: totalAmount,
                    status: "ORDERED",
                    createdBy: req.user.id,
                    orderedAt: new Date(),
                    orderedBy: req.user.id,
                });
            } else if (poMode !== "single") {
                const vendorGroups = {};
                for (const it of finalItems) {
                    if (it.vendorId) {
                        const vKey = String(it.vendorId);
                        if (!vendorGroups[vKey]) vendorGroups[vKey] = [];
                        vendorGroups[vKey].push(it);
                    }
                }
                for (const [vId, vItems] of Object.entries(vendorGroups)) {
                    const poItems = vItems.map(it => ({
                        itemId: it.itemId,
                        qty: Number(it.requestedQty || 0),
                        unit: it.unit || "",
                        rate: Number(it.unitPrice || 0),
                        amount: Number(it.amount || 0),
                        tax: Number(it.gst || 0),
                        discount: Number(it.discount || 0),
                        total: Number(it.amount || 0),
                        materialRequestId: mr._id,
                        receivedQty: 0,
                    }));
                    const grTotal = poItems.reduce((s, i) => s + i.amount, 0);
                    createdPo = await PurchaseOrder.create({
                        projectId: mr.projectId,
                        vendorId: vId,
                        items: poItems,
                        subtotal: grTotal,
                        grandTotal: grTotal,
                        status: "ORDERED",
                        createdBy: req.user.id,
                        orderedAt: new Date(),
                        orderedBy: req.user.id,
                    });
                }
            }
        } catch (poErr) {
            console.warn("PurchaseOrder creation note:", poErr.message);
        }

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
                poNumber,
                purchaseOrderId: createdPo ? createdPo._id : null,
                approvedBy: req.user.id,
                approvalDate: new Date()
            },
            { new: true }
        );

        // Update any linked StockRequests
        try {
            await StockRequest.updateMany(
                { projectId: mr.projectId, materialId: { $in: mr.items.map(i => i.itemId) }, status: "PENDING_ADMIN_REVIEW" },
                { $set: { status: "APPROVED_PROCUREMENT", reviewedBy: req.user.id, reviewedAt: new Date() } }
            );
        } catch (srErr) {
            console.warn("StockRequest status sync note:", srErr.message);
        }

        return res.status(200).json({
            message: "PO Generated Successfully",
            PO: updated,
            purchaseOrder: createdPo
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





