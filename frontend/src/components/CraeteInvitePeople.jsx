import React, { useState } from 'react'
import DialogBox from '../helper/DialogBox'
import { X, Plus } from 'lucide-react'; // Assuming lucide-react for icons
import { HiOutlineX, HiOutlinePlus } from "react-icons/hi";

function CraeteInvitePeople({ isOpen, onClose }) {

    const [members, setMembers] = useState([{ name: '', phone: '', role: '' }]);

    const handleAddMember = () => {
        setMembers([...members, { name: '', phone: '', role: '' }]);
    };

    const handleChange = (index, field, value) => {
        const newMembers = [...members];
        newMembers[index][field] = value;
        setMembers(newMembers);
    };

    const handleSubmit = () => {
        // e.preventDefault();
        console.log('Inviting members:');
        // Here you would typically send the data to your backend
        onClose(); // Close the modal after submission
    };

    return (






        <DialogBox
            isOpen={isOpen}
            onClose={onClose}
            title={null} // Remove default title bar if DialogBox renders it
            className="relative"
        >
            {/* Custom Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
                <HiOutlineX className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Invite Members to Project
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 w-full">
                {members.map((member, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">

                        {/* Name Input - Full width */}
                        <div className="flex flex-col w-full">
                            <label className="text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter name"
                                value={member.name}
                                onChange={(e) => handleChange(index, "name", e.target.value)}
                                className="border border-gray-300 p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition"
                            />
                        </div>

                        {/* Phone & Role - Full width stacked */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            {/* Phone */}
                            <div className="flex flex-1 border rounded-xl overflow-hidden shadow-sm w-full">
                                <span className="flex px-3 bg-gray-100 justify-center items-center text-gray-600 font-medium">
                                    +91
                                </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={member.phone}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d{0,10}$/.test(value)) {
                                            handleChange(index, "phone", value);
                                        }
                                    }}
                                    className="flex-grow p-3 outline-none w-full"
                                    placeholder="Enter 10-digit number"
                                />
                            </div>

                            {/* Role */}
                            <select
                                value={member.role}
                                onChange={(e) => handleChange(index, "role", e.target.value)}
                                className="flex-1 border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
                            >
                                <option value="">Select Role</option>
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Member">Member</option>
                            </select>
                        </div>
                    </div>
                ))}

                {/* Invite More Button */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleAddMember}
                        className="bg-blue-600 text-white flex items-center px-5 py-3 rounded-2xl shadow-md hover:bg-blue-700 transition-all font-semibold"
                    >
                        <HiOutlinePlus className="w-5 h-5 mr-2" /> Invite More
                    </button>
                </div>
            </form>
        </DialogBox>





    )
}

export default CraeteInvitePeople