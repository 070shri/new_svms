import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Button from "../components/Button";
import { Search, Download, Eye } from "lucide-react";

const VisitorLogs = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  /* ================= DATA (EMPTY FOR NOW) ================= */
  const filters = [
    "All",
    "Checked In",
    "Checked Out",
    "Pending",
    "Approved",
    "Rejected",
  ];

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
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header
            title="Visitor Logs"
            subtitle="Complete history of all visitor activity"
            action={<Button icon={Download}>Export</Button>}
          />

          {/* ================= SEARCH & FILTERS ================= */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, company, or purpose..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === filter
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================= TABLE ================= */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No visitor logs available
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                              {log.initials}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {log.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {log.company}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {log.purpose}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm">{log.host}</p>
                          <p className="text-xs text-gray-600">
                            {log.department}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {log.entryTime}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {log.exitTime}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              log.status
                            )}`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
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

export default VisitorLogs;
