// test-direct-mongo.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const testDirectLogin = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Find admin directly
    const admin = await usersCollection.findOne({ email: 'admin@byebyhunger.com' });
    
    if (!admin) {
      console.log('❌ Admin not found!');
      return;
    }
    
    console.log('✅ Admin found in database:');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Role:', admin.role);
    console.log('   Password hash:', admin.password);
    console.log('   Hash type:', typeof admin.password);
    console.log('   Hash length:', admin.password?.length);
    console.log('   Hash starts with $2a$:', admin.password?.startsWith('$2a$'));
    
    // Test password comparison
    const testPassword = 'Admin@123';
    console.log('\n🔐 Testing password:', testPassword);
    
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log('   bcrypt.compare result:', isMatch);
    
    if (!isMatch) {
      console.log('\n⚠️ Password doesn\'t match. Let\'s create a new hash...');
      
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(testPassword, salt);
      console.log('   New hash:', newHash);
      
      // Update the database directly
      await usersCollection.updateOne(
        { email: 'admin@byebyhunger.com' },
        { $set: { password: newHash } }
      );
      console.log('   ✅ Database updated with new hash');
      
      // Test again
      const verifyMatch = await bcrypt.compare(testPassword, newHash);
      console.log('   Verification after update:', verifyMatch ? '✅ MATCHES!' : '❌ DOES NOT MATCH');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Test complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

testDirectLogin();