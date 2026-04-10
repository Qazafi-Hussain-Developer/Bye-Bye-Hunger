// controllers/bookingController.js
import { query } from '../config/mysql.js';
import fileWriter from '../utils/fileWriter.js';
import { validationResult } from 'express-validator';

// @desc    Create a new table booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, phone, date, time, guests, special_requests } = req.body;
    const userId = req.user.id;

    // Validate date (cannot book past date)
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book a table for a past date'
      });
    }

    // Check if table is available for the given date and time
    const checkAvailability = `
      SELECT COUNT(*) as bookingCount FROM bookings 
      WHERE date = ? AND time = ? AND status != 'cancelled'
    `;
    
    const [existingBookings] = await query(checkAvailability, [date, time]);
    const bookingCount = existingBookings[0].bookingCount;
    
    // Simple capacity check - assuming restaurant has 15 tables
    if (bookingCount >= 15) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, no tables available for the selected date and time. Please try a different time.'
      });
    }

    // Check if user already has a booking for same date/time
    const checkUserBooking = `
      SELECT * FROM bookings 
      WHERE user_id = ? AND date = ? AND time = ? AND status != 'cancelled'
    `;
    const [userBookings] = await query(checkUserBooking, [userId, date, time]);
    
    if (userBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have a booking for this date and time'
      });
    }

    const insertQuery = `
      INSERT INTO bookings (user_id, name, email, phone, date, time, guests, special_requests, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    const [result] = await query(insertQuery, [
      userId, name, email, phone, date, time, guests, special_requests || null
    ]);

    // Add loyalty points for booking (5 points per booking)
    if (userId) {
      try {
        await query(`
          UPDATE users SET loyaltyPoints = loyaltyPoints + 5 WHERE id = ?
        `, [userId]);
        
        await query(`
          INSERT INTO loyalty_history (user_id, points, reason, created_at) 
          VALUES (?, 5, 'Table booking - 5 points earned', NOW())
        `, [userId]);
      } catch (error) {
        console.log('Error adding loyalty points:', error.message);
      }
    }

    // Write to log file
    await fileWriter.writeBookingData({
      bookingId: result.insertId,
      name,
      email,
      phone,
      date,
      time,
      guests,
      special_requests: special_requests || 'None',
      status: 'pending',
      userId,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully! 5 loyalty points added!',
      booking: {
        id: result.insertId,
        user_id: userId,
        name,
        email,
        phone,
        date,
        time,
        guests,
        special_requests,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, upcoming } = req.query;
    
    let sql = 'SELECT * FROM bookings WHERE user_id = ?';
    const params = [userId];
    
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    if (upcoming === 'true') {
      sql += ' AND date >= CURDATE() AND status != "cancelled"';
    }
    
    sql += ' ORDER BY date DESC, time DESC';
    
    const [bookings] = await query(sql, params);
    
    // Format dates for response
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      isUpcoming: new Date(booking.date) >= new Date() && booking.status !== 'cancelled',
      canCancel: booking.status === 'pending' && new Date(booking.date) > new Date()
    }));
    
    res.status(200).json({
      success: true,
      count: formattedBookings.length,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    
    const [bookings] = await query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, userId]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    const booking = bookings[0];
    booking.canCancel = booking.status === 'pending' && new Date(booking.date) > new Date();
    
    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    
    // Check if booking exists and belongs to user
    const [bookings] = await query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, userId]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    const booking = bookings[0];
    
    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }
    
    // Check if cancellation is within allowed time (at least 2 hours before)
    const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
    const now = new Date();
    const hoursDiff = (bookingDateTime - now) / (1000 * 60 * 60);
    
    if (hoursDiff < 2) {
      return res.status(400).json({
        success: false,
        message: 'Cancellations must be made at least 2 hours before the booking time'
      });
    }
    
    await query(
      'UPDATE bookings SET status = "cancelled" WHERE id = ? AND user_id = ?',
      [bookingId, userId]
    );
    
    // Write cancellation to log
    await fileWriter.writeBookingData({
      bookingId,
      action: 'cancelled',
      cancellationReason: req.body.reason || 'Cancelled by user',
      cancelledAt: new Date().toISOString(),
      userId
    });
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update booking status (Admin only)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, confirmed, cancelled, completed'
      });
    }
    
    const [result] = await query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, bookingId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Get booking details for email notification
    const [bookings] = await query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    
    if (bookings.length > 0) {
      await fileWriter.writeBookingData({
        bookingId,
        action: 'status_updated',
        oldStatus: bookings[0].status,
        newStatus: status,
        updatedBy: req.user.email,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get available time slots for a date
// @route   GET /api/bookings/available-times/:date
// @access  Public
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { date } = req.params;
    const { guests = 2 } = req.query;
    
    // Define all available time slots
    const allTimeSlots = [
      '12:00:00', '12:30:00', '13:00:00', '13:30:00', '14:00:00',
      '18:00:00', '18:30:00', '19:00:00', '19:30:00', '20:00:00', '20:30:00', '21:00:00'
    ];
    
    // Get existing bookings for the date
    const [bookings] = await query(`
      SELECT time, SUM(guests) as totalGuests 
      FROM bookings 
      WHERE date = ? AND status != 'cancelled'
      GROUP BY time
    `, [date]);
    
    const bookedSlots = {};
    bookings.forEach(booking => {
      bookedSlots[booking.time] = booking.totalGuests;
    });
    
    // Maximum capacity per time slot (assuming 40 seats max)
    const maxCapacity = 40;
    
    const availableSlots = allTimeSlots.map(time => {
      const bookedGuests = bookedSlots[time] || 0;
      const remainingCapacity = maxCapacity - bookedGuests;
      const isAvailable = remainingCapacity >= parseInt(guests);
      
      return {
        time,
        available: isAvailable,
        remainingCapacity
      };
    });
    
    res.json({
      success: true,
      date,
      guests: parseInt(guests),
      availableSlots,
      totalAvailable: availableSlots.filter(slot => slot.available).length
    });
  } catch (error) {
    console.error('Get available time slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ============ ADMIN FUNCTIONS ============

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const { status, date, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let sql = 'SELECT * FROM bookings';
    const conditions = [];
    const params = [];
    
    // Apply filters
    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (date) {
      conditions.push('date = ?');
      params.push(date);
    }
    
    if (startDate && endDate) {
      conditions.push('date BETWEEN ? AND ?');
      params.push(startDate, endDate);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add order by
    sql += ' ORDER BY date DESC, time DESC';
    
    // Add pagination
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM bookings';
    if (conditions.length > 0) {
      countSql += ' WHERE ' + conditions.join(' AND ');
    }
    const [countResult] = await query(countSql, params.slice(0, -2));
    const total = countResult[0]?.total || 0;
    
    // Get bookings
    const [bookings] = await query(sql, params);
    
    // Get user info for each booking
    for (let booking of bookings) {
      if (booking.user_id) {
        const [users] = await query('SELECT name, email FROM users WHERE id = ?', [booking.user_id]);
        if (users.length > 0) {
          booking.user = users[0];
        }
      }
    }
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      bookings
    });
    
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get booking statistics (Admin only)
// @route   GET /api/bookings/admin/stats
// @access  Private/Admin
export const getBookingStats = async (req, res) => {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Get stats for different periods
    const [todayBookings] = await query(`
      SELECT COUNT(*) as count, SUM(guests) as totalGuests 
      FROM bookings 
      WHERE date = ? AND status != 'cancelled'
    `, [today]);
    
    const [upcomingBookings] = await query(`
      SELECT COUNT(*) as count, SUM(guests) as totalGuests 
      FROM bookings 
      WHERE date >= CURDATE() AND status != 'cancelled'
    `, []);
    
    const [pendingBookings] = await query(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE status = 'pending'
    `, []);
    
    const [confirmedBookings] = await query(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE status = 'confirmed'
    `, []);
    
    const [cancelledBookings] = await query(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE status = 'cancelled'
    `, []);
    
    const [completedBookings] = await query(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE status = 'completed'
    `, []);
    
    // Get weekly stats (last 7 days)
    const [weeklyStats] = await query(`
      SELECT 
        DATE(date) as booking_date,
        COUNT(*) as count,
        SUM(guests) as totalGuests
      FROM bookings 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND status != 'cancelled'
      GROUP BY DATE(date)
      ORDER BY booking_date ASC
    `, []);
    
    // Get monthly stats (last 30 days)
    const [monthlyStats] = await query(`
      SELECT 
        DATE(date) as booking_date,
        COUNT(*) as count,
        SUM(guests) as totalGuests
      FROM bookings 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND status != 'cancelled'
      GROUP BY DATE(date)
      ORDER BY booking_date ASC
    `, []);
    
    res.status(200).json({
      success: true,
      stats: {
        today: {
          count: todayBookings[0]?.count || 0,
          totalGuests: todayBookings[0]?.totalGuests || 0
        },
        upcoming: {
          count: upcomingBookings[0]?.count || 0,
          totalGuests: upcomingBookings[0]?.totalGuests || 0
        },
        byStatus: {
          pending: pendingBookings[0]?.count || 0,
          confirmed: confirmedBookings[0]?.count || 0,
          completed: completedBookings[0]?.count || 0,
          cancelled: cancelledBookings[0]?.count || 0
        },
        weekly: weeklyStats,
        monthly: monthlyStats
      }
    });
    
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete booking (Admin only)
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
export const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Get booking details before deletion for logging
    const [bookings] = await query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    const booking = bookings[0];
    
    // Delete the booking
    const [result] = await query('DELETE FROM bookings WHERE id = ?', [bookingId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Write to log file
    try {
      await fileWriter.writeBookingData({
        bookingId,
        action: 'deleted_by_admin',
        bookingDetails: booking,
        deletedBy: req.user.email,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.log('Logging error:', logError.message);
    }
    
    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  getAvailableTimeSlots,
  getAllBookings,
  getBookingStats,
  deleteBooking
};