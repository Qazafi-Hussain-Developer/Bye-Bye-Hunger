// fix-user-password.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const fixUserPassword = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const userEmail = 'qazafihussain321@gmail.com';
    const newPassword = 'Muammar123456';
    
    // Find the user
    const user = await usersCollection.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ User not found:', userEmail);
      return;
    }
    
    console.log('✅ User found:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Current hash:', user.password);
    
    // Generate new hash
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    
    console.log('\n🔑 New hash generated:', newHash);
    
    // Update the password
    await usersCollection.updateOne(
      { email: userEmail },
      { $set: { password: newHash } }
    );
    
    console.log('\n✅ Password updated successfully!');
    
    // Verify
    const verifyMatch = await bcrypt.compare(newPassword, newHash);
    console.log('🔐 Verification:', verifyMatch ? '✅ MATCHES!' : '❌ DOES NOT MATCH');
    
    await mongoose.disconnect();
    console.log('\n✅ User password fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

fixUserPassword();