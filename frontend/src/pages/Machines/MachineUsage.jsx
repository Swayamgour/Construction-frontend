/**
 * DEPRECATED & DECOMMISSIONED
 * Legacy page replaced by canonical MachineDetails.jsx (Daily Operator Log with meter & fuel tracking)
 */
import { Navigate } from "react-router-dom";
export default function MachineUsage() {
    return <Navigate to="/machine/list" replace />;
}
