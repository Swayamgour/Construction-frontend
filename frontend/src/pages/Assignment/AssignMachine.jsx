import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    useAssignMachineMutation,
    useGetProjectsQuery,
    useGetAllMachinesQuery,
    useGetLabourQuery,
} from "../../Reduxe/Api";
import { MachinePage, Section, Field, StatusBadge, Spinner, inputCls, daysUntil, fmtDate, btnPrimary, btnGhost } from "../../components/machine/machineUi";

export default function AssignMachine() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { data: machinesData, isLoading: l1 } = useGetAllMachinesQuery();
    const { data: projects, isLoading: l2 } = useGetProjectsQuery();
    const { data: labourData, isLoading: l3 } = useGetLabourQuery();
    const [assignMachine, { isLoading: saving }] = useAssignMachineMutation();

    const [form, setForm] = useState({
        machineId: params.get("machineId") || "",
        projectId: "",
        operatorId: "",
        assignedFrom: new Date().toISOString().split("T")[0],
        assignedTo: "",
        notes: "",
    });
    const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    // Only machines the backend will accept: active, not already deployed,
    // and in a usable state (not maintenance / breakdown / decommissioned).
    const available = useMemo(
        () => (machinesData?.machines || []).filter((m) => m.active && !m.isAssigned && ["Available", "In Transit"].includes(m.status)),
        [machinesData]
    );
    const operators = useMemo(
        () => (Array.isArray(labourData) ? labourData : labourData?.data || []).filter((l) => l.category === "Operator" && l.isMachineAssigned === false),
        [labourData]
    );
    const projectList = projects?.data || [];

    const machine = available.find((m) => m._id === form.machineId);
    const project = projectList.find((p) => p._id === form.projectId);
    const operator = operators.find((o) => o._id === form.operatorId);

    const expiryWarnings = machine
        ? [["RC", machine.rcExpiry], ["Insurance", machine.insuranceExpiry]].filter(([, d]) => d && daysUntil(d) < 0)
        : [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.machineId || !form.projectId) return toast.error("Select both a machine and a project");
        if (form.assignedTo && form.assignedTo < form.assignedFrom) return toast.error("End date cannot be before start date");
        const body = { ...form };
        if (!body.operatorId) delete body.operatorId;
        if (!body.assignedTo) delete body.assignedTo;
        try {
            await assignMachine(body).unwrap();
            toast.success("Machine assigned");
            navigate("/assign/active");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to assign machine");
        }
    };

    if (l1 || l2 || l3) return <MachinePage title="Assign Machine"><Spinner /></MachinePage>;

    return (
        <MachinePage title="Assign Machine" subtitle="Deploy an available machine (and optionally an operator) to a project">
            <div className="grid gap-5 lg:grid-cols-3">
                <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-2">
                    <Section title="Assignment details">
                        <Field label={`Machine (${available.length} available)`} required full>
                            <select name="machineId" value={form.machineId} onChange={set} className={inputCls}>
                                <option value="">Select machine</option>
                                {available.map((m) => <option key={m._id} value={m._id}>{m.machineNumber} — {m.machineType || "Machine"}{m.brand ? ` (${m.brand})` : ""}</option>)}
                            </select>
                        </Field>
                        <Field label="Project" required>
                            <select name="projectId" value={form.projectId} onChange={set} className={inputCls}>
                                <option value="">Select project</option>
                                {projectList.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.name || p.projectName} {p.code ? `(${p.code})` : ""}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label={`Operator (${operators.length} free)`} hint="Optional — can be assigned or changed later">
                            <select name="operatorId" value={form.operatorId} onChange={set} className={inputCls}>
                                <option value="">No operator yet</option>
                                {operators.map((o) => <option key={o._id} value={o._id}>{o.name}{o.labourId ? ` (${o.labourId})` : ""}</option>)}
                            </select>
                        </Field>
                        <Field label="Start date"><input type="date" name="assignedFrom" value={form.assignedFrom} onChange={set} className={inputCls} /></Field>
                        <Field label="Expected release" hint="Leave blank if open-ended"><input type="date" name="assignedTo" value={form.assignedTo} min={form.assignedFrom} onChange={set} className={inputCls} /></Field>
                        <Field label="Notes" full><textarea name="notes" rows={3} value={form.notes} onChange={set} className={inputCls} /></Field>
                    </Section>

                    <div className="flex justify-end gap-3">
                        <button type="button" className={btnGhost} onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Assigning..." : "Assign Machine"}</button>
                    </div>
                </form>

                {/* Live summary */}
                <aside className="h-fit space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-4">
                    <h2 className="font-semibold text-gray-900">Summary</h2>
                    {!machine && !project && !operator ? (
                        <p className="text-sm text-gray-400">Pick a machine and project to preview the assignment.</p>
                    ) : (
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-xs text-gray-400">Machine</dt>
                                <dd className="font-medium">{machine ? <>{machine.machineNumber} <StatusBadge status={machine.status} /></> : "—"}</dd>
                                {machine && <dd className="text-xs text-gray-500">{machine.currentMeterReading ?? 0} h · ₹{machine.hourlyRate || 0}/hr</dd>}
                            </div>
                            <div><dt className="text-xs text-gray-400">Project</dt><dd className="font-medium">{project?.projectName || "—"}</dd></div>
                            <div><dt className="text-xs text-gray-400">Operator</dt><dd className="font-medium">{operator?.name || "Not assigned"}</dd></div>
                            <div><dt className="text-xs text-gray-400">Period</dt><dd className="font-medium">{fmtDate(form.assignedFrom)} → {form.assignedTo ? fmtDate(form.assignedTo) : "Open"}</dd></div>
                        </dl>
                    )}
                    {expiryWarnings.length > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                            {expiryWarnings.map(([l]) => l).join(" & ")} document expired — the server may refuse this assignment.
                        </div>
                    )}
                </aside>
            </div>
        </MachinePage>
    );
}
