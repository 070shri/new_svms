import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ShieldCheck, Users, Building2, ChevronRight } from "lucide-react";

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: "administrator",
      icon: Shield,
      title: "Administrator",
      description: "Full system access and analytics",
      color: "bg-blue-500",
      path: "/login" // Targets Login.jsx
    },
    {
      id: "security",
      icon: ShieldCheck,
      title: "Security Personnel",
      description: "Manage visitor check-ins and access",
      color: "bg-green-500",
      path: "/security-login" // Targets SecurityLogin.jsx
    },
    {
      id: "employee",
      icon: Users,
      title: "Employee",
      description: "Host visitors and manage requests",
      color: "bg-purple-500",
      path: "/employee-login" // Targets EmployeeLogin.jsx
    },
  ];

  const handleRoleSelect = (role) => {
    if (role.id === "administrator") {
      navigate(role.path, { state: { role: "administrator" } });
    } else {
      navigate(role.path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Visitor Management</h1>
          <p className="text-gray-600">Secure access control system</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select your role</h2>
          <div className="space-y-3">
            {roles.map((roleItem) => (
              <button
                key={roleItem.id}
                onClick={() => handleRoleSelect(roleItem)}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group border border-transparent hover:border-blue-200"
              >
                <div className={`w-12 h-12 ${roleItem.color} rounded-full flex items-center justify-center shadow-sm`}>
                  <roleItem.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">{roleItem.title}</h3>
                  <p className="text-sm text-gray-600">{roleItem.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;