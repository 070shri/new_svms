import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const EmployeeSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      path: "/employee-dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/employee-visitor-logs",
      icon: ClipboardList,
      label: "Visitor Logs",
    },
    {
      path: "/employee-settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-purple-600">Employee Panel</h1>
        <p className="text-xs text-gray-500">Visitor Management</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.name || "Employee"}
            </p>
            <p className="text-xs text-gray-500">Employee</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
