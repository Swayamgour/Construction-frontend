import jwt from "jsonwebtoken";
import User from "../models/User.js"; // path apne project ke according

export const auth = async (req, res, next) => {
    try {
        const token = req
            .header("Authorization")
            ?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // ==========================================
        // VERIFY JWT
        // ==========================================
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // ==========================================
        // GET LATEST USER FROM DATABASE
        // ==========================================
        const user = await User.findById(decoded.id)
            .select("_id name role projectId assignedProjects status");

        // console.log("========== DATABASE USER ==========");
        // console.log(user);
        // console.log("projectId:", user?.projectId);
        // console.log("assignedProjects:", user?.assignedProjects);
        // console.log("==================================");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found."
            });
        }

        // ==========================================
        // CHECK USER STATUS
        // ==========================================
        if (user.status === false) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated."
            });
        }

        // ==========================================
        // SET FRESH USER DATA
        // ==========================================
        req.user = {
            id: user._id.toString(),
            name: user.name,
            role: user.role,

            // Backward compatibility
            projectId: user.projectId
                ? user.projectId.toString()
                : null,

            // Latest project assignments
            assignedProjects: (user.assignedProjects || []).map(
                project => project.toString()
            )
        };

        return next();

    } catch (err) {
        console.error("AUTH ERROR:", err);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            error: err.message
        });
    }
};