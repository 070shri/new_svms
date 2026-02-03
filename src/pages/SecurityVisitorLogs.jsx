import React, { useState } from "react";
import SecuritySidebar from "../components/SecuritySidebar";
import Header from "../components/Header";
import Button from "../components/Button";
import { Search, Download } from "lucide-react";

const SecurityVisitorLogs = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = [
    "All",
    "Checked In",
    "Checked Out",
    "Pending",
    "Approved",
    "Rejected",
  ];

  // ❌ MOCK DATA REMOVED
  const logs = [];

  const getStatusColor = (status) => {
    const colors = {
      "Checked In": "bg-green-100 text-green-700",
      "Checked Out": "bg-gray-100 text-gray-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Approved: "bg-blue-100 text-blue-700",
      Rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SecuritySidebar />

      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header
            title="Visitor Logs"
            subtitle="Complete history of all visitor activity"
            action={<Button icon={Download}>Export</Button>}
          />

          {/* 🔍 Search & Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, company, or purpose..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === filter
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 📋 Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Visitor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Host
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Entry Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Exit Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {logs.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-16 text-center text-gray-500"
                      >
                        No visitor logs available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityVisitorLogs;
