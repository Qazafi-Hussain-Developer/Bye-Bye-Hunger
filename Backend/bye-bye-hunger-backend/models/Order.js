// models/Order.js
import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema({
  foodId: {
    type: Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 99
  },
  image: String,
  specialInstructions: {
    type: String,
    maxlength: 200
  }
});

const orderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  deliveryFee: {
    type: Number,
    required: true,
    default: 5,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryAddress: {
    type: String,
    required: function() {
      return this.orderType === 'delivery';
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'card', 'online']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    default: 'delivery'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  specialInstructions: {
    type: String,
    maxlength: 500
  },
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: {
    type: String,
    maxlength: 200
  },
  // ========== RATING FIELDS ==========
  userRating: {
    type: Number,
    min: 1,
    max: 5
  },
  userReview: {
    type: String,
    maxlength: 500
  },
  ratedAt: {
    type: Date
  }
  // ========== END RATING FIELDS ==========
}, {
  timestamps: true
});

// Virtual for estimated delivery time
orderSchema.virtual('estimatedTime').get(function() {
  const times = {
    pending: 'Awaiting confirmation',
    confirmed: this.orderType === 'takeaway' ? '20-30 mins' : '30-45 mins',
    preparing: this.orderType === 'takeaway' ? '15-20 mins' : '20-30 mins',
    ready: 'Ready for pickup/delivery',
    'out-for-delivery': 'Out for delivery - 15-20 mins',
    delivered: 'Delivered'
  };
  return times[this.status] || 'Processing';
});

// Virtual for tracking timeline
orderSchema.virtual('trackingTimeline').get(function() {
  const timeline = [
    { status: 'Order Placed', timestamp: this.createdAt, completed: true }
  ];
  
  if (this.status !== 'pending') {
    timeline.push({ status: 'Order Confirmed', timestamp: this.updatedAt, completed: true });
  }
  
  if (['preparing', 'ready', 'out-for-delivery', 'delivered'].includes(this.status)) {
    timeline.push({ status: 'Preparing Your Food', timestamp: this.updatedAt, completed: true });
  }
  
  if (['ready', 'out-for-delivery', 'delivered'].includes(this.status)) {
    timeline.push({ status: 'Ready for Pickup/Delivery', timestamp: this.updatedAt, completed: true });
  }
  
  if (this.status === 'out-for-delivery') {
    timeline.push({ status: 'Out for Delivery', timestamp: this.updatedAt, completed: true });
  }
  
  if (this.status === 'delivered') {
    timeline.push({ status: 'Delivered', timestamp: this.deliveredAt || this.updatedAt, completed: true });
  }
  
  return timeline;
});

// Method to check if order can be cancelled
orderSchema.methods.canCancel = function() {
  const cancellableStatuses = ['pending', 'confirmed'];
  return cancellableStatuses.includes(this.status);
};

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ createdAt: -1 });

export default model('Order', orderSchema);