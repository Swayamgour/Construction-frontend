import GRN from "../models/GRN.js";
import MaterialRequest from "../models/MaterialRequest.js";
import Stock from "../models/Stock.js";
// import mongoose from "mongoose";
import StockLedger from "../models/stockLedgerSchema.js";

export const createGRN = async (req, res) => {
    try {
        const {
            materialRequestId,
            deliveryChallan,
            dispatchDate,
            vehicleNumber,
            driverName,
            items
        } = req.body;

        if (!materialRequestId || !items?.length) {
            return res.status(400).json({ message: "MR ID & items required" });
        }

        // 1️⃣ Load MR
        const mr = await MaterialRequest.findById(materialRequestId)
            .populate("items.itemId", "_id name unit");

        if (!mr) return res.status(404).json({ message: "Material Request not found" });

        const projectId = mr.projectId; // IMPORTANT

        // 2️⃣ Create GRN entry
        const grn = await GRN.create({
            materialRequestId,
            poNumber: mr.poNumber,
            deliveryChallan,
            dispatchDate,
            vehicleNumber,
            driverName,
            receivedBy: req.user.id,
            items
        });

        let fullyReceived = true;

        // 3️⃣ Update MR items
        mr.items = mr.items.map((mrItem) => {
            const found = items.find(i =>
                String(i.itemId) === String(mrItem.itemId._id)
            );

            if (!found) {
                fullyReceived = false;
                return mrItem;
            }

            const received = Number(found.receivedQty || 0);
            const damaged = Number(found.damagedQty || 0);
            const short = Number(found.shortQty || 0);
            const excess = Number(found.excessQty || 0);
            const accepted = received - damaged;

            mrItem.receivedQty = (mrItem.receivedQty || 0) + received;
            mrItem.damagedQty = (mrItem.damagedQty || 0) + damaged;
            mrItem.shortQty = (mrItem.shortQty || 0) + short;
            mrItem.excessQty = (mrItem.excessQty || 0) + excess;
            mrItem.acceptedQty = (mrItem.acceptedQty || 0) + accepted;

            if (mrItem.requestedQty > mrItem.receivedQty) {
                fullyReceived = false;
            }

            return mrItem;
        });

        mr.status = fullyReceived ? "completed" : "ordered";
        await mr.save();

        // 4️⃣ Update STOCK
        for (const it of items) {
            const accepted = Math.max(
                Number(it.receivedQty || 0) - Number(it.damagedQty || 0),
                0
            );

            let stock = await Stock.findOne({ itemId: it.itemId });

            if (!stock) {
                await Stock.create({
                    itemId: it.itemId,
                    quantity: accepted,
                    damaged: Number(it.damagedQty || 0),
                    projectBalances: [{ projectId, qty: accepted }]
                });
            } else {
                stock.quantity += accepted;
                stock.damaged += Number(it.damagedQty || 0);

                const idx = stock.projectBalances.findIndex(
                    pb => String(pb.projectId) === String(projectId)
                );

                if (idx >= 0) {
                    stock.projectBalances[idx].qty += accepted;
                } else {
                    stock.projectBalances.push({ projectId, qty: accepted });
                }

                await stock.save();
            }
        }

        // 5️⃣ PROJECT-WISE LEDGER ENTRY ---- FIX HERE 🔥
        for (const it of items) {
            const accepted = Math.max(
                Number(it.receivedQty || 0) - Number(it.damagedQty || 0),
                0
            );

            // Find last ledger only for THIS PROJECT
            const lastEntry = await StockLedger.findOne({
                itemId: it.itemId,
                projectId: projectId
            }).sort({ createdAt: -1 });

            const previousBalance = lastEntry ? lastEntry.balanceQty : 0;
            const newBalance = previousBalance + accepted;

            await StockLedger.create({
                itemId: it.itemId,
                projectId: projectId,
                transactionType: "GRN",
                referenceId: grn._id,
                referenceNumber: grn.poNumber,
                qtyIn: accepted,
                qtyOut: 0,
                balanceQty: newBalance,
                remarks: "Material received via GRN"
            });
        }

        return res.status(201).json({
            message: "GRN created successfully",
            grn
        });

    } catch (err) {
        return res.status(500).json({ message: "GRN error", error: err.message });
    }
};







export const getGRN = async (req, res) => {
    try {
        const grnId = req.params.id;
        const grn = await GRN.findById(grnId)
            .populate("materialRequestId", "poNumber projectId")
            .populate("items.itemId", "name unit")
            .populate("items.vendorId", "companyName phone")
            .populate("receivedBy", "name");
        if (!grn) return res.status(404).json({ message: "GRN not found" });
        return res.status(200).json({ message: "GRN fetched", grn });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching GRN", error: err.message });
    }
};

export const listGRNs = async (req, res) => {
    try {
        const grns = await GRN.find()
            .populate("materialRequestId", "poNumber projectId")
            .populate("receivedBy", "name")
            .sort({ createdAt: -1 });
        return res.status(200).json({ message: "GRNs fetched", grns });
    } catch (err) {
        return res.status(500).json({ message: "Error listing GRNs", error: err.message });
    }
};


export const getProjectStock = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Only fetch stock where this project exists in projectBalances
        const projectStock = await Stock.find({
            projectBalances: {
                $elemMatch: { projectId }
            }
        }).populate("itemId", "name unit");

        const finalData = projectStock.map((st) => {
            const pb = st.projectBalances.find(
                (p) => String(p.projectId) === String(projectId)
            );

            return {
                itemId: st.itemId._id,
                name: st.itemId.name,
                unit: st.itemId.unit,
                qty: pb?.qty || 0,
                damaged: st.damaged || 0,
            };
        });

        return res.status(200).json({ stock: finalData });

    } catch (err) {
        return res.status(500).json({
            message: "Project Stock Error",
            error: err.message,
        });
    }
};



export const getItemHistory = async (req, res) => {
    try {
        const { itemId, projectId } = req.params; // projectId optional

        // build query only for provided params
        const query = { itemId };
        if (projectId) query.projectId = projectId;

        const logs = await StockLedger.find(query).sort({ createdAt: -1 });

        return res.status(200).json({ history: logs });
    } catch (err) {
        return res.status(500).json({ message: "Ledger error", error: err.message });
    }
};


