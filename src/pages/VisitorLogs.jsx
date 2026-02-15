import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Button from "../components/Button";
import { Search, Download, Calendar as CalendarIcon, User, X, Eye } from "lucide-react";

const VisitorLogs = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const filters = ["All", "Checked In", "Checked Out", "Pending", "Approved", "Rejected"];

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://localhost:5260/api/visitors'); 
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      log.fullName?.toLowerCase().includes(searchLower) ||
      log.company?.toLowerCase().includes(searchLower) ||
      log.host?.toLowerCase().includes(searchLower);
    
    const displayStatus = log.status === "Pre-Registered" ? "Approved" : 
                          log.status === "Pending Approval" ? "Pending" : log.status;
    const matchesStatus = activeFilter === "All" || displayStatus === activeFilter;

    const logDate = log.date ? new Date(log.date).setHours(0,0,0,0) : null;
    const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
    const end = endDate ? new Date(endDate).setHours(0,0,0,0) : null;
    const matchesDate = (!start || (logDate && logDate >= start)) && (!end || (logDate && logDate <= end));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    if (status === "Pre-Registered" || status === "Approved") return "bg-blue-100 text-blue-700";
    if (status === "Pending Approval" || status === "Pending") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <Header title="Admin Visitor Logs" subtitle="Complete history of premises access" action={<Button icon={Download}>Export</Button>} />

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 mt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, company, or host..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
              <div className="flex items-center px-2 gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-sm outline-none" />
              </div>
              <div className="flex items-center px-2 gap-2 border-l border-gray-300">
                <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-sm outline-none" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap border-t border-gray-50 pt-3 mt-4">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-xs font-medium text-gray-500 uppercase">
                <th className="px-6 py-3">Visitor</th>
                <th className="px-6 py-3">Host</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-16 text-center text-gray-500">Loading database...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-16 text-center text-gray-500">No logs found</td></tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedVisitor(log)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {log.photo ? <img src={log.photo} className="w-10 h-10 rounded-full object-cover border" alt="" /> : <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">{log.fullName?.charAt(0)}</div>}
                        <div><p className="text-sm font-medium text-gray-900">{log.fullName}</p><p className="text-xs text-gray-500">{log.company}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.host}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status === "Pre-Registered" ? "Approved" : log.status === "Pending Approval" ? "Pending" : log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-blue-600"><Eye className="w-5 h-5 mx-auto" /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedVisitor && <VisitorInfoModal visitor={selectedVisitor} onClose={() => setSelectedVisitor(null)} themeColor="bg-blue-600" />}
      </div>
    </div>
  );
};

const VisitorInfoModal = ({ visitor, onClose, themeColor }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
      <div className={`relative h-24 ${themeColor}`}>
        <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"><X className="w-5 h-5" /></button>
      </div>
      <div className="px-8 pb-8">
        <div className="relative -mt-12 mb-4 flex justify-center">
          {visitor.photo ? <img src={visitor.photo} className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg" /> : <div className="w-24 h-24 rounded-2xl border-4 border-white bg-gray-200 flex items-center justify-center shadow-lg"><User className="w-10 h-10 text-gray-400" /></div>}
        </div>
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{visitor.fullName}</h2>
          <p className="text-gray-500 text-sm font-medium">{visitor.company}</p>
        </div>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 border-t pt-6 text-sm">
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Email</p><p className="font-semibold text-gray-800">{visitor.email}</p></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p><p className="font-semibold text-gray-800">{visitor.phone}</p></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Host</p><p className="font-semibold text-gray-800">{visitor.host}</p></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Purpose</p><p className="font-semibold text-gray-800">{visitor.purpose}</p></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">ID Type</p><p className="font-semibold text-gray-800">{visitor.idType}</p></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">ID Number</p><p className="font-semibold text-gray-800">{visitor.idNumber}</p></div>
          <div className="col-span-2"><p className="text-[10px] font-bold text-gray-400 uppercase">Registered</p><p className="font-semibold text-gray-800">{visitor.date} at {visitor.time}</p></div>
        </div>
      </div>
    </div>
  </div>
);

export default VisitorLogs; // (or export VisitorLogs depending on the file)