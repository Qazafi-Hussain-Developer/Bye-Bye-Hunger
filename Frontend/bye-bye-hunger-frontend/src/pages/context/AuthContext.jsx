// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

// Create Context
const AuthContext = createContext();

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || sessionStorage.getItem("token"));

  // Set auth token for all axios requests
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Load user from token on app start
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/profile");
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to load user:", error);
        // Token is invalid or expired
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // SIGN UP FUNCTION
  const signUp = async (userData) => {
    try {
      const response = await api.post("/auth/register", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || "",
        address: userData.address || "",
        dietaryPreference: userData.dietaryPreference || "",
      });

      const { token: newToken, user: newUser } = response.data;

      // Store token based on remember me preference
      if (userData.rememberMe) {
        localStorage.setItem("token", newToken);
      } else {
        sessionStorage.setItem("token", newToken);
      }
      
      setToken(newToken);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Signup failed. Please try again.",
      };
    }
  };

  // SIGN IN FUNCTION
  const signIn = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: newToken, user: newUser } = response.data;

      // Store token based on remember me preference
      if (rememberMe) {
        localStorage.setItem("token", newToken);
      } else {
        sessionStorage.setItem("token", newToken);
      }
      
      setToken(newToken);
      setUser(newUser);

      return { success: true, user: newUser, role: newUser.role };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Invalid email or password",
      };
    }
  };

  // SIGN OUT FUNCTION
  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  };

  // UPDATE PROFILE FUNCTION
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update profile",
      };
    }
  };

  // CHANGE PASSWORD FUNCTION
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      return { success: true, message: "Password changed successfully" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to change password",
      };
    }
  };

  // GET DASHBOARD STATS
  const getDashboardStats = async () => {
    try {
      const response = await api.get("/auth/dashboard");
      return { success: true, stats: response.data.stats };
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      return { success: false, error: error.response?.data?.message };
    }
  };

  // ADD LOYALTY POINTS
  const addLoyaltyPoints = async (points, reason) => {
    try {
      const response = await api.post("/auth/add-points", { points, reason });
      setUser(prev => ({ ...prev, loyaltyPoints: response.data.loyaltyPoints }));
      return { success: true, loyaltyPoints: response.data.loyaltyPoints };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to add points",
      };
    }
  };

  // CHECK IF USER HAS REQUIRED ROLE
  const hasRole = (requiredRole) => {
    if (!user) return false;
    if (requiredRole === "user") return true;
    return user.role === requiredRole;
  };

  const value = {
    user,
    loading,
    token,
    signUp,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    getDashboardStats,
    addLoyaltyPoints,
    hasRole,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthContext;