// src/utils/constants.js

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const FOOD_CATEGORIES = [
  { value: "appetizer", label: "Appetizer" },
  { value: "main-course", label: "Main Course" },
  { value: "dessert", label: "Dessert" },
  { value: "beverage", label: "Beverage" },
  { value: "soup", label: "Soup" },
  { value: "salad", label: "Salad" },
  { value: "special", label: "Special" },
];

export const ORDER_STATUS = {
  pending: { label: "Pending", color: "warning" },
  confirmed: { label: "Confirmed", color: "info" },
  preparing: { label: "Preparing", color: "primary" },
  ready: { label: "Ready", color: "success" },
  "out-for-delivery": { label: "Out for Delivery", color: "primary" },
  delivered: { label: "Delivered", color: "success" },
  cancelled: { label: "Cancelled", color: "danger" },
};

export const BOOKING_STATUS = {
  pending: { label: "Pending", color: "warning" },
  confirmed: { label: "Confirmed", color: "success" },
  cancelled: { label: "Cancelled", color: "danger" },
  completed: { label: "Completed", color: "info" },
};

export const DIETARY_PREFERENCES = [
  { value: "", label: "No Preference" },
  { value: "veg", label: "Vegetarian" },
  { value: "non-veg", label: "Non-Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten Free" },
];