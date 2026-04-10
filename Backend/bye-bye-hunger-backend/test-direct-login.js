// test-direct-login.js
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const directLoginTest = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const email = 'admin@byebyhunger.com';
    const password = 'Admin@123';
    
    console.log('🔍 Looking for user:', email);
    
    // Find user WITHOUT select('+password') first to see if it exists
    const userExists = await User.findOne({ email });
    console.log('User exists:', !!userExists);
    
    if (userExists) {
      console.log('User found but without password field shown (normal)');
      console.log('User role:', userExists.role);
    }
    
    // Now find with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\n✅ User found with password:');
    console.log('   ID:', user._id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Password hash:', user.password);
    console.log('   Hash length:', user.password ? user.password.length : 0);
    
    // Test bcrypt compare
    console.log('\n🔐 Testing bcrypt.compare directly:');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('   Result:', isMatch ? '✅ MATCHES!' : '❌ DOES NOT MATCH');
    
    if (isMatch) {
      console.log('\n✅ Password matches! Login should work!');
      console.log('   Check your authController.js login function');
    } else {
      console.log('\n❌ Password does NOT match');
      console.log('   Let\'s update password one more time...');
      
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(password, salt);
      console.log('   New hash:', newHash);
      
      user.password = newHash;
      await user.save();
      console.log('   ✅ Password updated');
      
      // Test again
      const verifyMatch = await bcrypt.compare(password, newHash);
      console.log('   Verification after update:', verifyMatch ? '✅ MATCHES!' : '❌ STILL NOT MATCHING');
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

directLoginTest();