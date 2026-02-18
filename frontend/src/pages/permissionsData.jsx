import React, { useState } from 'react';
import {
  HiPlus,
  HiUserGroup,
  HiShieldCheck,
  HiCog,
  HiChevronDown,
  HiSearch,
  HiFilter,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUserAdd
} from 'react-icons/hi';
import { IoIosAddCircleOutline } from 'react-icons/io';

const permissionsData = [
  {
    group: 'Progress Management',
    count: 4,
    icon: '📊',
    items: [
      {
        name: 'Task',
        toggle: true,
        view: false,
        create: true,
        edit: false,
        delete: false,
        morePermissions: 'Access to only assigned Task',
        description: 'Manage project tasks and assignments'
      },
      {
        name: 'Task Progress Updates',
        toggle: true,
        view: false,
        create: true,
        edit: false,
        delete: false,
        description: 'Update and track task completion status'
      },
      {
        name: 'Gantt',
        toggle: false,
        view: false,
        create: true,
        edit: false,
        delete: false,
        description: 'View and manage project timelines'
      },
      {
        name: 'Issue',
        toggle: true,
        view: false,
        create: true,
        edit: false,
        delete: false,
        description: 'Report and resolve project issues'
      },
    ],
  },
  {
    group: 'Financial Management',
    count: 3,
    icon: '💰',
    items: [
      {
        name: 'Budget',
        toggle: true,
        view: true,
        create: false,
        edit: false,
        delete: false,
        description: 'View project budgets and expenses'
      },
      {
        name: 'Invoices',
        toggle: true,
        view: true,
        create: true,
        edit: false,
        delete: false,
        description: 'Create and manage project invoices'
      },
      {
        name: 'Payments',
        toggle: false,
        view: true,
        create: false,
        edit: false,
        delete: false,
        description: 'Track payment records and status'
      },
    ],
  },
];

