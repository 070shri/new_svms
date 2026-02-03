import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Building2 } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔐 LOGIN AS EMPLOYEE
    login("employee");

    // ✅ NAVIGATE AFTER LOGIN
    navigate("/employee-dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold">Visitor Management</h1>
          <p className="text-gray-500 text-sm">
            Secure access control system
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">Employee</p>
            <p className="text-xs text-gray-500">Signing in as employee</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="abc@test.com"
            icon={User}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            icon={Lock}
            required
          />

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-4">
          Demo: Enter any password to continue
        </p>
      </div>
    </div>
  );
};

export default EmployeeLogin;
