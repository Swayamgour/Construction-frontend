/**
 * DEPRECATED & DECOMMISSIONED
 * Legacy mock page replaced by canonical /machine/list and /machine/dashboard
 */
import { Navigate } from "react-router-dom";
export default function MachineManageMent() {
    return <Navigate to="/machine/list" replace />;
}