import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAddMachineMutation, useGetVendorsQuery } from "../../Reduxe/Api";
import { CheckRole } from "../../helper/CheckRole";
import { getMachinePermissions } from "../../helper/machinePermissions";
import {
    MachinePage,
    Section,
    Field,
    FileInput,
    inputCls,
    MACHINE_STATUSES,
    btnPrimary,
    btnGhost,
} from "../../components/machine/machineUi";

const MACHINE_TYPES = ["Excavator", "JCB / Backhoe", "Crane", "Roller", "Dumper / Truck", "Concrete Mixer", "Loader", "Bulldozer", "Grader", "Generator", "Compressor", "Other"];

const INITIAL = {
    machineNumber: "", machineType: "", brand: "", model: "",
    engineNumber: "", chassisNumber: "", purchaseDate: "",
    status: "Available", ownedOrRented: "owned",
    hourlyRate: "", dailyRate: "", monthlyRate: "",
    currentMeterReading: "", currentFuelLevel: "",
    rcExpiry: "", insuranceExpiry: "", notes: "",
    // rented only
    vendorId: "", rentalRate: "", rateType: "PER_DAY", contractStart: "", contractEnd: "",
    securityDeposit: "", transportCost: "", operatorProvidedBy: "Vendor", vendorRemarks: "",
};

