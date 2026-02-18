import React, { useState, useEffect, useCallback } from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import Header from "../components/Header";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { Search, Download, Eye, X } from "lucide-react";

const EmployeeLogs = () => {
  const { user } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedVisitor, setSelectedVisitor] = useState(null); // for detail modal

  const filters = ["All", "Pending Approval", "Approved", "Rejected", "Checked In", "Checked Out"];

  const fetchLogs = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(
        `http://localhost:5260/api/visitors/host/${encodeURIComponent(user.email)}`
      );
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch visitor logs:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // ── Filter + Search ──
  const filtered = logs.filter((v) => {
    const matchesFilter = activeFilter === "All" || v.status === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      v.fullName?.toLowerCase().includes(q) ||
      v.company?.toLowerCase().includes(q) ||
      v.purpose?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      "Checked In":       "bg-green-100 text-green-700",
      "Checked Out":      "bg-gray-100 text-gray-700",
      "Pending Approval": "bg-yellow-100 text-yellow-700",
      "Approved":         "bg-blue-100 text-blue-700",
      "Rejected":         "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  // ── CSV Export ──
  const handleExport = () => {
    const headers = ["Name", "Email", "Company", "Purpose", "Date", "Time", "Status", "Check In", "Check Out"];
    const rows = filtered.map((v) => [
      v.fullName, v.email, v.company, v.purpose,
      v.date, v.time, v.status,
      v.checkedInAt  ? formatDateTime(v.checkedInAt)  : "—",
      v.checkedOutAt ? formatDateTime(v.checkedOutAt) : "—",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_visitor_logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EmployeeSidebar />

      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header
            title="Visitor Logs"
            subtitle="Visitors hosted by you"
            action={<Button icon={Download} onClick={handleExport}>Export</Button>}
          />

          {/* Search & Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, company, or purpose..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter === filter
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filter}
                    {filter !== "All" && (
                      <span className="ml-1.5 text-xs opacity-70">
                        ({logs.filter((v) => v.status === filter).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
                          Loading visitor logs...
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                        {searchQuery || activeFilter !== "All"
                          ? "No visitors match your search or filter."
                          : "No visitor logs available."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors">

                        {/* Visitor */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {v.photo ? (
                              <img
                                src={v.photo}
                                alt={v.fullName}
                                className="w-10 h-10 rounded-full object-cover border"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                {v.fullName?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{v.fullName}</p>
                              <p className="text-xs text-gray-500">{v.company}</p>
                            </div>
                          </div>
                        </td>

                        {/* Purpose */}
                        <td className="px-6 py-4 text-sm text-gray-700">{v.purpose}</td>

                        {/* Scheduled date + time */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{v.date}</p>
                          <p className="text-xs text-gray-500">{v.time}</p>
                        </td>

                        {/* Check In time */}
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {v.checkedInAt ? (
                            <span className="text-green-700">{formatDateTime(v.checkedInAt)}</span>
                          ) : "—"}
                        </td>

                        {/* Check Out time */}
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {v.checkedOutAt ? (
                            <span className="text-gray-600">{formatDateTime(v.checkedOutAt)}</span>
                          ) : "—"}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(v.status)}`}>
                            {v.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedVisitor(v)}
                            className="text-purple-600 hover:text-purple-800 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Row count */}
            {!loading && filtered.length > 0 && (
              <div className="px-6 py-3 border-t bg-gray-50 text-xs text-gray-500">
                Showing {filtered.length} of {logs.length} visitor{logs.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Visitor Details</h2>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Photo + name */}
              <div className="flex items-center gap-4 mb-6">
                {selectedVisitor.photo ? (
                  <img src={selectedVisitor.photo} alt={selectedVisitor.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-200" />
                ) : (
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xl">
                    {selectedVisitor.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedVisitor.fullName}</h3>
                  <p className="text-gray-500 text-sm">{selectedVisitor.company}</p>
                  <span className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(selectedVisitor.status)}`}>
                    {selectedVisitor.status}
                  </span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Email",    value: selectedVisitor.email },
                  { label: "Phone",    value: selectedVisitor.phone },
                  { label: "Purpose",  value: selectedVisitor.purpose },
                  { label: "ID Type",  value: selectedVisitor.idType },
                  { label: "ID No.",   value: selectedVisitor.idNumber },
                  { label: "Date",     value: selectedVisitor.date },
                  { label: "Time",     value: selectedVisitor.time },
                  { label: "Registered By", value: selectedVisitor.registeredBy },
                  { label: "Check In",  value: selectedVisitor.checkedInAt  ? formatDateTime(selectedVisitor.checkedInAt)  : "—" },
                  { label: "Check Out", value: selectedVisitor.checkedOutAt ? formatDateTime(selectedVisitor.checkedOutAt) : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className="text-gray-900 font-semibold mt-0.5">{value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLogs;