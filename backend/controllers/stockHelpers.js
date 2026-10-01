import { applyStockMovement } from "../services/inventoryService.js";

/**
 * Legacy helper maintained for backward compatibility.
 * Safely redirects through central inventoryService.
 */
export const adjustStock = async ({ projectId, itemId, unit, qtyChange, session = null }) => {
  const result = await applyStockMovement({
    projectId,
    itemId,
    qtyChange,
    transactionType: qtyChange > 0 ? "GRN" : "OUT",
    remarks: "Legacy stock adjustment",
    session,
  });
  return result.stock;
};
