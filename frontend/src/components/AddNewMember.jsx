import React, { useState } from 'react'
import Drawer from '../helper/Drawer'

function AddNewMember({ isOpen, onClose }) {

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        phone: "",
        email: "",
        address: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("New Member Data:", formData);

        // ✅ Here you will send API request later

        onClose(); // Close drawer after submit
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Member"
            widthClass="w-full md:w-2/5 lg:w-1/3"
        >

            <form className="space-y-5 p-4" onSubmit={handleSubmit}>

                {/* Name */}
                <div>
                    <label className="text-sm font-medium text-gray-700">Member Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter member name"
                        required
                    />
                </div>

                {/* Role / Work Type */}
                <div>
                    <label className="text-sm font-medium text-gray-700">Role / Work Type</label>
                    <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Mason, Carpenter, Supervisor"
                        required
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={10}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter phone number"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="text-sm font-medium text-gray-700">Email (Optional)</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="example@email.com"
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="text-sm font-medium text-gray-700">Address (Optional)</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter address"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                >
                    Add Member
                </button>
            </form>

        </Drawer>
    )
}

export default AddNewMember
