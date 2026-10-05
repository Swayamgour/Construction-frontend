/**
 * DEPRECATED & DECOMMISSIONED
 * Legacy mock page replaced by canonical /machine/:id (MachineDetails.jsx)
 */
import { Navigate } from "react-router-dom";
export default function MachineDetailPage() {
    return <Navigate to="/machine/list" replace />;
}