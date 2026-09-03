import User from "../models/User.js";
import Labour from "../models/Labour.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ALL_ROLES } from "../config/roles.js";
// import Attendance from "../models/Attendance.js";

import MachineAssignment from "../models/MachineAssignment.js";
// import Machine from "../models/Machine.js";
// import Labour from "../models/Labour.js";

import mongoose from "mongoose";
// import Labour from "../models/Labour.js";
// import Attendance from "../models/Attendance.js";
// import Project from "../models/Project.js";


// REGISTER USER (PUBLIC SIGNUP)
// 🔒 SECURITY FIX: pehle ye endpoint client se bheja gaya `role` seedha
// database me save kar deta tha — matlab koi bhi public /register call
// karke khud ko "admin" bana sakta tha. Ab public signup hamesha
// "labour" role se hi banega. Privileged roles (admin/manager/supervisor/
// storekeeper/accountant/operator) sirf admin hi createUserByAdmin se
// bana sakta hai.
export const registerUser = async (req, res) => {
    try {
        const { name, phone, email, password, role } = req.body;

        if (!name || !phone || !email || !password) {
            return res.status(400).json({ message: "name, phone, email, password required" });
        }

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
            role // 🔒 forced — public signup can never grant privileged roles
        });

        const safeUser = user.toObject();
        delete safeUser.password;

        res.status(201).json({ message: "User Registered", user: safeUser });
    } catch (error) {
        res.status(500).json({ message: "Register Error", error: error.message });
    }
};

