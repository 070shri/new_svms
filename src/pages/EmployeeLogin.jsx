import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

const EmployeeLogin = () => {
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
        body: JSON.stringify({ email, password, role: "Employee" }),
      });

      if (response.ok) {
        const userData = await response.json();
        login(userData);
        navigate("/employee-dashboard", { replace: true });
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (err) {
      alert("Check your backend connection.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-purple-600">Employee Login</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={User} required placeholder="abc@test.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={Lock} required placeholder="••••••••" />
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">Sign In</Button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeLogin;