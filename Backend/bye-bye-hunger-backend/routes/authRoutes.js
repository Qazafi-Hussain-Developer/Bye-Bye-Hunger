// routes/authRoutes.js - UPDATED VERSION
import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getDashboardStats,
  addLoyaltyPoints,
  changePassword,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAdminStats,
  forgotPassword,
  resetPassword,
  sendEmailVerification,
  verifyEmail
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============ PUBLIC ROUTES ============
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// ============ PROTECTED ROUTES (Authenticated Users) ============
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/dashboard', protect, getDashboardStats);
router.post('/add-points', protect, addLoyaltyPoints);
router.put('/change-password', protect, changePassword);
router.post('/send-verification', protect, sendEmailVerification);

// ============ ADMIN ONLY ROUTES ============
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.get('/admin/stats', protect, adminOnly, getAdminStats);

export default router;