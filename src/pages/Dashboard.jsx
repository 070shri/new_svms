import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Button from "../components/Button";
import {
  Users, LogIn, ClipboardList, AlertCircle, UserPlus, Clock, Settings, Building, Camera, ChevronRight, ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [liveVisitors, setLiveVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("http://localhost:5260/api/visitors");
        if (res.ok) {
          const data = await res.json();
          
          const activeCount = data.filter(v => v.status === "Checked In").length;
          const expectedCount = data.filter(v => v.status === "Approved").length;
          const pendingCount = data.filter(v => v.status === "Pending Approval").length;
          const todayStr = new Date().toISOString().split('T')[0];
          const totalToday = data.filter(v => v.date === todayStr).length;

          setStats([
            { title: "Total Today", value: totalToday, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "bg-blue-500" },
            { title: "Active Inside", value: activeCount, icon: LogIn, color: "text-green-600", bg: "bg-green-50", border: "bg-green-500" },
            { title: "Expected at Gate", value: expectedCount, icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50", border: "bg-indigo-500" },
            { title: "Pending Approvals", value: pendingCount, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50", border: "bg-orange-500" }
          ]);

          setLiveVisitors(data.filter(v => v.status === "Checked In"));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    { icon: UserPlus, label: "Register Visitor", desc: "Pre-approve entry", color: "bg-blue-600", path: "/admin/register-visitor" },
    { icon: Camera, label: "AI Cameras", desc: "Manage AI tracking", color: "bg-indigo-500", path: "/admin/cameras" },
    { icon: ClipboardList, label: "Visitor Logs", desc: "View full history", color: "bg-purple-600", path: "/admin/logs" },
    { icon: Settings, label: "System Settings", desc: "Configure platform", color: "bg-slate-700", path: "/admin/settings" }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="p-8 max-w-7xl mx-auto">
          <Header
            title="Admin Dashboard"
            subtitle="System overview and master control"
            action={
              <Button icon={UserPlus} onClick={() => navigate("/admin/register-visitor")}>
                Direct Registration
              </Button>
            }
          />

          {/* 🌟 Polished Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  {/* Bottom Accent Line */}
                  <div className={`absolute bottom-0 left-0 w-full h-1 ${stat.border} opacity-80 group-hover:opacity-100 transition-opacity`} />
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 🌟 Polished Live Visitor List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Facility Occupancy</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  {liveVisitors.length} Active
                </span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                  <p className="text-sm text-gray-500 text-center py-12">Loading visitors...</p>
                ) : liveVisitors.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-gray-300" /> {/* Or LogOut */}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Facility is empty</h3>
                    <p className="text-sm text-gray-500 mt-1">No active visitors currently checked in.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {liveVisitors.map((visitor) => (
                      <div key={visitor.id} className="flex items-center justify-between p-5 hover:bg-gray-50/80 transition-colors">
                        <div className="flex items-center gap-4">
                          {visitor.photo ? (
                            <img src={visitor.photo} alt="Visitor" className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg shadow-sm border border-blue-100">
                              {visitor.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900">{visitor.fullName}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Building className="w-3.5 h-3.5" /> {visitor.company} <span className="mx-1">•</span> Host: {visitor.host}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate('/admin/active-visitors')}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Manage
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 🌟 Polished Quick Actions Sidebar */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group text-left"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} text-white shadow-sm group-hover:scale-105 transition-transform`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{action.label}</p>
                      <p className="text-xs text-gray-500 font-medium">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;