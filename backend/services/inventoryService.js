import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import StockLedger from "../models/stockLedgerSchema.js";
import Project from "../models/Project.js";
import Item from "../models/Item.js";

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
 * 4. IMMUTABLE AUDIT TRAIL: Every mutation writes a matching StockLedger entry.
 * 5. SEPARATION OF CONCEPTS:
 *    - Usable Stock (quantity/qty) vs Damaged Stock (damaged)
 *    - Central Godown vs Project Stock (stored in projectBalances)
 *    - Stock Issue (Store -> Issued Buffer) vs Consumption (Issued Buffer -> Consumed)
 *      NO DOUBLE DEDUCTION!
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
        const adminUser = await mongoose.model("User").findOne({ role: "admin" }).session(session);
        const createdBy = adminUser?._id || new mongoose.Types.ObjectId();

        const created = await Project.create(
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
        godown = created[0];
    }

    return godown;
};

/**
 * Core atomic updater for Usable Stock and StockLedger.
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
        stock.projectBalances.push({
            projectId,
            qty: newProjectQty,
            issuedBuffer: 0,
            damaged: 0,
        });
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

    return { stock, ledgerEntry, projectBalance: newProjectQty };
};

/**
 * AUTOMATIC STOCK CHECK: Item-wise availability check against Central Godown (or specified project).
 * Calculates availableQty and shortageQty for every item.
 */
export const checkStockAvailability = async ({ projectId = null, items = [], session = null }) => {
    const godown = await getOrCreateCentralGodown(session);
    const results = [];

    for (const item of items) {
        const itemId = item.itemId || item._id;
        const requestedQty = Number(item.requestedQty || item.quantity || 0);

        const stock = await Stock.findOne({ itemId }).session(session);

        let godownStock = 0;
        let projectStock = 0;

        if (stock && stock.projectBalances) {
            const godownEntry = stock.projectBalances.find(
                (pb) => String(pb.projectId) === String(godown._id)
            );
            godownStock = godownEntry ? Number(godownEntry.qty || 0) : 0;

            if (projectId) {
                const projectEntry = stock.projectBalances.find(
                    (pb) => String(pb.projectId) === String(projectId)
                );
                projectStock = projectEntry ? Number(projectEntry.qty || 0) : 0;
            }
        }

        // Available from central godown for fulfillment
        const availableQty = Math.min(requestedQty, godownStock);
        const shortageQty = Math.max(0, requestedQty - availableQty);

        let fulfillmentStatus = "PENDING";
        if (shortageQty === 0) {
            fulfillmentStatus = "AVAILABLE";
        } else if (availableQty > 0) {
            fulfillmentStatus = "PARTIALLY_AVAILABLE";
        } else {
            fulfillmentStatus = "SHORTAGE";
        }

        results.push({
            itemId,
            requestedQty,
            availableInGodown: godownStock,
            availableInProject: projectStock,
            availableQty,
            shortageQty,
            fulfillmentStatus,
            unit: item.unit || "",
            materialName: item.materialName || "",
        });
    }

    const allAvailable = results.every((r) => r.shortageQty === 0);
    const anyAvailable = results.some((r) => r.availableQty > 0);

    const overallStatus = allAvailable
        ? "AVAILABLE"
        : anyAvailable
        ? "PARTIALLY_AVAILABLE"
        : "PROCUREMENT_REQUIRED";

    return {
        items: results,
        overallStatus,
        godownId: godown._id,
        godownName: godown.projectName,
    };
};

/**
 * 1. RECEIVE STOCK VIA GRN (Single Receiving System)
 * Routes to Central Godown or Direct Project Site based on deliveryType.
 * Handles both accepted usable stock and damaged stock.
 */
export const receiveStockGRN = async ({
    purchaseOrderId = null,
    stockRequestId = null,
    deliveryType = "CENTRAL_GODOWN",
    destinationProjectId = null,
    poNumber = "",
    deliveryChallan = "",
    items = [],
    userId = null,
    session = null,
}) => {
    let destId = destinationProjectId;
    if (deliveryType === "CENTRAL_GODOWN" || !destId) {
        const godown = await getOrCreateCentralGodown(session);
        destId = godown._id;
    }

    const receiptResults = [];

    for (const it of items) {
        const received = Number(it.receivedQty || 0);
        const damaged = Number(it.damagedQty || 0);
        const returned = Number(it.returnQty || 0);
        const accepted = it.acceptedQty !== undefined
            ? Number(it.acceptedQty)
            : Math.max(received - damaged - returned, 0);

        if (received < 0 || damaged < 0 || returned < 0 || accepted < 0) {
            throw new Error(`Invalid quantities for item ${it.itemId}`);
        }

        let acceptedResult = null;
        let damageResult = null;

        // Credit usable accepted stock
        if (accepted > 0) {
            acceptedResult = await applyStockMovement({
                projectId: destId,
                itemId: it.itemId,
                qtyChange: accepted,
                transactionType: "GRN",
                referenceId: purchaseOrderId,
                referenceNumber: poNumber || deliveryChallan || "GRN",
                remarks: `GRN received (${deliveryType}): ${accepted} units accepted`,
                userId,
                session,
            });
        }

        // Record damaged stock if any
        if (damaged > 0) {
            damageResult = await recordDamage({
                projectId: destId,
                itemId: it.itemId,
                quantity: damaged,
                reason: `Damaged on arrival (PO ${poNumber || ""})`,
                userId,
                session,
            });
        }

        receiptResults.push({
            itemId: it.itemId,
            accepted,
            damaged,
            acceptedResult,
            damageResult,
        });
    }

    return {
        destinationProjectId: destId,
        deliveryType,
        items: receiptResults,
    };
};

