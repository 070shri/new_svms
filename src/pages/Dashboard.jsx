import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import ActivityItem from "../components/ActivityItem";
import {
  Users,
  Clock,
  Zap,
} from "lucide-react";

const Dashboard = () => {
  /* ================= DATA (EMPTY FOR NOW) ================= */
  const stats = [];
  const additionalInfo = [];
  const recentActivities = [];
  const activeVisitors = [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header
            title="Dashboard"
            subtitle="Welcome back"
          />

          {/* ================= STATS GRID ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-6">
                No statistics available
              </div>
            ) : (
              stats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))
            )}
          </div>

          {/* ================= ADDITIONAL INFO ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {additionalInfo.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-6">
                No additional information available
              </div>
            ) : (
              additionalInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${info.color}`}>
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{info.label}</p>
                      <p className="font-semibold text-gray-900">
                        {info.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ================= ACTIVITY & ACTIVE VISITORS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h2>
              </div>

              {recentActivities.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-1">
                  {recentActivities.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </div>
              )}
            </div>

            {/* Active Visitors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Active Visitors
                  </h2>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                  0 Active
                </span>
              </div>

              {activeVisitors.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No active visitors
                </p>
              ) : (
                <div className="space-y-3">
                  {activeVisitors.map((visitor, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                          {visitor.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {visitor.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {visitor.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {visitor.badge}
                        </span>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{visitor.time}</span>
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

export default Dashboard;
