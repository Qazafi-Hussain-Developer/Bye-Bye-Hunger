import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Admin.css";
import { getImageUrl } from '@/pages/utils/imageHelper.js';


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ManageFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFoods();
  }, []);

 const fetchFoods = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await axios.get(`${API_URL}/foods?showAll=true`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setFoods(response.data.data || []);
  } catch (error) {
    console.error("Error fetching foods:", error);
    setError("Failed to load foods");
  } finally {
    setLoading(false);
  }
};

const handleToggleAvailability = async (foodId, currentStatus) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/foods/${foodId}/toggle-availability`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Toggle response:', response.data);
    console.log('Food is now:', response.data.data.isAvailable ? 'Available' : 'Unavailable');
    
    // Refresh the list to show updated status
    await fetchFoods();
    
  } catch (error) {
    console.error("Error toggling availability:", error);
    console.error("Error details:", error.response?.data);
    alert(error.response?.data?.message || "Failed to update food status");
  }
};

  const handleDelete = async (foodId) => {
    if (window.confirm("Are you sure you want to delete this food item?")) {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        await axios.delete(`${API_URL}/foods/${foodId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchFoods(); // Refresh list
      } catch (error) {
        console.error("Error deleting food:", error);
        alert("Failed to delete food item");
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading foods...</p>
      </div>
    );
  }

  return (
    <div className="admin-manage-foods">
      <div className="page-header">
        <h1>Manage Foods</h1>
        <Link to="/admin/add-food" className="btn btn-primary btn-add-food">
          <i className="fas fa-plus"></i> Add New Food
        </Link>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Vegetarian</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food._id}>
                <td>
  <img 
  src={getImageUrl(food.image)} 
  alt={food.name} 
  className="food-thumbnail"
  onError={(e) => e.target.src = '/images/default-food.jpg'}
/>
</td>
                <td className="food-name">{food.name}</td>
                <td>
                  <span className="category-badge">{food.category}</span>
                </td>
                <td className="price">${food.price.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${food.isAvailable ? 'status-active' : 'status-inactive'}`}>
                    {food.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td>
                  {food.isVegetarian ? (
                    <span className="veg-badge">
                      <i className="fas fa-leaf"></i> Veg
                    </span>
                  ) : (
                    <span className="non-veg-badge">
                      <i className="fas fa-drumstick-bite"></i> Non-Veg
                    </span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <Link 
                      to={`/admin/edit-food/${food._id}`} 
                      className="btn-icon edit"
                      title="Edit Food"
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button 
                      className={`btn-icon toggle ${food.isAvailable ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleAvailability(food._id, food.isAvailable)}
                      title={food.isAvailable ? "Mark Unavailable" : "Mark Available"}
                    >
                      <i className={`fas ${food.isAvailable ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                    <button 
                      className="btn-icon delete"
                      onClick={() => handleDelete(food._id)}
                      title="Delete Food"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {foods.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center empty-message">
                  No food items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageFoods;