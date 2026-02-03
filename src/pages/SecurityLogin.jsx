import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SecurityLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ ALWAYS set role explicitly
    login("security");

    // ✅ use replace to avoid going back to role-selection
    navigate("/security-dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-lg">
            🏢
          </div>
          <div>
            <h1 className="text-lg font-semibold">Visitor Management</h1>
            <p className="text-xs text-gray-500">
              Secure access control system
            </p>
          </div>
        </div>

        {/* ✅ Back button must navigate */}
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="flex items-center gap-1 text-xs text-gray-500 mb-5"
        >
          <span>←</span>
          <span>Back to roles</span>
        </button>

        <div className="flex items-center gap-3 mb-6 rounded-2xl bg-slate-50 px-4 py-3">
          <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm">
            🛡
          </div>
          <div>
            <p className="text-xs font-medium">Security Personnel</p>
            <p className="text-[11px] text-gray-500">
              Signing in as security
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              defaultValue="michael.chen@company.com"
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-2xl bg-blue-600 text-white text-sm font-medium mt-2"
          >
            Sign In
          </button>

          <p className="text-[11px] text-center text-gray-400 mt-2">
            Demo: Enter any password to continue.
          </p>
        </form>

        <p className="mt-6 text-[11px] text-center text-gray-400">
          © 2024 Smart VMS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SecurityLogin;
