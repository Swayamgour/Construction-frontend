import StockRequest from "../models/StockRequest.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import {
  createStockRequest,
  listStockRequests,
  getStockRequest,
  approveStockRequest,
  rejectStockRequest,
} from "./stockRequestController.js";

/**
 * Backward compatibility controller for legacy /api/mr/* endpoints.
 * All operations delegate directly to canonical StockRequest and PurchaseOrder!
 */

export const addMaterialRequest = createStockRequest;

export const getMaterialRequests = async (req, res) => {
  // Delegate to listStockRequests
  return listStockRequests(req, res);
};

export const getPendingRequests = async (req, res) => {
  try {
    const pending = await StockRequest.find({
      status: { $in: ["PENDING_APPROVAL", "PENDING_ADMIN_REVIEW", "SUBMITTED"] },
    })
      .populate("projectId", "projectName projectCode")
      .populate("items.itemId", "name unit category")
      .populate("materialId", "name unit category")
      .populate("requestedBy", "name role");

    res.status(200).json({ message: "Pending Material Requests", data: pending });
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending requests", error: error.message });
  }
};

export const approveMaterialRequest = approveStockRequest;
export const rejectMaterialRequest = rejectStockRequest;
export const getSingleMaterialRequest = getStockRequest;

export const getPurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate("projectId", "projectName projectCode")
      .populate("deliveryProject", "projectName projectCode")
      .populate("vendorId", "companyName phone email address")
      .populate("items.itemId", "name unit category")
      .populate("createdBy", "name role");

    if (!po) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    return res.status(200).json({ message: "PO Details Fetched", po });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching PO", error: error.message });
  }
};
