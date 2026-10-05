import { Link, useParams } from "react-router-dom";
import { useGetAssignmentHistoryQuery } from "../../Reduxe/Api";
import {
    MachinePage,
    StatusBadge,
    REQUEST_STATUS_TONE,
    EmptyState,
    Spinner,
    projectLabel,
    fmtDate,
    btnGhost,
} from "../../components/machine/machineUi";

export default function AssignmentHistory() {
    const { machineId } = useParams();
    const { data, isLoading } = useGetAssignmentHistoryQuery(machineId);
    const history = data?.history || [];
    const machine = history[0]?.machineId;

    return (
        <MachinePage
            title="Assignment History"
            subtitle={machine ? `${machine.machineNumber} · ${machine.machineType || ""}` : undefined}
            actions={<Link to={`/machine/${machineId}`} className={btnGhost}>← Machine details</Link>}
        >
            {isLoading ? (
                <Spinner />
            ) : history.length === 0 ? (
                <EmptyState title="This machine has no assignment history yet" />
            ) : (
                <ol className="relative space-y-4 border-l-2 border-gray-200 pl-6">
                    {history.map((h) => (
                        <li key={h._id} className="relative">
                            <span
                                className={`absolute -left-[31px] top-4 h-3 w-3 rounded-full ring-4 ring-gray-50 ${
                                    h.releaseDate ? "bg-gray-400" : "bg-emerald-500"
                                }`}
                            />
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="font-semibold text-gray-900">{projectLabel(h.projectId)}</h3>
                                    <StatusBadge status={h.assignmentStatus} map={REQUEST_STATUS_TONE} />
                                </div>
                                <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                    <div><dt className="text-xs text-gray-400">Assigned</dt><dd>{fmtDate(h.assignDate)}</dd></div>
                                    <div><dt className="text-xs text-gray-400">Released</dt><dd>{h.releaseDate ? fmtDate(h.releaseDate) : "Still active"}</dd></div>
                                    <div><dt className="text-xs text-gray-400">Operator</dt><dd>{h.operatorId?.name || "—"}</dd></div>
                                    <div><dt className="text-xs text-gray-400">Assigned by</dt><dd>{h.assignedBy?.name || "—"}</dd></div>
                                </dl>
                                {h.releaseReason && <p className="mt-2 text-sm text-gray-500">Release reason: {h.releaseReason}</p>}
                                {h.operatorHistory?.length > 0 && (
                                    <div className="mt-3 border-t border-gray-100 pt-3">
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Operator changes</p>
                                        <ul className="space-y-1 text-xs text-gray-600">
                                            {h.operatorHistory.map((o, i) => (
                                                <li key={i}>
                                                    {fmtDate(o.changedAt)} — <b>{o.action}</b>
                                                    {o.previousOperatorId?.name && <> from {o.previousOperatorId.name}</>}
                                                    {o.newOperatorId?.name && <> to {o.newOperatorId.name}</>}
                                                    {o.reason && <> ({o.reason})</>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </MachinePage>
    );
}
