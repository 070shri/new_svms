import React, { useState, useEffect } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, XCircle, Clock, Users, CalendarCheck, Bell } from "lucide-react";

const EmployeeDashboard = () => {
  const { user } = useAuth();

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores id of visitor being actioned

  // Fetch all visitors for this employee (by their email as hostEmail)
  const fetchVisitors = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`http://localhost:5260/api/visitors/host/${user.email}`);
      if (res.ok) {
        const data = await res.json();
        setVisitors(data);
      }
    } catch (err) {
      console.error("Failed to fetch visitors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [user?.email]);

  // Approve or Reject a visitor
  const handleDecision = async (visitorId, decision) => {
    setActionLoading(visitorId + decision);
    try {
      const res = await fetch(`http://localhost:5260/api/visitors/${visitorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision, actionBy: user.email }),
      });
      if (res.ok) {
        // Refresh list after decision
        await fetchVisitors();
      } else {
        alert("Action failed. Please try again.");
      }
    } catch (err) {
      alert("Error connecting to backend.");
    } finally {
      setActionLoading(null);
    }
  };

  // Derived stats
  const pending   = visitors.filter(v => v.status === "Pending Approval");
  const upcoming  = visitors.filter(v => v.status === "Approved");
  const total     = visitors.length;

  const statusBadge = (status) => {
    const map = {
      "Pending Approval": "bg-yellow-100 text-yellow-700",
      "Approved":         "bg-green-100 text-green-700",
      "Rejected":         "bg-red-100 text-red-700",
      "Checked In":       "bg-blue-100 text-blue-700",
      "Checked Out":      "bg-gray-100 text-gray-600",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <EmployeeSidebar />

      <main className="ml-64 p-6 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome, {user?.fullName?.split(" ")[0] || "Employee"}
          </h1>
          <p className="text-gray-500 mt-1">Manage your visitor requests and history</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Stat icon={Bell}          color="yellow" title="Pending Requests"  value={pending.length} />
          <Stat icon={CalendarCheck} color="green"  title="Approved Visitors" value={upcoming.length} />
          <Stat icon={Users}         color="blue"   title="Total Hosted"      value={total} />
        </div>

        {/* ===== PENDING APPROVAL REQUESTS ===== */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-500" />
            Pending Visitor Requests
            {pending.length > 0 && (
              <span className="ml-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {pending.length}
              </span>
            )}
          </h3>

          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : pending.length === 0 ? (
            <p className="text-sm text-gray-500">No pending visitor requests.</p>
          ) : (
            <div className="space-y-4">
              {pending.map((v) => (
                <div key={v.id} className="border border-yellow-200 rounded-xl p-4 bg-yellow-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-800 font-bold text-sm">
                          {v.fullName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{v.fullName}</p>
                          <p className="text-xs text-gray-500">{v.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mt-2">
                        <p><span className="text-gray-500">Company:</span> <span className="font-medium">{v.company}</span></p>
                        <p><span className="text-gray-500">Purpose:</span> <span className="font-medium">{v.purpose}</span></p>
                        <p><span className="text-gray-500">Date:</span> <span className="font-medium">{v.date}</span></p>
                        <p><span className="text-gray-500">Time:</span> <span className="font-medium">{v.time}</span></p>
                        <p><span className="text-gray-500">ID Type:</span> <span className="font-medium">{v.idType}</span></p>
                        <p><span className="text-gray-500">ID No.:</span> <span className="font-medium">{v.idNumber}</span></p>
                      </div>
                    </div>
                    {v.photo && (
                      <img src={v.photo} alt="visitor" className="w-16 h-16 rounded-lg object-cover border border-yellow-200 ml-4" />
                    )}
                  </div>

                  {/* Approve / Reject buttons */}
                  <div className="flex gap-3 mt-4 pt-3 border-t border-yellow-200">
                    <button
                      onClick={() => handleDecision(v.id, "Approved")}
                      disabled={actionLoading === v.id + "Approved"}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading === v.id + "Approved" ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleDecision(v.id, "Rejected")}
                      disabled={actionLoading === v.id + "Rejected"}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-60"
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

        {/* ===== UPCOMING + RECENT ===== */}
        <div className="grid grid-cols-2 gap-6">
          {/* Upcoming Visitors (Approved) */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-green-500" />
              Upcoming Visitors
            </h3>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming visitors.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{v.fullName}</p>
                      <p className="text-xs text-gray-500">{v.company} • {v.date} at {v.time}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(v.status)}`}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Visitor History */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Recent Visitor History
            </h3>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : visitors.length === 0 ? (
              <p className="text-sm text-gray-500">No visitor history available.</p>
            ) : (
              <div className="space-y-3">
                {[...visitors]
                  .filter(v => v.status !== "Pending Approval")
                  .slice(0, 5)
                  .map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{v.fullName}</p>
                        <p className="text-xs text-gray-500">{v.company} • {v.purpose}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(v.status)}`}>
                        {v.status}
                      </span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

/* ===== STAT CARD ===== */
const colorMap = {
  yellow: { bg: "bg-yellow-100", icon: "text-yellow-600" },
  green:  { bg: "bg-green-100",  icon: "text-green-600"  },
  blue:   { bg: "bg-blue-100",   icon: "text-blue-600"   },
};

const Stat = ({ icon: Icon, color, title, value }) => {
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
};

export default EmployeeDashboard;