// debug-password.js
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const debugPassword = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find admin
    const admin = await User.findOne({ email: 'admin@byebyhunger.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin NOT found!');
      return;
    }
    
    console.log('✅ Admin found:');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Role:', admin.role);
    console.log('   Password hash:', admin.password);
    console.log('   Hash exists:', admin.password ? 'Yes' : 'No');
    console.log('   Hash length:', admin.password ? admin.password.length : 0);
    
    // Test with bcrypt.compare
    console.log('\n🔐 Testing password "Admin@123":');
    const isMatch = await bcrypt.compare('Admin@123', admin.password);
    console.log('   Result:', isMatch ? '✅ MATCHES!' : '❌ DOES NOT MATCH');
    
    // Test with a wrong password
    console.log('\n🔐 Testing password "wrongpassword":');
    const wrongMatch = await bcrypt.compare('wrongpassword', admin.password);
    console.log('   Result:', wrongMatch ? 'Matches' : '✅ Does not match (good)');
    
    // If still not matching, let's create a new hash and update
    if (!isMatch) {
      console.log('\n⚠️ Password mismatch! Let\'s create a fresh hash...');
      
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash('Admin@123', salt);
      console.log('📝 New hash:', newHash);
      
      admin.password = newHash;
      await admin.save();
      console.log('✅ Password updated in database');
      
      // Test again
      const verifyMatch = await bcrypt.compare('Admin@123', newHash);
      console.log('🔐 Verification after update:', verifyMatch ? '✅ MATCHES!' : '❌ STILL NOT MATCHING');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

debugPassword();