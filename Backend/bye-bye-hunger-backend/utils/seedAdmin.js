// utils/seedAdmin.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { query } from '../config/mysql.js';

export const seedAdmin = async () => {
  try {
    // Wait for MongoDB to be connected (max 10 retries)
    let retries = 10;
    while (retries > 0) {
      if (mongoose.connection.readyState === 1) {
        console.log('✅ MongoDB ready for admin seeding');
        break;
      }
      console.log(`⏳ Waiting for MongoDB connection... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      retries--;
    }
    
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected after retries, skipping admin seeding');
      return;
    }
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@byebyhunger.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    
    // ============ CHECK BOTH DATABASES ============
    
    // Check if admin exists in MySQL
    let mysqlAdmin = null;
    let mysqlAdminExists = false;
    try {
      const [rows] = await query('SELECT * FROM users WHERE email = ?', [adminEmail]);
      if (rows.length > 0) {
        mysqlAdmin = rows[0];
        mysqlAdminExists = true;
        console.log('✅ Admin found in MySQL');
      } else {
        console.log('📝 Admin not found in MySQL');
      }
    } catch (err) {
      console.log('⚠️ MySQL check error:', err.message);
    }
    
    // Check if admin exists in MongoDB
    const mongoAdmin = await User.findOne({ email: adminEmail });
    const mongoAdminExists = !!mongoAdmin;
    
    if (mongoAdminExists) {
      console.log('✅ Admin found in MongoDB');
    } else {
      console.log('📝 Admin not found in MongoDB');
    }
    
    // ============ CASE 1: Admin exists in BOTH databases ============
    if (mysqlAdminExists && mongoAdminExists) {
      console.log('✅ Admin user already exists in both databases');
      console.log(`📧 Admin email: ${adminEmail}`);
      return;
    }
    
    // ============ CASE 2: Admin exists ONLY in MySQL (sync to MongoDB) ============
    if (mysqlAdminExists && !mongoAdminExists) {
      console.log('📝 Syncing admin from MySQL to MongoDB...');
      
      const admin = await User.create({
        name: mysqlAdmin.name,
        email: mysqlAdmin.email,
        password: mysqlAdmin.password,
        role: mysqlAdmin.role,
        phone: mysqlAdmin.phone || '1234567890',
        address: mysqlAdmin.address || 'Admin Address',
        loyaltyPoints: mysqlAdmin.loyaltyPoints || 0,
        isActive: mysqlAdmin.isActive === 1
      });
      
      console.log('✅ Admin synced to MongoDB:', admin._id);
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword} (from MySQL)`);
      return;
    }
    
    // ============ CASE 3: Admin exists ONLY in MongoDB (sync to MySQL) ============
    if (!mysqlAdminExists && mongoAdminExists) {
      console.log('📝 Syncing admin from MongoDB to MySQL...');
      
      await query(
        `INSERT INTO users (name, email, password, role, phone, address, loyaltyPoints, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mongoAdmin.name, 
          mongoAdmin.email, 
          mongoAdmin.password, 
          mongoAdmin.role, 
          mongoAdmin.phone || '1234567890', 
          mongoAdmin.address || 'Admin Address', 
          mongoAdmin.loyaltyPoints || 0, 
          mongoAdmin.isActive ? 1 : 0
        ]
      );
      
      console.log('✅ Admin synced to MySQL');
      console.log(`📧 Email: ${adminEmail}`);
      return;
    }
    
    // ============ CASE 4: Admin exists in NEITHER database (create fresh) ============
    console.log('📝 Creating brand new admin user...');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Create in MongoDB
    const admin = await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      phone: '1234567890',
      address: 'Admin Address',
      loyaltyPoints: 0,
      isActive: true
    });
    
    console.log('✅ Admin created in MongoDB:', admin._id);
    
    // Create in MySQL
    try {
      await query(
        `INSERT INTO users (name, email, password, role, phone, address, loyaltyPoints, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['Super Admin', adminEmail, hashedPassword, 'admin', '1234567890', 'Admin Address', 0, 1]
      );
      console.log('✅ Admin created in MySQL');
    } catch (mysqlError) {
      console.log('⚠️ MySQL insert error:', mysqlError.message);
    }
    
    console.log('\n🎉 ADMIN USER CREATED SUCCESSFULLY! 🎉');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error('Error details:', error);
  }
};