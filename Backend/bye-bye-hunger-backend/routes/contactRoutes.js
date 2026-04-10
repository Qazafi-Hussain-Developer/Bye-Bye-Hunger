// routes/contactRoutes.js
import express from 'express';
import {
  submitContact,
  getContacts,
  getContactsFromMySQL,
  getContactById,
  replyToContact,
  deleteContact,
  getContactStats,
  updateContactStatus
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { testMySQL } from '../controllers/contactController.js';

const router = express.Router();

// Public route
router.post('/', submitContact);

// Test route (admin only)
router.get('/test-mysql', protect, admin, testMySQL);

// Admin only routes
router.get('/', protect, admin, getContacts);
router.get('/mysql', protect, admin, getContactsFromMySQL);
router.get('/stats', protect, admin, getContactStats);
router.get('/:id', protect, admin, getContactById);
router.put('/:id/status', protect, admin, updateContactStatus);
router.post('/:id/reply', protect, admin, replyToContact);
router.delete('/:id', protect, admin, deleteContact);

export default router;