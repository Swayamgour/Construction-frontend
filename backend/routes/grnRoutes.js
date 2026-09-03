import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { createGRN, getGRN, listGRNs, getProjectStock, getItemHistory } from "../controllers/grnController.js";
import StockLedger from "../models/stockLedgerSchema.js";
import GRN from "../models/GRN.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import MaterialRequest from "../models/MaterialRequest.js";
import { checkProjectAccess, resolveProjectFrom } from "../middleware/projectAccess.js";

const router = express.Router();
const resolveGRNCreateProject = async (req) => {
  if (req.body?.projectId) return req.body.projectId;
  if (req.body?.purchaseOrderId) { const po=await PurchaseOrder.findById(req.body.purchaseOrderId).select("projectId"); return po?.projectId||null; }
  if (req.body?.materialRequestId) { const mr=await MaterialRequest.findById(req.body.materialRequestId).select("projectId"); return mr?.projectId||null; }
  return null;
};

// 👈 ALWAYS LAST


router.post("/add", auth, roleCheck("manager", "admin", "supervisor", "storekeeper"), checkProjectAccess(resolveGRNCreateProject), createGRN);
router.get("/", auth, roleCheck("manager", "admin", "storekeeper", "accountant"), listGRNs);
router.get("/ledger/:projectId/:itemId", auth, roleCheck("admin", "manager", "storekeeper", "accountant"), async (req, res) => {
    try {
        const { projectId, itemId } = req.params;

        const ledger = await StockLedger.find({
            itemId,
            projectId
        })
            .populate("projectId", "projectName")
            .sort({ createdAt: -1 });

        res.status(200).json(ledger);

    } catch (err) {
        res.status(500).json({
            message: "Error fetching ledger",
            error: err.message
        });
    }
});
router.get("/project/:projectId", auth, checkProjectAccess("projectId"), getProjectStock);
router.get("/history/:itemId/:projectId", auth, checkProjectAccess("projectId"), getItemHistory);
router.get("/:id", auth, roleCheck("manager", "admin", "supervisor", "storekeeper"), checkProjectAccess(resolveProjectFrom(GRN,{field:"projectId"})), getGRN);




export default router;
