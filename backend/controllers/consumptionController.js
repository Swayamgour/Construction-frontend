import mongoose from "mongoose";
import MaterialConsumption from "../models/MaterialConsumption.js";
import { consumeStock } from "../services/inventoryService.js";
import { logAudit } from "../utils/audit.js";

/**
 * POST /api/consumption/add-multiple — Record site material consumption.
 * CRITICAL RULE: Consumes from Issued Buffer. ZERO double deduction from Usable Stock.
 */
export const addConsumptionMultiple = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { projectId, items } = req.body;

        if (!projectId || !items?.length) {
            return res.status(400).json({ message: "Project and at least one item are required" });
        }

        const userId = req.user.id;

        for (const it of items) {
            const qty = Number(it.qtyUsed);
            if (!it.itemId || !Number.isFinite(qty) || qty <= 0) {
                return res.status(400).json({
                    message: `Invalid item or qtyUsed in consumption payload: ${JSON.stringify(it)}`,
                });
            }
        }

        let saved;
        await session.withTransaction(async () => {
            saved = await MaterialConsumption.create(
                items.map((i) => ({
                    projectId,
                    itemId: i.itemId,
                    qtyUsed: Number(i.qtyUsed),
                    unit: i.unit || "",
                    remarks: i.remarks || "",
                    usedBy: userId,
                    usedAt: new Date(),
                })),
                { session }
            );

            for (const it of items) {
                const qty = Number(it.qtyUsed);

                // Consume from issued buffer via central inventoryService (no double deduction)
                const { ledgerEntry, remainingIssuedBuffer } = await consumeStock({
                    projectId,
                    itemId: it.itemId,
                    qtyUsed: qty,
                    referenceId: saved[0]?._id,
                    remarks: it.remarks || "Consumed on site from issued buffer",
                    userId,
                    session,
                });

                await logAudit({
                    module: "Inventory",
                    entityId: ledgerEntry._id,
                    action: "consumption",
                    performedBy: userId,
                    remarks: it.remarks || `Consumed ${qty} units (Remaining buffer: ${remainingIssuedBuffer})`,
                    meta: { projectId, itemId: it.itemId, qty, remainingIssuedBuffer },
                    projectId,
                    session,
                });
            }
        });

        return res.status(201).json({
            message: "Consumption recorded against issued buffer successfully (no double deduction)",
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

/**
 * GET /api/consumption/today — Get today's site consumption report.
 */
export const getTodayConsumption = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const data = await MaterialConsumption.find({
            usedAt: { $gte: start, $lte: end },
        })
            .populate("itemId", "name unit category")
            .populate("projectId", "projectName projectCode")
            .populate("usedBy", "name role");

        res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching report",
            error: err.message,
        });
    }
};

/**
 * GET /api/consumption/project/:projectId — Get all consumption for a project.
 */
export const getProjectConsumption = async (req, res) => {
    try {
        const { projectId } = req.params;

        const data = await MaterialConsumption.find({ projectId })
            .populate("itemId", "name unit category")
            .populate("usedBy", "name role")
            .sort({ createdAt: -1 });

        res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({
            message: "Project consumption error",
            error: err.message,
        });
    }
};

/**
 * GET /api/consumption/filter — Filter consumption by date range / project.
 */
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
            usedAt: { $gte: start, $lte: end },
        };
        if (projectId) query.projectId = projectId;

        const data = await MaterialConsumption.find(query)
            .populate("itemId", "name unit category")
            .populate("projectId", "projectName projectCode")
            .populate("usedBy", "name role")
            .sort({ createdAt: -1 });

        res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({
            message: "Filter error",
            error: err.message,
        });
    }
};
