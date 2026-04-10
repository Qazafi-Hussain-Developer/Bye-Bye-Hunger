// routes/bookingRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { 
  createBooking, 
  getUserBookings, 
  getBookingById, 
  cancelBooking,
  updateBookingStatus,
  getAvailableTimeSlots,
  getAllBookings,
  getBookingStats,
  deleteBooking
} from '../controllers/bookingController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation rules for booking
const bookingValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('guests').isInt({ min: 1, max: 20 }).withMessage('Guests must be between 1 and 20')
];

// ============ PUBLIC ROUTES ============
// Get available time slots for a specific date
router.get('/available-times/:date', getAvailableTimeSlots);

// ============ USER ROUTES (Authenticated) ============
// Create a new booking
router.post('/', protect, bookingValidation, createBooking);

// Get all bookings for logged in user
router.get('/my-bookings', protect, getUserBookings);

// Get single booking by ID
router.get('/:id', protect, getBookingById);

// Cancel a booking (user)
router.put('/:id/cancel', protect, cancelBooking);

// ============ ADMIN ONLY ROUTES ============
// Get all bookings with filters (status, date range, pagination)
router.get('/admin/all', protect, adminOnly, getAllBookings);

// Get booking statistics (daily, weekly, monthly counts)
router.get('/admin/stats', protect, adminOnly, getBookingStats);

// Update booking status (confirm, complete, cancel)
router.put('/:id/status', protect, adminOnly, updateBookingStatus);

// Delete booking (admin only - hard delete)
router.delete('/:id', protect, adminOnly, deleteBooking);

export default router;