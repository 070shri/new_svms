import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ShieldCheck, Users, Building2, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  // AUTO REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    if (!isAuthenticated || !role) return;

    if (role === "administrator") {
      navigate("/dashboard", { replace: true });
    }

    if (role === "security") {
      navigate("/security-dashboard", { replace: true });
    }

    if (role === "employee") {
      navigate("/employee-dashboard", { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const roles = [
    {
      id: "administrator",
      icon: Shield,
      title: "Administrator",
      description: "Full system access and analytics",
      color: "bg-blue-500",
    },
    {
      id: "security",
      icon: ShieldCheck,
      title: "Security Personnel",
      description: "Manage visitor check-ins and access",
      color: "bg-green-500",
    },
    {
      id: "employee",
      icon: Users,
      title: "Employee",
      description: "Host visitors and manage requests",
      color: "bg-purple-500",
    },
  ];

  // ✅ FIXED ROUTING
  const handleRoleSelect = (roleId) => {
    if (roleId === "employee") {
      navigate("/employee-login");
    } else {
      navigate("/login", { state: { role: roleId } });
    }
  };

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
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Select your role
          </h2>
          <p className="text-gray-600 mb-6">
            Choose how you want to sign in
          </p>

          <div className="space-y-3">
            {roles.map((roleItem) => (
              <button
                key={roleItem.id}
                onClick={() => handleRoleSelect(roleItem.id)}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
              >
                <div
                  className={`w-12 h-12 ${roleItem.color} rounded-full flex items-center justify-center`}
                >
                  <roleItem.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">
                    {roleItem.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {roleItem.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 Smart VMS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
