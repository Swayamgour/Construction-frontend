import { useState } from "react";
import toast from "react-hot-toast";
import {
    useAssignOperatorToMachineMutation,
    useChangeOperatorMutation,
    useRemoveOperatorMutation,
    useGetOperatorAssignmentHistoryQuery,
    useGetLabourQuery,
} from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";

/**
 * NEW — wires up the operator assignment lifecycle added on the backend
 * (POST/PATCH /api/machinery/assignments/:assignmentId/operator[...]).
 * This is distinct from the "operator" tab's daily working-hour logs —
 * this panel tracks WHO the assigned operator is right now, and keeps a
 * permanent assign/change/remove history (nothing here is ever overwritten
 * or deleted, matching the backend's operatorHistory[] design).
 *
 * Props:
 *   assignment  — the current MachineAssignment record (or null/undefined
 *                 if the machine has no active assignment; in that case
 *                 this panel renders nothing, since there's nothing to
 *                 assign an operator TO yet).
 *   onChanged   — optional callback (e.g. refetch()) after any successful action.
 */
export default function OperatorAssignmentPanel({ assignment, onChanged }) {
    const { role } = CheckRole();
    const canManage = ["admin", "manager"].includes(role);

    const [showHistory, setShowHistory] = useState(false);
    const [mode, setMode] = useState(null); // "assign" | "change" | "remove" | null
    const [operatorId, setOperatorId] = useState("");
    const [reason, setReason] = useState("");

    const [assignOperator, { isLoading: assigning }] = useAssignOperatorToMachineMutation();
    const [changeOperator, { isLoading: changing }] = useChangeOperatorMutation();
    const [removeOperator, { isLoading: removing }] = useRemoveOperatorMutation();

    const { data: historyResp, isFetching: historyLoading } = useGetOperatorAssignmentHistoryQuery(
        assignment?._id,
        { skip: !showHistory || !assignment?._id }
    );
    const history = historyResp?.data?.history || [];

    // Query Labour collection (canonical site workforce) for operators
    const { data: labourResp } = useGetLabourQuery(undefined, { skip: !canManage || mode === null });
    const allLabours = Array.isArray(labourResp) ? labourResp : labourResp?.data || [];
    const operators = allLabours.filter((l) => l.category === "Operator");
    const displayOperators = operators.length > 0 ? operators : allLabours;

    if (!assignment) return null;

    const resetForm = () => {
        setMode(null);
        setOperatorId("");
        setReason("");
    };

    const submit = async () => {
        if (!operatorId && mode !== "remove") return toast.error("Select an operator");
        if ((mode === "change" || mode === "remove") && !reason.trim() && mode === "change") {
            return toast.error("A reason is required when changing the operator");
        }
        try {
            if (mode === "assign") {
                await assignOperator({ assignmentId: assignment._id, operatorId, reason }).unwrap();
                toast.success("Operator assigned");
            } else if (mode === "change") {
                await changeOperator({ assignmentId: assignment._id, operatorId, reason }).unwrap();
                toast.success("Operator changed");
            } else if (mode === "remove") {
                await removeOperator({ assignmentId: assignment._id, reason }).unwrap();
                toast.success("Operator removed");
            }
            resetForm();
            onChanged?.();
        } catch (err) {
            toast.error(err?.data?.message || "Action failed");
        }
    };

    const busy = assigning || changing || removing;

    return (
        <div className="mt-4 pt-4 border-t border-blue-200/60">
            <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Operator</span>
                {canManage && !mode && (
                    <div className="flex gap-2">
                        {!assignment.operatorId ? (
                            <button
                                onClick={() => setMode("assign")}
                                className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Assign Operator
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setMode("change")}
                                    className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                >
                                    Change
                                </button>
                                <button
                                    onClick={() => setMode("remove")}
                                    className="text-xs px-3 py-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-medium"
                                >
                                    Remove
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {!mode && (
                <p className="font-medium text-gray-900">
                    {assignment.operatorId?.name || assignment.operatorId || "No operator assigned"}
                </p>
            )}

            {mode && (
                <div className="bg-white/70 rounded-lg p-4 space-y-3">
                    {mode !== "remove" && (
                        <div>
                            <label className="text-xs text-gray-600 font-medium">
                                {mode === "assign" ? "Operator to assign" : "New operator"}
                            </label>
                            <select
                                value={operatorId}
                                onChange={(e) => setOperatorId(e.target.value)}
                                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Select operator</option>
                                {displayOperators.map((u) => (
                                    <option key={u._id} value={u._id}>
                                        {u.labourId ? `[${u.labourId}] ` : ""}{u.name} {u.phone ? `(${u.phone})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="text-xs text-gray-600 font-medium">
                            Reason {mode === "change" ? "(required)" : "(optional)"}
                        </label>
                        <input
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. operator on leave, reassigned to another site"
                            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={submit}
                            disabled={busy}
                            className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                        >
                            {busy ? "Saving..." : "Confirm"}
                        </button>
                        <button
                            onClick={resetForm}
                            className="text-xs px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setShowHistory((s) => !s)}
                className="mt-2 text-xs text-blue-700 hover:underline font-medium"
            >
                {showHistory ? "Hide" : "View"} operator history
            </button>

            {showHistory && (
                <div className="mt-2 space-y-2">
                    {historyLoading && <p className="text-xs text-gray-500">Loading...</p>}
                    {!historyLoading && history.length === 0 && (
                        <p className="text-xs text-gray-500">No operator changes recorded yet.</p>
                    )}
                    {history.map((h, idx) => (
                        <div key={idx} className="text-xs bg-gray-50 rounded-lg p-2 border border-gray-100">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-800">{h.action}</span>
                                <span className="text-gray-400">{new Date(h.changedAt).toLocaleString()}</span>
                            </div>
                            <div className="text-gray-600 mt-1">
                                {h.previousOperatorId?.name || "—"} → {h.newOperatorId?.name || "—"}
                                {h.reason && <span className="block text-gray-500 mt-0.5">Reason: {h.reason}</span>}
                            </div>
                            <div className="text-gray-400 mt-0.5">By {h.changedBy?.name || "—"}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
