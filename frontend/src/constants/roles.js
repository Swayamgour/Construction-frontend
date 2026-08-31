// Central role list — MUST always match backend/models/User.js `enum`
// exactly. Kahin bhi role dropdown, sidebar filter, ya role-check karna ho,
// yahi se import karo — taaki backend aur frontend kabhi out-of-sync na ho.

export const ROLES = {
    ADMIN: "admin",
    MANAGER: "manager",
    SUPERVISOR: "supervisor",
    STOREKEEPER: "storekeeper",
    ACCOUNTANT: "accountant",
    OPERATOR: "operator",
    LABOUR: "labour",
};

export const ALL_ROLES = Object.values(ROLES);

// Roles jo admin ke through create kiye ja sakte hain (Create User form me)
export const CREATABLE_ROLES = [
    ROLES.MANAGER,
    ROLES.SUPERVISOR,
    ROLES.STOREKEEPER,
    ROLES.ACCOUNTANT,
    ROLES.OPERATOR,
    ROLES.LABOUR,
];

export const ROLE_LABELS = {
    [ROLES.ADMIN]: "Admin",
    [ROLES.MANAGER]: "Manager",
    [ROLES.SUPERVISOR]: "Supervisor",
    [ROLES.STOREKEEPER]: "Storekeeper",
    [ROLES.ACCOUNTANT]: "Accountant",
    [ROLES.OPERATOR]: "Operator",
    [ROLES.LABOUR]: "Labour",
};

export default ROLES;
