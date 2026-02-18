import React, { useState, useEffect, useCallback } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { Bell, UserCheck, UserX, RefreshCw, CheckCircle } from "lucide-react";

const EmployeeNotifications = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  // Tracks which cards are showing the success flash before disappearing
  // { [notifId]: "Approved" | "Rejected" }
  const [resolved, setResolved] = useState({});

  // ── Fetch notifications for this employee ──
  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!user?.email) return;
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch(
        `http://localhost:5260/api/notifications?email=${encodeURIComponent(user.email)}&role=Employee`
      );
      if (res.ok) {
        const data = await res.json();
        // Filter out any notifications that are already resolved locally
        // so the flash card doesn't get overwritten by the poll mid-animation
        setNotifications((prev) => {
          const resolvedIds = Object.keys(resolved);
          return data.filter((n) => !resolvedIds.includes(n.id));
        });
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.email, resolved]);

  useEffect(() => { fetchNotifications(); }, [user?.email]);

  // Poll every 15s — but resolved cards are filtered out above so they won't re-appear
  useEffect(() => {
    const interval = setInterval(() => {
      if (!user?.email) return;
      fetch(`http://localhost:5260/api/notifications?email=${encodeURIComponent(user.email)}&role=Employee`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (!data) return;
          // Never bring back a notification that's currently in the resolved/flash state
          setNotifications((prev) => {
            const currentResolved = prev
              .filter((n) => resolved[n.id])
              .map((n) => n.id);
            return data.filter((n) => !currentResolved.includes(n.id));
          });
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // ── Approve or Reject ──
  const handleDecision = async (visitorId, decision, notifId) => {
    setActionLoading(visitorId + decision);
    try {
      // 1. Update visitor status
      const res = await fetch(
        `http://localhost:5260/api/visitors/${visitorId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: decision, actionBy: user.email }),
        }
      );

      if (res.ok) {
        // 2. DELETE the notification from DB permanently
        //    This is the key fix — mark-as-read wasn't enough, poll kept bringing it back
        await fetch(
          `http://localhost:5260/api/notifications/${notifId}`,
          { method: "DELETE" }
        );

        // 3. Show flash on card for 1.5s then remove from local state
        setResolved((prev) => ({ ...prev, [notifId]: decision }));
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notifId));
          setResolved((prev) => {
            const next = { ...prev };
            delete next[notifId];
            return next;
          });
        }, 1500);
      } else {
        alert("Action failed. Please try again.");
      }
    } catch (err) {
      alert("Error connecting to backend.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Mark single as read ──
  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5260/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // ── Mark all as read ──
  const markAllAsRead = async () => {
    if (!user?.email) return;
    try {
      await fetch(
        `http://localhost:5260/api/notifications/mark-all-read?email=${encodeURIComponent(user.email)}&role=Employee`,
        { method: "PATCH" }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const pendingCount = notifications.filter((n) => n.type === "pending_approval" && !n.isRead).length;
  const unreadCount  = notifications.filter((n) => !n.isRead).length;

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const diffMins = Math.floor((new Date() - d) / 60000);
    if (diffMins < 1)  return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24)  return `${diffHrs} hr ago`;
    return d.toLocaleDateString();
  };

  const getConfig = (type) => {
    if (type === "approved")
      return { icon: UserCheck, iconColor: "text-green-600", bg: "bg-green-100", border: "border-l-green-500", label: "Visitor Approved" };
    if (type === "rejected")
      return { icon: UserX, iconColor: "text-red-600", bg: "bg-red-100", border: "border-l-red-500", label: "Visitor Rejected" };
    return { icon: Bell, iconColor: "text-orange-600", bg: "bg-orange-100", border: "border-l-orange-500", label: "Visitor Approval Request" };
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EmployeeSidebar />

      <div className="flex-1 ml-64 p-8">
        <Header
          title="Approval Requests"
          subtitle="Visitor approval notifications"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchNotifications(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          }
        />

        {/* Stats */}
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-6 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{notifications.length}</h3>
              <p className="text-xs text-gray-500">Total Notifications</p>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <h3 className="text-2xl font-bold text-orange-600">{unreadCount}</h3>
            <p className="text-xs text-gray-500">Unread</p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <h3 className="text-2xl font-bold text-yellow-600">{pendingCount}</h3>
            <p className="text-xs text-gray-500">Awaiting Your Action</p>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : notifications.length === 0 && Object.keys(resolved).length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No Requests</h3>
            <p className="text-gray-500 text-sm mt-1">No visitor approvals pending.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Flash cards for resolved items */}
            {Object.entries(resolved).map(([notifId, decision]) => {
              const isApproved = decision === "Approved";
              return (
                <div
                  key={`resolved-${notifId}`}
                  className={`rounded-xl p-5 border flex items-center gap-3 transition-all ${
                    isApproved ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <CheckCircle className={`w-5 h-5 flex-shrink-0 ${isApproved ? "text-green-600" : "text-red-500"}`} />
                  <p className={`text-sm font-medium ${isApproved ? "text-green-700" : "text-red-700"}`}>
                    Visitor {decision} successfully. Security has been notified.
                  </p>
                </div>
              );
            })}

            {/* Normal notification cards */}
            {notifications.map((item) => {
              const cfg = getConfig(item.type);
              const Icon = cfg.icon;
              const isPending = item.type === "pending_approval";

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl p-6 shadow-sm border transition-all ${
                    !item.isRead ? `border-l-4 ${cfg.border}` : "border-gray-100"
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${cfg.bg}`}>
                        <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{cfg.label}</h3>
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{formatTime(item.createdAt)}</p>
                      </div>
                    </div>
                    {!item.isRead && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-700 mb-3">{item.message}</p>

                  {/* Approve / Reject — only for pending_approval */}
                  {isPending && (
                    <div className="flex gap-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleDecision(item.visitorId, "Approved", item.id)}
                        disabled={!!actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                      >
                        <UserCheck className="w-4 h-4" />
                        {actionLoading === item.visitorId + "Approved" ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleDecision(item.visitorId, "Rejected", item.id)}
                        disabled={!!actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-60"
                      >
                        <UserX className="w-4 h-4" />
                        {actionLoading === item.visitorId + "Rejected" ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeNotifications;