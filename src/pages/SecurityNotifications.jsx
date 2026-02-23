import React, { useState, useEffect, useCallback } from "react";
import SecuritySidebar from "../components/SecuritySidebar";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { Bell, CheckCircle, XCircle, Clock, RefreshCw, LogIn } from "lucide-react";

const SecurityNotifications = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingIn, setCheckingIn] = useState(null); 
  const [checkedIn, setCheckedIn] = useState({}); 

  // ✅ SMART FILTER: Removes old actionable items that are already done
  const filterValidNotifications = (data, flashingIds) => {
    return data.filter((n) => {
      // 1. Don't render cards that are currently in the middle of the flash animation
      if (flashingIds.includes(n.id)) return false;
      
      // 2. Hide "Approved" cards if they have already been marked as read (Checked In)
      // This stops old, previously checked-in visitors from reappearing on page refresh.
      if (n.type === "approved" && n.isRead) return false;
      
      return true;
    });
  };

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!user?.email) return;
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch(
        `http://localhost:5260/api/notifications?email=${encodeURIComponent(user.email)}&role=Security`
      );
      if (res.ok) {
        const data = await res.json();
        setNotifications((prev) => filterValidNotifications(data, Object.keys(checkedIn)));
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.email, checkedIn]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Poll every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      if (!user?.email) return;
      fetch(`http://localhost:5260/api/notifications?email=${encodeURIComponent(user.email)}&role=Security`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (!data) return;
          setNotifications((prev) => filterValidNotifications(data, Object.keys(checkedIn)));
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [user?.email, checkedIn]);

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5260/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.email) return;
    try {
      await fetch(
        `http://localhost:5260/api/notifications/mark-all-read?email=${encodeURIComponent(user.email)}&role=Security`,
        { method: "PATCH" }
      );
      // Mark all as read, which will automatically hide the old "approved" ones
      setNotifications((prev) => 
        prev.map((n) => ({ ...n, isRead: true })).filter(n => n.type !== "approved")
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // ── Check In visitor from notification ──
  const handleCheckIn = async (visitorId, notifId) => {
    setCheckingIn(visitorId);
    try {
      const res = await fetch(
        `http://localhost:5260/api/visitors/${visitorId}/checkin`,
        { method: "PATCH" }
      );

      if (res.ok) {
        // Mark notification as read in backend so it never loads on this page again
        await fetch(`http://localhost:5260/api/notifications/${notifId}/read`, { method: "PATCH" });

        // Show success flash then remove card
        setCheckedIn((prev) => ({ ...prev, [notifId]: true }));
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notifId));
          setCheckedIn((prev) => {
            const next = { ...prev };
            delete next[notifId];
            return next;
          });
        }, 1800);
      } else {
        alert("Check-in failed. Visitor may have already been checked in.");
      }
    } catch (err) {
      alert("Error connecting to backend.");
    } finally {
      setCheckingIn(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const typeConfig = {
    approved:         { icon: CheckCircle, bg: "bg-green-100",  iconColor: "text-green-600",  border: "border-l-green-500",  label: "Visitor Approved — Ready to Check In" },
    rejected:         { icon: XCircle,     bg: "bg-red-100",    iconColor: "text-red-600",    border: "border-l-red-500",    label: "Visitor Rejected" },
    pending_approval: { icon: Clock,       bg: "bg-yellow-100", iconColor: "text-yellow-600", border: "border-l-yellow-500", label: "Pending Approval" },
    checked_in:       { icon: CheckCircle, bg: "bg-blue-100",   iconColor: "text-blue-600",   border: "border-l-blue-500",   label: "Checked In" },
    checked_out:      { icon: Bell,        bg: "bg-gray-100",   iconColor: "text-gray-600",   border: "border-l-gray-400",   label: "Checked Out" },
  };

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SecuritySidebar />

      <div className="flex-1 ml-64 p-8">
        <Header
          title="Notifications"
          subtitle="Visitor approval updates — check in approved visitors"
          action={
            <div className="flex items-center gap-2">
              <button onClick={() => fetchNotifications(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition" title="Refresh">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead}
                  className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg font-medium">
                  Mark all as read
                </button>
              )}
            </div>
          }
        />

        {/* Stats */}
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-6 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{notifications.length}</h3>
              <p className="text-xs text-gray-500">Total Notifications</p>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <h3 className="text-2xl font-bold text-yellow-600">{unreadCount}</h3>
            <p className="text-xs text-gray-500">Unread</p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <h3 className="text-2xl font-bold text-green-600">
              {notifications.filter((n) => n.type === "approved").length}
            </h3>
            <p className="text-xs text-gray-500">Ready to Check In</p>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <h3 className="text-2xl font-bold text-red-600">
              {notifications.filter((n) => n.type === "rejected").length}
            </h3>
            <p className="text-xs text-gray-500">Rejections</p>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : notifications.length === 0 && Object.keys(checkedIn).length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No notifications yet</h3>
            <p className="text-gray-500 text-sm mt-1">Approval and rejection updates from employees will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">

            {/* Flash cards */}
            {Object.keys(checkedIn).map((notifId) => (
              <div key={`flash-${notifId}`}
                className="rounded-xl p-5 border bg-blue-50 border-blue-200 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm font-medium text-blue-700">
                  Visitor checked in successfully! They are now in Active Visitors.
                </p>
              </div>
            ))}

            {/* Notification cards */}
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig["pending_approval"];
              const Icon = cfg.icon;
              const isApproved = n.type === "approved";

              return (
                <div key={n.id}
                  className={`bg-white rounded-xl p-5 shadow-sm border transition-all ${
                    !n.isRead ? `border-l-4 ${cfg.border}` : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${cfg.bg}`}>
                        <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{cfg.label}</p>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{n.message}</p>
                        <p className="text-xs text-gray-400">{formatTime(n.createdAt)}</p>

                        {/* CHECK IN button — only on approved notifications */}
                        {isApproved && (
                          <button
                            onClick={() => handleCheckIn(n.visitorId, n.id)}
                            disabled={checkingIn === n.visitorId}
                            className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                          >
                            <LogIn className="w-4 h-4" />
                            {checkingIn === n.visitorId ? "Checking In..." : "Check In Visitor"}
                          </button>
                        )}
                      </div>
                    </div>

                    {!n.isRead && (
                      <button onClick={() => markAsRead(n.id)}
                        className="text-xs text-green-600 hover:text-green-800 font-medium ml-4 flex-shrink-0">
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityNotifications;