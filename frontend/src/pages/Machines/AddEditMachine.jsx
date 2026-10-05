import React, { useEffect, useState } from "react";
import {
    useAddMachineMutation,
    useUpdateMachineMutation,
    useGetMachineDetailsQuery,
} from "../../Reduxe/Api";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * Rewritten to match the real backend Machine schema (models/Machine.js) —
 * the previous version of this form posted fields (name, ownership,
 * vendorId, rateType, rentRate, internalRate, fuelType) that don't exist
 * anywhere in the Machine model or addMachine/updateMachine controllers,
 * so nothing it submitted was ever actually saved correctly. It also
 * called useGetMachineByIdQuery / useUpdateMachineMutation, neither of
 * which existed as real endpoints — both are now real
 * (GET/PUT /api/machines/:id).
 */
export default function AddEditMachine() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data } = useGetMachineDetailsQuery(id, { skip: !id });
    const [addMachine, { isLoading: adding }] = useAddMachineMutation();
    const [updateMachine, { isLoading: updating }] = useUpdateMachineMutation();

    const [form, setForm] = useState({
        machineNumber: "",
        brand: "",
        model: "",
        engineNumber: "",
        chassisNumber: "",
        machineType: "",
        ownedOrRented: "owned",
        hourlyRate: "",
        currentMeterReading: "",
        currentFuelLevel: "",
        rcExpiry: "",
        insuranceExpiry: "",
        notes: "",
    });

    const [files, setFiles] = useState({ photo: null, rcFile: null, insuranceFile: null });

    useEffect(() => {
        if (id && data?.machine) {
            const m = data.machine;
            setForm({
                machineNumber: m.machineNumber || "",
                brand: m.brand || "",
                model: m.model || "",
                engineNumber: m.engineNumber || "",
                chassisNumber: m.chassisNumber || "",
                machineType: m.machineType || "",
                ownedOrRented: m.ownedOrRented || "owned",
                hourlyRate: m.hourlyRate || "",
                currentMeterReading: m.currentMeterReading || "",
                currentFuelLevel: m.currentFuelLevel || "",
                rcExpiry: m.rcExpiry ? m.rcExpiry.slice(0, 10) : "",
                insuranceExpiry: m.insuranceExpiry ? m.insuranceExpiry.slice(0, 10) : "",
                notes: m.notes || "",
            });
        }
    }, [id, data]);

    const handleFileChange = (e) => {
        const { name, files: fileList } = e.target;
        setFiles((prev) => ({ ...prev, [name]: fileList?.[0] || null }));
    };

    const buildFormData = () => {
        const fd = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) fd.append(key, value);
        });
        Object.entries(files).forEach(([key, file]) => {
            if (file) fd.append(key, file);
        });
        return fd;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.machineNumber || !form.machineType) {
            toast.error("Machine number and type are required");
            return;
        }

        try {
            const fd = buildFormData();
            if (id) {
                await updateMachine({ id, formData: fd }).unwrap();
                toast.success("Machine updated successfully");
            } else {
                await addMachine(fd).unwrap();
                toast.success("Machine added successfully");
            }
            navigate("/machine/list");
        } catch (err) {
            toast.error(err?.data?.message || "Error saving machine");
        }
    };

    const isLoading = adding || updating;

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">
                {id ? "Update Machine" : "Add Machine"}
            </h1>

            <form
                className="space-y-4 bg-white p-6 rounded-lg shadow"
                onSubmit={handleSubmit}
            >
                <input
                    type="text"
                    placeholder="Machine Number (e.g. plate/registration) *"
                    value={form.machineNumber}
                    className="border p-2 w-full rounded"
                    onChange={(e) => setForm({ ...form, machineNumber: e.target.value })}
                    required
                />

                <input
                    type="text"
                    placeholder="Machine Type (e.g. Excavator, Truck) *"
                    value={form.machineType}
                    className="border p-2 w-full rounded"
                    onChange={(e) => setForm({ ...form, machineType: e.target.value })}
                    required
                />

                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        placeholder="Brand / Manufacturer"
                        value={form.brand}
                        className="border p-2 rounded"
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Model"
                        value={form.model}
                        className="border p-2 rounded"
                        onChange={(e) => setForm({ ...form, model: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <input
                        type="number"
                        placeholder="Hourly Rate (₹)"
                        value={form.hourlyRate}
                        className="border p-2 rounded"
                        onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Meter (hrs)"
                        value={form.currentMeterReading}
                        className="border p-2 rounded"
                        onChange={(e) => setForm({ ...form, currentMeterReading: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Fuel (L)"
                        value={form.currentFuelLevel}
                        className="border p-2 rounded"
                        onChange={(e) => setForm({ ...form, currentFuelLevel: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        placeholder="Engine Number"
                        value={form.engineNumber}
                        className="border p-2 rounded"
                        onChange={(e) => setForm({ ...form, engineNumber: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Chassis Number"
                        value={form.chassisNumber}
                        className="border p-2 rounded"
                        onChange={(e) => setForm({ ...form, chassisNumber: e.target.value })}
                    />
                </div>

                <select
                    className="border p-2 w-full rounded"
                    value={form.ownedOrRented}
                    onChange={(e) => setForm({ ...form, ownedOrRented: e.target.value })}
                >
                    <option value="owned">Owned</option>
                    <option value="rented">Rented</option>
                </select>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">RC Expiry</label>
                        <input
                            type="date"
                            className="border p-2 rounded w-full"
                            value={form.rcExpiry}
                            onChange={(e) => setForm({ ...form, rcExpiry: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Insurance Expiry</label>
                        <input
                            type="date"
                            className="border p-2 rounded w-full"
                            value={form.insuranceExpiry}
                            onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })}
                        />
                    </div>
                </div>

                <textarea
                    placeholder="Notes"
                    className="border p-2 w-full rounded"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />

                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Photo</label>
                        <input type="file" name="photo" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">RC File</label>
                        <input type="file" name="rcFile" accept="image/*,.pdf" onChange={handleFileChange} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Insurance File</label>
                        <input type="file" name="insuranceFile" accept="image/*,.pdf" onChange={handleFileChange} />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full disabled:opacity-60"
                >
                    {isLoading ? "Saving..." : id ? "Update" : "Save"}
                </button>
            </form>
        </div>
    );
}