/**
 * 2. ISSUE STOCK (Store -> Site/Task)
 * CRITICAL RULE:
 * - Project Usable Stock (qty) decreases
 * - Project Issued Buffer (issuedBuffer) increases
 * - StockLedger: ISSUE
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

    // 1. Debit Usable Stock and record StockLedger ISSUE entry
    const movement = await applyStockMovement({
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

    // 2. Increment Issued Buffer at this project
    const stock = movement.stock;
    const idx = stock.projectBalances.findIndex((pb) => String(pb.projectId) === String(projectId));
    if (idx >= 0) {
        stock.projectBalances[idx].issuedBuffer = Number(stock.projectBalances[idx].issuedBuffer || 0) + n;
    } else {
        stock.projectBalances.push({
            projectId,
            qty: 0,
            issuedBuffer: n,
            damaged: 0,
        });
    }
    await stock.save({ session });

    return {
        ...movement,
        issuedBuffer: idx >= 0 ? stock.projectBalances[idx].issuedBuffer : n,
    };
};

/**
 * 3. CONSUME STOCK (Actual usage on site)
 * CRITICAL RULE:
 * - Material was ALREADY deducted from Usable Stock during ISSUE
 * - Consumption ONLY reduces Issued Buffer (issuedBuffer - qtyUsed)
 * - DOES NOT deduct Project Usable Stock again (PREVENTS DOUBLE DEDUCTION)
 * - StockLedger: CONSUMPTION
 */
export const consumeStock = async ({
    projectId,
    itemId,
    qtyUsed,
    taskId = null,
    referenceId = null,
    referenceNumber = null,
    remarks = "Material consumed on site",
    userId = null,
    session = null,
}) => {
    const n = Number(qtyUsed);
    if (!Number.isFinite(n) || n <= 0) {
        throw new Error("Consumed quantity must be a positive number");
    }

    // 1. Fetch Stock record
    const stock = await Stock.findOne({ itemId }).session(session);
    if (!stock) {
        throw new Error(`Stock not found for item ${itemId}`);
    }

    // 2. Find Project Balance
    const idx = stock.projectBalances.findIndex((pb) => String(pb.projectId) === String(projectId));
    if (idx < 0) {
        throw new Error(`No project balance found for project ${projectId}`);
    }

    const currentBuffer = Number(stock.projectBalances[idx].issuedBuffer || 0);
    if (currentBuffer < n) {
        throw new Error(
            `Insufficient issued buffer! Available issued buffer: ${currentBuffer}, attempted consumption: ${n}. Material must be issued to site activity first.`
        );
    }
    const newBuffer = currentBuffer - n;
    stock.projectBalances[idx].issuedBuffer = newBuffer;
    await stock.save({ session });

    // 3. Create immutable StockLedger record without touching usable balance
    const currentUsable = Number(stock.projectBalances[idx].qty || 0);
    const [ledgerEntry] = await StockLedger.create(
        [
            {
                itemId,
                projectId,
                transactionType: "CONSUMPTION",
                referenceId: referenceId || taskId,
                referenceNumber: referenceNumber || `CONS-${Date.now()}`,
                qtyIn: 0,
                qtyOut: n,
                balanceQty: currentUsable, // Usable balance remains unchanged!
                remarks: remarks || `Consumed from issued buffer (remaining buffer: ${newBuffer})`,
            },
        ],
        { session }
    );

    return {
        stock,
        ledgerEntry,
        currentUsableBalance: currentUsable,
        remainingIssuedBuffer: newBuffer,
    };
};

/**
 * 4. TRANSFER STOCK (Source -> Destination)
 * Atomic debit at source, credit at destination.
 * StockLedger: TRANSFER_OUT at source, TRANSFER_IN at destination.
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
 * 5. RETURN STOCK (Site -> Central Godown / Store)
 * Debits site stock, credits Central Godown (or specified destination).
 * StockLedger: RETURN at site, RECEIPT at godown.
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
        transactionType: "RETURN",
        remarks: `Returned material received from ${sourceProjectId}: ${reason}`,
        userId,
        session,
    });

    return { debit, credit };
};

/**
 * 6. RECORD DAMAGE (Reduces usable stock, records damage count)
 * Debits usable stock, increments damaged stock in Stock and projectBalances.
 * StockLedger: DAMAGE
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

    // Increment damaged count in Stock document and projectBalances
    const stock = result.stock;
    stock.damaged = Number(stock.damaged || 0) + n;

    const idx = stock.projectBalances.findIndex((pb) => String(pb.projectId) === String(projectId));
    if (idx >= 0) {
        stock.projectBalances[idx].damaged = Number(stock.projectBalances[idx].damaged || 0) + n;
    }
    await stock.save({ session });

    return result;
};

/**
 * 7. ADJUST STOCK (Audit correction / Physical Count Difference)
 * Requires authorized reason and writes StockLedger ADJUSTMENT entry.
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
 * Returns usable balance, issuedBuffer, damaged, and total usable stock.
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
            const issuedBuffer = pb ? Number(pb.issuedBuffer || 0) : 0;
            const damaged = pb ? Number(pb.damaged || 0) : 0;

            result.push({
                stockId: s._id,
                itemId: s.itemId._id,
                name: s.itemId.name,
                category: s.itemId.category,
                unit: s.itemId.unit,
                hsnCode: s.itemId.hsnCode,
                projectId,
                currentBalance, // Usable in store/site
                qty: currentBalance, // Alias for backward compatibility
                issuedBuffer,   // Issued to site, not yet consumed
                damaged,        // Damaged at project
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
                    issuedBuffer: Number(pb.issuedBuffer || 0),
                    damaged: Number(pb.damaged || 0),
                })),
            });
        }
    }

    return result;
};
