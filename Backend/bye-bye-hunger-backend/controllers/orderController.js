// controllers/orderController.js
import Order from '../models/Order.js';
import Food from '../models/Food.js';
import User from '../models/User.js';
import { query } from '../config/mysql.js';
import fileWriter from '../utils/fileWriter.js';

import { sendOrderConfirmation, sendOrderStatusUpdate } from '../utils/emailService.js';


// Helper function for ETA (testing - shortened times in seconds)
const getETA = (status, orderType) => {
  const etaMap = {
    pending: 'Awaiting confirmation',
    confirmed: orderType === 'takeaway' ? '15 sec' : '20 sec',
    preparing: orderType === 'takeaway' ? '10 sec' : '15 sec',
    ready: 'Ready for pickup/delivery',
    'out-for-delivery': 'Out for delivery - 10 sec',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return etaMap[status] || 'Processing';
};



// Generate unique order number
const generateOrderNumber = () => {
  return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Helper function to get estimated delivery time (SINGLE VERSION - defined once)
const getEstimatedTime = (status, orderType) => {
  const times = {
    pending: 'Awaiting confirmation',
    confirmed: orderType === 'takeaway' ? '20-30 mins' : '30-45 mins',
    preparing: orderType === 'takeaway' ? '15-20 mins' : '20-30 mins',
    ready: 'Ready for pickup/delivery',
    'out-for-delivery': 'Out for delivery - 15-20 mins',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return times[status] || 'Processing';
};

// Helper function to create order timeline
const getOrderTimeline = (order) => {
  const timeline = [
    { status: 'Order Placed', timestamp: order.createdAt, completed: true }
  ];
  
  if (order.status !== 'pending') {
    timeline.push({ status: 'Order Confirmed', timestamp: order.updatedAt, completed: true });
  }
  
  if (order.status === 'preparing' || order.status === 'ready' || order.status === 'out-for-delivery' || order.status === 'delivered') {
    timeline.push({ status: 'Preparing Your Food', timestamp: order.updatedAt, completed: true });
  }
  
  if (order.status === 'ready' || order.status === 'out-for-delivery' || order.status === 'delivered') {
    timeline.push({ status: 'Ready for Pickup/Delivery', timestamp: order.updatedAt, completed: true });
  }
  
  if (order.status === 'out-for-delivery') {
    timeline.push({ status: 'Out for Delivery', timestamp: order.updatedAt, completed: true });
  }
  
  if (order.status === 'delivered') {
    timeline.push({ status: 'Delivered', timestamp: order.deliveredAt || order.updatedAt, completed: true });
  }
  
  return timeline;
};

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  try {
    console.log('📦 CREATE ORDER CALLED');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user?.id);

    const { items, deliveryAddress, paymentMethod, specialInstructions, orderType } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one item to your order'
      });
    }

    // Calculate totals and validate items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const food = await Food.findById(item.foodId);
      
      if (!food) {
        return res.status(404).json({
          success: false,
          message: `Food item with ID ${item.foodId} not found`
        });
      }

      if (!food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${food.name} is currently not available`
        });
      }

      const itemTotal = food.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        foodId: food._id,
        name: food.name,
        price: food.price,
        quantity: item.quantity,
        image: food.image,
        specialInstructions: item.specialInstructions || ''
      });
    }

    const tax = subtotal * 0.1; // 10% tax
    const deliveryFee = orderType === 'takeaway' ? 0 : 5.00;
    const totalAmount = subtotal + tax + deliveryFee;
    const orderNumber = generateOrderNumber();

    // Create order in MongoDB
    const order = await Order.create({
      orderNumber,
      user: req.user.id,
      items: orderItems,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      specialInstructions,
      orderType: orderType || 'delivery',
      status: 'pending',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending'
    });

    // Add loyalty points (1 point per $10 spent)
    const pointsEarned = Math.floor(totalAmount / 10);
    if (pointsEarned > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { loyaltyPoints: pointsEarned }
      });
      
      // Store loyalty points history in MySQL
      try {
        await query(`
          INSERT INTO loyalty_history (user_id, points, reason, created_at) 
          VALUES (?, ?, ?, NOW())
        `, [req.user.id, pointsEarned, `Order #${orderNumber} - ${pointsEarned} points earned`]);
      } catch (error) {
        console.log('Error saving loyalty history:', error.message);
      }
    }

    // Store in MySQL
    try {
      await query(
        `INSERT INTO orders (orderNumber, userId, items, subtotal, tax, deliveryFee, totalAmount, 
         deliveryAddress, paymentMethod, status, orderType) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderNumber, req.user.id, JSON.stringify(orderItems), subtotal, tax, deliveryFee, 
         totalAmount, deliveryAddress, paymentMethod, 'pending', orderType || 'delivery']
      );
    } catch (mysqlError) {
      console.log('MySQL insert error (non-critical):', mysqlError.message);
    }

    // Write to .txt file
    await fileWriter.writeOrderData({
      orderNumber,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
      items: orderItems,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      orderType: orderType || 'delivery',
      pointsEarned,
      status: 'pending',
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: `Order placed successfully! You earned ${pointsEarned} loyalty points!`,
      data: {
        orderId: order._id,
        orderNumber,
        totalAmount,
        pointsEarned,
        status: 'pending',
        estimatedDeliveryTime: orderType === 'takeaway' ? '20-30 minutes' : '30-45 minutes'
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
export const getMyOrders = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    console.log('📦 Fetching orders for user:', req.user.id);
    
    let filter = { user: req.user.id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    console.log(`✅ Found ${orders.length} orders for user`);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: orders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        orderType: order.orderType,
        createdAt: order.createdAt,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        deliveryFee: order.deliveryFee,
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        specialInstructions: order.specialInstructions,
        itemsCount: order.items.length,
        estimatedDeliveryTime: getEstimatedTime(order.status, order.orderType),
        eta: getETA(order.status, order.orderType),
        userRating: order.userRating || null,      // ← ADD THIS
        userReview: order.userReview || null,      // ← ADD THIS
        ratedAt: order.ratedAt || null             // ← ADD THIS
      }))
    });

  } catch (error) {
    console.error('❌ Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    // Add tracking timeline
    const trackingTimeline = getOrderTimeline(order);

    res.json({
      success: true,
      data: {
        ...order.toObject(),
        trackingTimeline,
        estimatedTime: getEstimatedTime(order.status, order.orderType)
      }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Track order by order number
// @route   GET /api/orders/track/:orderNumber
export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns the order
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to track this order'
      });
    }
    
    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedTime: getEstimatedTime(order.status, order.orderType),
        trackingTimeline: getOrderTimeline(order),
        totalAmount: order.totalAmount,
        orderType: order.orderType
      }
    });
    
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }
    
    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }
    
    order.status = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancellationReason = req.body.reason || 'Cancelled by user';
    await order.save();
    
    // Update in MySQL
    try {
      await query('UPDATE orders SET status = "cancelled" WHERE orderNumber = ?', [order.orderNumber]);
    } catch (error) {
      console.log('MySQL update error:', error.message);
    }
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
    
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const oldStatus = order.status;
    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }
    await order.save();
  
await order.save();

// Auto status progression for testing (simulates real-time updates)
if (status === 'confirmed') {
  setTimeout(async () => {
    await Order.findByIdAndUpdate(order._id, { 
      status: 'preparing',
      preparingAt: new Date()
    });
    console.log(`⏩ Auto status: ${order.orderNumber} moved to PREPARING`);
  }, 2000);
}

if (status === 'preparing') {
  setTimeout(async () => {
    await Order.findByIdAndUpdate(order._id, { 
      status: 'ready',
      readyAt: new Date()
    });
    console.log(`⏩ Auto status: ${order.orderNumber} moved to READY`);
  }, 2000);
}

if (status === 'ready') {
  setTimeout(async () => {
    await Order.findByIdAndUpdate(order._id, { 
      status: 'out-for-delivery',
      outForDeliveryAt: new Date()
    });
    console.log(`⏩ Auto status: ${order.orderNumber} moved to OUT FOR DELIVERY`);
  }, 2000);
}

if (status === 'out-for-delivery') {
  setTimeout(async () => {
    await Order.findByIdAndUpdate(order._id, { 
      status: 'delivered',
      deliveredAt: new Date()
    });
    console.log(`⏩ Auto status: ${order.orderNumber} moved to DELIVERED`);
  }, 3000);
}



    // Update in MySQL
    try {
      await query('UPDATE orders SET status = ? WHERE orderNumber = ?', [status, order.orderNumber]);
    } catch (mysqlError) {
      console.log('MySQL update error (non-critical):', mysqlError.message);
    }
    
    // Write status change to log
    await fileWriter.writeOrderData({
      orderNumber: order.orderNumber,
      action: 'status_update',
      oldStatus,
      newStatus: status,
      updatedBy: req.user.email,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: `Order status updated from ${oldStatus} to ${status}`,
      data: order
    });
    
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, startDate, endDate } = req.query;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Order.countDocuments(filter);
    
    // Calculate summary statistics
    const summary = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);
    
    // Include rating fields in response
    const ordersWithRatings = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      user: order.user,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      deliveryFee: order.deliveryFee,
      totalAmount: order.totalAmount,
      status: order.status,
      orderType: order.orderType,
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      userRating: order.userRating || null,      // ← ADD THIS
      userReview: order.userReview || null,      // ← ADD THIS
      ratedAt: order.ratedAt || null             // ← ADD THIS
    }));
    
    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      summary: summary[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
      data: ordersWithRatings
    });
    
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add rating to order
// @route   POST /api/orders/:id/rating
export const addRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this order'
      });
    }
    
    // Check if order is delivered
    if (order.status !== 'delivered' && order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate delivered orders'
      });
    }
    
    // Check if already rated
    if (order.userRating) {
      return res.status(400).json({
        success: false,
        message: 'Order already rated'
      });
    }
    
    order.userRating = rating;
    order.userReview = review || '';
    order.ratedAt = Date.now();
    await order.save();
    
    res.json({
      success: true,
      message: 'Thank you for your rating!',
      data: {
        rating: order.userRating,
        review: order.userReview
      }
    });
    
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// @desc    Debug - Check rating directly
// @route   GET /api/orders/debug/:id
export const debugOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    console.log('Debug - Found order:', order.orderNumber);
    console.log('Debug - userRating in DB:', order.userRating);
    console.log('Debug - userReview in DB:', order.userReview);
    
    res.json({
      success: true,
      orderNumber: order.orderNumber,
      userRating: order.userRating,
      userReview: order.userReview,
      ratedAt: order.ratedAt,
      status: order.status
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.json({ success: false, error: error.message });
  }
};

export default {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  addRating,
  debugOrder  // ← ADD THIS
};