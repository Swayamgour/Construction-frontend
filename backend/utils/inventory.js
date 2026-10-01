import { applyStockMovement, getInventorySummary } from "../services/inventoryService.js";

/**
 * Single choke-point for every project-wise stock quantity change.
 * Delegates to central inventoryService (services/inventoryService.js).
 */
export const applyStockLedgerEntry = async ({
    projectId,
    itemId,
    qtyChange,
    transactionType,
    referenceId,
    referenceNumber,
    remarks,
    session,
    rate,
    entryDate,
    userId,
}) => {
    return applyStockMovement({
        projectId,
        itemId,
        qtyChange,
        transactionType,
        referenceId,
        referenceNumber,
        remarks,
        rate,
        entryDate,
        userId,
        session,
    });
};

/** Project-wise inventory summary for a single item, or all items on a project. */
export const getProjectInventory = async (projectId, itemId = null) => {
    return getInventorySummary({ projectId, itemId });
};
