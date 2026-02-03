import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Lock, Building2, Shield } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // ✅ DO NOT FORCE DEFAULT ROLE
  const role = location.state?.role;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ If role missing, go back safely
    if (!role) {
      navigate("/role-selection", { replace: true });
      return;
    }

    // ✅ CALL LOGIN CORRECTLY (ONLY ROLE)
    login(role);

    // ✅ NAVIGATE BASED ON ROLE
    if (role === "security") {
      navigate("/security-dashboard", { replace: true });
    } else if (role === "administrator") {
      navigate("/dashboard", { replace: true });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getRoleInfo = () => {
    const roles = {
      administrator: {
        title: "Administrator",
        subtitle: "Signing in as admin",
        icon: Shield,
      },
      security: {
        title: "Security Personnel",
        subtitle: "Signing in as security",
        icon: Shield,
      },
      employee: {
        title: "Employee",
        subtitle: "Signing in as employee",
        icon: User,
      },
    };
    return roles[role] || roles.administrator;
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Visitor Management
          </h1>
          <p className="text-gray-600">Secure access control system</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* ✅ FIX BACK BUTTON */}
          <button
            onClick={() => navigate("/role-selection", { replace: true })}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to roles</span>
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                role === "security" ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              <roleInfo.icon
                className={`w-6 h-6 ${
                  role === "security"
                    ? "text-green-600"
                    : "text-blue-600"
                }`}
              />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {roleInfo.title}
              </h2>
              <p className="text-sm text-gray-600">
                {roleInfo.subtitle}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={
                role === "security"
                  ? "michael.chen@company.com"
                  : "sarah.johnson@company.com"
              }
              icon={User}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={Lock}
              required
            />

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Demo: Enter any password to continue
          </p>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 Smart VMS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
