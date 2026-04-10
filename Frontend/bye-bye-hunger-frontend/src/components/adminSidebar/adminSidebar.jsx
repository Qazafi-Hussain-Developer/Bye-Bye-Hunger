import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../pages/context/AuthContext";

const AdminSidebar = ({ collapsed, onToggle }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Hamburger Toggle inside sidebar for mobile */}
      <button className="sidebar-mobile-toggle" onClick={onToggle}>
        <i className="fas fa-bars"></i>
      </button>
      
      <nav className="sidebar-nav">
        <Link to="/admin/dashboard" className="sidebar-link">
          <i className="fas fa-tachometer-alt"></i>
          <span>Dashboard</span>
        </Link>
        
        <Link to="/admin/manage-orders" className="sidebar-link">
          <i className="fas fa-shopping-bag"></i>
          <span>Orders</span>
        </Link>
        
        <Link to="/admin/manage-users" className="sidebar-link">
          <i className="fas fa-users"></i>
          <span>Users</span>
        </Link>
        
        <Link to="/admin/manage-foods" className="sidebar-link">
          <i className="fas fa-utensils"></i>
          <span>Foods</span>
        </Link>
        
        <Link to="/admin/settings" className="sidebar-link">
          <i className="fas fa-cog"></i>
          <span>Settings</span>
        </Link>
        
        <button onClick={handleLogout} className="sidebar-link logout">
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;