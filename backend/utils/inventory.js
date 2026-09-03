import Stock from "../models/Stock.js";
import StockLedger from "../models/stockLedgerSchema.js";

/**
 * Single choke-point for every project-wise stock quantity change in the
 * new Stock Request/Transfer/Procurement/Receiving modules. Never mutates
 * Stock without writing a matching StockLedger row, and never lets a
 * project's balance go negative (spec rule #12).
 *
 * qtyChange: positive to credit, negative to debit.
 * Must be called inside a mongoose session/transaction by the caller when
 * more than one document needs to change together.
 */
export const applyStockLedgerEntry = async ({
    projectId, itemId, qtyChange, transactionType, referenceId, referenceNumber, remarks, session, rate, entryDate,
}) => {
    let stock = await Stock.findOne({ itemId }).session(session || null);
    if (!stock) {
        stock = new Stock({ itemId, quantity: 0, damaged: 0, projectBalances: [] });
    }

    const idx = stock.projectBalances.findIndex((pb) => String(pb.projectId) === String(projectId));
    const currentProjectQty = idx >= 0 ? stock.projectBalances[idx].qty : 0;
    const newProjectQty = currentProjectQty + qtyChange;

    if (newProjectQty < 0) {
        throw new Error(`Insufficient stock: project has ${currentProjectQty}, tried to change by ${qtyChange}`);
    }

    if (idx >= 0) stock.projectBalances[idx].qty = newProjectQty;
    else stock.projectBalances.push({ projectId, qty: newProjectQty });

    stock.quantity = Math.max(stock.quantity + qtyChange, 0);
    await stock.save({ session });

    const lastEntry = await StockLedger.findOne({ itemId, projectId }).sort({ createdAt: -1 }).session(session || null);
    const previousBalance = lastEntry ? lastEntry.balanceQty : 0;
    const balanceQty = previousBalance + qtyChange;

    const [ledgerEntry] = await StockLedger.create(
        [
            {
                itemId,
                projectId,
                transactionType,
                referenceId,
                referenceNumber,
                qtyIn: qtyChange > 0 ? qtyChange : 0,
                qtyOut: qtyChange < 0 ? Math.abs(qtyChange) : 0,
                balanceQty,
                remarks,
                ...(rate !== undefined ? { rate } : {}),
                ...(entryDate !== undefined ? { entryDate } : {}),
            },
        ],
        { session }
    );

    return { stock, ledgerEntry, projectBalance: newProjectQty };
};

/** Project-wise inventory summary for a single item, or all items on a project. */
export const getProjectInventory = async (projectId, itemId = null) => {
    const filter = itemId ? { itemId } : {};
    const stocks = await Stock.find(filter).populate("itemId", "name category unit");

    return stocks
        .map((s) => {
            const pb = s.projectBalances.find((p) => String(p.projectId) === String(projectId));
            return {
                itemId: s.itemId?._id,
                name: s.itemId?.name,
                category: s.itemId?.category,
                unit: s.itemId?.unit,
                currentBalance: pb?.qty || 0,
                damaged: s.damaged || 0,
            };
        })
        .filter((s) => s.currentBalance > 0 || itemId);
};
