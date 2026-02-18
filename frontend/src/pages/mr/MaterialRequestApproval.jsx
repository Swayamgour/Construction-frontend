import React, { useState } from "react";
import toast from "react-hot-toast";
import {
    useGetMaterialRequestQuery,
    useGetVendorsQuery,
} from "../../Reduxe/Api";
// import axios from "axios";
import ApproveModal from "../../components/ApproveModal";

export default function MaterialRequestApproval() {
    const { data: requests } = useGetMaterialRequestQuery();
    const { data: vendors } = useGetVendorsQuery();

    const [selectedMR, setSelectedMR] = useState(null);

    const openApproveModal = (mr) => setSelectedMR(mr);
    const closeModal = () => setSelectedMR(null);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Material Requests Approval</h1>

            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 border">Project</th>
                        <th className="p-2 border">Item</th>
                        <th className="p-2 border">Qty</th>
                        <th className="p-2 border">Status</th>
                        <th className="p-2 border">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {requests?.map((mr) => (
                        <tr key={mr._id} className="border">
                            <td className="p-2">{mr.projectId?.projectName}</td>
                            <td className="p-2">{mr.itemId?.name}</td>
                            <td className="p-2">{mr.requestedQty}</td>
                            <td className="p-2 capitalize">{mr.status}</td>
                            <td className="p-2 text-center">
                                {mr.status === "pending" && (
                                    <button
                                        className="bg-green-500 px-3 py-1 text-white rounded"
                                        onClick={() => openApproveModal(mr)}
                                    >
                                        Approve
                                    </button>
                                )}
                                {mr.status === "approved" && (
                                    <button
                                        className="bg-blue-500 px-3 py-1 text-white rounded"
                                        onClick={() => window.location.href = `/po/${mr._id}`}
                                    >
                                        View PO
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedMR && (
                <ApproveModal
                    mr={selectedMR}
                    vendors={vendors}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}
