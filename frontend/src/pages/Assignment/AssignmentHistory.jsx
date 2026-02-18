import { useParams } from "react-router-dom";
import { useGetAssignmentHistoryQuery } from "../../Reduxe/Api";

export default function AssignmentHistory() {
    const { machineId } = useParams();
    const { data } = useGetAssignmentHistoryQuery(machineId);

    return (
        <div className="p-5">
            <h2 className="text-xl font-bold mb-3">Assignment History</h2>

            {data?.history?.map((item) => (
                <div key={item._id} className="p-4 bg-white rounded shadow mb-3">
                    <p><b>Project:</b> {item.projectId}</p>
                    <p><b>Operator:</b> {item.operatorId?.name}</p>
                    <p><b>Assigned On:</b> {new Date(item.assignDate).toDateString()}</p>
                    <p><b>Released:</b> {item.releaseDate ? new Date(item.releaseDate).toDateString() : "Still Active"}</p>
                </div>
            ))}
        </div>
    );
}
