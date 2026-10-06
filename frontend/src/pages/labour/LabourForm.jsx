import React, { useEffect, useState } from "react";
import {
  useAddLabourMutation,
  useUpdateLabourMutation,
  useGetLabourByIdQuery,
  useGetNextLabourIdQuery,
} from "../../Reduxe/Api";
import { motion } from "framer-motion";
import { X, Save, User, Phone, MapPin, HardHat, Wallet, Gauge, Loader2, Sparkles, Fingerprint } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckRole } from "../../helper/CheckRole";
import { getPermissions } from "../../helper/permissions";

const inputCls =
  "w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";
const selectCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";

const LabourForm = ({ labourId, onClose, onSave }) => {
  const navigate = useNavigate();
  const { role } = CheckRole();
  const permissions = getPermissions(role);

  useEffect(() => {
    if (permissions.isAdmin) {
      toast.error("Admins have view & monitoring access only. Labour profile management is an operational manager task.");
      navigate("/LabourDashboard", { replace: true });
    }
  }, [permissions.isAdmin, navigate]);

  const { data: labourData } = useGetLabourByIdQuery(labourId, { skip: !labourId });
  const isEditMode = !!labourId;
  const { data: nextIdData } = useGetNextLabourIdQuery(undefined, { skip: isEditMode });

  const [addLabour] = useAddLabourMutation();
  const [updateLabour] = useUpdateLabourMutation();

  const initialState = {
    labourId: "",
    name: "",
    labourType: "Permanent Labour",
    category: "Labour",
    wageType: "Daily",
    dailyWage: "",
    monthlySalary: "",
    skillLevel: "Unskilled",
    phone: "",
    address: "",
    projectAssigned: "",
    status: "Active",
  };

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (labourData?.data && isEditMode) {
      const labour = labourData.data;
      setFormData({
        ...labour,
        labourId: labour.labourId || "",
        projectAssigned: labour.projectAssigned?._id || "",
        dailyWage: labour.dailyWage?.toString() || "",
        monthlySalary: labour.monthlySalary?.toString() || "",
      });
    }
  }, [labourData, isEditMode]);

  useEffect(() => {
    if (formData.category === "Operator") {
      setFormData((prev) => ({ ...prev, skillLevel: "Skilled" }));
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    if (name === "dailyWage" || name === "monthlySalary") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 6) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      toast.error("Required fields missing!");
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error("Phone number must be 10 digits!");
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode) {
        await updateLabour({
          id: labourId,
          ...formData,
          dailyWage: Number(formData.dailyWage),
          monthlySalary: Number(formData.monthlySalary),
        }).unwrap();

        toast.success("Updated Successfully");
        navigate(-1);
      } else {
        const payload = {
          ...formData,
          labourId: formData.labourId || nextIdData?.nextLabourId || undefined,
          dailyWage: Number(formData.dailyWage),
          monthlySalary: Number(formData.monthlySalary),
          projectAssigned: formData.projectAssigned || null,
        };
        const res = await addLabour(payload).unwrap();
        const assignedId = res?.labour?.labourId || payload.labourId || "";
        toast.success(`Worker Added Successfully ${assignedId ? `(${assignedId})` : ""}`);
        navigate(-1);
      }

      // Guarded — this form is also mounted directly as a route with no
      // parent-supplied callbacks, so calling these unconditionally
      // used to throw right after a successful save.
      onSave?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.data?.message || "Error saving data!");
    } finally {
      setIsLoading(false);
    }
  };

  const displayLabourId = isEditMode
    ? formData.labourId || "LAB-CON-..."
    : nextIdData?.nextLabourId || "LAB-CON-001 (Auto)";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <HardHat size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{isEditMode ? "Edit Worker" : "Add New Worker"}</h2>
              <p className="text-xs text-indigo-100 mt-0.5">Unique Serial ID: {displayLabourId}</p>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* UNIQUE LABOUR ID BANNER */}
            <div className="bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/50 border border-indigo-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25 shrink-0">
                  <Fingerprint size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                    Labour Unique ID ({isEditMode ? "Assigned ID" : "Auto-Generated Serial"})
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-mono font-bold text-slate-900 tracking-wide">
                      {displayLabourId}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase">
                      {isEditMode ? "Fixed ID" : "Serial Wise"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 sm:text-right max-w-xs leading-relaxed">
                Unique serial ID assigned sequentially for all site attendance, transfers, and ledger tracking.
              </p>
            </div>

            {/* NAME + PHONE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone *</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={inputCls} />
                </div>
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address *</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Category + LabourType */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className={selectCls}>
                  <option value="Labour">Labour</option>
                  <option value="Mistri">Mistri</option>
                  <option value="Operator">Operator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
                <select name="labourType" value={formData.labourType} onChange={handleChange} className={selectCls}>
                  <option>Permanent Labour</option>
                  <option>Contract Labour</option>
                  <option>Permanent Mistri</option>
                  <option>Contract Mistri</option>
                  <option>Permanent Operator</option>
                  <option>Contract Operator</option>
                </select>
              </div>
            </div>

            {/* Skill */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Gauge size={13} /> Skill Level
              </label>
              <select
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleChange}
                className={`${selectCls} disabled:bg-gray-100 disabled:text-gray-400`}
                disabled={formData.category === "Operator"}
              >
                <option>Unskilled</option>
                <option>Semi-skilled</option>
                <option>Skilled</option>
              </select>
            </div>

            {/* Wage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Wallet size={13} /> Wage Type
                </label>
                <select name="wageType" value={formData.wageType} onChange={handleChange} className={selectCls}>
                  <option value="Daily">Daily</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              {formData.wageType === "Daily" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Daily Wage (₹)</label>
                  <input
                    type="text"
                    name="dailyWage"
                    value={formData.dailyWage}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              )}

              {formData.wageType === "Monthly" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monthly Salary (₹)</label>
                  <input
                    type="text"
                    name="monthlySalary"
                    value={formData.monthlySalary}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-70 text-white rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-indigo-900/20 transition-all"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isEditMode ? "Update" : "Add Worker"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LabourForm;
