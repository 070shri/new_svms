import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Lock, Building2 } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const roleFromState = location.state?.role;

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const backendRole = roleFromState === "administrator" ? "Admin" : 
                       roleFromState === "security" ? "Security" : "Employee";

    try {
      const response = await fetch("http://localhost:5260/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password, role: backendRole }),
      });

      if (response.ok) {
        const userData = await response.json();
        login(userData);

        if (userData.role === "Admin") {
          navigate("/dashboard", { replace: true });
        } else if (userData.role === "Security") {
          navigate("/security-dashboard", { replace: true });
        }
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (err) {
      alert("Backend error! Is the API running on port 5260?");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <button onClick={() => navigate("/role-selection")} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> <span className="text-sm">Back to roles</span>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center capitalize">Login as {roleFromState}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} icon={User} required />
          <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} icon={Lock} required />
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </div>
    </div>
  );
};

export default Login;