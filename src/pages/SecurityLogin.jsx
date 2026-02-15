import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Lock, User } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";

const SecurityLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5260/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "Security" }), // Matches AuthService.cs
      });

      if (response.ok) {
        const userData = await response.json();
        login(userData);
        // Successful login redirects to security dashboard
        navigate("/SecurityDashboard", { replace: true });
      } else {
        const error = await response.json();
        alert(error.message || "Security access denied.");
      }
    } catch (err) {
      alert("Backend is not responding. Ensure SVMS.API is running.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Security Portal</h1>
          <p className="text-sm text-slate-500">Gate & Visitor Management Access</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input 
            label="Security Email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            icon={User} 
            required 
            placeholder="gate01@svms.io"
          />
          <Input 
            label="Secure Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            icon={Lock} 
            required 
            placeholder="••••••••"
          />
          <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg font-semibold shadow-emerald-200"
          >
            Authenticate
          </Button>
        </form>

        <button 
          onClick={() => navigate("/role-selection")}
          className="w-full mt-6 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← Back to Role Selection
        </button>
      </div>
    </div>
  );
};

export default SecurityLogin;