import mongoose from "mongoose";
import MaterialConsumption from "../models/MaterialConsumption.js";
import { applyStockLedgerEntry } from "../utils/inventory.js";
import { logAudit } from "../utils/audit.js";

export const addConsumptionMultiple = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { projectId, items } = req.body;

        if (!projectId || !items?.length) {
            return res.status(400).json({ message: "Project & items required" });
        }

        const userId = req.user.id;

        for (const it of items) {
            const qty = Number(it.qtyUsed);
            if (!it.itemId || !Number.isFinite(qty) || qty <= 0) {
                return res.status(400).json({ message: `Invalid item/qtyUsed in consumption payload: ${JSON.stringify(it)}` });
            }
        }

        // ⭐ Consumption record creation + stock debit + ledger entry now all
        // happen inside ONE transaction, through the centralized
        // applyStockLedgerEntry choke-point (utils/inventory.js) instead of
        // mutating Stock directly. This closes two real bugs the earlier
        // version had: (1) it could push a project's balance negative —
        // applyStockLedgerEntry rejects that — and (2) a failure partway
        // through the items loop could leave some consumption records
        // saved with no matching stock/ledger change; that's no longer
        // possible since everything commits or rolls back together.
        let saved;
        await session.withTransaction(async () => {
            saved = await MaterialConsumption.create(
                items.map((i) => ({
                    projectId,
                    itemId: i.itemId,
                    qtyUsed: i.qtyUsed,
                    unit: i.unit || "",
                    remarks: i.remarks || "",
                    usedBy: userId,
                    usedAt: new Date(),
                })),
                { session }
            );

            for (const it of items) {
                const qty = Number(it.qtyUsed);
                const isIssued = Boolean(it.isAlreadyIssued);

                if (!isIssued) {
                    // Direct consumption: debits project inventory
                    const { ledgerEntry } = await applyStockLedgerEntry({
                        projectId,
                        itemId: it.itemId,
                        qtyChange: -qty,
                        transactionType: "CONSUMPTION",
                        referenceNumber: `CONS-${Date.now()}`,
                        remarks: it.remarks || "Direct material consumption",
                        session,
                    });
                    await logAudit({
                        module: "Inventory",
                        entityId: ledgerEntry._id,
                        action: "consumption",
                        performedBy: userId,
                        remarks: it.remarks || "",
                        meta: { projectId, itemId: it.itemId, qty },
                        projectId,
                        session,
                    });
                } else {
                    // Consumption against previously issued material: record audit without double deducting
                    await logAudit({
                        module: "Inventory",
                        entityId: saved[0]?._id,
                        action: "consumption_from_issue",
                        performedBy: userId,
                        remarks: it.remarks || "Consumption from previously issued stock (no double deduction)",
                        meta: { projectId, itemId: it.itemId, qty, isAlreadyIssued: true },
                        projectId,
                        session,
                    });
                }
            }
        });

        return res.status(201).json({
            message: "Consumption saved successfully",
            data: saved,
        });

    } catch (err) {
        return res.status(400).json({
            message: "Error saving consumption",
            error: err.message,
        });
    } finally {
        session.endSession();
    }
};


export const getTodayConsumption = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const data = await MaterialConsumption.find({
            usedAt: { $gte: start, $lte: end }
        })
            .populate("itemId", "name unit")
            .populate("projectId", "projectName")
            .populate("usedBy", "name");

        res.status(200).json({ data });

    } catch (err) {
        return res.status(500).json({
            message: "Error fetching report",
            error: err.message
        });
    }
};


export const getProjectConsumption = async (req, res) => {
    try {
        const { projectId } = req.params;

        const data = await MaterialConsumption.find({ projectId })
            .populate("itemId", "name unit")
            .populate("usedBy", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ data });

    } catch (err) {
        return res.status(500).json({
            message: "Project consumption error",
            error: err.message
        });
    }
};


export const filterConsumption = async (req, res) => {
    try {
        const { type, projectId } = req.query;

        let start = new Date();
        let end = new Date();

        end.setHours(23, 59, 59, 999);

        if (type === "today") {
            start.setHours(0, 0, 0, 0);
        } else if (type === "week") {
            start.setDate(start.getDate() - 7);
        } else if (type === "month") {
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
        } else {
            return res.status(400).json({ message: "Invalid type (today/week/month)" });
        }

        const query = {
            usedAt: { $gte: start, $lte: end }
        };

        if (projectId) query.projectId = projectId;

        const data = await MaterialConsumption.find(query)
            .populate("itemId", "name unit")
            .populate("projectId", "projectName")
            .populate("usedBy", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ data });

    } catch (err) {
        return res.status(500).json({
            message: "Filter error",
            error: err.message
        });
    }
};
