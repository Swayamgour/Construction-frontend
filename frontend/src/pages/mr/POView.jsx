import React from "react";
import { useParams } from "react-router-dom";
import { useGetItemHistoryQuery, useGetPoRequestQuery, useGetProjectStockQuery } from "../../Reduxe/Api";
import {
    FaFileInvoice,
    FaBuilding,
    FaUserTie,
    FaPrint
} from "react-icons/fa";
import { FaShareAlt } from "react-icons/fa";

export default function POView() {
    const { id } = useParams();
    const { data, isLoading, error } = useGetPoRequestQuery(id);

    console.log(data?.po?.project?.locationMapLink)
    //  ,
    // useGetProjectStockQuery,

    // const { data: itemHistory } = useGetItemHistoryQuery()
    // const { data: projectStock } = useGetProjectStockQuery('69296d426c4583cbb6a22050')



    const shareLocation = () => {
        const link = data?.po?.project?.locationMapLink

        if (!link) {
            alert("No link found");
            return;
        }

        // Check if Web Share API is supported
        if (navigator.share) {
            navigator.share({
                title: "Project Location",
                text: "Here is the project location link:",
                url: link
            })
                .then(() => console.log("Shared successfully"))
                .catch((err) => console.log("Share failed", err));
        } else {
            // Fallback for unsupported browsers
            alert("Sharing not supported on this device");
        }
    };


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 mt-10">Failed to load PO</div>;
    }



    const po = data?.po;

    const getVendor = (itemVendor) => {
        if (po.poMode === "single") return po.vendor;
        return itemVendor;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
            <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-8">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <FaFileInvoice size={30} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Purchase Order</h1>
                            <p className="text-gray-500">PO Number: {po?.poNumber || "N/A"}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {data?.po?.project?.locationMapLink &&
                            <button
                                onClick={() => shareLocation()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2"
                            >
                                <FaShareAlt /> Share
                            </button>}
                        <button
                            onClick={() => window.print()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2"
                        >
                            <FaPrint /> Print
                        </button>
                    </div>
                </div>

                {/* PROJECT & VENDOR */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                    {/* PROJECT DETAILS */}
                    <div className="bg-gray-50 p-6 rounded-xl border">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FaBuilding /> Project Details
                        </h2>
                        <div className="mt-3 space-y-2 text-gray-600">
                            <p><b>Name:</b> {po?.project?.projectName}</p>
                            <p><b>Code:</b> {po?.project?.projectCode || "---"}</p>
                            <p><b>Delivery Date:</b> {po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : "N/A"}</p>
                        </div>
                    </div>

                    {/* VENDOR DETAILS */}
                    <div className="bg-gray-50 p-6 rounded-xl border">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FaUserTie /> Vendor Details
                        </h2>

                        {po.poMode === "single" ? (
                            po.vendor ? (
                                <div className="mt-3 space-y-2 text-gray-600">
                                    <p><b>Company:</b> {po.vendor.companyName}</p>
                                    <p><b>Phone:</b> {po.vendor.phone}</p>
                                    <p><b>Email:</b> {po.vendor.email}</p>
                                    <p><b>Address:</b> {po.vendor.address}</p>
                                </div>
                            ) : (
                                <p className="mt-3 text-red-500">Vendor information missing!</p>
                            )
                        ) : (
                            <p className="mt-3 text-gray-600 text-sm italic">
                                *Multiple vendor mode – vendor assigned per item.
                            </p>
                        )}
                    </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="mt-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Items Summary</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border rounded-xl overflow-hidden">
                            <thead className="bg-gray-100 text-gray-700 text-sm">
                                <tr>
                                    <th className="p-3 border">Item</th>
                                    <th className="p-3 border">Qty</th>
                                    <th className="p-3 border">Unit</th>
                                    <th className="p-3 border">Vendor</th>
                                    <th className="p-3 border">Unit Price</th>
                                    <th className="p-3 border">GST %</th>
                                    <th className="p-3 border">Discount %</th>
                                    <th className="p-3 border">Total</th>
                                </tr>
                            </thead>

                            <tbody className="text-sm">
                                {po.items.map((item, index) => {
                                    const vendor = getVendor(item.vendorId);

                                    const qty = item.requestedQty;
                                    const price = item.unitPrice;
                                    const gst = item.gst;
                                    const disc = item.discount;

                                    const amount = qty * price;
                                    const gstVal = (amount * gst) / 100;
                                    const discVal = (amount * disc) / 100;
                                    const final = amount + gstVal - discVal;

                                    return (
                                        <tr key={index} className="border">
                                            <td className="p-3 border">{item.itemId?.name}</td>
                                            <td className="p-3 border text-center">{qty}</td>
                                            <td className="p-3 border text-center">{item.unit}</td>

                                            {/* VENDOR */}
                                            <td className="p-3 border text-center">
                                                {vendor ? vendor.companyName : "N/A"}
                                            </td>

                                            <td className="p-3 border text-right">₹{price}</td>
                                            <td className="p-3 border text-center">{gst}%</td>
                                            <td className="p-3 border text-center">{disc}%</td>

                                            <td className="p-3 border text-right text-green-600 font-semibold">
                                                ₹{final.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TOTAL */}
                <div className="mt-6 text-right">
                    <p className="text-xl font-bold text-gray-800">
                        Total Amount: <span className="text-green-600">₹{po.totalAmount}</span>
                    </p>
                </div>

                {/* PAYMENT TERMS */}
                <div className="mt-8 bg-gray-50 p-5 rounded-xl border text-gray-700">
                    <h2 className="font-bold">Payment Terms</h2>
                    <p className="mt-2">{po.paymentTerms || "N/A"}</p>
                </div>

                {/* APPROVAL */}
                <div className="mt-8 bg-gray-50 p-5 rounded-xl border text-gray-700">
                    <h2 className="font-bold">Approved By</h2>
                    <p className="mt-2">{po.approvedBy?.name}</p>
                    <p className="text-sm text-gray-500">
                        {new Date(po.approvalDate).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
