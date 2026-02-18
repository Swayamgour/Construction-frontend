import React, { useState } from "react";
import { usePunchOutMutation, useUserDetailQuery } from "../../Reduxe/Api";
import { useNavigate } from "react-router-dom";

export default function PunchOut() {
    const [loading, setLoading] = useState(false);
    const [punchOut] = usePunchOutMutation();


    const { data } = useUserDetailQuery()

    // console.log(data?.user?._id)

    const navigate = useNavigate()

    const handlePunchOut = async () => {
        const employeeId = data?.user?._id;
        if (!employeeId) {
            alert("employeeId not found. Login or select employee.");
            return;
        }

        try {
            setLoading(true);
            await punchOut({ employeeId }).unwrap();
            alert("Punch-out successful ✅");
            navigate(-1)

        } catch (err) {
            console.error(err);
            alert(err?.data?.message || "Error punching out");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 680, margin: "24px auto", padding: 16 }}>
            <h2>Punch Out</h2>

            <p>Press the button below to punch out for today.</p>

            <button
                onClick={handlePunchOut}
                disabled={loading}
                style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer"
                }}
            >
                {loading ? "Processing..." : "Punch Out"}
            </button>
        </div>
    );
}
