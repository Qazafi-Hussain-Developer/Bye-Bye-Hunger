// controllers/authController.js
import User from '../models/User.js';
import Order from '../models/Order.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/mysql.js';
import fileWriter from '../utils/fileWriter.js';


import crypto from 'crypto';
import { sendWelcomeEmail, sendPasswordResetEmail, sendVerificationEmail } from '../utils/emailService.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Helper function to sync user to MySQL
const syncUserToMySQL = async (user) => {
  try {
    const mysqlSql = `
      INSERT INTO users (name, email, password, phone, address, role, dietaryPreference, loyaltyPoints, isActive) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password = VALUES(password),
        phone = VALUES(phone),
        address = VALUES(address),
        role = VALUES(role),
        dietaryPreference = VALUES(dietaryPreference),
        loyaltyPoints = VALUES(loyaltyPoints),
        isActive = VALUES(isActive)
    `;
    
    await query(mysqlSql, [
      user.name,
      user.email,
      user.password,
      user.phone || '',
      user.address || '',
      user.role,
      user.dietaryPreference || '',
      user.loyaltyPoints || 0,
      user.isActive ? 1 : 0
    ]);
    return true;
  } catch (error) {
    console.error('MySQL sync error:', error.message);
    return false;
  }
};

// ============ ONE-TIME SYNC FUNCTION ============
export const syncAllPasswords = async () => {
  try {
    console.log('\n🔄 [SYNC] Starting password sync between MongoDB and MySQL...');
    
    const users = await User.find({}).select('+password').lean();
    console.log(`📊 [SYNC] Found ${users.length} users in MongoDB`);
    
    let syncedCount = 0;
    let createdCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        const [mysqlUsers] = await query('SELECT id, password FROM users WHERE email = ?', [user.email]);
        
        if (mysqlUsers.length === 0) {
          console.log(`📝 [SYNC] Creating ${user.email} in MySQL...`);
          await query(
            `INSERT INTO users (name, email, password, role, phone, address, loyaltyPoints, isActive) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              user.name,
              user.email,
              user.password,
              user.role || 'user',
              user.phone || '',
              user.address || '',
              user.loyaltyPoints || 0,
              1
            ]
          );
          createdCount++;
          console.log(`✅ [SYNC] Created ${user.email} in MySQL`);
        } else {
          const mysqlPassword = mysqlUsers[0].password;
          
          if (user.password !== mysqlPassword) {
            console.log(`⚠️ [SYNC] Password mismatch for ${user.email}`);
            await query('UPDATE users SET password = ? WHERE email = ?', [user.password, user.email]);
            console.log(`✅ [SYNC] Updated MySQL password for ${user.email}`);
            syncedCount++;
          } else {
            console.log(`✅ [SYNC] ${user.email} passwords already in sync`);
          }
        }
      } catch (userError) {
        console.error(`❌ [SYNC] Error syncing ${user.email}:`, userError.message);
        errorCount++;
      }
    }
    
    console.log('\n========================================');
    console.log(`🔄 [SYNC] Complete!`);
    console.log(`   ✅ Synced: ${syncedCount}`);
    console.log(`   📝 Created: ${createdCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ [SYNC] Sync error:', error.message);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, dietaryPreference } = req.body;

    console.log('\n========================================');
    console.log('📝 [REGISTER] Attempting to register:', email);
    console.log('📝 [REGISTER] Password length:', password?.length);
    console.log('📝 [REGISTER] Password first 3 chars:', password?.substring(0, 3));

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('❌ [REGISTER] User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('🔑 [REGISTER] Generated hash for', email);
    console.log('🔑 [REGISTER] Hash:', hashedPassword);
    console.log('🔑 [REGISTER] Hash length:', hashedPassword.length);
    console.log('🔑 [REGISTER] Hash starts with $2a$:', hashedPassword.startsWith('$2a$'));
    
    // TEST: Verify the hash works immediately
    const testVerify = await bcrypt.compare(password, hashedPassword);
    console.log('🔑 [REGISTER] Immediate hash verification:', testVerify ? '✅ PASS' : '❌ FAIL');

    // Create user in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      dietaryPreference: dietaryPreference || '',
      role: 'user',
      loyaltyPoints: 50
    });

    console.log('✅ [REGISTER] User created in MongoDB with ID:', user._id);
    console.log('✅ [REGISTER] MongoDB stored password:', user.password);

    // Send Welcome Email
    try {
      await sendWelcomeEmail(user.email, user.name);
      console.log('✅ Welcome email sent to:', user.email);
    } catch (emailError) {
      console.log('⚠️ Welcome email error (non-critical):', emailError.message);
    }
    
    // Verify MongoDB stored the correct hash
    const mongoUser = await User.findById(user._id).select('+password');
    const mongoVerify = await bcrypt.compare(password, mongoUser.password);
    console.log('✅ [REGISTER] MongoDB verification:', mongoVerify ? '✅ PASS' : '❌ FAIL');

    // Sync to MySQL with the SAME hash
    const mysqlSql = `INSERT INTO users (name, email, password, phone, address, role, dietaryPreference, loyaltyPoints, isActive) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    await query(mysqlSql, [
      name,
      email,
      hashedPassword,
      phone || '',
      address || '',
      'user',
      dietaryPreference || '',
      50,
      1
    ]);
    console.log('✅ [REGISTER] User synced to MySQL');

    // Verify MySQL stored the correct hash
    const [mysqlUser] = await query('SELECT password FROM users WHERE email = ?', [email]);
    if (mysqlUser.length > 0) {
      console.log('✅ [REGISTER] MySQL stored password:', mysqlUser[0].password);
      const mysqlVerify = await bcrypt.compare(password, mysqlUser[0].password);
      console.log('✅ [REGISTER] MySQL verification:', mysqlVerify ? '✅ PASS' : '❌ FAIL');
      
      // Double-check that both hashes are identical
      if (hashedPassword !== mysqlUser[0].password) {
        console.log('⚠️ [REGISTER] WARNING: MongoDB and MySQL hashes are DIFFERENT!');
        console.log('   MongoDB hash:', hashedPassword);
        console.log('   MySQL hash:  ', mysqlUser[0].password);
        // Fix it immediately
        await query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
        console.log('✅ [REGISTER] MySQL password fixed to match MongoDB');
      } else {
        console.log('✅ [REGISTER] Hashes match between MongoDB and MySQL');
      }
    }

    await fileWriter.writeUserData({
      name,
      email,
      phone,
      role: 'user',
      loyaltyPoints: 50,
      action: 'registration',
      timestamp: new Date().toISOString()
    });

    const token = generateToken(user._id);

    console.log('✅ [REGISTER] Registration successful for:', email);
    console.log('========================================\n');

    res.status(201).json({
      success: true,
      message: 'User registered successfully! Welcome to Bye-Bye-Hunger!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        dietaryPreference: user.dietaryPreference,
        loyaltyPoints: user.loyaltyPoints
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('🔍 [LOGIN] ========================================');
    console.log('🔍 [LOGIN] loginUser function called');
    console.log('🔍 [LOGIN] req.body:', req.body);
    console.log('🔍 [LOGIN] req.headers.content-type:', req.headers['content-type']);
    
    const { email, password } = req.body;
    
    console.log('🔍 [LOGIN] Extracted email:', email);
    console.log('🔍 [LOGIN] Extracted password length:', password?.length);
    console.log('🔍 [LOGIN] Extracted password first 3 chars:', password?.substring(0, 3));
    
    if (!email || !password) {
      console.log('❌ [LOGIN] Email or password missing!');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    console.log('========================================');
    console.log('🔍 LOGIN ATTEMPT');
    console.log('📧 Email:', email);
    console.log('🔑 Password entered:', password?.substring(0, 3) + '...');
    console.log('========================================');
    
    const user = await User.findOne({ email }).select('+password').lean();
    
    if (!user) {
      console.log('❌ User NOT found in MongoDB');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    console.log('✅ User found in MongoDB');
    console.log('📝 User Name:', user.name);
    console.log('📝 User Role:', user.role);
    console.log('📝 Stored hash:', user.password);
    console.log('📝 Hash length:', user.password.length);
    console.log('📝 Hash starts with $2a$:', user.password.startsWith('$2a$'));
    
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password match result:', isPasswordMatch);
    
    if (!isPasswordMatch) {
      console.log('❌ Password does NOT match');
      
      // Try to generate a test hash of the entered password for comparison
      const testSalt = await bcrypt.genSalt(10);
      const testHash = await bcrypt.hash(password, testSalt);
      console.log('🔍 Test hash of entered password (for reference):', testHash);
      
      // Check MySQL
      try {
        const [mysqlUsers] = await query('SELECT password FROM users WHERE email = ?', [email]);
        if (mysqlUsers.length > 0) {
          const mysqlPassword = mysqlUsers[0].password;
          console.log('🔍 MySQL stored hash:', mysqlPassword);
          const mysqlMatch = await bcrypt.compare(password, mysqlPassword);
          console.log('🔍 MySQL password match:', mysqlMatch);
          
          if (mysqlMatch) {
            console.log('✅ Password matches MySQL! Syncing to MongoDB...');
            await User.updateOne(
              { email: email },
              { $set: { password: mysqlPassword } }
            );
            console.log('✅ Password synced from MySQL to MongoDB');
            
            const retryUser = await User.findOne({ email }).select('+password').lean();
            const retryMatch = await bcrypt.compare(password, retryUser.password);
            if (retryMatch) {
              console.log('✅ Retry successful!');
              const token = generateToken(retryUser._id);
              await query('UPDATE users SET lastLogin = NOW() WHERE email = ?', [email]);
              await fileWriter.writeUserData({
                name: retryUser.name,
                email: retryUser.email,
                action: 'login',
                timestamp: new Date().toISOString()
              });
              return res.json({
                success: true,
                message: 'Login successful! Welcome back!',
                token,
                user: {
                  id: retryUser._id,
                  name: retryUser.name,
                  email: retryUser.email,
                  role: retryUser.role,
                  phone: retryUser.phone,
                  address: retryUser.address,
                  dietaryPreference: retryUser.dietaryPreference,
                  loyaltyPoints: retryUser.loyaltyPoints,
                  profileImage: retryUser.profileImage
                }
              });
            }
          }
        }
      } catch (syncError) {
        console.log('MySQL sync check error:', syncError.message);
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    console.log('✅ Login successful!');
    console.log('========================================\n');
    
    try {
      await query('UPDATE users SET lastLogin = NOW() WHERE email = ?', [email]);
    } catch (mysqlError) {
      console.log('MySQL update error (non-critical):', mysqlError.message);
    }

    await fileWriter.writeUserData({
      name: user.name,
      email: user.email,
      action: 'login',
      timestamp: new Date().toISOString()
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful! Welcome back!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        dietaryPreference: user.dietaryPreference,
        loyaltyPoints: user.loyaltyPoints,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    let bookingStats = { total: 0, upcoming: 0, past: 0 };
    try {
      const [bookings] = await query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN date >= CURDATE() THEN 1 ELSE 0 END) as upcoming,
          SUM(CASE WHEN date < CURDATE() THEN 1 ELSE 0 END) as past
        FROM bookings 
        WHERE user_id = ? AND status != 'cancelled'
      `, [req.user.id]);
      
      if (bookings && bookings.length > 0) {
        bookingStats = bookings[0];
      }
    } catch (error) {
      console.log('Error fetching booking stats:', error.message);
    }

    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      user,
      stats: {
        bookings: bookingStats,
        orders: orderStats[0] || { totalOrders: 0, totalSpent: 0 },
        loyaltyPoints: user.loyaltyPoints
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dietaryPreference } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, dietaryPreference },
      { new: true, runValidators: true }
    ).select('-password');

    await query(
      'UPDATE users SET name = ?, phone = ?, address = ?, dietaryPreference = ? WHERE email = ?',
      [name, phone, address, dietaryPreference, user.email]
    );

    await fileWriter.writeUserData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      dietaryPreference: user.dietaryPreference,
      action: 'profile_update',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/auth/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    let recentBookings = [];
    try {
      const [bookings] = await query(`
        SELECT id, date, time, guests, status, created_at
        FROM bookings 
        WHERE user_id = ? 
        ORDER BY date DESC, time DESC 
        LIMIT 5
      `, [req.user.id]);
      recentBookings = bookings;
    } catch (error) {
      console.log('Error fetching bookings:', error.message);
    }

    const recentOrders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber totalAmount status createdAt orderType');

    let loyaltyHistory = [];
    try {
      const [history] = await query(`
        SELECT * FROM loyalty_history 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 10
      `, [req.user.id]);
      loyaltyHistory = history;
    } catch (error) {
      console.log('Error fetching loyalty history:', error.message);
    }

    const totalOrders = await Order.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      stats: {
        loyaltyPoints: user.loyaltyPoints,
        totalOrders,
        recentOrders,
        recentBookings,
        loyaltyHistory,
        memberSince: user.createdAt
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add loyalty points to user
// @route   POST /api/auth/add-points
export const addLoyaltyPoints = async (req, res) => {
  try {
    const { points, reason } = req.body;
    
    const user = await User.findById(req.user.id);
    user.loyaltyPoints += points;
    await user.save();

    await query(`
      INSERT INTO loyalty_history (user_id, points, reason, created_at) 
      VALUES (?, ?, ?, NOW())
    `, [req.user.id, points, reason]);

    await fileWriter.writeUserData({
      userEmail: user.email,
      pointsAdded: points,
      newTotal: user.loyaltyPoints,
      reason,
      action: 'points_added',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `${points} loyalty points added!`,
      loyaltyPoints: user.loyaltyPoints
    });

  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    user.password = newHash;
    await user.save();

    await query('UPDATE users SET password = ? WHERE email = ?', [newHash, user.email]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ============ ADMIN FUNCTIONS ============

export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }
    
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }
    
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user or admin'
      });
    }
    
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    try {
      await query('UPDATE users SET role = ? WHERE email = ?', [role, user.email]);
    } catch (mysqlError) {
      console.log('MySQL update error (non-critical):', mysqlError.message);
    }
    
    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }
    
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (user.role === 'admin' && adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last admin user'
      });
    }
    
    await user.deleteOne();
    
    try {
      await query('DELETE FROM users WHERE email = ?', [user.email]);
    } catch (mysqlError) {
      console.log('MySQL delete error (non-critical):', mysqlError.message);
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }
    
    const totalUsers = await User.countDocuments();
    
    const Food = await import('../models/Food.js').then(m => m.default);
    const totalFoods = await Food.countDocuments();
    
    const Order = await import('../models/Order.js').then(m => m.default);
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');
    
    let totalBookings = 0;
    try {
      const [bookings] = await query('SELECT COUNT(*) as count FROM bookings');
      totalBookings = bookings[0]?.count || 0;
    } catch (error) {
      console.log('MySQL bookings count error:', error.message);
    }
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalFoods,
        totalOrders,
        totalRevenue,
        totalBookings,
        pendingOrders
      },
      recentOrders
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ============ FORGOT PASSWORD FUNCTIONS ============

// @desc    Forgot password - send reset token
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('📧 Forgot password request for:', email);
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    console.log('🔗 RESET LINK (copy this to browser):', resetUrl);
    
    // Try to send email, but don't fail if it doesn't work
    let emailSent = false;
    try {
      emailSent = await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      console.log('⚠️ Email service error:', emailError.message);
    }
    
    res.json({
      success: true,
      message: emailSent 
        ? 'Password reset link sent to your email!' 
        : `Reset link (email not configured): ${resetUrl}`,
      devResetLink: !emailSent ? resetUrl : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    // Update MySQL
    await query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, user.email]);
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ============ EMAIL VERIFICATION FUNCTIONS ============

// @desc    Send email verification
// @route   POST /api/auth/send-verification
export const sendEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();
    
    const emailSent = await sendVerificationEmail(user.email, user.name, verificationToken);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }
    
    res.json({
      success: true,
      message: 'Verification email sent'
    });
    
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();
    
    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default {
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
  syncAllPasswords,
  forgotPassword,
  resetPassword,
  sendEmailVerification,
  verifyEmail
};