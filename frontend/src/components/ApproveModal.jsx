import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    Slide
} from "@mui/material";
import toast from "react-hot-toast";
import { useApproveMaterialRequestMutation } from "../Reduxe/Api";
import {
    FaTruck,
    FaCalculator,
    FaCalendarAlt,
    FaClipboardList,
    FaCheckCircle
} from "react-icons/fa";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

export default function ApproveModal({ open, mr, vendors, onClose }) {

    const [approveMR] = useApproveMaterialRequestMutation();

    // ⭐ PO Mode
    const [poMode, setPoMode] = useState("single");

    // ⭐ Items Pricing + Vendor (per item)
    const [itemData, setItemData] = useState(
        mr?.items?.map(() => ({
            vendorId: "",
            unitPrice: "",
            gst: "",
            discount: ""
        })) || []
    );

    // ⭐ Single Vendor Mode
    const [singleVendorId, setSingleVendorId] = useState("");

    // ⭐ Delivery & Terms
    const [extra, setExtra] = useState({
        deliveryDate: "",
        paymentTerms: ""
    });

    const handleItemChange = (index, field, value) => {
        const updated = [...itemData];
        updated[index][field] = value;
        setItemData(updated);
    };

    const getItemTotal = (qty, price, gst, discount) => {
        let amount = qty * (price || 0);
        let gstValue = (amount * (gst || 0)) / 100;
        let discountValue = (amount * (discount || 0)) / 100;
        return amount + gstValue - discountValue;
    };

    const handleApprove = async () => {
        if (!extra.deliveryDate) {
            toast.error("Delivery date required!");
            return;
        }

        // ⭐ Validate Single Vendor Mode
        if (poMode === "single" && !singleVendorId) {
            toast.error("Select vendor for single PO mode");
            return;
        }

        // ⭐ Validate per item vendor (manual / group / itemwise)
        if (poMode !== "single") {
            for (let i = 0; i < itemData.length; i++) {
                if (!itemData[i].vendorId) {
                    toast.error(`Vendor missing for item ${mr.items[i].itemId.name}`);
                    return;
                }
            }
        }

        // let payload = {
        //     poMode,
        //     vendorId: poMode === "single" ? singleVendorId : null,
        //     items: itemData.map((it, index) => ({
        //         itemId: mr.items[index].itemId._id,
        //         unitPrice: Number(it.unitPrice),
        //         gst: Number(it.gst),
        //         discount: Number(it.discount),
        //         vendorId: it.vendorId
        //     })),
        //     deliveryDate: extra.deliveryDate,
        //     paymentTerms: extra.paymentTerms
        // };

        let payload = {
            poMode,
            vendorId: poMode === "single" ? singleVendorId : null,
            items: itemData.map((it, index) => ({
                itemId: mr.items[index].itemId._id,
                vendorId: poMode === "single" ? singleVendorId : it.vendorId,   // ⭐ THIS FIX
                unitPrice: Number(it.unitPrice || 0),
                gst: Number(it.gst || 0),
                discount: Number(it.discount || 0)
            })),
            deliveryDate: extra.deliveryDate,
            paymentTerms: extra.paymentTerms
        };


        try {
            await approveMR({ id: mr._id, data: payload }).unwrap();
            toast.success("PO Generated Successfully!");
            onClose();
            // window.location.reload();
        } catch (error) {
            toast.error(error?.data?.message || "Approval Failed");
        }
    };

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ style: { borderRadius: "20px" } }}
        >
            {/* HEADER */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <FaCheckCircle className="text-white text-xl" />
                </div>
                <div>
                    <h2 className="text-xl text-white font-bold">Approve Material Request</h2>
                    <p className="text-green-100 text-sm">Select vendor & pricing to generate PO</p>
                </div>
            </div>

            <DialogContent dividers className="space-y-6 bg-white">

                {/* PO MODE */}
                <div className="p-4 bg-gray-100 rounded-xl">
                    <label className="font-bold text-gray-700">PO Creation Mode</label>
                    <select
                        className="w-full border p-3 rounded-xl mt-2"
                        value={poMode}
                        onChange={(e) => setPoMode(e.target.value)}
                    >
                        <option value="single">Single Vendor (All Items)</option>
                        <option value="itemwise">Item-wise Vendor</option>
                        <option value="group">Group by Vendor</option>
                        <option value="manual">Manual Vendor Per Item</option>
                    </select>
                </div>

                {/* SINGLE VENDOR */}
                {poMode === "single" && (
                    <div>
                        <label className="font-semibold">Select Vendor</label>
                        <select
                            className="w-full border p-3 rounded-xl mt-2"
                            value={singleVendorId}
                            onChange={(e) => setSingleVendorId(e.target.value)}
                        >
                            <option value="">Choose vendor...</option>
                            {vendors?.map((v) => (
                                <option value={v._id} key={v._id}>
                                    {v.companyName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* MULTIPLE ITEMS LIST */}
                {mr.items.map((it, index) => {
                    const qty = it.requestedQty;
                    const d = itemData[index];

                    return (
                        <div key={index} className="border p-4 rounded-xl bg-gray-50">

                            <h3 className="font-bold">
                                {it.itemId?.name} — {qty} {it.unit}
                            </h3>

                            {/* Vendor per item (except single mode) */}
                            {poMode !== "single" && (
                                <select
                                    className="w-full border p-2 rounded mt-2"
                                    value={d.vendorId}
                                    onChange={(e) => handleItemChange(index, "vendorId", e.target.value)}
                                >
                                    <option value="">Select Vendor...</option>
                                    {vendors?.map((v) => (
                                        <option value={v._id} key={v._id}>
                                            {v.companyName}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <div className="grid grid-cols-3 gap-3 mt-3">
                                <input
                                    type="number"
                                    placeholder="Unit Price"
                                    className="border p-2 rounded"
                                    value={d.unitPrice}
                                    onChange={(e) =>
                                        handleItemChange(index, "unitPrice", e.target.value)
                                    }
                                />

                                <input
                                    type="number"
                                    placeholder="GST %"
                                    className="border p-2 rounded"
                                    value={d.gst}
                                    onChange={(e) =>
                                        handleItemChange(index, "gst", e.target.value)
                                    }
                                />

                                <input
                                    type="number"
                                    placeholder="Discount %"
                                    className="border p-2 rounded"
                                    value={d.discount}
                                    onChange={(e) =>
                                        handleItemChange(index, "discount", e.target.value)
                                    }
                                />
                            </div>

                            <div className="mt-3 bg-white p-3 rounded font-semibold">
                                Total: ₹
                                {getItemTotal(
                                    qty,
                                    d.unitPrice,
                                    d.gst,
                                    d.discount
                                ).toFixed(2)}
                            </div>
                        </div>
                    );
                })}

                {/* DELIVERY + TERMS */}
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="date"
                        className="border p-2 rounded-xl"
                        value={extra.deliveryDate}
                        onChange={(e) => setExtra({ ...extra, deliveryDate: e.target.value })}
                    />

                    <input
                        type="text"
                        className="border p-2 rounded-xl"
                        placeholder="Payment Terms"
                        value={extra.paymentTerms}
                        onChange={(e) => setExtra({ ...extra, paymentTerms: e.target.value })}
                    />
                </div>
            </DialogContent>

            <DialogActions className="bg-gray-50 py-4">
                <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-xl">
                    Cancel
                </button>
                <button
                    onClick={handleApprove}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl"
                >
                    Approve & Generate PO
                </button>
            </DialogActions>
        </Dialog>
    );
}
