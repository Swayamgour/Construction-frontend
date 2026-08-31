/**
 * roleCheck middleware
 * Usage: router.get("/x", auth, roleCheck("admin", "manager"), controllerFn)
 *
 * IMPORTANT: roleCheck must always run AFTER `auth` middleware,
 * kyunki ye req.user.role par depend karta hai jo auth() set karta hai.
 */
export const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please login first."
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access Denied. This action requires one of these roles: ${allowedRoles.join(", ")}`
            });
        }

        next();
    };
};

/**
 * Admin ka god-mode helper — admin ko hamesha access milta hai,
 * baaki roles list se check hota hai.
 * Usage: roleCheckOrAdmin("supervisor")  => admin OR supervisor allowed
 */
export const roleCheckOrAdmin = (...allowedRoles) => roleCheck("admin", ...allowedRoles);

export default roleCheck;
