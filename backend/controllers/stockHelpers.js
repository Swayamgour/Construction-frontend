import Stock from "../models/Stock.js";

export const adjustStock = async ({ projectId, itemId, unit, qtyChange }) => {
  // qtyChange +ve -> IN, -ve -> OUT
  let stock = await Stock.findOne({ projectId, itemId });

  if (!stock) {
    stock = await Stock.create({
      projectId,
      itemId,
      qty: 0,
      unit,
    });
  }

  const newQty = stock.qty + qtyChange;

  if (newQty < 0) {
    throw new Error("Insufficient stock");
  }

  stock.qty = newQty;
  if (unit && !stock.unit) stock.unit = unit;

  await stock.save();
  return stock;
};
