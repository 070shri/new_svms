import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import VisitorCard from "../components/VisitorCard";

const ActiveVisitors = () => {
  /* ================= DATA (EMPTY FOR NOW) ================= */
  const visitors = [];

  const handleCheckOut = (visitorId) => {
    // TODO: integrate checkout API
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header
            title="Active Visitors"
            subtitle="Currently on premises"
            action={
              <div className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-medium">
                0 Active
              </div>
            }
          />

          {/* ================= VISITOR CARDS ================= */}
          {visitors.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No active visitors at the moment
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visitors.map((visitor) => (
                <VisitorCard
                  key={visitor.id}
                  visitor={visitor}
                  onCheckOut={handleCheckOut}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveVisitors;
