import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { AlertTriangle, Shield, Clock } from "lucide-react";

const SecurityAlerts = () => {
  /* ================= DATA (EMPTY FOR NOW) ================= */
  const alerts = [];

  const getPriorityColor = (priority) => {
    const colors = {
      High: "bg-red-100 text-red-700",
      Medium: "bg-yellow-100 text-yellow-700",
      Low: "bg-blue-100 text-blue-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header
            title="Security Alerts"
            subtitle="Monitor and manage security notifications"
            action={
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-medium">
                <Shield className="w-4 h-4" />
                <span>{alerts.length} Active Alerts</span>
              </div>
            }
          />

          {/* ================= ALERT LIST ================= */}
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="bg-white rounded-xl p-10 shadow-sm border border-gray-100 text-center text-gray-500">
                No security alerts available
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {alert.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {alert.description}
                          </p>
                        </div>

                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                            alert.priority
                          )}`}
                        >
                          {alert.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlerts;