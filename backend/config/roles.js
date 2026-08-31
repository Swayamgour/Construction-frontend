/**
 * ============================================================
 *  CENTRAL ROLE CONFIG (RBAC)
 * ============================================================
 * Ye file poore backend ka "single source of truth" hai roles ke liye.
 * Naya role add karna ho, ya kisi role ka access badalna ho — sirf yaha
 * dekho ki role kaha kaha use ho raha hai (routes/*.js me roleCheck())
 *
 * ROLE HIERARCHY (upar se niche, zyada se kam access):
 *  1. admin        -> Full system access, sab kuch
 *  2. manager       -> Apne assigned project(s) ka full control
 *  3. supervisor    -> Site level operations (attendance, task, material request)
 *  4. storekeeper   -> Stock / Inventory / GRN / Item master
 *  5. accountant    -> Vendor payments, ledger, purchase orders
 *  6. operator      -> Machine usage / daily usage entries
 *  7. labour        -> Sirf apna data (attendance, task) - mobile/self-service
 * ============================================================
 */

export const ROLES = Object.freeze({
    ADMIN: "admin",
    MANAGER: "manager",
    SUPERVISOR: "supervisor",
    STOREKEEPER: "storekeeper",
    ACCOUNTANT: "accountant",
    OPERATOR: "operator",
    LABOUR: "labour",
    DRAWING_MANAGER: "drawing_manager",
});

export const ALL_ROLES = Object.values(ROLES);

// Roles jo kisi bhi project/site level operational cheez ko manage karte hain
export const MANAGEMENT_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR];

// Roles jo financial / procurement data dekh sakte hain
export const FINANCE_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT];

// Roles jo stock/inventory manage karte hain
export const STOCK_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.STOREKEEPER];

// Roles jo approvals de sakte hain (attendance, material request, task completion)
export const APPROVER_ROLES = [ROLES.ADMIN, ROLES.MANAGER];

// Roles jo project drawings/documents review + upload kar sakte hain
export const DRAWING_ROLES = [ROLES.ADMIN, ROLES.DRAWING_MANAGER];

export default ROLES;
