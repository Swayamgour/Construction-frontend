import React, { useEffect, useState } from "react";
import {
    useAddMachineMutation,
    useUpdateMachineMutation,
    useGetMachineByIdQuery,
} from "../../Reduxe/Api";
import { useNavigate, useParams } from "react-router-dom";

export default function AddEditMachine() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data } = useGetMachineByIdQuery(id, { skip: !id });
    const [addMachine] = useAddMachineMutation();
    const [updateMachine] = useUpdateMachineMutation();

    const [form, setForm] = useState({
        name: "",
        machineType: "",
        ownership: "Owned",
        vendorId: "",
        rateType: "Hour",
        rentRate: "",
        internalRate: "",
        fuelType: "Diesel",
    });

    useEffect(() => {
        if (id && data?.data) setForm(data.data);
    }, [id, data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (id) {
            await updateMachine({ id, ...form });
        } else {
            await addMachine(form);
        }
        navigate("/machines");
    };

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
                    placeholder="Machine Name"
                    value={form.name}
                    className="border p-2 w-full rounded"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />

                <input
                    type="text"
                    placeholder="Machine Type (JCB, Roller...)"
                    value={form.machineType}
                    className="border p-2 w-full rounded"
                    onChange={(e) => setForm({ ...form, machineType: e.target.value })}
                    required
                />

                {/* Ownership */}
                <select
                    value={form.ownership}
                    className="border p-2 w-full rounded"
                    onChange={(e) => setForm({ ...form, ownership: e.target.value })}
                >
                    <option value="Owned">Owned</option>
                    <option value="Rented">Rented</option>
                </select>

                {/* Vendor Field only on rented */}
                {form.ownership === "Rented" && (
                    <input
                        type="text"
                        placeholder="Vendor ID (Temporary)"
                        className="border p-2 w-full rounded"
                        value={form.vendorId}
                        onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                        required
                    />
                )}

                {/* Rate Input */}
                <div className="grid grid-cols-2 gap-3">
                    <select
                        className="border p-2 rounded"
                        value={form.rateType}
                        onChange={(e) => setForm({ ...form, rateType: e.target.value })}
                    >
                        <option value="Hour">Hour</option>
                        <option value="Day">Day</option>
                        <option value="Month">Month</option>
                    </select>

                    <input
                        type="number"
                        placeholder={form.ownership === "Rented" ? "Rent Rate" : "Internal Rate"}
                        className="border p-2 rounded w-full"
                        value={form.ownership === "Rented" ? form.rentRate : form.internalRate}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                [form.ownership === "Rented" ? "rentRate" : "internalRate"]:
                                    e.target.value,
                            })
                        }
                    />
                </div>

                {/* Fuel Type */}
                <select
                    className="border p-2 w-full rounded"
                    value={form.fuelType}
                    onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                    <option value="NA">NA</option>
                </select>

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
                >
                    {id ? "Update" : "Save"}
                </button>
            </form>
        </div>
    );
}
