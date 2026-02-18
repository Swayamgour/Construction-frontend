import React, { useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import Drawer from '../helper/Drawer';
// import Drawer from './Drawer'; // Import the reusable Drawer component

const CreateProjectForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    startDate: '',
    endDate: '',
    addressLine: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Add logic to submit data to your backend
    onClose(); // Close the drawer after submission (or success)
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create Project"
      // widthClass="w-full md:w-2/5 lg:w-1/3" // Responsive width
      widthClass="w-full md:w-2/5 lg:w-1/3"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Details Section */}
        <div className="space-y-6">

          {/* Project Name */}
          <div className="flex items-center gap-4">
            <label className="w-1/3 text-sm font-medium uppercase text-gray-500">
              Project Name
            </label>
            <input
              type="text"
              name="projectName"
              placeholder="Project Name"
              value={formData.projectName}
              onChange={handleChange}
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div className="flex items-start gap-4">
            <label className="w-1/3 text-sm font-medium uppercase text-gray-500 mt-2">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date Fields */}
          <div className="flex items-center gap-4">
            <label className="w-1/3 text-sm font-medium uppercase text-gray-500">
              Start Dates
            </label>
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => (e.target.type = 'text')}
                  name="startDate"
                  placeholder="Start Date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 pr-10"
                  required
                />
                <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-1/3 text-sm font-medium uppercase text-gray-500">
              End Dates
            </label>
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => (e.target.type = 'text')}
                  name="endDate"
                  placeholder="End Date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

            </div>
          </div>
        </div>

        {/* Project Address & Contact */}
        <div className="flex flex-col items-start gap-4">
          <label className="w-1/3 text-sm font-medium uppercase text-gray-500 mt-2">
            Address & Contact
          </label>
          <div className="w-full space-y-4">
            <div className="p-3 border border-dashed border-gray-300 rounded flex justify-between items-center text-sm">
              <span>
                **Add map location & site radius**
                <p className="text-xs text-gray-500 mt-0.5">
                  Required to Set up Attendance. You can add later as well
                </p>
              </span>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Add
              </button>
            </div>

            <div>
              <input
                type="text"
                name="addressLine"
                placeholder="Address Line"
                value={formData.addressLine}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>


          </div>
        </div>

        {/* Create Project Button */}
        <div className="pt-4 border-t sticky bottom-0 bg-white">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            CREATE PROJECT
          </button>
        </div>
      </form>

    </Drawer>
  );
};

export default CreateProjectForm;