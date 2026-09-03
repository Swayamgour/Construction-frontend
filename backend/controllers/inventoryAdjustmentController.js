import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import StockTransaction from "../models/StockTransaction.js";
import StockLedger from "../models/stockLedgerSchema.js";
import { applyStockLedgerEntry } from "../utils/inventory.js";
import { logAudit } from "../utils/audit.js";

async function move(req,res,{kind}){const session=await mongoose.startSession();try{const {projectId,itemId,qty,reason,adjustmentType}=req.body;const n=Number(qty);if(!projectId||!itemId||!Number.isFinite(n)||n<=0)return res.status(400).json({success:false,message:"projectId, itemId and positive qty are required"});let delta=kind==="DAMAGE"?-n:(String(adjustmentType).toUpperCase()==="POSITIVE"?n:-n);if(kind==="ADJUSTMENT"&&!reason)return res.status(400).json({success:false,message:"Adjustment reason is required"});let result;await session.withTransaction(async()=>{result=await applyStockLedgerEntry({projectId,itemId,qtyChange:delta,transactionType:kind,remarks:reason||kind,session});if(kind==="DAMAGE"){await Stock.updateOne({_id:result.stock._id},{$inc:{damaged:n}},{session});}const txn=await StockTransaction.create([{projectId,itemId,type:delta>0?"IN":"OUT",qty:n,reason:reason||kind,createdBy:req.user.id}],{session});await logAudit({module:"Inventory",entityId:txn[0]._id,action:kind.toLowerCase(),performedBy:req.user.id,remarks:reason||"",meta:{projectId,itemId,qty:n,delta},projectId,session});});return res.status(201).json({success:true,message:`Inventory ${kind.toLowerCase()} recorded`,data:result});}catch(e){return res.status(400).json({success:false,message:e.message});}finally{session.endSession();}}
export const damageInventory=(req,res)=>move(req,res,{kind:"DAMAGE"});
export const adjustInventory=(req,res)=>move(req,res,{kind:"ADJUSTMENT"});

/**
 * POST /api/stock/opening
 * Records the starting balance for an item on a project — the missing
 * "Opening Stock" workflow flagged in the follow-up audit. Goes through
 * the same centralized ledger service as every other movement (spec rule:
 * no controller touches Stock quantities directly), inside a transaction,
 * with an audit log entry.
 *
 * Deliberately a ONE-TIME entry per (projectId, itemId): opening balance
 * should be set once when a project/item combination starts being
 * tracked, not repeated — repeating it would double-count stock that
 * arrived through normal RECEIPT/TRANSFER_IN movements afterwards. If the
 * opening figure was wrong, use POST /api/stock/adjustment to correct it
 * (which preserves the correction as its own ledger entry rather than
 * silently rewriting history).
 */
export const openingStock = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { projectId, itemId, quantity, rate, date, remarks } = req.body;
        const n = Number(quantity);
        if (!projectId || !itemId || !Number.isFinite(n) || n <= 0) {
            return res.status(400).json({ success: false, message: "projectId, itemId and positive quantity are required" });
        }

        const existingOpening = await StockLedger.findOne({ projectId, itemId, transactionType: "OPENING" });
        if (existingOpening) {
            return res.status(400).json({
                success: false,
                message: "Opening stock has already been recorded for this item on this project. Use /api/stock/adjustment to correct a balance instead.",
            });
        }

        let result;
        await session.withTransaction(async () => {
            result = await applyStockLedgerEntry({
                projectId,
                itemId,
                qtyChange: n,
                transactionType: "OPENING",
                remarks: remarks || "Opening stock",
                rate: rate !== undefined ? Number(rate) : undefined,
                entryDate: date ? new Date(date) : undefined,
                session,
            });
            const txn = await StockTransaction.create(
                [{ projectId, itemId, type: "IN", qty: n, reason: remarks || "Opening stock", createdBy: req.user.id }],
                { session }
            );
            await logAudit({
                module: "Inventory",
                entityId: txn[0]._id,
                action: "opening_stock",
                performedBy: req.user.id,
                remarks: remarks || "",
                meta: { projectId, itemId, quantity: n, rate: rate || null },
                projectId,
                session,
            });
        });

        return res.status(201).json({ success: true, message: "Opening stock recorded", data: result });
    } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
    } finally {
        session.endSession();
    }
};
