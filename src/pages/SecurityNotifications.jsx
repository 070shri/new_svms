import React, { useState } from "react";
import SecuritySidebar from "../components/SecuritySidebar";
import Header from "../components/Header";
import { Bell, MessageSquare } from "lucide-react";

const SecurityNotifications = () => {
  /* ================= EMPTY STATE (BACKEND WILL FILL) ================= */
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SecuritySidebar />

      <div className="flex-1 ml-64 p-8">
        <Header
          title="Notifications"
          subtitle="Updates and instructions from admin"
          action={
            unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg font-medium"
              >
                Mark all as read
              </button>
            )
          }
        />

        {/* ================= STATS ================= */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {notifications.length}
              </h3>
              <p className="text-sm text-gray-600">
                Total Notifications • {unreadCount} Unread
              </p>
            </div>
          </div>
        </div>

        {/* ================= LIST ================= */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              No notifications
            </h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl p-6 shadow-sm border transition-all ${
                  item.read
                    ? "border-gray-100"
                    : "border-l-4 border-l-green-500"
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Visitor Update from Admin
                      </h3>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteNotification(item.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Message Body (LOG BASED) */}
                <div className="bg-gray-50 rounded-lg p-4 text-sm mb-3">
                  <p>
                    <span className="font-medium">Visitor:</span>{" "}
                    {item.visitor?.name}
                  </p>
                  <p>
                    <span className="font-medium">Company:</span>{" "}
                    {item.visitor?.company}
                  </p>
                  <p>
                    <span className="font-medium">Purpose:</span>{" "}
                    {item.visitor?.purpose}
                  </p>
                  <p>
                    <span className="font-medium">Host:</span>{" "}
                    {item.visitor?.host}
                  </p>
                  <p className="mt-2">
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        item.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </p>
                </div>

                {/* Admin Message */}
                {item.adminMessage && (
                  <div className="text-sm text-gray-700 mb-3">
                    <span className="font-medium">Admin Message:</span>{" "}
                    {item.adminMessage}
                  </div>
                )}

                {/* Actions */}
                {!item.read && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityNotifications;
