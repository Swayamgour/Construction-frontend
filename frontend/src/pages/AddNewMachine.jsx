/**
 * DEPRECATED & DECOMMISSIONED
 * Legacy mock page replaced by canonical /machine/add (AddMachine.jsx / AddEditMachine.jsx)
 */
import { Navigate } from "react-router-dom";
export default function AddNewMachine() {
    return <Navigate to="/machine/add" replace />;
}