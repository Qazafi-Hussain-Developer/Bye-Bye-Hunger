// src/pages/Admin/AdminLayout.jsx
import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminSidebar from "../../adminSidebar/adminSidebar";
import "./Admin.css";

const AdminLayout = () => {
  const { user, signOut, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if user is authenticated and is admin
  if (!isAuthenticated) {
    navigate("/signin");
    return null;
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className={`admin-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header */}
        <div className="admin-header">
          <button 
            className="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className={`fas ${sidebarCollapsed ? 'fa-bars' : 'fa-chevron-left'}`}></i>
          </button>
          
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">{user?.name}</span>
              <span className="admin-user-role">Administrator</span>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;