import React, { useState } from 'react';
// import { ChevronDown, Plus, Info, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IoIosAddCircleOutline } from "react-icons/io";
import AddNewMember from '../components/AddNewMember';


// Sample data for the roles table
const rolesData = [
    { role: 'Admin', createdBy: 'Default', createdAgo: '5 years ago', lastUpdatedBy: 'Default', updatedAgo: 'a month ago', navigate: '/RolePermissionsPage' },
    { role: 'Collaborator Organisation', createdBy: 'Default', createdAgo: '5 years ago', lastUpdatedBy: 'Powerplay Support', updatedAgo: 'a month ago', navigate: '/RolePermissionsPage' },
    { role: 'PM', createdBy: 'Default', createdAgo: '5 years ago', lastUpdatedBy: 'Manu', updatedAgo: 'a month ago', navigate: '/RolePermissionsPage' },
    { role: 'Project On-site Team', createdBy: 'Default', createdAgo: '5 years ago', lastUpdatedBy: 'Powerplay Support', updatedAgo: '19 days ago', navigate: '/RolePermissionsPage' },
    { role: 'Designer', createdBy: 'Powerplay support', createdAgo: '4 years ago', lastUpdatedBy: 'Megha', updatedAgo: 'a month ago' },
    { role: 'Powerplay Site Team', createdBy: 'Powerplay support', createdAgo: '3 years ago', lastUpdatedBy: 'Divya Bundela', updatedAgo: 'a month ago', navigate: '/RolePermissionsPage' },
];



const UserRolesAndPermissions = () => {
    
    const navigate = useNavigate()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    // const [show, setShow] = useState(false);


    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };
    return (
        <div className="p-6">
            <div className=" mx-auto ">

                {/* --- Title and Subtitle --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4 mb-0 lg:mb-4 ">
                    {/* Left Content */}
                    <div className="flex-1">


                        <div className="  flex justify-between items-center mb-3">

                            <h1 className="text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent ">
                                User Roles & Permissions
                            </h1>
                        </div>
                        <p className="text-sm text-gray-600  sm:mb-0 sm:w-2/3">
                            Use Roles to organise your organisation members and customize their permissions. You can assign roles in the individual role page or{' '}
                            {/* <a className="text-blue-600 hover:underline">
                                Members page
                            </a>. */}
                        </p>
                    </div>

                    {/* Button */}
                    <div className="flex-shrink-0 flex justify-end w-full sm:w-auto mb-4 sm:mb-2">
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition-colors duration-200 w-full sm:w-auto justify-center"
                            onClick={toggleDrawer}
                        >
                            <IoIosAddCircleOutline size={20} className="flex-shrink-0" />
                            <span className="whitespace-nowrap font-medium">New Member</span>
                        </button>
                    </div>
                </div>





                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
                    <table className="min-w-full table-fixed">
                        {/* Table Header */}
                        <thead className="bg-blue-900 text-white text-sm font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left w-1/3 border-r border-gray-400">Role</th>
                                <th className="px-4 py-3 text-left w-1/3 border-r border-gray-400">Created By</th>
                                <th className="px-4 py-3 text-left w-1/3 border-r border-gray-400">Last Updated By</th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-gray-100">
                            {rolesData.map((roleItem, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                                    onClick={() => navigate(roleItem.navigate)}
                                >
                                    {/* Role */}
                                    <td className="px-4 py-3 text-blue-600 font-medium hover:underline border-r border-gray-200">
                                        {roleItem.role}
                                    </td>

                                    {/* Created By */}
                                    <td className="px-4 py-3 text-gray-700 border-r border-gray-200">
                                        <span className="font-medium">{roleItem.createdBy}</span>
                                        <span className="text-xs text-gray-500 ml-2">{roleItem.createdAgo}</span>
                                    </td>

                                    {/* Last Updated By */}
                                    <td className="px-4 py-3 text-gray-700 border-r border-gray-200">
                                        <span className="font-medium">{roleItem.lastUpdatedBy}</span>
                                        <span className="text-xs text-gray-500 ml-2">{roleItem.updatedAgo}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
            <AddNewMember isOpen={isDrawerOpen} onClose={toggleDrawer} />
        </div>
    );
};

export default UserRolesAndPermissions;