// check-admin.js
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const checkAdmin = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Check if admin exists
    const admin = await User.findOne({ email: 'admin@byebyhunger.com' });
    
    if (admin) {
      console.log('✅ Admin found in MongoDB:');
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.name);
      console.log('   Role:', admin.role);
      console.log('   Password hash:', admin.password);
      console.log('   Hash length:', admin.password.length);
      
      // Verify if password matches "Admin@123"
      const isMatch = await bcrypt.compare('Admin@123', admin.password);
      console.log('\n🔐 Password "Admin@123" matches:', isMatch ? '✅ YES' : '❌ NO');
      
      if (!isMatch) {
        console.log('\n⚠️ Password hash is incorrect!');
        console.log('📝 Generating new hash and updating...');
        
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash('Admin@123', salt);
        
        admin.password = newHash;
        await admin.save();
        
        console.log('✅ Password updated successfully!');
        console.log('📝 New hash:', newHash);
      } else {
        console.log('\n✅ Password is correct! Login should work.');
      }
    } else {
      console.log('❌ Admin NOT found in MongoDB');
      console.log('📝 Creating new admin with correct password...');
      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('Admin@123', salt);
      
      const newAdmin = await User.create({
        name: 'Super Admin',
        email: 'admin@byebyhunger.com',
        password: hash,
        role: 'admin',
        phone: '1234567890',
        address: 'Admin Address',
        loyaltyPoints: 0,
        isActive: true
      });
      
      console.log('✅ Admin created successfully!');
      console.log('📧 Email: admin@byebyhunger.com');
      console.log('🔑 Password: Admin@123');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Done! Now test login with: node test-fetch.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAdmin();