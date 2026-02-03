import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null); // administrator | security | employee
  const [loading, setLoading] = useState(true);

  // 🔹 Load auth state from localStorage on app load
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedRole = localStorage.getItem("role");

    if (storedAuth === "true" && storedRole) {
      setIsAuthenticated(true);
      setRole(storedRole);
    } else {
      setIsAuthenticated(false);
      setRole(null);
    }

    setLoading(false);
  }, []);

  // 🔹 Login
  const login = (selectedRole) => {
    setIsAuthenticated(true);
    setRole(selectedRole);

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("role", selectedRole);
  };

  // 🔹 Logout
  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);

    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
