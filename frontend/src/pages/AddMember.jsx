import React, { useState } from 'react';
import { ChevronDown, Plus, XCircle } from 'lucide-react';
import CraeteInvitePeople from '../components/CraeteInvitePeople';
import { MdDelete } from "react-icons/md";
import { IoIosAddCircleOutline } from 'react-icons/io';

// import { ChevronDown } from "react-feather"; // or any icon you like

// Sample data to populate the table
const membersData = [
  {
    name: 'Mayurkumar M Yewale',
    contact: '+91-9510526285',
    email: 'project@raghavuslifestyle.com',
    role: 'Admin',
    invitationStatus: 'Accepted',
    actionsToTrack: 'No action assigned',
  },
  {
    name: 'Chaitali Mhaske',
    contact: '+91-8369182298',
    email: 'chaitali.mhaske@bird-engineering.com',
    role: 'Admin',
    invitationStatus: 'Accepted',
    actionsToTrack: 'No action assigned',
  },
  {
    name: 'Lokesh',
    contact: '+91-8073504788',
    email: 'lokeshsharma6311@gmail.com',
    role: 'Admin',
    invitationStatus: 'Accepted',
    actionsToTrack: 'No action assigned',
  },
  {
    name: 'Akshat Agrawal',
    contact: '+91-8113275695',
    email: 'akshat.a@getpowerplay.in',
    role: 'Admin',
    invitationStatus: 'Accepted',
    actionsToTrack: 'No action assigned',
  },
  {
    name: 'Rishav',
    contact: '+91-9800005206',
    email: 'rishav.c@getpowerplay.in',
    role: 'Admin',
    invitationStatus: 'Accepted',
    actionsToTrack: 'No action assigned',
  },
  {
    name: 'abc',
    contact: '+91-9819853893',
    email: 'abc.abc@example.com', // Added a placeholder email for completeness
    role: 'Admin',
    invitationStatus: 'Accepted',
    actionsToTrack: 'No action assigned',
  },
];

const AddMember = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("S S Construction");
  const [active, setActive] = useState('AllMembers')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const options = ["S S Construction", "A B Builders", "X Y Constructions"];

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
  };


  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  return (
    <div className="min-h-screen p-4 sm:p-3 md:p-4 lg:p-6 "> {/* Increased padding for better spacing */}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation (Modernized) */}

        <div className='flex justify-between items-center mb-6'>
          <h1 className="text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent mb-3">
            All Member
          </h1>


          <div className="relative w-64 ">
            {/* Dropdown Input */}
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-white border border-gray-300 p-2.5 rounded-lg cursor-pointer flex justify-between items-center text-gray-700 shadow-sm transition-all duration-150 hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
              tabIndex={0}
            >
              <span className='font-medium'>{selected}</span>
              <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {/* Dropdown Menu */}
            {isOpen && (
              <ul className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 ">
                {options.map((option) => (
                  <li
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="px-3 py-2 cursor-pointer text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* <div className="flex space-x-6  sm:flex-col  bg-white rounded-t-lg shadow-sm  items-center justify-between "> */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 bg-white rounded-t-lg shadow-sm items-center sm:flex-end justify-between p-4">
          {/* <!-- Items yahan -->
          </div> */}

          <div className='flex space-x-6 bg-white rounded-t-lg shadow-sm  items-center'>
            <div
              onClick={() => setActive('AllMembers')}
              className={`py-2 text-base cursor-pointer font-semibold transition-colors ${active === 'AllMembers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              All Members
            </div>
            <div
              onClick={() => setActive('Members')}
              className={`py-2 text-base cursor-pointer font-semibold transition-colors ${active === 'Members' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Members By Project
            </div>
          </div>

          <button
            onClick={toggleDrawer}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:bg-blue-700 transition-colors"
          >
            <IoIosAddCircleOutline size={20} />
            Add Member
          </button>
        </div>

        {/* Project Selection and Add Members Button (Modernized) */}
        <div className='flex justify-between w-full mb-6 items-center'>


          {/* Add Member Button */}

        </div>


        <CraeteInvitePeople
          isOpen={isDrawerOpen}
          onClose={toggleDrawer}
        />



        {/* Members Table Card (Matching Dashboard Table Style) */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Header: Dark Blue Background like the Payment History table */}
              <thead className="bg-blue-900">
                <tr>
                  {/* Borders: border-b border-r border-gray-200 on headers */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-200">
                    Actions to track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-200">
                    Member Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-200">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider border-b border-r border-gray-200">
                    Invitation Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider border-b border-gray-200 w-20">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {membersData.map((member, index) => (
                  <tr
                    key={index}
                    className={`hover: transition-colors ${index % 2 === 0 ? 'bg-white' : '/70'}`}
                  >
                    {/* Borders: border-r border-gray-200 on cells */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic border-r border-gray-200">
                      {member.actionsToTrack}
                    </td>
                    <td className="px-6 py-3 border-r border-gray-200">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm">
                          {member.name}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {member.contact}
                        </span>
                        <span className="text-blue-600 text-xs truncate">
                          {member.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {member.invitationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        aria-label="Remove member"
                        className='text-red-500 hover:text-red-700 p-1 rounded-full transition-colors'
                      >
                        <MdDelete className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


      </div>
    </div >
  );
};

export default AddMember;