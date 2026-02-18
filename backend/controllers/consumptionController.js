import MaterialConsumption from "../models/MaterialConsumption.js";
import Stock from "../models/Stock.js";
// import Stock from "../models/Stock.js";
import StockLedger from "../models/stockLedgerSchema.js";

export const addConsumptionMultiple = async (req, res) => {
    try {
        const { projectId, items } = req.body;

        if (!projectId || !items?.length) {
            return res.status(400).json({ message: "Project & items required" });
        }

        const userId = req.user.id;

        // 🔥 Create consumption records
        const saved = await MaterialConsumption.create(
            items.map((i) => ({
                projectId,
                itemId: i.itemId,
                qtyUsed: i.qtyUsed,
                unit: i.unit || "",
                remarks: i.remarks || "",
                usedBy: userId,
                usedAt: new Date(),
            }))
        );

        // 🔥 NOW UPDATE STOCK + LEDGER
        for (const it of items) {
            const qty = Number(it.qtyUsed);

            // 1️⃣ Update Stock
            let stock = await Stock.findOne({ itemId: it.itemId });

            if (stock) {
                const idx = stock.projectBalances.findIndex(
                    pb => String(pb.projectId) === String(projectId)
                );

                if (idx >= 0) {
                    stock.projectBalances[idx].qty -= qty;
                }

                stock.quantity -= qty;
                await stock.save();
            }

            // 2️⃣ Ledger (PROJECT-WISE)
            const lastEntry = await StockLedger.findOne({
                itemId: it.itemId,
                projectId
            }).sort({ createdAt: -1 });

            const previousBalance = lastEntry ? lastEntry.balanceQty : 0;
            const newBalance = previousBalance - qty;

            await StockLedger.create({
                itemId: it.itemId,
                projectId,
                transactionType: "CONSUMPTION",
                referenceId: null,
                referenceNumber: `CONS-${Date.now()}`,
                qtyIn: 0,
                qtyOut: qty,
                balanceQty: newBalance,
                remarks: it.remarks || "Material consumed"
            });
        }


        return res.status(201).json({
            message: "Consumption saved successfully",
            data: saved,
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error saving consumption",
            error: err.message,
        });
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
