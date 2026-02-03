import React from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import Header from "../components/Header";
import {
  Bell,
  Moon,
  Globe,
  Lock,
  Shield,
  ChevronRight,
  Mail,
  Building,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const EmployeeSettings = () => {
  const { user, logout } = useAuth();

  const preferences = [
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage notification preferences",
      color: "text-blue-600",
    },
    {
      icon: Moon,
      title: "Appearance",
      description: "Dark mode and themes",
      color: "text-purple-600",
    },
    {
      icon: Globe,
      title: "Language",
      description: "English (US)",
      color: "text-green-600",
    },
  ];

  const security = [
    {
      icon: Lock,
      title: "Change Password",
      description: "Update your password",
      color: "text-orange-600",
    },
    {
      icon: Shield,
      title: "Two-Factor Auth",
      description: "Add extra security",
      color: "text-red-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EmployeeSidebar />

      <div className="flex-1 ml-64">
        <div className="p-8">
          <Header
            title="Settings"
            subtitle="Manage your employee account"
          />

          {/* Profile */}
          <div className="bg-white rounded-xl p-6 border mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-500 text-white flex items-center justify-center text-2xl font-semibold">
                  {user?.name?.charAt(0) || "E"}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {user?.name || "Employee"}
                  </h2>
                  <div className="flex items-center gap-1 text-sm text-purple-600 mt-1">
                    <span className="px-2 py-0.5 bg-purple-100 rounded">
                      Employee
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">Department</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">
                    {user?.email || "employee@company.com"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Department</p>
                  <p className="font-medium">Assigned</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl p-6 border mb-6">
            <h3 className="font-semibold mb-4">Preferences</h3>
            <div className="space-y-2">
              {preferences.map((pref, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className={`p-2 bg-gray-100 rounded-lg ${pref.color}`}>
                    <pref.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{pref.title}</p>
                    <p className="text-sm text-gray-600">
                      {pref.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl p-6 border mb-6">
            <h3 className="font-semibold mb-4">Security</h3>
            <div className="space-y-2">
              {security.map((sec, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className={`p-2 bg-gray-100 rounded-lg ${sec.color}`}>
                    <sec.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{sec.title}</p>
                    <p className="text-sm text-gray-600">
                      {sec.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-4 border border-red-200 text-red-600 rounded-xl hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSettings;
