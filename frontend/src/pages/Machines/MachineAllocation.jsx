/**
 * DEPRECATED & DECOMMISSIONED
 * Legacy page replaced by canonical /assign/active (ActiveAssignments.jsx)
 */
import { Navigate } from "react-router-dom";
export default function MachineAllocation() {
    return <Navigate to="/assign/active" replace />;
}