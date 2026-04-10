// fix-admin.js
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const fixAdmin = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Delete existing admin if exists
    const deleted = await User.deleteOne({ email: 'admin@byebyhunger.com' });
    if (deleted.deletedCount > 0) {
      console.log('🗑️ Deleted existing admin');
    }
    
    // Generate new password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    console.log('🔑 New password hash generated');
    
    // Create new admin
    const newAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@byebyhunger.com',
      password: hashedPassword,
      role: 'admin',
      phone: '1234567890',
      address: 'Admin Address',
      loyaltyPoints: 0,
      isActive: true
    });
    
    console.log('\n✅ ADMIN CREATED SUCCESSFULLY!');
    console.log('📧 Email:', newAdmin.email);
    console.log('👤 Name:', newAdmin.name);
    console.log('👑 Role:', newAdmin.role);
    console.log('🔑 Password: Admin@123');
    console.log('📝 Password hash saved:', newAdmin.password ? '✅ Yes' : '❌ No');
    
    await mongoose.disconnect();
    console.log('\n✅ Done! Now test login with: node test-fetch.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

fixAdmin();