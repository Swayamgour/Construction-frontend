import React, { useState, useEffect } from "react";
import { Camera, Save, UserCircle2, ArrowLeft, Mail, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserDetailQuery } from "../Reduxe/Api";
import { getInitials, getAvatarGradient } from "../helper/avatar";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);

  const { data, isLoading } = useUserDetailQuery();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  // 💡 Set form values from API response
  useEffect(() => {
    if (data?.user) {
      setForm({
        name: data?.user?.name || "",
        email: data?.user?.email || "",
        phone: data?.user?.phone || "",
        role: data?.user?.role || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) setImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleSave = () => {
    // 🟢 Here you can send update API later
    toast.success("Profile updated");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3 text-gray-500">
        <Loader2 className="animate-spin" size={24} />
        <p className="text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
        {/* Gradient banner */}
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 flex items-center gap-2 text-white/90 hover:text-white bg-black/10 hover:bg-black/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowLeft size={15} /> Back
          </button>
        </div>

        <div className="px-6 sm:px-8 pb-8">
          {/* Avatar overlapping the banner */}
          <div className="flex flex-col items-center -mt-14 mb-6">
            <div className="relative w-28 h-28 rounded-full shadow-lg border-4 border-white overflow-hidden">
              {image ? (
                <img src={image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-white text-3xl font-bold bg-gradient-to-br ${getAvatarGradient(form.name)}`}
                >
                  {getInitials(form.name)}
                </div>
              )}
            </div>

            <label className="mt-3 flex items-center gap-2 text-sm text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors font-medium">
              <Camera size={15} /> Change Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>

            <h2 className="mt-3 text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserCircle2 size={20} className="text-indigo-500" /> {form.name || "Your Profile"}
            </h2>
            {form.role && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 capitalize">
                <ShieldCheck size={12} /> {form.role}
              </span>
            )}
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-600">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-600 flex items-center gap-1.5">
                <Mail size={13} /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-600 flex items-center gap-1.5">
                <Phone size={13} /> Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-600">Role</label>
              <input
                type="text"
                name="role"
                value={form.role}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 capitalize cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 rounded-xl shadow-lg shadow-indigo-900/20 transition-all font-semibold"
          >
            <Save size={16} /> Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
