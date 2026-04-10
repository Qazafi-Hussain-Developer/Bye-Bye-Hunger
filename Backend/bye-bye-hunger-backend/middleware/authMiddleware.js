// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  console.log('🔐 Auth middleware called');
  console.log('Headers:', req.headers.authorization);

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('📝 Token extracted:', token.substring(0, 30) + '...');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified. Decoded:', decoded);

      // Get user from token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      console.log('👤 User found:', req.user ? req.user.email : 'NO USER FOUND');

      if (!req.user) {
        console.log('❌ User not found in database for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if account is active
      if (req.user.isActive === false) {
        console.log('❌ Account is deactivated');
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.'
        });
      }

      console.log('✅ Auth successful for:', req.user.email);
      next();
    } catch (error) {
      console.error('❌ Auth error:', error.message);
      console.error('Token that failed:', token);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: error.message
      });
    }
  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    console.log('✅ Admin access granted for:', req.user.email);
    next();
  } else {
    console.log('❌ Admin access denied for:', req.user?.email);
    return res.status(403).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
};

// Admin only middleware (alias for admin)
export const adminOnly = admin;

// Optional: Check if user owns resource
export const checkOwnership = (resourceModel) => async (req, res, next) => {
  try {
    const resource = await resourceModel.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check if user owns the resource or is admin
    if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
    
    req.resource = resource;
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};