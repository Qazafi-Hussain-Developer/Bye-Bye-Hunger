// models/Food.js
import { Schema, model } from 'mongoose';

const foodSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide food name'],
    trim: true,
    minlength: [2, 'Food name must be at least 2 characters'],
    maxlength: [100, 'Food name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: [0, 'Price cannot be negative'],
    max: [9999.99, 'Price cannot exceed 9999.99']
  },
  category: {
    type: String,
    required: [true, 'Please provide category'],
    enum: ['appetizer', 'main-course', 'dessert', 'beverage', 'soup', 'salad', 'special']
  },
  image: {
    type: String,
    default: 'default-food.jpg'
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  preparationTime: {
    type: Number,
    default: 20,
    min: 5,
    max: 120
  },
  calories: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for discounted price (if needed)
foodSchema.virtual('discountedPrice').get(function() {
  // You can implement discount logic here
  return this.price;
});

// Method to check if food is in stock
foodSchema.methods.isInStock = function() {
  return this.isAvailable;
};

// Static method to get foods by category
foodSchema.statics.getByCategory = async function(category) {
  return this.find({ category, isAvailable: true }).sort({ name: 1 });
};

// Create indexes for better query performance
foodSchema.index({ name: 'text', description: 'text' });
foodSchema.index({ category: 1 });
foodSchema.index({ price: 1 });
foodSchema.index({ isAvailable: 1 });
foodSchema.index({ rating: -1 });

const Food = model('Food', foodSchema);
export default Food;