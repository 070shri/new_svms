import React from "react";
import SecuritySidebar from "../components/SecuritySidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import Button from "../components/Button";
import VisitorListItem from "../components/VisitorListItem";
import {
  Users,
  LogIn,
  LogOut,
  AlertCircle,
  UserPlus,
  Clock,
  Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SecurityDashboard = () => {
  const navigate = useNavigate();

  // 🔹 EMPTY STATES (DATA WILL COME FROM API LATER)
  const stats = [];
  const quickActions = [
    { icon: UserPlus, label: "New Visitor", color: "bg-blue-500", path: "/security-register-visitor" },
    { icon: LogIn, label: "Check In", color: "bg-green-500", path: "/security-active-visitors" },
    { icon: LogOut, label: "Check Out", color: "bg-purple-500", path: "/security-active-visitors" },
    { icon: Bell, label: "Alerts", color: "bg-orange-500", path: "/security-notifications" }
  ];

  const liveVisitors = [];
  const securityAlerts = [];

  const handleCheckOut = () => {
    // API logic will be added later
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SecuritySidebar />

      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header
            title="Security Dashboard"
            subtitle="Manage visitor check-ins and access control"
            action={
              <Button
                icon={UserPlus}
                onClick={() => navigate("/security-register-visitor")}
              >
                Quick Registration
              </Button>
            }
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.length === 0 && (
              <div className="col-span-full text-center text-gray-500 text-sm">
                No statistics available
              </div>
            )}
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900">{action.label}</p>
              </button>
            ))}
          </div>

          {/* Live Visitor List & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Visitors */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Live Visitor List
                </h2>
              </div>

              {liveVisitors.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">
                  No active visitors
                </p>
              ) : (
                <div className="space-y-3">
                  {liveVisitors.map((visitor) => (
                    <VisitorListItem
                      key={visitor.id}
                      visitor={visitor}
                      onCheckOut={handleCheckOut}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Security Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Security Alerts
                </h2>
              </div>

              {securityAlerts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">
                  No active alerts
                </p>
              ) : (
                <div className="space-y-3">
                  {securityAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg bg-gray-100"
                    >
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs opacity-80">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
