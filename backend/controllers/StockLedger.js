import StockLedger from "../models/StockLedger.js";

for (const it of items) {
    const accepted = Number(it.receivedQty || 0) - Number(it.damagedQty || 0);

    // find latest balance
    const lastEntry = await StockLedger.findOne({ itemId: it.itemId })
        .sort({ createdAt: -1 });

    const previousBalance = lastEntry ? lastEntry.balanceQty : 0;
    const newBalance = previousBalance + accepted;

    await StockLedger.create({
        itemId: it.itemId,
        projectId: mr.projectId,
        transactionType: "GRN",
        referenceId: grn._id,
        referenceNumber: grn.poNumber, 
        qtyIn: accepted,
        qtyOut: 0,
        balanceQty: newBalance,
        remarks: `Material received through GRN`
    });
}
