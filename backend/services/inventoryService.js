import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import StockLedger from "../models/stockLedgerSchema.js";
import StockTransaction from "../models/StockTransaction.js";
import Project from "../models/Project.js";
import Item from "../models/Item.js";
import { logAudit } from "../utils/audit.js";

/**
 * ============================================================================
 * CENTRAL INVENTORY SERVICE (Single Source of Truth for all Stock Movements)
 * ============================================================================
 * 
 * Rules enforced:
 * 1. ONE SERVICE: Every stock change (receive, issue, transfer, return, consume,
 *    damage, adjust, opening) MUST pass through this service.
 * 2. TRANSACTION SAFETY: Operations support and respect Mongoose sessions.
 * 3. NO NEGATIVE STOCK: Prevents a project or godown balance from dropping below 0.
 * 4. IMMUTABLE AUDIT TRAIL: Every mutation writes a matching StockLedger row and
 *    StockTransaction record.
 * 5. SEPARATION OF CONCEPTS:
 *    - Usable Stock (quantity) vs Damaged Stock (damaged)
 *    - Central Godown vs Project Stock (stored in projectBalances)
 *    - Stock Issue (store -> site) vs Consumption (actual usage on task)
 */

/**
 * Ensures a Central Godown project exists for central storage.
 */
export const getOrCreateCentralGodown = async (session = null) => {
    let godown = await Project.findOne({
        $or: [
            { isGodown: true },
            { projectCode: "GODOWN-MAIN" },
            { projectName: /Central Godown/i }
        ]
    }).session(session);

    if (!godown) {
        // Find an admin user to set as creator
        const adminUser = await mongoose.model("User").findOne({ role: "admin" }).session(session);
        const createdBy = adminUser?._id || new mongoose.Types.ObjectId();

        godown = await Project.create(
            [
                {
                    projectName: "Central Godown / Main Store",
                    projectCode: "GODOWN-MAIN",
                    projectType: "Godown",
                    siteLocation: "Central Logistics Hub",
                    createdBy,
                }
            ],
            { session }
        );
        godown = godown[0];
    }

    return godown;
};

/**
 * Core atomic updater for Stock and StockLedger.
 */
export const applyStockMovement = async ({
    projectId,
    itemId,
    qtyChange,
    transactionType,
    referenceId = null,
    referenceNumber = null,
    remarks = "",
    rate = undefined,
    entryDate = undefined,
    userId = null,
    session = null,
}) => {
    const delta = Number(qtyChange);
    if (!Number.isFinite(delta)) {
        throw new Error("Invalid quantity change: must be a finite number");
    }

    // 1. Fetch or initialize Stock record for Item
    let stock = await Stock.findOne({ itemId }).session(session);
    if (!stock) {
        stock = new Stock({
            itemId,
            quantity: 0,
            damaged: 0,
            projectBalances: [],
        });
    }

    // 2. Validate Project existence
    const project = await Project.findById(projectId).session(session);
    if (!project) {
        throw new Error(`Project not found: ${projectId}`);
    }

    // 3. Find current project balance
    const idx = stock.projectBalances.findIndex((pb) => String(pb.projectId) === String(projectId));
    const currentProjectQty = idx >= 0 ? Number(stock.projectBalances[idx].qty || 0) : 0;
    const newProjectQty = currentProjectQty + delta;

    if (newProjectQty < 0) {
        throw new Error(
            `Insufficient stock for item on project ${project.projectName || projectId}: available ${currentProjectQty}, requested ${Math.abs(delta)}`
        );
    }

    // 4. Update projectBalances
    if (idx >= 0) {
        stock.projectBalances[idx].qty = newProjectQty;
    } else {
        stock.projectBalances.push({ projectId, qty: newProjectQty });
    }

    // 5. Update overall usable quantity
    stock.quantity = Math.max(Number(stock.quantity || 0) + delta, 0);
    await stock.save({ session });

    // 6. Calculate previous balance from latest StockLedger entry
    const lastEntry = await StockLedger.findOne({ itemId, projectId })
        .sort({ createdAt: -1 })
        .session(session);
    const previousBalance = lastEntry ? Number(lastEntry.balanceQty || 0) : 0;
    const balanceQty = previousBalance + delta;

    // 7. Create immutable StockLedger record
    const [ledgerEntry] = await StockLedger.create(
        [
            {
                itemId,
                projectId,
                transactionType,
                referenceId,
                referenceNumber,
                qtyIn: delta > 0 ? delta : 0,
                qtyOut: delta < 0 ? Math.abs(delta) : 0,
                balanceQty,
                remarks: remarks || `${transactionType} recorded`,
                ...(rate !== undefined ? { rate: Number(rate) } : {}),
                ...(entryDate !== undefined ? { entryDate: new Date(entryDate) } : {}),
            },
        ],
        { session }
    );

    // 8. Create StockTransaction record for legacy compatibility
    let txn = null;
    if (userId) {
        const txnType = delta > 0 ? "IN" : (transactionType === "RETURN" ? "RETURN" : (transactionType.includes("TRANSFER") ? "TRANSFER" : "OUT"));
        [txn] = await StockTransaction.create(
            [
                {
                    projectId,
                    itemId,
                    type: txnType,
                    qty: Math.abs(delta),
                    reason: remarks || transactionType,
                    createdBy: userId,
                }
            ],
            { session }
        );
    }

    return { stock, ledgerEntry, projectBalance: newProjectQty, transaction: txn };
};

