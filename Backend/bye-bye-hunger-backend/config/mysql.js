// config/mysql.js
import mysql from 'mysql2';
import dotenv from 'dotenv';

// Load env vars - IMPORTANT: call this BEFORE using process.env
dotenv.config();

// Debug: Check if env vars are loaded
console.log('🔍 MySQL Config Check:');
console.log('- MYSQL_HOST:', process.env.MYSQL_HOST || '❌ NOT LOADED');
console.log('- MYSQL_USER:', process.env.MYSQL_USER || '❌ NOT LOADED');
console.log('- MYSQL_DATABASE:', process.env.MYSQL_DATABASE || '❌ NOT LOADED');
console.log('- MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? '✅ Loaded' : '❌ NOT LOADED');

// Validate environment variables
if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
  console.error('❌ Missing required MySQL environment variables!');
  console.error('Please check your .env file');
}

// Create connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Create all tables if they don't exist
export const initializeMySQL = async () => {
  try {
    // 1. Create users table (enhanced)
    const createUserTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        phone VARCHAR(20),
        address TEXT,
        dietaryPreference ENUM('', 'veg', 'non-veg', 'vegan', 'gluten-free') DEFAULT '',
        loyaltyPoints INT DEFAULT 0,
        profileImage VARCHAR(255),
        lastLogin TIMESTAMP NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_isActive (isActive)
      )
    `;

    // 2. Create bookings table (table reservations)
    const createBookingsTable = `
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        guests INT NOT NULL CHECK (guests >= 1 AND guests <= 20),
        special_requests TEXT,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_date (date),
        INDEX idx_status (status),
        INDEX idx_date_time (date, time)
      )
    `;

    // 3. Create orders table (enhanced with more fields)
    const createOrderTable = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderNumber VARCHAR(50) UNIQUE NOT NULL,
        userId INT,
        items JSON NOT NULL,
        subtotal DECIMAL(10, 2) DEFAULT 0,
        tax DECIMAL(10, 2) DEFAULT 0,
        deliveryFee DECIMAL(10, 2) DEFAULT 5,
        totalAmount DECIMAL(10, 2) NOT NULL,
        deliveryAddress TEXT NOT NULL,
        paymentMethod VARCHAR(50) NOT NULL,
        orderType ENUM('dine-in', 'takeaway', 'delivery') DEFAULT 'delivery',
        status ENUM('pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled') DEFAULT 'pending',
        paymentStatus ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        specialInstructions TEXT,
        cancellationReason TEXT,
        deliveredAt TIMESTAMP NULL,
        cancelledAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_orderNumber (orderNumber),
        INDEX idx_status (status),
        INDEX idx_userId (userId),
        INDEX idx_createdAt (createdAt),
        INDEX idx_orderType (orderType)
      )
    `;

    // 4. Create contacts table
    const createContactTable = `
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'replied') DEFAULT 'new',
        repliedBy INT,
        replyMessage TEXT,
        repliedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_email (email),
        INDEX idx_createdAt (createdAt)
      )
    `;

    // 5. Create loyalty_history table (track points)
    const createLoyaltyHistoryTable = `
      CREATE TABLE IF NOT EXISTS loyalty_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        points INT NOT NULL,
        reason VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )
    `;

    // 6. Create testimonials table
    const createTestimonialsTable = `
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_rating (rating)
      )
    `;

    // 7. Create newsletter_subscribers table
    const createNewsletterTable = `
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `;

    // Execute all table creations
    await pool.promise().query(createUserTable);
    console.log('✅ MySQL Users Table Ready');
    
    await pool.promise().query(createBookingsTable);
    console.log('✅ MySQL Bookings Table Ready');
    
    await pool.promise().query(createOrderTable);
    console.log('✅ MySQL Orders Table Ready');
    
    await pool.promise().query(createContactTable);
    console.log('✅ MySQL Contacts Table Ready');
    
    await pool.promise().query(createLoyaltyHistoryTable);
    console.log('✅ MySQL Loyalty History Table Ready');
    
    await pool.promise().query(createTestimonialsTable);
    console.log('✅ MySQL Testimonials Table Ready');
    
    await pool.promise().query(createNewsletterTable);
    console.log('✅ MySQL Newsletter Subscribers Table Ready');

    console.log('🎉 All MySQL tables initialized successfully!');

  } catch (error) {
    console.error('❌ MySQL Initialization Error:', error.message);
    console.error('Error details:', error);
    throw error;
  }
};

// Promise wrapper for queries
export const query = (sql, params) => {
  return pool.promise().query(sql, params);
};

// Get pool instance
export const getPool = () => pool;

// Test connection function
export const testConnection = async () => {
  try {
    const [result] = await pool.promise().query('SELECT 1+1 as result');
    console.log('✅ MySQL connection test successful');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection test failed:', error.message);
    return false;
  }
};

// Get connection count
export const getConnectionCount = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        connection.release();
        resolve(pool._allConnections.length);
      }
    });
  });
};

export default {
  query,
  getPool,
  testConnection,
  getConnectionCount,
  initializeMySQL
};
