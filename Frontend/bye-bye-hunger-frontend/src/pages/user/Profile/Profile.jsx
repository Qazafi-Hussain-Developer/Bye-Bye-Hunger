import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const { user, isAuthenticated, updateProfile, changePassword, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    dietaryPreference: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        dietaryPreference: user.dietaryPreference || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear message on change
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to change password' });
    }
    setLoading(false);
  };

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="profile-page py-5">
      <div className="container">
        <div className="profile-header">
          <h1 className="section-title ff-secondary text-primary fw-normal mb-3">
            My Profile
          </h1>
          <p className="text-muted">Manage your account information and preferences</p>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div className={`profile-alert profile-alert-${message.type}`}>
            <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
            <span>{message.text}</span>
          </div>
        )}

        <div className="profile-grid">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-placeholder">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="avatar-badge">
                <i className="fas fa-user"></i>
              </div>
            </div>
            <div className="profile-info">
              <h3>{user.name}</h3>
              <p className="user-email">{user.email}</p>
              <div className="user-badge">
                <span className={`role-badge role-${user.role}`}>
                  {user.role === 'admin' ? 'Administrator' : 'Member'}
                </span>
              </div>
              <div className="loyalty-points">
                <i className="fas fa-star"></i>
                <span>{user.loyaltyPoints || 0} Loyalty Points</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="profile-form-container">
            <div className="form-header">
              <h3>Profile Information</h3>
              {!isEditing && !isChangingPassword && (
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit"></i> Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">
                    <i className="fas fa-user"></i> Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    <i className="fas fa-phone"></i> Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    <i className="fas fa-map-marker-alt"></i> Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter your address"
                    disabled={loading}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="dietaryPreference">
                    <i className="fas fa-leaf"></i> Dietary Preference
                  </label>
                  <select
                    id="dietaryPreference"
                    name="dietaryPreference"
                    value={formData.dietaryPreference}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">No Preference</option>
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten Free</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i> Save Changes
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name || '',
                        phone: user.phone || '',
                        address: user.address || '',
                        dietaryPreference: user.dietaryPreference || ''
                      });
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : !isChangingPassword ? (
              <div className="profile-details">
                <div className="detail-item">
                  <label>Full Name</label>
                  <p>{user.name || 'Not set'}</p>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="detail-item">
                  <label>Phone Number</label>
                  <p>{user.phone || 'Not set'}</p>
                </div>
                <div className="detail-item">
                  <label>Address</label>
                  <p>{user.address || 'Not set'}</p>
                </div>
                <div className="detail-item">
                  <label>Dietary Preference</label>
                  <p>
                    {user.dietaryPreference === 'veg' && 'Vegetarian'}
                    {user.dietaryPreference === 'non-veg' && 'Non-Vegetarian'}
                    {user.dietaryPreference === 'vegan' && 'Vegan'}
                    {user.dietaryPreference === 'gluten-free' && 'Gluten Free'}
                    {!user.dietaryPreference && 'No Preference'}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Member Since</label>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                
                <button 
                  className="btn btn-outline-primary mt-3"
                  onClick={() => setIsChangingPassword(true)}
                >
                  <i className="fas fa-key"></i> Change Password
                </button>
              </div>
            ) : null}

            {/* Change Password Form */}
            {isChangingPassword && (
              <div className="password-form-container">
                <div className="form-header">
                  <h3>Change Password</h3>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setIsChangingPassword(false)}
                  >
                    Cancel
                  </button>
                </div>
                
                <form onSubmit={handleChangePassword} className="password-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">
                      <i className="fas fa-lock"></i> Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="newPassword">
                      <i className="fas fa-key"></i> New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      disabled={loading}
                    />
                    <small className="form-hint">
                      Password must be at least 6 characters
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      <i className="fas fa-check-circle"></i> Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i> Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Logout Button */}
            <div className="logout-section">
              <hr />
              <button 
                className="btn btn-danger logout-btn"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt"></i> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;