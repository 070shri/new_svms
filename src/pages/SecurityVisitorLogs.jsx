import React, { useState, useEffect } from "react";
import SecuritySidebar from "../components/SecuritySidebar";
import Header from "../components/Header";
import Button from "../components/Button";
import { Search, Download, Calendar as CalendarIcon, User, X } from "lucide-react";

const SecurityVisitorLogs = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const filters = ["All", "Pending Approval", "Approved", "Rejected", "Checked In", "Checked Out"];

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:5260/api/visitors");
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      log.fullName?.toLowerCase().includes(q) ||
      log.company?.toLowerCase().includes(q) ||
      log.host?.toLowerCase().includes(q);

    const matchesStatus = activeFilter === "All" || log.status === activeFilter;

    const logDate = log.date ? new Date(log.date).setHours(0, 0, 0, 0) : null;
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;
    const matchesDate =
      (!start || (logDate && logDate >= start)) &&
      (!end || (logDate && logDate <= end));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    const map = {
      "Checked In":       "bg-green-100 text-green-700",
      "Checked Out":      "bg-gray-100 text-gray-700",
      "Pending Approval": "bg-yellow-100 text-yellow-700",
      "Approved":         "bg-blue-100 text-blue-700",
      "Rejected":         "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  // CSV Export
  const handleExport = () => {
    const headers = ["Name", "Company", "Host", "Purpose", "Date", "Time", "Status", "Checked In At", "Checked Out At"];
    const rows = filteredLogs.map((v) => [
      v.fullName, v.company, v.host, v.purpose, v.date, v.time, v.status,
      v.checkedInAt  ? formatDateTime(v.checkedInAt)  : "—",
      v.checkedOutAt ? formatDateTime(v.checkedOutAt) : "—",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "visitor_logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SecuritySidebar />

      <div className="flex-1 ml-64 p-8">
        <Header
          title="Visitor Logs"
          subtitle="Complete visitor history"
          action={<Button icon={Download} onClick={handleExport}>Export</Button>}
        />

        {/* Search & Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6 mt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, company, or host..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
              <div className="flex items-center px-2 gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-sm outline-none" />
              </div>
              <div className="flex items-center px-2 gap-2 border-l border-gray-300">
                <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-sm outline-none" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap border-t border-gray-100 pt-3 mt-4">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === f ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                {f}
                {f !== "All" && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({logs.filter((v) => v.status === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr className="text-xs font-medium text-gray-500 uppercase">
                <th className="px-6 py-3">Visitor</th>
                <th className="px-6 py-3">Host</th>
                <th className="px-6 py-3">Purpose</th>
                <th className="px-6 py-3">Scheduled</th>
                <th className="px-6 py-3">Check In</th>
                <th className="px-6 py-3">Check Out</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedVisitor(log)}
                  >
                    {/* Visitor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {log.photo ? (
                          <img src={log.photo} className="w-10 h-10 rounded-full object-cover border" alt="" />
                        ) : (
                          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                            {log.fullName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.fullName}</p>
                          <p className="text-xs text-gray-500">{log.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.host}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.purpose}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <p>{log.date}</p>
                      <p className="text-xs text-gray-400">{log.time}</p>
                    </td>
                    {/* Check In time */}
                    <td className="px-6 py-4 text-sm">
                      {log.checkedInAt ? (
                        <span className="text-green-700">{formatDateTime(log.checkedInAt)}</span>
                      ) : "—"}
                    </td>
                    {/* Check Out time */}
                    <td className="px-6 py-4 text-sm">
                      {log.checkedOutAt ? (
                        <span className="text-gray-600">{formatDateTime(log.checkedOutAt)}</span>
                      ) : "—"}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Row count */}
          {!loading && filteredLogs.length > 0 && (
            <div className="px-6 py-3 border-t bg-gray-50 text-xs text-gray-500">
              Showing {filteredLogs.length} of {logs.length} visitor{logs.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="relative h-20 bg-green-600">
              <button onClick={() => setSelectedVisitor(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-8 pb-8">
              <div className="relative -mt-10 mb-4 flex justify-center">
                {selectedVisitor.photo ? (
                  <img src={selectedVisitor.photo}
                    className="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl border-4 border-white bg-gray-100 flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-gray-900">{selectedVisitor.fullName}</h2>
                <p className="text-gray-500 text-sm">{selectedVisitor.company}</p>
                <span className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(selectedVisitor.status)}`}>
                  {selectedVisitor.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t pt-5 text-sm">
                {[
                  { label: "Email",         value: selectedVisitor.email },
                  { label: "Phone",         value: selectedVisitor.phone },
                  { label: "Host",          value: selectedVisitor.host },
                  { label: "Purpose",       value: selectedVisitor.purpose },
                  { label: "ID Type",       value: selectedVisitor.idType },
                  { label: "ID Number",     value: selectedVisitor.idNumber },
                  { label: "Scheduled",     value: `${selectedVisitor.date} at ${selectedVisitor.time}` },
                  { label: "Registered By", value: selectedVisitor.registeredBy },
                  { label: "Check In",      value: formatDateTime(selectedVisitor.checkedInAt) },
                  { label: "Check Out",     value: formatDateTime(selectedVisitor.checkedOutAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className="text-gray-900 font-semibold mt-0.5 text-sm">{value || "—"}</p>
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

export default SecurityVisitorLogs;