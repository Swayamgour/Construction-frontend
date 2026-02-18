import toast from "react-hot-toast";
import { useGetActiveAssignmentsQuery, useReleaseMachineMutation } from "../../Reduxe/Api";
// import { toast } from "react-toastify";

export default function ActiveAssignments() {
    const { data, isLoading } = useGetActiveAssignmentsQuery();
    const [releaseMachine] = useReleaseMachineMutation();

    const handleRelease = async (machineId) => {
        try {
            await releaseMachine({ machineId }).unwrap();
            toast.success("Machine Released!");
        } catch (err) {
            toast.error("Release Failed!");
        }
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="p-5">
            <h2 className="text-xl font-bold mb-3">Active Assignments</h2>

            {data?.active?.map((item) => (
                <div key={item._id} className="p-4 bg-white rounded shadow mb-3">

                    <p><b>Machine:</b> {item.machineId.machineNumber}</p>
                    <p><b>Project:</b> {item.projectId}</p>
                    <p><b>Operator:</b> {item.operatorId?.name || "N/A"}</p>
                    <p><b>Assigned On:</b> {new Date(item.assignDate).toDateString()}</p>

                    <button
                        className="btn-red mt-2"
                        onClick={() => handleRelease(item.machineId._id)}
                    >
                        Release Machine
                    </button>

                </div>
            ))}
        </div>
    );
}
