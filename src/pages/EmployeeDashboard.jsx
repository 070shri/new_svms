import React from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";

const EmployeeDashboard = () => {
  // ❌ MOCK DATA REMOVED
  const stats = [];
  const pendingRequests = [];
  const upcomingVisitors = [];
  const recentVisitors = [];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <EmployeeSidebar />

      <main className="ml-64 p-6 w-full">
        <h1 className="text-2xl font-semibold mb-1">Welcome</h1>
        <p className="text-gray-500 mb-6">
          Manage your visitor requests and history
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Stat title="Pending Requests" value="0" />
          <Stat title="Upcoming Visitors" value="0" />
          <Stat title="Total Hosted" value="0" />
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h3 className="font-semibold mb-4">Pending Visitor Requests</h3>

          {pendingRequests.length === 0 && (
            <p className="text-sm text-gray-500">
              No pending visitor requests
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card title="Upcoming Visitors">
            {upcomingVisitors.length === 0 ? (
              <span>No upcoming visitors</span>
            ) : null}
          </Card>

          <Card title="Recent Visitor History">
            {recentVisitors.length === 0 ? (
              <span>No visitor history available</span>
            ) : null}
          </Card>
        </div>
      </main>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const Stat = ({ title, value }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm">
    <h2 className="text-2xl font-bold">{value}</h2>
    <p className="text-sm text-gray-500">{title}</p>
  </div>
);

const Card = ({ title, children }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm">
    <h3 className="font-semibold mb-3">{title}</h3>
    <p className="text-sm text-gray-500">{children}</p>
  </div>
);

export default EmployeeDashboard;
