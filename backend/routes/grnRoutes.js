import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import { createGRN, getGRN, listGRNs, getProjectStock, getItemHistory } from "../controllers/grnController.js";
import StockLedger from "../models/stockLedgerSchema.js";

const router = express.Router();

// 👈 ALWAYS LAST


router.post("/add", auth, roleCheck("manager", "admin", "supervisor"), createGRN);
router.get("/", auth, roleCheck("manager", "admin"), listGRNs);
router.get("/ledger/:projectId/:itemId", auth, async (req, res) => {
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
router.get("/project/:projectId", auth, getProjectStock);
router.get("/history/:itemId/:projectId", auth, getItemHistory);
router.get("/:id", auth, roleCheck("manager", "admin", "supervisor"), getGRN);




export default router;