/**
 * 1. RECEIVE STOCK (e.g. from GRN, Vendor Delivery, or Purchase Order)
 */
export const receiveStock = async ({
    projectId,
    itemId,
    qty,
    unit = "",
    referenceId = null,
    referenceNumber = null,
    remarks = "Material received",
    userId = null,
    rate = undefined,
    session = null,
}) => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) {
        throw new Error("Receive quantity must be a positive number");
    }

    return applyStockMovement({
        projectId,
        itemId,
        qtyChange: n,
        transactionType: "GRN",
        referenceId,
        referenceNumber,
        remarks,
        rate,
        userId,
        session,
    });
};

/**
 * 2. ISSUE STOCK (Store -> Site/Task)
 * Takes material from available store stock and issues it to site.
 */
export const issueStock = async ({
    projectId,
    itemId,
    qty,
    referenceId = null,
    referenceNumber = null,
    remarks = "Material issued to site",
    userId = null,
    session = null,
}) => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) {
        throw new Error("Issue quantity must be a positive number");
    }

    return applyStockMovement({
        projectId,
        itemId,
        qtyChange: -n,
        transactionType: "ISSUE",
        referenceId,
        referenceNumber,
        remarks,
        userId,
        session,
    });
};

/**
 * 3. CONSUME STOCK (Actual usage on site)
 * Records actual usage on a task or direct consumption.
 */
export const consumeStock = async ({
    projectId,
    itemId,
    qtyUsed,
    isAlreadyIssued = false,
    remarks = "Material consumed on site",
    userId = null,
    session = null,
}) => {
    const n = Number(qtyUsed);
    if (!Number.isFinite(n) || n <= 0) {
        throw new Error("Consumed quantity must be a positive number");
    }

    // If the material was ALREADY deducted from inventory during an ISSUE step,
    // do NOT deduct stock balance again (prevents double deduction).
    if (isAlreadyIssued) {
        return {
            alreadyIssued: true,
            qtyUsed: n,
            message: "Consumption recorded against existing issued quantity without double deduction."
        };
    }

    return applyStockMovement({
        projectId,
        itemId,
        qtyChange: -n,
        transactionType: "CONSUMPTION",
        remarks,
        userId,
        session,
    });
};

/**
 * 4. TRANSFER STOCK (Source Project/Godown -> Destination Project)
 * Atomically debits source and credits destination.
 */
export const transferStock = async ({
    sourceProjectId,
    destinationProjectId,
    itemId,
    quantity,
    referenceId = null,
    referenceNumber = null,
    remarks = "Stock transfer",
    userId = null,
    session = null,
}) => {
    const n = Number(quantity);
    if (!Number.isFinite(n) || n <= 0) {
        throw new Error("Transfer quantity must be a positive number");
    }
    if (String(sourceProjectId) === String(destinationProjectId)) {
        throw new Error("Source and destination locations cannot be identical");
    }

    // Debit source
    const debit = await applyStockMovement({
        projectId: sourceProjectId,
        itemId,
        qtyChange: -n,
        transactionType: "TRANSFER_OUT",
        referenceId,
        referenceNumber,
        remarks: remarks || `Transfer out to destination ${destinationProjectId}`,
        userId,
        session,
    });

    // Credit destination
    const credit = await applyStockMovement({
        projectId: destinationProjectId,
        itemId,
        qtyChange: n,
        transactionType: "TRANSFER_IN",
        referenceId,
        referenceNumber,
        remarks: remarks || `Transfer in from source ${sourceProjectId}`,
        userId,
        session,
    });

    return {
        debit,
        credit,
        sourceBalance: debit.projectBalance,
        destinationBalance: credit.projectBalance,
    };
};

/**
 * 5. RETURN STOCK (Site -> Store / Central Godown)
 */
