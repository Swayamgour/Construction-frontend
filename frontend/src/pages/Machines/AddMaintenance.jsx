import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAddMaintenanceMutation, useGetMachineDetailsQuery } from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";
import { getMachinePermissions } from "../../helper/machinePermissions";
import { MachinePage, Section, Field, FileInput, StatusBadge, inputCls, btnPrimary, btnGhost } from "../../components/machine/machineUi";

const SERVICE_TYPES = ["Routine Maintenance", "Oil Change", "Filter Replacement", "Brake Service", "Engine Repair", "Electrical Repair", "Tire Replacement", "Hydraulic Service", "Annual Service", "Emergency Repair", "Other"];

export default function AddMaintenance() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { role } = CheckRole();
    const permissions = getMachinePermissions(role);

    useEffect(() => {
        if (permissions.isAdmin) {
            toast.error("Admins have view & monitoring access only. Maintenance logging is handled by Managers.");
            navigate(`/machine/${id}`, { replace: true });
        }
    }, [permissions.isAdmin, navigate, id]);

    const { data } = useGetMachineDetailsQuery(id);
    const machine = data?.machine;
    const [addMaintenance, { isLoading }] = useAddMaintenanceMutation();
    const [bill, setBill] = useState(null);
    const [form, setForm] = useState({
        serviceType: "", serviceDate: new Date().toISOString().split("T")[0], vendorName: "",
        cost: "", labourCost: "", partsCost: "", nextServiceOn: "", description: "",
    });
    const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    const total = (Number(form.cost) || 0) + (Number(form.labourCost) || 0) + (Number(form.partsCost) || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.serviceType || !form.serviceDate) return toast.error("Service type and date are required");
        const fd = new FormData();
        fd.append("machineId", id);
        Object.entries(form).forEach(([k, v]) => v !== "" && fd.append(k, v));
        if (bill) fd.append("billFile", bill);
        try {
            await addMaintenance(fd).unwrap();
            toast.success("Maintenance recorded");
            navigate(`/machine/${id}`);
        } catch (err) {
            toast.error(err?.data?.message || "Failed to add maintenance");
        }
    };

    return (
        <MachinePage
            title="Add Maintenance"
            subtitle={machine ? `${machine.machineNumber} · ${machine.machineType || ""}` : "Record a service for this machine"}
            actions={machine && <StatusBadge status={machine.status} />}
        >
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Saving a record marks this machine as <b>Under Maintenance</b> so it cannot be assigned to a project until the service is closed.
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <Section title="Service details">
                    <Field label="Service type" required>
                        <select name="serviceType" value={form.serviceType} onChange={set} className={inputCls}>
                            <option value="">Select service type</option>
                            {SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                    </Field>
                    <Field label="Service date" required><input type="date" name="serviceDate" value={form.serviceDate} onChange={set} className={inputCls} /></Field>
                    <Field label="Vendor / workshop"><input name="vendorName" value={form.vendorName} onChange={set} className={inputCls} /></Field>
                    <Field label="Next service due" hint="Shows on the dashboard when it is close"><input type="date" name="nextServiceOn" value={form.nextServiceOn} onChange={set} className={inputCls} /></Field>
                    <Field label="Description / parts replaced" full><textarea name="description" rows={3} value={form.description} onChange={set} className={inputCls} /></Field>
                </Section>

                <Section title="Cost">
                    <Field label="Service cost (₹)"><input type="number" min="0" step="0.01" name="cost" value={form.cost} onChange={set} className={inputCls} /></Field>
                    <Field label="Labour cost (₹)"><input type="number" min="0" step="0.01" name="labourCost" value={form.labourCost} onChange={set} className={inputCls} /></Field>
                    <Field label="Parts cost (₹)"><input type="number" min="0" step="0.01" name="partsCost" value={form.partsCost} onChange={set} className={inputCls} /></Field>
                    <div className="flex items-end"><p className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-800">Total: <b>₹{total.toLocaleString("en-IN")}</b></p></div>
                    <FileInput label="Bill / invoice" accept=".pdf,image/*" file={bill} onChange={setBill} />
                </Section>

                <div className="flex justify-end gap-3">
                    <button type="button" className={btnGhost} onClick={() => navigate(`/machine/${id}`)}>Cancel</button>
                    <button type="submit" disabled={isLoading} className={btnPrimary}>{isLoading ? "Saving..." : "Save Record"}</button>
                </div>
            </form>
        </MachinePage>
    );
}
