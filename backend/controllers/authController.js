import User from "../models/User.js";
import Labour from "../models/Labour.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import Attendance from "../models/Attendance.js";

import MachineAssignment from "../models/MachineAssignment.js";
// import Machine from "../models/Machine.js";
// import Labour from "../models/Labour.js";

import mongoose from "mongoose";
// import Labour from "../models/Labour.js";
// import Attendance from "../models/Attendance.js";
// import Project from "../models/Project.js";


// REGISTER USER
export const registerUser = async (req, res) => {
    try {
        const { name, phone, email, password, role } = req.body;

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashPass = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            phone,
            email,
            password: hashPass,
            role
        });

        res.status(201).json({ message: "User Registered", user });
    } catch (error) {
        res.status(500).json({ message: "Register Error", error });
    }
};

// LOGIN USER
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User Not Found" });

        // 🚫 Block inactive users
        if (user.status === false) {
            return res.status(403).json({
                message: "Your account is inactive. Please contact admin."
            });
        }

        const checkPass = await bcrypt.compare(password, user.password);
        if (!checkPass) return res.status(401).json({ message: "Invalid Password" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login Successful",
            token,
            user
        });

    } catch (error) {
        res.status(500).json({ message: "Login Error", error });
    }
};


export const getAllUser = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.status(200).json({
            message: "All users fetched successfully",
            users,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching users",
            error: error.message,
        });
    }
};



// export const getManagersAndSupervisors = async (req, res) => {
//     try {
//         const users = await User.find({
//             role: { $in: ["manager", "supervisor"] }
//         });

//         res.status(200).json(users);
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Something went wrong",
//             error: error.message
//         });
//     }
// };

export const getManagersAndSupervisors = async (req, res) => {
    try {
        const users = await User.find({
            role: { $in: ["manager", "supervisor"] }
        }).sort({ createdAt: -1 }); // latest first

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


export const updateUserStatus = async (req, res) => {
    try {
        const { userId, status } = req.body;

        if (!userId) return res.status(400).json({ message: "userId is required" });
        if (status === undefined) return res.status(400).json({ message: "status is required (true/false)" });

        const user = await User.findByIdAndUpdate(
            userId,
            { status },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "Status updated successfully", user });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};




export const getManagerDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({
            _id: id,
            role: { $in: ["manager", "supervisor"] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Manager or Supervisor not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            data: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


// import Labour from "../models/Labour.js";

export const addLabour = async (req, res) => {
    try {
        const {
            name,
            phone,
            gender,
            age,
            labourType,
            category,
            wageType,
            dailyWage,
            monthlySalary,
            skillLevel,
            aadhaarNumber,
            address,
            status,
            projectAssigned
        } = req.body;

        // Required fields
        if (!name || !phone || !labourType || !category || !skillLevel || !wageType || !address) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // Validate wage based on wageType
        if (wageType === "Daily" && !dailyWage) {
            return res.status(400).json({ message: "Daily wage is required" });
        }

        if (wageType === "Monthly" && !monthlySalary) {
            return res.status(400).json({ message: "Monthly salary is required" });
        }

        // Check duplicate phone
        const exists = await Labour.findOne({ phone });
        if (exists) {
            return res.status(400).json({ message: "Labour already exists" });
        }

        const labour = await Labour.create({
            name,
            phone,
            gender,
            age,
            labourType,   // now supports operator
            category,     // supports: Labour, Mistri, Operator
            skillLevel,
            wageType,
            dailyWage: wageType === "Daily" ? dailyWage : null,
            monthlySalary: wageType === "Monthly" ? monthlySalary : null,
            aadhaarNumber,
            address,
            status: status || "Active",
            assignedProjects: projectAssigned ? [projectAssigned] : [],
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Labour/Operator added successfully",
            labour
        });

    } catch (error) {
        res.status(500).json({
            message: "Error adding labour/operator",
            error: error.message
        });
    }
};




// import User from "../models/User.js";



export const getLabours = async (req, res) => {
    try {
        const labours = await Labour.find()
            .populate("assignedProjects", "projectName location startDate")
            .select("name phone skillLevel wageType dailyWage monthlySalary labourType category status assignedProjects createdAt")
            .sort({ createdAt: -1 });

        const updatedLabours = await Promise.all(
            labours.map(async (l) => {

                // Find active machine assignment for this labour
                const activeMachine = await MachineAssignment.findOne({
                    operatorId: l._id,
                    releaseDate: null
                }).populate("machineId", "machineNumber machineType");

                return {
                    ...l.toObject(),
                    // Project assign status already there
                    isAssigned: l.assignedProjects.length > 0,

                    // Machine assign status
                    isMachineAssigned: activeMachine ? true : false,

                    // Details of assigned machine
                    assignedMachine: activeMachine
                        ? {
                            machineId: activeMachine.machineId._id,
                            machineNumber: activeMachine.machineId.machineNumber,
                            machineType: activeMachine.machineId.machineType,
                            projectId: activeMachine.projectId,
                            assignDate: activeMachine.assignDate
                        }
                        : null
                };
            })
        );

        res.status(200).json(updatedLabours);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching labours",
            error: error.message
        });
    }
};



export const getLaboursById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "labourId required" });
        }

        const labourObjId = new mongoose.Types.ObjectId(id);

        const labour = await Labour.aggregate([
            {
                // 🔥 Filter only 1 labour
                $match: { _id: labourObjId }
            },

            {
                // 🔥 Get attendance history for this ONE labour
                $lookup: {
                    from: "attendances",

                    let: { labourObjId: labourObjId },

                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        // Case 1 — attendance.labourId is ObjectId
                                        { $eq: ["$labourId", "$$labourObjId"] },

                                        // Case 2 — attendance.labourId stored as string
                                        { $eq: ["$labourId", { $toString: "$$labourObjId" }] },

                                        // Case 3 — attendance.labourId convert string → ObjectId
                                        {
                                            $eq: [
                                                { $toObjectId: "$labourId" },
                                                "$$labourObjId"
                                            ]
                                        }
                                    ]
                                }
                            }
                        },

                        { $project: { status: 1, date: 1, projectId: 1, _id: 0 } },
                        { $sort: { date: -1 } }
                    ],

                    as: "attendanceHistory"
                }
            },

            {
                // 🔥 Get assigned project details
                $lookup: {
                    from: "projects",
                    localField: "assignedProjects",
                    foreignField: "_id",
                    as: "assignedProjects"
                }
            },

            {
                // 🔥 Final returned fields
                $project: {
                    name: 1,
                    phone: 1,
                    skillLevel: 1,
                    wageType: 1,
                    dailyWage: 1,
                    monthlySalary: 1,
                    labourType: 1,
                    category: 1,
                    status: 1,
                    address: 1,
                    createdAt: 1,

                    assignedProjects: {
                        _id: 1,
                        projectName: 1
                    },

                    attendanceHistory: 1
                }
            }
        ]);

        return res.status(200).json(labour[0]);  // Only one

    } catch (err) {
        return res.status(500).json({
            message: "Error fetching labour details",
            error: err.message
        });
    }
};