export const returnStock = async ({
    sourceProjectId,
    destinationProjectId = null,
    itemId,
    quantity,
    reason = "Material returned",
    userId = null,
    session = null,
}) => {
    const n = Number(quantity);
    if (!Number.isFinite(n) || n <= 0) {
        throw new Error("Return quantity must be a positive number");
    }

    // If destinationProjectId is not specified, default to Central Godown
    let destId = destinationProjectId;
    if (!destId) {
        const godown = await getOrCreateCentralGodown(session);
        destId = godown._id;
    }

    // Debit site
    const debit = await applyStockMovement({
        projectId: sourceProjectId,
        itemId,
        qtyChange: -n,
        transactionType: "RETURN",
        remarks: reason || "Return from site",
        userId,
        session,
    });

    // Credit destination
    const credit = await applyStockMovement({
        projectId: destId,
        itemId,
        qtyChange: n,
        transactionType: "RECEIPT",
        remarks: `Returned material received from ${sourceProjectId}: ${reason}`,
        userId,
        session,
    });

    return { debit, credit };
};

/**
 * 6. RECORD DAMAGE (Reduces usable stock, records damage count)
 */
export const recordDamage = async ({
    projectId,
    itemId,
    quantity,
    reason = "Damaged on site",
    userId = null,
    session = null,
}) => {
    const n = Number(quantity);
    if (!Number.isFinite(n) || n <= 0) {
        throw new Error("Damaged quantity must be a positive number");
    }

    // Debit usable stock
    const result = await applyStockMovement({
        projectId,
        itemId,
        qtyChange: -n,
        transactionType: "DAMAGE",
        remarks: reason || "Material damaged",
        userId,
        session,
    });

    // Increment damaged count in Stock document
    await Stock.updateOne(
        { _id: result.stock._id },
        { $inc: { damaged: n } },
        { session }
    );

    return result;
};

/**
 * 7. ADJUST STOCK (Audit correction / Physical Count Difference)
 */
export const adjustStock = async ({
    projectId,
    itemId,
    qtyChange,
    reason,
    userId = null,
    session = null,
}) => {
    const delta = Number(qtyChange);
    if (!Number.isFinite(delta) || delta === 0) {
        throw new Error("Adjustment quantity must be a non-zero number");
    }
    if (!reason || !reason.trim()) {
        throw new Error("Adjustment reason is mandatory");
    }

    return applyStockMovement({
        projectId,
        itemId,
        qtyChange: delta,
        transactionType: "ADJUSTMENT",
        remarks: reason,
        userId,
        session,
    });
};

/**
 * 8. RECORD OPENING STOCK (One-time initial stock)
 */
export const recordOpeningStock = async ({
    projectId,
    itemId,
    quantity,
    rate = undefined,
    date = undefined,
    remarks = "Opening stock",
    userId = null,
    session = null,
}) => {
    const n = Number(quantity);
    if (!Number.isFinite(n) || n <= 0) {
        throw new Error("Opening stock quantity must be a positive number");
    }

    const existingOpening = await StockLedger.findOne({
        projectId,
        itemId,
        transactionType: "OPENING",
    }).session(session);

    if (existingOpening) {
        throw new Error("Opening stock has already been recorded for this item on this project. Use adjustment instead.");
    }

    return applyStockMovement({
        projectId,
        itemId,
        qtyChange: n,
        transactionType: "OPENING",
        remarks: remarks || "Opening balance",
        rate,
        entryDate: date,
        userId,
        session,
    });
};

/**
 * 9. INVENTORY QUERIES (Project, Godown, Item-wise)
 */
export const getInventorySummary = async ({ projectId = null, itemId = null } = {}) => {
    const filter = itemId ? { itemId } : {};
    const stocks = await Stock.find(filter).populate("itemId", "name category unit hsnCode description");

    const result = [];
    for (const s of stocks) {
        if (!s.itemId) continue;

        if (projectId) {
            const pb = s.projectBalances.find((p) => String(p.projectId) === String(projectId));
            const currentBalance = pb ? Number(pb.qty || 0) : 0;
            result.push({
                stockId: s._id,
                itemId: s.itemId._id,
                name: s.itemId.name,
                category: s.itemId.category,
                unit: s.itemId.unit,
                hsnCode: s.itemId.hsnCode,
                projectId,
                currentBalance,
                damaged: Number(s.damaged || 0),
                totalUsableStock: Number(s.quantity || 0),
            });
        } else {
            result.push({
                stockId: s._id,
                itemId: s.itemId._id,
                name: s.itemId.name,
                category: s.itemId.category,
                unit: s.itemId.unit,
                hsnCode: s.itemId.hsnCode,
                totalUsableStock: Number(s.quantity || 0),
                damaged: Number(s.damaged || 0),
                projectBalances: s.projectBalances.map((pb) => ({
                    projectId: pb.projectId,
                    qty: Number(pb.qty || 0),
                })),
            });
        }
    }

    return result;
};
