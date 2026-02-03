import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Bell,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";

const AdminNotifications = () => {
  const [replyMessage, setReplyMessage] = useState("");

  /* ================= DATA STRUCTURE (MATCHES VISITOR LOGS) ================= */
  const notifications = [
    {
      id: 1,
      visitor: {
        name: "John Smith",
        company: "TechCorp Solutions",
        purpose: "Business Meeting",
        host: "Emily Davis",
      },
      requestedBy: "Security Desk",
      time: "5 minutes ago",
      status: "Pending",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        <Header
          title="Notifications"
          subtitle="Visitor approval requests from security"
        />

        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              {/* ================= HEADER ================= */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Visitor Approval Request
                    </h3>
                    <p className="text-xs text-gray-500">
                      {item.time} • Requested by {item.requestedBy}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                  Pending
                </span>
              </div>

              {/* ================= MESSAGE FORMAT (LOG-BASED) ================= */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm mb-4">
                <p>
                  <span className="font-medium">Visitor Name:</span>{" "}
                  {item.visitor.name}
                </p>
                <p>
                  <span className="font-medium">Company:</span>{" "}
                  {item.visitor.company}
                </p>
                <p>
                  <span className="font-medium">Purpose:</span>{" "}
                  {item.visitor.purpose}
                </p>
                <p>
                  <span className="font-medium">Host:</span>{" "}
                  {item.visitor.host}
                </p>
              </div>

              {/* ================= ADMIN MESSAGE ================= */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MessageSquare className="w-4 h-4" />
                  Message to Security / Employee (optional)
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Example: Approved. Please issue badge at Gate A."
                  rows={3}
                  className="w-full mt-2 p-3 border rounded-lg resize-none outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ================= ACTIONS ================= */}
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>

                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= EMPTY STATE ================= */}
        {notifications.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border">
            <Bell className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
