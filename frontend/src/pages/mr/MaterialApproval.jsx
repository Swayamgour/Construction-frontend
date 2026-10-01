import React, { useState } from "react";
import {
  ClipboardList,
  Building2,
  CheckCircle2,
  Clock,
  Check,
  X,
  Calendar,
  User,
  Boxes,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import { useGetMaterialRequestQuery, useGetVendorsQuery } from "../../Reduxe/Api";
import { useNavigate } from "react-router-dom";
import ApproveModal from "../../components/ApproveModal";
import { CheckRole } from "../../helper/CheckRole";
import { getInitials, getAvatarGradient } from "../../helper/avatar";

const STATUS_STYLES = {
  approved: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
  pending: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  completed: "bg-gradient-to-r from-indigo-500 to-blue-600 text-white",
  rejected: "bg-gradient-to-r from-red-500 to-pink-600 text-white",
};

export default function MaterialApproval() {
  const { data: requests = [], isLoading, refetch } = useGetMaterialRequestQuery();
  const { data: vendors } = useGetVendorsQuery();
  const { user } = CheckRole();
  const navigate = useNavigate();

  const [selectedMR, setSelectedMR] = useState(null);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  const pendingRequests = requests.filter((req) => req.status === "pending");
  const approvedRequests = requests.filter((req) => req.status === "approved");
  const completedRequests = requests.filter((req) => req.status === "completed");
  const recentRequests = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const closeModal = () => {
    setSelectedMR(null);
    setOpen(false);
    refetch();
  };

  const getStatusColor = (status) => STATUS_STYLES[status] || "bg-gradient-to-r from-gray-500 to-gray-600 text-white";

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);

  const getFilteredRequests = () => {
    switch (activeTab) {
      case "pending":
        return pendingRequests;
      case "approved":
        return approvedRequests;
      case "completed":
        return completedRequests;
      default:
        return requests;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/40 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-3.5 rounded-2xl shadow-lg shadow-indigo-900/25">
                <ClipboardList size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Material Requests Dashboard</h1>
                <p className="text-gray-500 mt-1">Manage and approve material purchase requests</p>
              </div>
            </div>

            <button
              onClick={refetch}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2 transition-colors w-fit"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/60 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{requests.length}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <ClipboardList className="text-indigo-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm shadow-gray-200/60 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pending Approval</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingRequests.length}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Clock className="text-amber-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm shadow-gray-200/60 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Approved</p>
                  <p className="text-2xl font-bold text-emerald-600">{approvedRequests.length}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Check className="text-emerald-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm shadow-gray-200/60 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{completedRequests.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <CheckCircle2 className="text-blue-600" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* APPROVER CARD — the logged-in reviewer, not a fixed demo name */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-100 border border-emerald-200 rounded-2xl p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className={`w-16 h-16 rounded-2xl border-4 border-white shadow flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br ${getAvatarGradient(user?.name)}`}
                  >
                    {getInitials(user?.name)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full">
                    <Check size={13} />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Approval Authority</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-emerald-700">{user?.name || "You"}</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs capitalize">
                      {user?.role || "reviewer"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{pendingRequests.length} requests awaiting your approval</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-700">{pendingRequests.length}</div>
                <div className="text-sm text-gray-500">Pending for approval</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT - TWO COLUMNS */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT COLUMN - REQUESTS LIST */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 p-5 md:p-6">
              {/* TABS */}
              <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {[
                  { key: "pending", label: `Pending (${pendingRequests.length})`, icon: Clock, color: "border-amber-500 text-amber-600" },
                  { key: "approved", label: `Approved (${approvedRequests.length})`, icon: Check, color: "border-emerald-500 text-emerald-600" },
                  { key: "completed", label: `Completed (${completedRequests.length})`, icon: CheckCircle2, color: "border-blue-500 text-blue-600" },
                  { key: "all", label: `All (${requests.length})`, icon: ClipboardList, color: "border-indigo-500 text-indigo-600" },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.key ? tab.color : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={15} />
                        {tab.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* REQUESTS LIST */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-500">Loading requests...</p>
                  </div>
                ) : getFilteredRequests().length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ClipboardList size={26} className="text-gray-400" />
                    </div>
                    <h3 className="text-gray-500 font-medium mb-1">No requests found</h3>
                    <p className="text-gray-400 text-sm">No {activeTab} material requests available</p>
                  </div>
                ) : (
                  getFilteredRequests().map((mr) => (
                    <div key={mr._id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-indigo-50 p-2 rounded-xl">
                              <Building2 className="text-indigo-600" size={16} />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg">{mr.projectId?.projectName}</h3>
                              <p className="text-sm text-gray-500">
                                PO# {mr.poNumber} • {formatDate(mr.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User size={13} /> {mr.requestedBy?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={13} /> Required: {formatDate(mr.requiredDate)}
                            </span>
                          </div>
                        </div>

                        <div className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 ${getStatusColor(mr.status)}`}>
                          {mr.status.toUpperCase()}
                        </div>
                      </div>

                      {/* ITEMS PREVIEW */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-gray-700 font-medium mb-3 text-sm">
                          <Boxes size={15} /> Items ({mr.items.length})
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {mr.items.slice(0, 2).map((it, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-xl">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-gray-800 text-sm">{it.itemId?.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {it.requestedQty} {it.unit}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-emerald-600 font-bold text-sm">{formatCurrency(it.amount)}</div>
                                  <div className="text-xs text-gray-400">@ {formatCurrency(it.unitPrice)}/unit</div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {mr.items.length > 2 && (
                            <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-center">
                              <span className="text-gray-500 text-sm">+ {mr.items.length - 2} more items</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* TOTAL AMOUNT & ACTIONS */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <IndianRupee size={15} className="text-emerald-600" />
                          <span className="text-lg font-bold text-gray-800">Total: {formatCurrency(mr.totalAmount)}</span>
                        </div>

                        <div className="flex gap-3">
                          {mr.status === "pending" && (
                            <button
                              onClick={() => {
                                setSelectedMR(mr);
                                setOpen(true);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-medium shadow-md shadow-emerald-900/20 transition-all text-sm"
                            >
                              Review & Approve
                            </button>
                          )}

                          {mr.status === "approved" && (
                            <button
                              onClick={() => navigate(`/POView/${mr._id}`)}
                              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-md shadow-indigo-900/20 transition-all text-sm"
                            >
                              View Purchase Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - RECENT REQUESTS */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/60 border border-gray-100 p-5 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="text-indigo-600" size={18} />
                  Recent Requests
                </h2>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">5 most recent</span>
              </div>

              <div className="space-y-3">
                {recentRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No recent requests</div>
                ) : (
                  recentRequests.map((mr) => (
                    <div
                      key={mr._id}
                      className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/RequestDetails/${mr._id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-800 text-sm">{mr.projectId?.projectName}</div>
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(mr.status)}`}>{mr.status}</div>
                      </div>

                      <div className="text-sm text-gray-500 mb-2">
                        {mr.items.length} items • {formatCurrency(mr.totalAmount)}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{formatDate(mr.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <User size={10} /> {mr.requestedBy?.name}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* QUICK STATS */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-medium text-gray-700 mb-3 text-sm">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-50 p-3 rounded-xl">
                    <div className="text-amber-600 font-bold">{pendingRequests.length}</div>
                    <div className="text-xs text-gray-500">Awaiting</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl">
                    <div className="text-emerald-600 font-bold">{approvedRequests.length}</div>
                    <div className="text-xs text-gray-500">Approved</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <div className="text-blue-600 font-bold">{completedRequests.length}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-xl">
                    <div className="text-purple-600 font-bold text-sm">
                      {formatCurrency(requests.reduce((sum, mr) => sum + (mr.totalAmount || 0), 0))}
                    </div>
                    <div className="text-xs text-gray-500">Total Value</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* APPROVE MODAL */}
        {selectedMR && <ApproveModal open={open} mr={selectedMR} vendors={vendors} onClose={closeModal} />}
      </div>
    </div>
  );
}