const RolePermissionsPage = () => {
  const [permissions, setPermissions] = useState(permissionsData);
  const [activeTab, setActiveTab] = useState('permissions');
  const [expandedGroups, setExpandedGroups] = useState([0]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = (groupIndex, itemIndex, field) => {
    const updatedPermissions = [...permissions];
    updatedPermissions[groupIndex].items[itemIndex][field] =
      !updatedPermissions[groupIndex].items[itemIndex][field];
    setPermissions(updatedPermissions);
  };

  const toggleGroup = (index) => {
    setExpandedGroups(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredPermissions = permissions.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* --- Enhanced Header --- */}
        <div className="bg-white rounded-3xl  border border-slate-200 p-8 mb-8 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
            <div className="flex items-start space-x-4 mb-6 lg:mb-0">
              {/* <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl ">
                PM
              </div> */}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
                    Project Manager
                  </h1>
                  <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-2xl border border-blue-200">
                    Default Role
                  </span>
                </div>
                <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
                  Project Manager has comprehensive project module access across both web and mobile platforms with advanced management capabilities.
                </p>
              </div>
            </div>
            {/* <button className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-2xl text-sm font-semibold  hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
              <HiOutlineUserAdd className="h-5 w-5 mr-2" />
              Add New Member
            </button> */}

            <button
              // onClick={toggleDrawer}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:bg-blue-700 transition-colors"
            >
              <IoIosAddCircleOutline size={20} />
              Add New Member
            </button>
          </div>

          {/* Role Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-200">
              <div className="text-2xl font-black text-blue-700">24</div>
              <div className="text-xs text-blue-600 font-semibold">Active Permissions</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-200">
              <div className="text-2xl font-black text-green-700">62</div>
              <div className="text-xs text-green-600 font-semibold">Team Members</div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-200">
              <div className="text-2xl font-black text-amber-700">8</div>
              <div className="text-xs text-amber-600 font-semibold">Projects</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 text-center border border-purple-200">
              <div className="text-2xl font-black text-purple-700">12</div>
              <div className="text-xs text-purple-600 font-semibold">Modules</div>
            </div>
          </div>
        </div>

        {/* --- Enhanced Tabs --- */}
        <div className="bg-white rounded-2xl  border border-slate-200 p-2 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('permissions')}
              className={`flex items-center px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${activeTab === 'permissions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
            >
              <HiShieldCheck className="h-4 w-4 mr-2" />
              Role Permissions
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${activeTab === 'members'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
            >
              <HiUserGroup className="h-4 w-4 mr-2" />
              Members (62)
            </button>
          </div>
        </div>

        {/* --- Enhanced Permissions Table --- */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl  border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-slate-300 p-3 pl-11 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 py-2.5 px-4 rounded-2xl text-sm font-semibold transition-all duration-300">
                    <HiFilter className="h-4 w-4 mr-2" />
                    Filter
                    <HiChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  <button className="flex items-center border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 py-2.5 px-4 rounded-2xl text-sm font-semibold transition-all duration-300">
                    <HiCog className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Permissions Groups */}

            <div className="space-y-4">
              {filteredPermissions.map((group, groupIndex) => (
                <div key={groupIndex} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {/* Group Header */}
                  <div
                    className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors duration-300"
                    onClick={() => toggleGroup(groupIndex)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl border border-slate-200">
                        {group.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{group.group}</h3>
                        <p className="text-slate-600 text-sm">{group.count} permissions</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${expandedGroups.includes(groupIndex)
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-blue-100 text-blue-700 border border-blue-300'
                          }`}
                      >
                        {expandedGroups.includes(groupIndex) ? 'Expanded' : 'Collapsed'}
                      </span>
                      <HiChevronDown
                        className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${expandedGroups.includes(groupIndex) ? 'rotate-180' : ''
                          }`}
                      />
                    </div>
                  </div>

                  {/* Permission Items with Smooth Transition */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedGroups.includes(groupIndex) ? 'max-h-[2000px]' : 'max-h-0'
                      }`}
                  >
                    <div className="divide-y divide-slate-100">
                      {group.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="p-6 hover:bg-slate-50/50 transition-colors duration-300">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                            {/* Permission Info */}
                            <div className="lg:col-span-4">
                              <div className="flex items-center space-x-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={item.toggle}
                                    onChange={() => handleToggle(groupIndex, itemIndex, 'toggle')}
                                    className="sr-only peer"
                                  />
                                  <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6 shadow-inner"></div>
                                </label>
                                <div>
                                  <h4 className="font-semibold text-slate-900 text-lg">{item.name}</h4>
                                  <p className="text-slate-600 text-sm mt-1">{item.description}</p>
                                </div>
                              </div>
                            </div>

                            {/* Permission Toggles */}
                            <div className="lg:col-span-6">
                              <div className="grid grid-cols-4 gap-4">
                                {[
                                  { key: 'view', label: 'View', icon: HiOutlineEye },
                                  { key: 'create', label: 'Create', icon: HiPlus },
                                  { key: 'edit', label: 'Edit', icon: HiOutlinePencil },
                                  { key: 'delete', label: 'Delete', icon: HiOutlineTrash }
                                ].map(({ key, label, icon: Icon }) => (
                                  <div key={key} className="flex flex-col items-center space-y-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          checked={item[key]}
                                          onChange={() => handleToggle(groupIndex, itemIndex, key)}
                                          className="sr-only peer"
                                        />
                                        <div
                                          className={`w-10 h-6 rounded-full transition-all duration-300 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 ${item[key] ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-slate-300'
                                            }`}
                                        ></div>
                                        <div
                                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${item[key] ? 'transform translate-x-4' : ''
                                            }`}
                                        ></div>
                                      </div>
                                    </label>
                                    <span className="text-xs font-medium text-slate-600">{label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* More Permissions */}
                            <div className="lg:col-span-2">
                              {item.morePermissions && (
                                <div className="text-right">
                                  <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center justify-end space-x-1 group">
                                    <span>More</span>
                                    <HiChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* --- Enhanced Members Tab --- */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-3xl  border border-slate-200 p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 ">
              <HiUserGroup className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">Team Members Management</h3>
            <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
              Manage and organize your team members assigned to this role with advanced permission controls.
            </p>
            <button className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-8 rounded-2xl text-sm font-semibold  hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
              <HiOutlineUserAdd className="h-5 w-5 mr-2" />
              Manage Team Members
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolePermissionsPage;