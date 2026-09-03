import { ROLES } from "../config/roles.js";
import Project from "../models/Project.js";
// import { ROLES } from "../constants/roles.js"

    /**
     * ============================================================
     *  PROJECT-LEVEL ACCESS CONTROL  (Module 17 of the ERP audit)
     * ============================================================
     * Reusable middleware so project/site scoping doesn't get duplicated
     * inside every controller. Must run AFTER `auth` (needs req.user) and
     * is normally placed after `roleCheck` on a route:
     *
     *   router.post("/eod", auth, roleCheck("supervisor","manager"),
     *               checkProjectAccess(), createEODReport);
     *
     * req.user.assignedProjects is populated at login time (see
     * authController.loginUser) as the UNION of the user's single
     * `projectId` field and their `assignedProjects` array — so both the
     * legacy single-project users and newer multi-project managers work
     * against the same check without any per-route special-casing.
     *
     * Admins always pass — they are intentionally project-unscoped
     * (config/roles.js: "admin -> Full system access, sab kuch").
     * ============================================================
     */

    /**
     * checkProjectAccess(source)
     *
     * source can be:
     *  - a string field name (default "projectId") — read from
     *    req.params, then req.body, then req.query, in that order.
     *  - an async function (req) => projectId | projectId[] | null, for
     *    routes where the project has to be resolved from a document
     *    rather than being a direct field on the request (see the
     *    resolveProjectFrom() helper below for the common case of "load
     *    doc by :id, check its projectId").
     *
     * If no target project can be determined at all, access is denied for a scoped route (there's nothing to scope) — use a resolver instead of the
     * default string form for any route where a project always exists
     * but isn't a direct field, so this fallback never silently skips a
     * check that should have applied.
     */
    ;

export const checkProjectAccess = (source = "projectId") => {
    return async (req, res, next) => {
        try {
            // ==========================================
            // AUTH CHECK
            // ==========================================

            if (!req.user?.id || !req.user?.role) {
                return res.status(401).json({
                    success: false,
                    message: "Access denied. Please login first."
                });
            }

            // ==========================================
            // ADMIN HAS FULL ACCESS
            // ==========================================

            if (req.user.role === ROLES.ADMIN) {
                return next();
            }

            // ==========================================
            // GET PROJECT ID
            // ==========================================

            let targetProjectId;

            if (typeof source === "function") {
                targetProjectId = await source(req);
            } else {
                targetProjectId =
                    req.params?.[source] ??
                    req.body?.[source] ??
                    req.query?.[source];
            }

            if (!targetProjectId) {
                return res.status(400).json({
                    success: false,
                    message: "projectId is required."
                });
            }

            // Support single/multiple projects
            const projectIds = Array.isArray(targetProjectId)
                ? targetProjectId
                : [targetProjectId];

            // ==========================================
            // CHECK PROJECT ASSIGNMENT IN DATABASE
            // ==========================================

            const userId = String(req.user.id);

            const projects = await Project.find({
                _id: { $in: projectIds }
            })
                .select("_id managerId projectIncharge supervisors");

            if (projects.length !== projectIds.length) {
                return res.status(404).json({
                    success: false,
                    message: "One or more projects not found."
                });
            }

            // ==========================================
            // VERIFY ACCESS
            // ==========================================

            const allowed = projects.every((project) => {

                const managerId = project.managerId
                    ? String(project.managerId)
                    : null;

                const projectIncharge = project.projectIncharge
                    ? String(project.projectIncharge)
                    : null;

                const supervisorIds = (project.supervisors || [])
                    .map(supervisor => String(supervisor));

                return (
                    managerId === userId ||
                    projectIncharge === userId ||
                    supervisorIds.includes(userId)
                );
            });

            if (!allowed) {
                console.log("PROJECT ACCESS DENIED:", {
                    userId,
                    projectIds: projectIds.map(String),
                    role: req.user.role
                });

                return res.status(403).json({
                    success: false,
                    message: "Access denied. You are not assigned to this project."
                });
            }

            return next();

        } catch (err) {
            console.error("PROJECT ACCESS ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Project access check failed",
                error: err.message
            });
        }
    };
};

/**
 * resolveProjectFrom(Model, { param = "id", field = "projectId" })
 *
 * Builds a resolver for checkProjectAccess() that loads a document by
 * req.params[param] and reads its `field` — for routes like
 * PATCH /overtime/:id/approve or PATCH /drawings/:id/approve where the
 * project isn't in the request body, only reachable via the record
 * being acted on. Attaches the loaded doc to req._accessCheckedDoc so
 * the controller can reuse it instead of a second findById.
 */
export const resolveProjectFrom = (Model, { param = "id", field = "projectId" } = {}) => {
    return async (req) => {
        const docId = req.params?.[param];
        if (!docId) return null;
        const doc = await Model.findById(docId).select(field);
        if (!doc) return null; // let the controller's own 404 handle a missing record
        req._accessCheckedDoc = doc;
        return doc[field];
    };
};

export default checkProjectAccess;
