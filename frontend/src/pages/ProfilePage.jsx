import React, { useState, useEffect } from "react";
import { FaCamera, FaSave, FaUser, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUserDetailQuery } from "../Reduxe/Api";

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
        console.log("Profile Updated:", form);
        // 🟢 Here you can send update API later
    };

    if (isLoading) {
        return <p className="text-center mt-10">Loading profile...</p>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-start">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8 border border-gray-100 animate-fadeIn">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
                >
                    <FaArrowLeft /> Back
                </button>

                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                    <FaUser className="text-blue-600" /> Your Profile
                </h2>

                {/* Profile Image */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-md border-4 border-gray-200">
                        <img
                            src={image || 'profile.png'}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <label className="mt-3 flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:text-blue-800 transition">
                        <FaCamera /> Change Photo
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-600">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-600">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-600">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-600">Role</label>
                        <input
                            type="text"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            disabled
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="mt-8 w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-xl shadow-lg hover:opacity-90 transition"
                >
                    <FaSave /> Save Profile
                </button>
            </div>
        </div>
    );
}
