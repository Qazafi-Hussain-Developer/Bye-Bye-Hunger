// fix-ash-password.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { query } from './config/mysql.js';
import dotenv from 'dotenv';

dotenv.config();

const fixAshPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const email = 'ash@gmail.com';
    const newPassword = 'Ash123456';
    
    // Generate new hash
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    
    console.log('🔑 New hash for Ash:', newHash);
    
    // Update MongoDB
    await usersCollection.updateOne(
      { email: email },
      { $set: { password: newHash } }
    );
    console.log('✅ MongoDB updated');
    
    // Update MySQL
    await query(
      'UPDATE users SET password = ? WHERE email = ?',
      [newHash, email]
    );
    console.log('✅ MySQL updated');
    
    // Verify
    const verifyMatch = await bcrypt.compare(newPassword, newHash);
    console.log('🔐 Verification:', verifyMatch ? '✅ MATCHES!' : '❌ DOES NOT MATCH');
    
    await mongoose.disconnect();
    console.log('\n✅ Ash password fixed! Now try logging in with Ash123456');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

fixAshPassword();