export default function AddMachine() {
    const navigate = useNavigate();
    const { role } = CheckRole();
    const permissions = getMachinePermissions(role);

    useEffect(() => {
        if (permissions.isAdmin) {
            toast.error("Admins have view & approval access only. Operational creation is reserved for Managers.");
            navigate("/machine/list", { replace: true });
        }
    }, [permissions.isAdmin, navigate]);

    const [form, setForm] = useState(INITIAL);
    const [files, setFiles] = useState({ photo: null, rcFile: null, insuranceFile: null });
    const [addMachine, { isLoading }] = useAddMachineMutation();
    const { data: vendorResp } = useGetVendorsQuery({ limit: 200 });
    const vendors = vendorResp?.data || [];

    const rented = form.ownedOrRented === "rented";
    const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.machineNumber.trim() || !form.machineType) return toast.error("Machine number and type are required");
        if (rented && !form.vendorId) return toast.error("Select the vendor for a rented machine");

        const fd = new FormData();
        const direct = ["machineNumber", "machineType", "brand", "model", "engineNumber", "chassisNumber", "purchaseDate",
            "status", "ownedOrRented", "hourlyRate", "dailyRate", "monthlyRate", "currentMeterReading", "currentFuelLevel",
            "rcExpiry", "insuranceExpiry", "notes"];
        direct.forEach((k) => form[k] !== "" && fd.append(k, form[k]));

        if (rented) {
            fd.append("vendorId", form.vendorId);
            fd.append("rentalDetails", JSON.stringify({
                rentalRate: Number(form.rentalRate) || 0,
                rateType: form.rateType,
                contractStart: form.contractStart || null,
                contractEnd: form.contractEnd || null,
                securityDeposit: Number(form.securityDeposit) || 0,
                transportCost: Number(form.transportCost) || 0,
                operatorProvidedBy: form.operatorProvidedBy,
                vendorRemarks: form.vendorRemarks,
            }));
        }
        Object.entries(files).forEach(([k, f]) => f && fd.append(k, f));

        try {
            await addMachine(fd).unwrap();
            toast.success("Machine added");
            navigate("/machine/list");
        } catch (err) {
            toast.error(err?.data?.message || err?.data?.error || "Failed to add machine");
        }
    };

    return (
        <MachinePage title="Add Machine" subtitle="Register a new machine in the fleet">
            <form onSubmit={handleSubmit} className="space-y-5">
                <Section title="Basic details">
                    <Field label="Machine number / plate" required><input name="machineNumber" value={form.machineNumber} onChange={set} className={inputCls} placeholder="e.g. MH12-AB-1234" /></Field>
                    <Field label="Machine type" required>
                        <select name="machineType" value={form.machineType} onChange={set} className={inputCls}>
                            <option value="">Select type</option>
                            {MACHINE_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                    </Field>
                    <Field label="Brand"><input name="brand" value={form.brand} onChange={set} className={inputCls} placeholder="e.g. JCB, CAT, Tata" /></Field>
                    <Field label="Model"><input name="model" value={form.model} onChange={set} className={inputCls} /></Field>
                    <Field label="Engine number"><input name="engineNumber" value={form.engineNumber} onChange={set} className={inputCls} /></Field>
                    <Field label="Chassis number"><input name="chassisNumber" value={form.chassisNumber} onChange={set} className={inputCls} /></Field>
                    <Field label="Status">
                        <select name="status" value={form.status} onChange={set} className={inputCls}>
                            {MACHINE_STATUSES.filter((s) => s !== "Assigned").map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </Field>
                    <Field label="Ownership">
                        <select name="ownedOrRented" value={form.ownedOrRented} onChange={set} className={inputCls}>
                            <option value="owned">Company owned</option>
                            <option value="rented">Rented from vendor</option>
                        </select>
                    </Field>
                    {!rented && <Field label="Purchase date"><input type="date" name="purchaseDate" value={form.purchaseDate} onChange={set} className={inputCls} /></Field>}
                </Section>

                <Section title="Rates & readings" hint="Used to calculate machine usage cost from operator logs">
                    <Field label="Hourly rate (₹)"><input type="number" min="0" name="hourlyRate" value={form.hourlyRate} onChange={set} className={inputCls} /></Field>
                    <Field label="Daily rate (₹)"><input type="number" min="0" name="dailyRate" value={form.dailyRate} onChange={set} className={inputCls} /></Field>
                    <Field label="Monthly rate (₹)"><input type="number" min="0" name="monthlyRate" value={form.monthlyRate} onChange={set} className={inputCls} /></Field>
                    <span className="hidden sm:block" />
                    <Field label="Current meter reading (hrs)"><input type="number" min="0" name="currentMeterReading" value={form.currentMeterReading} onChange={set} className={inputCls} /></Field>
                    <Field label="Current fuel level (L)"><input type="number" min="0" name="currentFuelLevel" value={form.currentFuelLevel} onChange={set} className={inputCls} /></Field>
                </Section>

                {rented && (
                    <Section title="Rental details" hint="Vendor contract information">
                        <Field label="Vendor" required>
                            <select name="vendorId" value={form.vendorId} onChange={set} className={inputCls}>
                                <option value="">Select vendor</option>
                                {vendors.map((v) => <option key={v._id} value={v._id}>{v.companyName || v.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Operator provided by">
                            <select name="operatorProvidedBy" value={form.operatorProvidedBy} onChange={set} className={inputCls}>
                                <option>Company</option><option>Vendor</option>
                            </select>
                        </Field>
                        <Field label="Rental rate (₹)"><input type="number" min="0" name="rentalRate" value={form.rentalRate} onChange={set} className={inputCls} /></Field>
                        <Field label="Rate type">
                            <select name="rateType" value={form.rateType} onChange={set} className={inputCls}>
                                <option value="PER_HOUR">Per hour</option><option value="PER_DAY">Per day</option>
                                <option value="PER_MONTH">Per month</option><option value="FIXED_CONTRACT">Fixed contract</option>
                            </select>
                        </Field>
                        <Field label="Contract start"><input type="date" name="contractStart" value={form.contractStart} onChange={set} className={inputCls} /></Field>
                        <Field label="Contract end"><input type="date" name="contractEnd" value={form.contractEnd} onChange={set} className={inputCls} /></Field>
                        <Field label="Security deposit (₹)"><input type="number" min="0" name="securityDeposit" value={form.securityDeposit} onChange={set} className={inputCls} /></Field>
                        <Field label="Transport cost (₹)"><input type="number" min="0" name="transportCost" value={form.transportCost} onChange={set} className={inputCls} /></Field>
                        <Field label="Vendor remarks" full><input name="vendorRemarks" value={form.vendorRemarks} onChange={set} className={inputCls} /></Field>
                    </Section>
                )}

                <Section title="Documents & photo" hint="RC and insurance expiry dates trigger reminders on the dashboard">
                    <Field label="RC expiry"><input type="date" name="rcExpiry" value={form.rcExpiry} onChange={set} className={inputCls} /></Field>
                    <Field label="Insurance expiry"><input type="date" name="insuranceExpiry" value={form.insuranceExpiry} onChange={set} className={inputCls} /></Field>
                    <FileInput label="Machine photo" accept="image/*" file={files.photo} onChange={(f) => setFiles((x) => ({ ...x, photo: f }))} />
                    <FileInput label="RC file" accept=".pdf,image/*" file={files.rcFile} onChange={(f) => setFiles((x) => ({ ...x, rcFile: f }))} />
                    <FileInput label="Insurance file" accept=".pdf,image/*" file={files.insuranceFile} onChange={(f) => setFiles((x) => ({ ...x, insuranceFile: f }))} />
                    <Field label="Notes" full><textarea name="notes" rows={3} value={form.notes} onChange={set} className={inputCls} /></Field>
                </Section>

                <div className="flex justify-end gap-3">
                    <button type="button" className={btnGhost} onClick={() => navigate("/machine/list")}>Cancel</button>
                    <button type="submit" disabled={isLoading} className={btnPrimary}>{isLoading ? "Saving..." : "Save Machine"}</button>
                </div>
            </form>
        </MachinePage>
    );
}