// CREATE USER (ADMIN ONLY)
// Isse admin koi bhi role ka user bana sakta hai (manager, supervisor,
// storekeeper, accountant, operator, labour). Route already `auth` +
// `roleCheck("admin")` se protected hai (routes/authRoutes.js).
export const createUserByAdmin = async (req, res) => {
    try {
        const { name, phone, email, password, role, projectId, assignedProjects } = req.body;

        if (!name || !phone || !email || !password || !role) {
            return res.status(400).json({ message: "name, phone, email, password, role required" });
        }

        if (!ALL_ROLES.includes(role)) {
            return res.status(400).json({
                message: `Invalid role. Allowed roles: ${ALL_ROLES.join(", ")}`
            });
        }

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashPass = await bcrypt.hash(password, 10);

        // ⭐ Module 17: a user can now be scoped to more than one project.
        // assignedProjects is optional — if omitted, projectId (unchanged
        // behaviour) is still honoured everywhere via the token payload.
        const user = await User.create({
            name,
            phone,
            email,
            password: hashPass,
            role,
            projectId: projectId || null,
            assignedProjects: Array.isArray(assignedProjects) ? assignedProjects : []
        });

        const safeUser = user.toObject();
        delete safeUser.password;

        res.status(201).json({ message: "User created successfully", user: safeUser });
    } catch (error) {
        res.status(500).json({ message: "Create User Error", error: error.message });
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

        // ⭐ Module 17 — Project-Level Authorization.
        // The token now carries the user's accessible-project set (their
        // single "home" projectId plus any assignedProjects), so
        // middleware/projectAccess.js can check project access without an
        // extra DB read on every request. Admins get an empty array here —
        // checkProjectAccess() already lets admins through regardless.
        const projectScope = [
            ...(user.projectId ? [String(user.projectId)] : []),
            ...(Array.isArray(user.assignedProjects) ? user.assignedprojects?.data?.map(String) : []),
        ];

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                projectId: user.projectId || null,
                assignedProjects: [...new Set(projectScope)],
            },
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




/**
 * PUT /api/auth/labours/:id
 * Basic-details edit for an existing Labour record (name, phone, wage,
 * skill, etc). Does NOT touch project assignment — use /api/labour/assign
 * or /api/labour/transfer for that, so assignment history stays intact.
 */
export const updateLabour = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, phone, gender, age, labourType, category,
            wageType, dailyWage, monthlySalary, skillLevel,
            aadhaarNumber, address, status,
        } = req.body;

        const labour = await Labour.findById(id);
        if (!labour) {
            return res.status(404).json({ message: "Labour not found" });
        }

        if (phone && phone !== labour.phone) {
            const exists = await Labour.findOne({ phone, _id: { $ne: id } });
            if (exists) {
                return res.status(400).json({ message: "Another labour already uses this phone number" });
            }
        }

        if (name !== undefined) labour.name = name;
        if (phone !== undefined) labour.phone = phone;
        if (gender !== undefined) labour.gender = gender;
        if (age !== undefined) labour.age = age;
        if (labourType !== undefined) labour.labourType = labourType;
        if (category !== undefined) labour.category = category;
        if (skillLevel !== undefined) labour.skillLevel = skillLevel;
        if (wageType !== undefined) labour.wageType = wageType;
        if (wageType === "Daily") {
            labour.dailyWage = dailyWage ?? labour.dailyWage;
            labour.monthlySalary = null;
        } else if (wageType === "Monthly") {
            labour.monthlySalary = monthlySalary ?? labour.monthlySalary;
            labour.dailyWage = null;
        }
        if (aadhaarNumber !== undefined) labour.aadhaarNumber = aadhaarNumber;
        if (address !== undefined) labour.address = address;
        if (status !== undefined) labour.status = status;

        await labour.save();

        res.status(200).json({
            message: "Labour updated successfully",
            data: labour,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating labour",
            error: error.message,
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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid labourId" });
        }

        const labourObjId = new mongoose.Types.ObjectId(id);

        const labour = await Labour.aggregate([
            {
                $match: { _id: labourObjId }
            },

            // 🔥 Attendance Lookup
            // 🔥 Attendance Lookup
            {
                $lookup: {
                    from: "attendances",
                    let: { labourObjId: labourObjId },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ["$labourId", "$$labourObjId"] },

                                        {
                                            $eq: [
                                                "$labourId",
                                                { $toString: "$$labourObjId" }
                                            ]
                                        },

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

                        // 🔥 Include complete attendance details
                        {
                            $project: {
                                _id: 1,

                                status: 1,
                                date: 1,
                                projectId: 1,

                                timeIn: 1,
                                timeOut: 1,
                                overtimeHours: 1,

                                markedBy: 1
                            }
                        },

                        { $sort: { date: -1 } }
                    ],
                    as: "attendanceHistory"
                }
            },

            // 🔥 Project Lookup
            {
                $lookup: {
                    from: "projects",
                    localField: "assignedProjects",
                    foreignField: "_id",
                    as: "assignedProjects"
                }
            },

            // 🔥 Calculate Attendance Stats
            {
                $addFields: {
                    totalPresentDays: {
                        $size: {
                            $filter: {
                                input: "$attendanceHistory",
                                as: "att",
                                cond: { $eq: ["$$att.status", "Present"] }
                            }
                        }
                    },
                    totalAbsentDays: {
                        $size: {
                            $filter: {
                                input: "$attendanceHistory",
                                as: "att",
                                cond: { $eq: ["$$att.status", "Absent"] }
                            }
                        }
                    },
                    totalHalfDays: {
                        $size: {
                            $filter: {
                                input: "$attendanceHistory",
                                as: "att",
                                cond: { $eq: ["$$att.status", "Half Day"] }
                            }
                        }
                    },
                    totalAttendanceDays: {
                        $size: "$attendanceHistory"
                    }
                }
            },

            // 🔥 Final Response Fields
            {
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

                    attendanceHistory: 1,

                    totalPresentDays: 1,
                    totalAbsentDays: 1,
                    totalHalfDays: 1,
                    totalAttendanceDays: 1
                }
            }
        ]);

        if (!labour.length) {
            return res.status(404).json({ message: "Labour not found" });
        }

        return res.status(200).json(labour[0]);

    } catch (err) {
        return res.status(500).json({
            message: "Error fetching labour details",
            error: err.message
        });
    }
};


// DELETE USER (ADMIN ONLY)
// 🔒 BUG FIX: ye function routes/authRoutes.js me import ho raha tha
// lekin yaha define hi nahi tha — Express isse route register karte
// waqt hi crash ho jaata (server start hi nahi hota). Ab properly defined.
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        // Admin khud apna hi account delete na kar sake (safety guard)
        if (req.user.id === id) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};



