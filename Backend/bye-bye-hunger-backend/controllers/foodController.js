// controllers/foodController.js
import Food from '../models/Food.js';
import { query } from '../config/mysql.js';
import fileWriter from '../utils/fileWriter.js';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// @desc    Get all foods
// @route   GET /api/foods
export const getFoods = async (req, res) => {
  try {
    const { category, search, vegetarian, page = 1, limit = 10, showAll } = req.query;
    
    // Build filter object
    let filter = {};
    
    // For admin panel - show ALL foods (including unavailable)
    // For customer menu - only show available foods
    if (showAll !== 'true') {
      filter.isAvailable = true;
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (vegetarian === 'true') {
      filter.isVegetarian = true;
    }
    
    // Search by name or description
    let foods;
    if (search) {
      foods = await Food.find({
        ...filter,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    } else {
      foods = await Food.find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
    }

    const total = await Food.countDocuments(filter);

    res.json({
      success: true,
      count: foods.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: foods
    });

  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get foods by category
// @route   GET /api/foods/category/:category
export const getFoodsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const foods = await Food.find({ 
      category, 
      isAvailable: true  // ← Keep this for customer view only
    }).sort({ name: 1 });
    
    res.json({
      success: true,
      count: foods.length,
      data: foods
    });
    
  } catch (error) {
    console.error('Get foods by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single food
// @route   GET /api/foods/:id
export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    res.json({
      success: true,
      data: food
    });

  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create food (Admin only)
// @route   POST /api/foods
export const createFood = async (req, res) => {
  try {
    const { name, description, price, category, ingredients, isVegetarian, preparationTime } = req.body;

    // Handle image upload
    let image = '';
    if (req.file) {
      image = `/uploads/foods/${req.file.filename}`;
    }

    // Create in MongoDB
    const food = await Food.create({
      name,
      description,
      price,
      category,
      ingredients: ingredients ? ingredients.split(',').map(i => i.trim()) : [],
      isVegetarian: isVegetarian === 'true',
      preparationTime: parseInt(preparationTime),
      image
    });

    // Write to .txt file using fileWriter
    await fileWriter.writeUserData({
      action: 'FOOD_ADDED',
      name: food.name,
      price: food.price,
      category: food.category,
      addedBy: req.user?.email || 'admin',
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Food created successfully',
      data: food
    });

  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update food (Admin only)
// @route   PUT /api/foods/:id
export const updateFood = async (req, res) => {
  try {
    let food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (food.image) {
        const oldImagePath = join(__dirname, '..', food.image);
        try {
          await fs.access(oldImagePath);
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.log('Old image not found or already deleted');
        }
      }
      req.body.image = `/uploads/${req.file.filename}`;
    }

    // Update in MongoDB
    food = await Food.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Food updated successfully',
      data: food
    });

  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Toggle food availability (Admin only) - NEW FUNCTION
// @route   PATCH /api/foods/:id/toggle-availability
export const toggleFoodAvailability = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }
    
    food.isAvailable = !food.isAvailable;
    await food.save();
    
    await fileWriter.writeUserData({
      action: 'FOOD_AVAILABILITY_TOGGLED',
      name: food.name,
      isAvailable: food.isAvailable,
      updatedBy: req.user?.email || 'admin',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: `Food is now ${food.isAvailable ? 'available' : 'unavailable'}`,
      data: {
        id: food._id,
        name: food.name,
        isAvailable: food.isAvailable
      }
    });
    
  } catch (error) {
    console.error('Toggle food availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete food (Admin only)
// @route   DELETE /api/foods/:id
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    // Delete image file
    if (food.image) {
      const imagePath = join(__dirname, '..', food.image);
      try {
        await fs.access(imagePath);
        await fs.unlink(imagePath);
      } catch (err) {
        console.log('Image file not found');
      }
    }

    // Delete from MongoDB
    await food.deleteOne();

    // Write to .txt file using fileWriter
    await fileWriter.writeUserData({
      action: 'FOOD_DELETED',
      name: food.name,
      id: food._id.toString(),
      deletedBy: req.user?.email || 'admin',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Food deleted successfully'
    });

  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default {
  getFoods,
  getFoodsByCategory,
  getFoodById,
  createFood,
  updateFood,
  toggleFoodAvailability,
  deleteFood
};