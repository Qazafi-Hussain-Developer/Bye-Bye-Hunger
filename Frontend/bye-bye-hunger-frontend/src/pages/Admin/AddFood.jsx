import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Admin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AddFood = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "main-course",
    ingredients: "",
    isVegetarian: false,
    isSpicy: false,
    preparationTime: 20,
    calories: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState("");

  const categories = [
    { value: "appetizer", label: "Appetizer" },
    { value: "main-course", label: "Main Course" },
    { value: "dessert", label: "Dessert" },
    { value: "beverage", label: "Beverage" },
    { value: "soup", label: "Soup" },
    { value: "salad", label: "Salad" },
    { value: "special", label: "Special" }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("ingredients", formData.ingredients);
      data.append("isVegetarian", formData.isVegetarian);
      data.append("isSpicy", formData.isSpicy);
      data.append("preparationTime", formData.preparationTime);
      data.append("calories", formData.calories);
      if (formData.image) {
        data.append("image", formData.image);
      }

      await axios.post(`${API_URL}/foods`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      navigate("/admin/manage-foods");
    } catch (error) {
      console.error("Error adding food:", error);
      setError(error.response?.data?.message || "Failed to add food item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-food">
      <div className="page-header">
        <h1>Add New Food Item</h1>
        <button onClick={() => navigate("/admin/manage-foods")} className="btn btn-secondary">
          <i className="fas fa-arrow-left"></i> Back
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Food Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter food name"
            />
          </div>

          <div className="form-group">
            <label>Price ($) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>

          <div className="form-group full-width">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Describe the food item..."
            ></textarea>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ingredients</label>
            <input
              type="text"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              placeholder="Comma separated (e.g., Cheese, Tomato, Basil)"
            />
          </div>

          <div className="form-group">
            <label>Preparation Time (minutes)</label>
            <input
              type="number"
              name="preparationTime"
              value={formData.preparationTime}
              onChange={handleChange}
              min="5"
              max="120"
            />
          </div>

          <div className="form-group">
            <label>Calories</label>
            <input
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              min="0"
              placeholder="Calories per serving"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isVegetarian"
                checked={formData.isVegetarian}
                onChange={handleChange}
              />
              <span>Vegetarian</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isSpicy"
                checked={formData.isSpicy}
                onChange={handleChange}
              />
              <span>Spicy</span>
            </label>
          </div>

          <div className="form-group full-width">
            <label>Food Image</label>
            <div className="image-upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button 
                    type="button"
                    className="remove-image"
                    onClick={() => {
                      setFormData({ ...formData, image: null });
                      setImagePreview("");
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
              {!imagePreview && (
                <div className="upload-placeholder">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>Click or drag to upload image</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Adding...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Add Food Item
              </>
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate("/admin/manage-foods")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFood;