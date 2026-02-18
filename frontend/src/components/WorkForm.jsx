import React, { useState } from "react";

const WorkForm = ({ categories, vendors, materials, onSubmit }) => {
  const [work, setWork] = useState({
    name: "",
    address: "",
    startDate: "",
    endDate: "",
    category: "",
    assignedVendors: [],
    assignedMaterials: [],
    progress: 0,
  });

  const handleChange = (e) => {
    setWork({ ...work, [e.target.name]: e.target.value });
  };

  const toggleVendor = (vendor) => {
    setWork((prev) => ({
      ...prev,
      assignedVendors: prev.assignedVendors.includes(vendor)
        ? prev.assignedVendors.filter((v) => v !== vendor)
        : [...prev.assignedVendors, vendor],
    }));
  };

  const toggleMaterial = (mat) => {
    setWork((prev) => ({
      ...prev,
      assignedMaterials: prev.assignedMaterials.includes(mat)
        ? prev.assignedMaterials.filter((m) => m !== mat)
        : [...prev.assignedMaterials, mat],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(work);
    setWork({
      name: "",
      address: "",
      startDate: "",
      endDate: "",
      category: "",
      assignedVendors: [],
      assignedMaterials: [],
      progress: 0,
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Add Work / Project</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={work.name}
          onChange={handleChange}
          placeholder="Work / Project Name"
          className="w-full border p-2 rounded-lg"
          required
        />
        <input
          name="address"
          value={work.address}
          onChange={handleChange}
          placeholder="Site Address"
          className="w-full border p-2 rounded-lg"
          required
        />
        <div className="grid md:grid-cols-2 gap-3">
          <input
            type="date"
            name="startDate"
            value={work.startDate}
            onChange={handleChange}
            className="border p-2 rounded-lg w-full"
          />
          <input
            type="date"
            name="endDate"
            value={work.endDate}
            onChange={handleChange}
            className="border p-2 rounded-lg w-full"
          />
        </div>

        <select
          name="category"
          value={work.category}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        >
          <option value="">Select Category</option>
          {categories?.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        {/* Vendors */}
        <div>
          <label className="font-medium text-gray-700">Assign Vendors:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {vendors?.map((v) => (
              <button
                key={v.name}
                type="button"
                onClick={() => toggleVendor(v.name)}
                className={`px-3 py-1 border rounded-full ${
                  work.assignedVendors.includes(v.name)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-blue-50"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div>
          <label className="font-medium text-gray-700">Assign Materials:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {/* {Object?.entries(materials)?.flatMap(([cat, mats]) =>
              mats?.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMaterial(m)}
                  className={`px-3 py-1 border rounded-full ${
                    work.assignedMaterials.includes(m)
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 hover:bg-green-50"
                  }`}
                >
                  {m}
                </button>
              ))
            )} */}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Save Work
        </button>
      </form>
    </div>
  );
};

export default WorkForm;
