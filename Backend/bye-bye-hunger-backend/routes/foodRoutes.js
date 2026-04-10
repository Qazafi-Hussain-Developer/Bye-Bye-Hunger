// routes/foodRoutes.js
import express from 'express';
import {
  getFoods,
  getFoodById,
  getFoodsByCategory,
  createFood,
  updateFood,
  deleteFood,
  toggleFoodAvailability
} from '../controllers/foodController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/fileMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getFoods);
router.get('/category/:category', getFoodsByCategory);
router.get('/:id', getFoodById);

// Admin only routes
router.post('/', protect, admin, upload.single('image'), createFood);
router.put('/:id', protect, admin, upload.single('image'), updateFood);
router.patch('/:id/toggle-availability', protect, admin, toggleFoodAvailability);
router.delete('/:id', protect, admin, deleteFood);

export default router;