import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem("token");
    if (token) {
      // Set token in API headers and verify
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Try to get user data from localStorage first
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }
    setLoading(false);
  }, []);

  const loginWithCredentials = async (
    email,
    password,
    aadhaarNumber = null
  ) => {
    try {
      const loginData = { email, password };

      // Add Aadhaar number if provided (for voter login)
      if (aadhaarNumber) {
        loginData.aadhaarNumber = aadhaarNumber;
      }

      const response = await api.post("/auth/login", loginData);

      const { token, user: userData } = response.data;

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Set user
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const register = async (email, password) => {
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Set user
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const value = {
    user,
    login,
    loginWithCredentials,
    logout,
    register,
    getToken,
    loading,
    isAuthenticated: !!user,
    isEC: user?.role === "EC",
    isVoter: user?.role === "VOTER",
    isParty: user?.role === "PARTY",
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
