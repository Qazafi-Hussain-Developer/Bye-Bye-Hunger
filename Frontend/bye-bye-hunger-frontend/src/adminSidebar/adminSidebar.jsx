// src/adminSidebar/adminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './adminSidebar.css';

const AdminSidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/admin/manage-foods', icon: 'fas fa-utensils', label: 'Foods' },
    { path: '/admin/manage-orders', icon: 'fas fa-shopping-bag', label: 'Orders' },
    { path: '/admin/manage-users', icon: 'fas fa-users', label: 'Users' },
    { path: '/admin/manage-bookings', icon: 'fas fa-calendar-check', label: 'Bookings' },
    { path: '/admin/manage-testimonials', icon: 'fas fa-comment-dots', label: 'Testimonials' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <h3>Bye-Bye-Hunger</h3>
        <p>Admin Panel</p>
      </div>
      
      <ul className="admin-sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link 
              to={item.path} 
              className={`admin-sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <i className={item.icon}></i>
              {!collapsed && <span>{item.label}</span>}
              {collapsed && <span className="tooltip">{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;