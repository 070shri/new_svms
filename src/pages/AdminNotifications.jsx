import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { Bell, CheckCircle, XCircle, RefreshCw, Clock } from "lucide-react";

const AdminNotifications = () => {
  const { user } = useAuth();

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Admin sees ALL visitors that are "Pending Approval"
  const fetchPendingVisitors = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("http://localhost:5260/api/visitors");
      if (res.ok) {
        const data = await res.json();
        // Admin notification panel shows only pending ones (like an inbox)
        const pending = data.filter(v => v.status === "Pending Approval");
        setVisitors(pending);
      }
    } catch (err) {
      console.error("Failed to fetch visitors:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingVisitors();
  }, [fetchPendingVisitors]);

  // Poll every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchPendingVisitors(), 15000);
    return () => clearInterval(interval);
  }, [fetchPendingVisitors]);

  // Admin approve/reject
  const handleDecision = async (visitorId, decision) => {
    setActionLoading(visitorId + decision);
    try {
      const res = await fetch(`http://localhost:5260/api/visitors/${visitorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision, actionBy: "Admin" }),
      });
      if (res.ok) {
        // Remove from pending list immediately
        setVisitors(prev => prev.filter(v => v.id !== visitorId));
      } else {
        alert("Action failed. Please try again.");
      }
    } catch (err) {
      alert("Error connecting to backend.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1)  return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24)  return `${diffHrs} hr ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        <Header
          title="Notifications"
          subtitle="Pending visitor approval requests"
          action={
            <button
              onClick={() => fetchPendingVisitors(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          }
        />

        {/* Stats */}
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-6 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{visitors.length}</h3>
              <p className="text-xs text-gray-500">Pending Approvals</p>
            </div>
          </div>
          {visitors.length > 0 && (
            <>
              <div className="h-10 w-px bg-gray-200" />
              <p className="text-sm text-gray-500">
                Review and approve or reject each visitor request below.
              </p>
            </>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : visitors.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">No pending requests</h3>
            <p className="text-gray-500 text-sm">All visitor requests have been handled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visitors.map((v) => (
              <div key={v.id} className="bg-white rounded-xl shadow-sm border border-l-4 border-l-yellow-400 p-6">

                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Bell className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Visitor Approval Request</h3>
                      <p className="text-xs text-gray-500">
                        {formatTime(v.createdAt)} • Registered by {v.registeredBy}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">
                    Pending
                  </span>
                </div>

                {/* Visitor Details */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm mb-4 grid grid-cols-2 gap-x-8 gap-y-2">
                  <p><span className="font-medium text-gray-600">Visitor Name:</span> <span className="text-gray-900">{v.fullName}</span></p>
                  <p><span className="font-medium text-gray-600">Company:</span> <span className="text-gray-900">{v.company}</span></p>
                  <p><span className="font-medium text-gray-600">Purpose:</span> <span className="text-gray-900">{v.purpose}</span></p>
                  <p><span className="font-medium text-gray-600">Host:</span> <span className="text-gray-900">{v.host}</span></p>
                  <p><span className="font-medium text-gray-600">Date:</span> <span className="text-gray-900">{v.date}</span></p>
                  <p><span className="font-medium text-gray-600">Time:</span> <span className="text-gray-900">{v.time}</span></p>
                  <p><span className="font-medium text-gray-600">ID Type:</span> <span className="text-gray-900">{v.idType}</span></p>
                  <p><span className="font-medium text-gray-600">ID No.:</span> <span className="text-gray-900">{v.idNumber}</span></p>
                </div>

                {/* Photo if available */}
                {v.photo && (
                  <div className="mb-4">
                    <img src={v.photo} alt="Visitor" className="w-20 h-20 rounded-lg object-cover border" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleDecision(v.id, "Approved")}
                    disabled={actionLoading === v.id + "Approved"}
                    className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {actionLoading === v.id + "Approved" ? "Approving..." : "Approve"}
                  </button>

                  <button
                    onClick={() => handleDecision(v.id, "Rejected")}
                    disabled={actionLoading === v.id + "Rejected"}
                    className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-60"
                  >
                    <XCircle className="w-4 h-4" />
                    {actionLoading === v.id + "Rejected" ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;