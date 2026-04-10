// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Footer from "@/components/Footer/Footer.jsx";
import Navbar from "@/components/Navbar/Navbar.jsx";
import Home from "@/pages/Home/Home.jsx";
import About from "@/pages/About/About.jsx";
import Service from "@/pages/Service/Service.jsx";
import Menu from "@/pages/Menu/Menu.jsx";
import Booking from "@/pages/Booking/Booking.jsx";
import Team from "@/pages/Team/Team.jsx";
import Testimonial from "@/pages/Testimonial/Testimonial.jsx";
import Contact from "@/pages/Contact/Contact.jsx";
import SignIn from "@/pages/auth/SignIn/SignIn.jsx";
import SignUp from "@/pages/auth/SignUp/SignUp.jsx";
import ForgotPassword from "@/pages/auth/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "@/pages/auth/ResetPassword/ResetPassword.jsx";

import ProtectedRoute from "@/components/protectedRoute/protectedRoute.jsx";

import Dashboard from "@/pages/user/Dashboard/Dashboard.jsx";
import MyOrders from "@/pages/user/MyOrders/MyOrders.jsx";
import Profile from "@/pages/user/Profile/Profile.jsx";
import Cart from "@/pages/user/Cart/Cart.jsx";
import BookTable from "@/pages/Booking/BookTable.jsx";

import AdminLayout from "@/pages/Admin/AdminLayout.jsx";
import AdminDashboard from "@/pages/Admin/AdminDashboard.jsx";
import ManageFoods from "@/pages/Admin/ManageFoods.jsx";
import ManageOrders from "@/pages/Admin/ManageOrders.jsx";
import ManageUsers from "@/pages/Admin/ManageUsers.jsx";
import AddFood from "@/pages/Admin/AddFood.jsx";
import EditFood from "@/pages/Admin/EditFood.jsx";



import "@/App.css";

const App = () => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/service" element={<Service />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/book-table" element={<BookTable />} />
          <Route path="/team" element={<Team />} />
          <Route path="/testimonial" element={<Testimonial />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          // Add these routes:
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* USER ROUTES */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute requiredRole="user">
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="user">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute requiredRole="user">
                <Cart />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="manage-foods" element={<ManageFoods />} />
            <Route path="manage-orders" element={<ManageOrders />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="add-food" element={<AddFood />} />
            <Route path="edit-food/:id" element={<EditFood />} />
          </Route>
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;