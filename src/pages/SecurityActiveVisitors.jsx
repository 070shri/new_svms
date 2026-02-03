import React from "react";
import SecuritySidebar from "../components/SecuritySidebar";
import Header from "../components/Header";
import VisitorListItem from "../components/VisitorListItem";

const SecurityActiveVisitors = () => {
  // 🔹 EMPTY ARRAY (DATA WILL COME FROM BACKEND)
  const visitors = [];

  const handleCheckOut = () => {
    // checkout logic will be added later
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SecuritySidebar />

      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header
            title="Active Visitors"
            subtitle="Manage currently checked-in visitors"
            action={
              <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-medium">
                {visitors.length} Active
              </div>
            }
          />

          {visitors.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <p className="text-gray-600">No active visitors at the moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visitors.map((visitor) => (
                <VisitorListItem
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

export default SecurityActiveVisitors;
