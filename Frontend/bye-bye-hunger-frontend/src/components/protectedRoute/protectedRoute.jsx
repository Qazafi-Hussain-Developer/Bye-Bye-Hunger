import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../pages/context/AuthContext";
import LoadingSpinner from "../loadingSpinner/loadingSpinner";
import "./protectedRoute.css";

/**
 * Props:
 * - children: JSX component to render
 * - requiredRole: optional string ("admin" or "user") to restrict route
 * - redirectTo: optional string to redirect to (defaults to /signin)
 */
const ProtectedRoute = ({ children, requiredRole, redirectTo = "/signin" }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Not logged in → redirect to signin
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role check
  if (requiredRole) {
    // Admin route check
    if (requiredRole === "admin" && user?.role !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }
    // User route check (any authenticated user is fine for user routes)
    if (requiredRole === "user" && !user) {
      return <Navigate to="/signin" replace />;
    }
  }

  // User is authenticated and has correct role → render children
  return children;
};

export default ProtectedRoute;