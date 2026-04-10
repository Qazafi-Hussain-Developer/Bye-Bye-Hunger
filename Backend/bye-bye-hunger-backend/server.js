import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { seedAdmin } from './utils/seedAdmin.js';

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
config();

// Database connections
import connectMongoDB from './config/db.js';
import { initializeMySQL } from './config/mysql.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

// Import auth controller for sync function
import authController from './controllers/authController.js';

// Initialize express
const app = express();

// Create directories if they don't exist
if (!existsSync('./uploads')) mkdirSync('./uploads');
if (!existsSync('./logs')) mkdirSync('./logs');

// ============ MIDDLEWARE - ORDER MATTERS! ============
// 1. CORS first
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://192.168.10.4:5173',
    'https://abc123.ngrok.io'  // Add this when using ngrok
  ],
  credentials: true
}));

// 2. Body parsers BEFORE debug middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Debug middleware - NOW body will be parsed
app.use((req, res, next) => {
  console.log('📥 Incoming request:');
  console.log('   Method:', req.method);
  console.log('   URL:', req.url);
  console.log('   Body:', req.body);
  console.log('   Headers:', req.headers);
  next();
});

// Static files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    message: 'Bye-Bye-Hunger API is running',
    timestamp: new Date().toISOString(),
    databases: {
      mongodb: 'connected',
      mysql: 'connected'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Max size is 5MB'
    });
  }
  
  if (err.message?.includes('Images only')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Function to initialize everything in correct order
const initializeApp = async () => {
  try {
    // 1. Connect to MongoDB first
    await connectMongoDB();
    console.log('✅ MongoDB connected');
    
    // 2. Initialize MySQL tables
    await initializeMySQL();
    console.log('✅ MySQL initialized');
    
    // 3. Seed admin user (now MongoDB is connected)
    await seedAdmin();
    console.log('✅ Admin seeding completed');
    
    // 4. Sync all existing user passwords between MongoDB and MySQL
    console.log('\n🔄 Running password sync to fix any existing mismatches...');
    await authController.syncAllPasswords();
    console.log('✅ Password sync completed\n');
    
    // 5. Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📝 API: http://localhost:${PORT}/api`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/haealth\n`);
    });
    
  } catch (error) {
    console.error('❌ Initialization error:', error.message);
    process.exit(1);
  }
};

// Start the initialization
initializeApp();