import React, { useState, useEffect, useCallback } from "react";
import SecuritySidebar from "../components/SecuritySidebar";
import Header from "../components/Header";
import { LogOut, RefreshCw, User, Clock, Building, X, ShieldCheck } from "lucide-react";

const SecurityActiveVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(null); 
  const [checkingIn, setCheckingIn] = useState(null); 
  const [selectedVisitor, setSelectedVisitor] = useState(null); 
  const [checkedOut, setCheckedOut] = useState({}); 

  const fetchActiveVisitors = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("http://localhost:5260/api/visitors");
      if (res.ok) {
        const data = await res.json();
        const active = data.filter((v) => v.status === "Checked In" || v.status === "Approved");
        setVisitors(active);
      }
    } catch (err) {
      console.error("Failed to fetch active visitors:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchActiveVisitors(); }, [fetchActiveVisitors]);

  useEffect(() => {
    const interval = setInterval(() => fetchActiveVisitors(), 15000);
    return () => clearInterval(interval);
  }, [fetchActiveVisitors]);

  // ── Check In ──
  const handleCheckIn = async (visitorId) => {
    setCheckingIn(visitorId);
    try {
      const res = await fetch(
        `http://localhost:5260/api/visitors/${visitorId}/checkin`,
        { method: "PATCH" }
      );

      if (res.ok) {
        fetchActiveVisitors(); 
        if (selectedVisitor?.id === visitorId) setSelectedVisitor(null); 
      } else {
        alert("Check-in failed. Please try again.");
      }
    } catch (err) {
      alert("Error connecting to backend.");
    } finally {
      setCheckingIn(null);
    }
  };

  // ── Check Out ──
  const handleCheckOut = async (visitorId) => {
    setCheckingOut(visitorId);
    try {
      const res = await fetch(
        `http://localhost:5260/api/visitors/${visitorId}/checkout`,
        { method: "PATCH" }
      );

      if (res.ok) {
        setCheckedOut((prev) => ({ ...prev, [visitorId]: true }));
        setTimeout(() => {
          setVisitors((prev) => prev.filter((v) => v.id !== visitorId));
          setCheckedOut((prev) => {
            const next = { ...prev };
            delete next[visitorId];
            return next;
          });
          if (selectedVisitor?.id === visitorId) setSelectedVisitor(null);
        }, 1500);
      } else {
        alert("Check-out failed. Please try again.");
      }
    } catch (err) {
      alert("Error connecting to backend.");
    } finally {
      setCheckingOut(null);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (dateStr) => {
    if (!dateStr) return "";
    const mins = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (mins < 60) return `${mins}m inside`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m inside`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SecuritySidebar />

      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header
            title="Active & Expected Visitors"
            subtitle="Manage gate check-ins and active visitors"
          />

          <div className="flex items-center justify-end mb-6 gap-3">
            <button
              onClick={() => fetchActiveVisitors(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-medium text-sm">
              {visitors.filter(v => v.status === 'Checked In').length} Active
            </div>
            <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm">
              {visitors.filter(v => v.status === 'Approved').length} Expected
            </div>
          </div>

          {Object.keys(checkedOut).length > 0 && (
            <div className="space-y-2 mb-4">
              {Object.keys(checkedOut).map((id) => (
                <div key={`co-${id}`}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <LogOut className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-600 font-medium">Visitor checked out successfully.</p>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            </div>
          ) : visitors.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700">No active or expected visitors</h3>
              <p className="text-gray-500 text-sm mt-1">
                Approved visitors will appear here for check-in.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visitors.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {v.photo ? (
                      <img src={v.photo} alt={v.fullName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-green-200 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {v.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">{v.fullName}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${
                          v.status === 'Checked In' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {v.status === 'Approved' ? 'Expected' : 'Checked In'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />{v.company}
                        </span>
                        <span>Host: <span className="font-medium text-gray-700">{v.host}</span></span>
                        <span>Purpose: <span className="font-medium text-gray-700">{v.purpose}</span></span>
                        
                        {v.status === 'Checked In' && v.checkedInAt && (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <Clock className="w-3 h-3" />
                            In at {formatDateTime(v.checkedInAt)} · {formatDuration(v.checkedInAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => setSelectedVisitor(v)}
                      className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      View
                    </button>
                    
                    {v.status === 'Approved' ? (
                      <button
                        onClick={() => handleCheckIn(v.id)}
                        disabled={checkingIn === v.id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {checkingIn === v.id ? "Checking In..." : "Check In"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCheckOut(v.id)}
                        disabled={checkingOut === v.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-60"
                      >
                        <LogOut className="w-4 h-4" />
                        {checkingOut === v.id ? "Checking Out..." : "Check Out"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedVisitor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className={`relative h-20 ${selectedVisitor.status === 'Checked In' ? 'bg-green-600' : 'bg-blue-600'}`}>
              <button onClick={() => setSelectedVisitor(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-1.5 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-8 pb-8">
              <div className="relative -mt-10 mb-4 flex justify-center">
                {selectedVisitor.photo ? (
                  <img src={selectedVisitor.photo} alt={`${selectedVisitor.fullName} Profile`}
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
                <span className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                  selectedVisitor.status === 'Checked In' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedVisitor.status === 'Approved' ? 'Expected at Gate' : 'Checked In'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm border-t pt-5">
                {[
                  { label: "Email",      value: selectedVisitor.email },
                  { label: "Phone",      value: selectedVisitor.phone },
                  { label: "Host",       value: selectedVisitor.host },
                  { label: "Purpose",    value: selectedVisitor.purpose },
                  { label: "ID Type",    value: selectedVisitor.idType },
                  { label: "ID Number",  value: selectedVisitor.idNumber },
                  { label: "Scheduled",  value: `${selectedVisitor.date} at ${selectedVisitor.time}` },
                  { label: "Checked In", value: selectedVisitor.checkedInAt ? formatDateTime(selectedVisitor.checkedInAt) : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className="text-gray-900 font-semibold mt-0.5 text-sm">{value || "—"}</p>
                  </div>
                ))}
              </div>
              
              {selectedVisitor.status === 'Approved' ? (
                <button
                  onClick={() => handleCheckIn(selectedVisitor.id)}
                  disabled={checkingIn === selectedVisitor.id}
                  className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {checkingIn === selectedVisitor.id ? "Checking In..." : "Check In Visitor"}
                </button>
              ) : (
                <button
                  onClick={() => handleCheckOut(selectedVisitor.id)}
                  disabled={checkingOut === selectedVisitor.id}
                  className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60"
                >
                  <LogOut className="w-4 h-4" />
                  {checkingOut === selectedVisitor.id ? "Checking Out..." : "Check Out Visitor"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityActiveVisitors;