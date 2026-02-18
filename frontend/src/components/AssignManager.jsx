import React, { useState } from 'react'
import DialogBox from '../helper/DialogBox'
import { HiOutlineX } from "react-icons/hi";
import { useAssignManagerMutation, useGetRolesQuery, useAssignSupervisorMutation } from '../Reduxe/Api';
import toast from 'react-hot-toast';

function AssignManager({ isOpen, onClose, id, selectManager }) {

    // console.log(id)

    const [selectedValue, setSelectedValue] = useState("");
    const { data: roleData } = useGetRolesQuery();

    const [AssignManager] = useAssignManagerMutation()
    const [AssignSupervisor] = useAssignSupervisorMutation()

    const handleSubmit = (e) => {
        e.preventDefault();

        let body = {
            projectId: id,
            managerId: selectedValue
        }
        let bodySupervisor = {
            projectId: id,
            supervisorId: selectedValue
        }

        // console.log(selectedValue)

        if (!selectedValue) {
            toast.error("Please select an option")
        } else {
            // alert("Please select an option");
            if (selectManager === 'supervisor') {
                AssignSupervisor(bodySupervisor)
            } else {
                AssignManager(body)
            }
        }

        // console.log("Selected:", selectedValue);
        onClose();
    };

    return (
        <DialogBox
            isOpen={isOpen}
            onClose={onClose}
            title={null}
            className="relative"
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
                <HiOutlineX className="w-6 h-6" />
            </button>

            <h2 className="text-lg font-bold text-center text-gray-800 mb-5">
                {/* Select Manager / Supervisor */}
                Select {selectManager === 'manager' ? 'Manager' : 'Supervisor'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* {console.log(roleData)} */}

                <select
                    value={selectedValue}
                    onChange={(e) => setSelectedValue(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    <option value="">Select Manager or Supervisor</option>

                    {roleData?.map((role) => (
                        <option
                            key={role._id}
                            value={role._id}
                        >
                            {role.name} ({role.role}) {role.email}
                        </option>
                    ))}
                </select>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md"
                >
                    Save
                </button>
            </form>
        </DialogBox>
    );
}

export default AssignManager;
