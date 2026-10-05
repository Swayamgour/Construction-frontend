/**
 * DEPRECATED & DECOMMISSIONED
 * Legacy mock page replaced by canonical /machine/dashboard and /machine/list
 */
import { Navigate } from "react-router-dom";
export default function MachinerySetupOrg() {
    return <Navigate to="/machine/dashboard" replace />;
}