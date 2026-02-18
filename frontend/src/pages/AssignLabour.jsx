import React, { useState } from "react";
import toast from "react-hot-toast";
import {
    useGetLabourQuery,
    useGetProjectsQuery,
    useAssignLabourMutation,
    useUnassignLabourMutation,
    useReassignLabourMutation,
} from "../Reduxe/Api";

const AssignLabour = () => {
    const [projectId, setProjectId] = useState("");
    const [selectedLabours, setSelectedLabours] = useState([]);
    const [reassignLabourId, setReassignLabourId] = useState(null);
    const [newProjectId, setNewProjectId] = useState("");

    const { data: allLabours, isLoading } = useGetLabourQuery();
    const { data: allProjects } = useGetProjectsQuery();

    const [assignLabour] = useAssignLabourMutation();
    const [unassignLabour] = useUnassignLabourMutation();
    const [reassignLabour] = useReassignLabourMutation();

    // Toggle selection
    const toggleSelect = (labour) => {
        if (labour.assignedProjects?.length > 0) return; // already assigned

        setSelectedLabours((prev) =>
            prev.includes(labour._id)
                ? prev.filter((id) => id !== labour._id)
                : [...prev, labour._id]
        );
    };

    const handleProjectChange = (e) => {
        setProjectId(e.target.value);
        setSelectedLabours([]);
    };

    // 👉 Assign Labour
    const handleSave = async () => {
        if (!projectId) return toast.error("Select a project");
        if (selectedLabours.length === 0)
            return toast.error("Select at least one labour");

        try {
            await assignLabour({ projectId, labourIds: selectedLabours }).unwrap();
            toast.success("Labours assigned!");
            setSelectedLabours([]);
            setProjectId("");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to assign");
        }
    };

    // 👉 UNASSIGN LABOUR
    const handleUnassign = async (labour) => {
        try {
            await unassignLabour({
                labourId: labour._id,
                projectId: labour.assignedProjects[0]?._id
            }).unwrap();

            toast.success("Labour removed from project");
        } catch (err) {
            toast.error("Error removing");
        }
    };

    // 👉 REASSIGN LABOUR
    const handleReassign = async () => {
        if (!newProjectId) return toast.error("Select new project");

        try {
            await reassignLabour({
                labourId: reassignLabourId,
                oldProjectId: allLabours?.find((l) => l._id === reassignLabourId)
                    ?.assignedProjects[0]?._id,
                newProjectId
            }).unwrap();

            toast.success("Labour reassigned successfully");
            setReassignLabourId(null);
            setNewProjectId("");
        } catch (err) {
            toast.error("Failed to reassign");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto min-h-screen">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">👷 Labour Project Manager</h1>

                <button
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 hidden md:block"
                    onClick={handleSave}
                >
                    Assign Worker
                </button>
            </div>

            {/* SELECT PROJECT */}
            <select
                className="border p-3 rounded-xl w-full mb-6 bg-white shadow-sm"
                value={projectId}
                onChange={handleProjectChange}
            >
                <option value="">Select Project</option>
                {allProjects?.map((proj) => (
                    <option key={proj._id} value={proj._id}>
                        {proj.projectName}
                    </option>
                ))}
            </select>

            {/* LABOUR TABLE */}
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <table className="w-full border-collapse shadow-lg bg-white rounded-xl overflow-hidden">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-3 border w-12 text-center">Select</th>
                            <th className="p-3 border">Name</th>
                            <th className="p-3 border">Phone</th>
                            <th className="p-3 border">Type</th>
                            <th className="p-3 border">Wage</th>
                            <th className="p-3 border text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {allLabours?.map((labour) => {
                            const isAssigned = labour.assignedProjects?.length > 0;
                            const assignedProj = labour.assignedProjects?.[0];
                            const isSelected = selectedLabours.includes(labour._id);

                            return (
                                <tr
                                    key={labour._id}
                                    className={`border transition ${isAssigned
                                            ? "bg-gray-100"
                                            : isSelected
                                                ? "bg-green-50"
                                                : "hover:bg-blue-50"
                                        }`}
                                >
                                    <td className="p-3 text-center">
                                        <input
                                            type="checkbox"
                                            disabled={isAssigned}
                                            checked={isSelected}
                                            onChange={() => toggleSelect(labour)}
                                        />
                                    </td>

                                    <td className="p-3 font-semibold">{labour.name}</td>

                                    <td className="p-3">{labour.phone}</td>

                                    <td className="p-3">{labour.labourType}</td>

                                    <td className="p-3">
                                        {labour.wageType === "Monthly"
                                            ? `₹${labour.monthlySalary}/month`
                                            : `₹${labour.dailyWage}/day`}
                                    </td>

                                    <td className="p-3 text-center">

                                        {/* If already assigned → show actions */}
                                        {isAssigned ? (
                                            <div className="flex gap-2 justify-center">

                                                {/* UNASSIGN */}
                                                <button
                                                    onClick={() => handleUnassign(labour)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs"
                                                >
                                                    Unassign
                                                </button>

                                                {/* REASSIGN */}
                                                <button
                                                    onClick={() => setReassignLabourId(labour._id)}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs"
                                                >
                                                    Reassign
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                                Available
                                            </span>
                                        )}

                                        {/* SHOW CURRENT PROJECT */}
                                        {assignedProj && (
                                            <p className="text-xs mt-1 text-gray-600">
                                                Assigned → {assignedProj.projectName}
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {/* MOBILE SAVE BUTTON */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg">
                <button
                    onClick={handleSave}
                    className="bg-green-600 text-white w-full py-3 rounded-lg"
                >
                    Save Assignment
                </button>
            </div>

            {/* REASSIGN POPUP */}
            {reassignLabourId && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Reassign Labour</h2>

                        <select
                            className="border p-3 rounded-xl w-full mb-4"
                            value={newProjectId}
                            onChange={(e) => setNewProjectId(e.target.value)}
                        >
                            <option value="">Select New Project</option>

                            {allProjects?.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.projectName}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setReassignLabourId(null)}
                                className="px-4 py-2 bg-gray-300 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleReassign}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Reassign
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AssignLabour;
