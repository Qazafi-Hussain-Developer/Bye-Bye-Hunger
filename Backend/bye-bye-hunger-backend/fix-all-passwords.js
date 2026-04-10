// fix-all-passwords.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { query } from './config/mysql.js';
import dotenv from 'dotenv';

dotenv.config();

const fixAllPasswords = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Get all users
    const users = await usersCollection.find({}).toArray();
    console.log(`📊 Found ${users.length} users in MongoDB\n`);
    
    for (const user of users) {
      console.log(`🔧 Processing: ${user.email}`);
      
      // Check if password is valid bcrypt
      const isValidHash = user.password && user.password.startsWith('$2a$') && user.password.length === 60;
      
      if (!isValidHash) {
        console.log(`   ⚠️ Invalid hash found! Regenerating...`);
        
        // For testing, use a default password
        // In production, you'd need to handle this differently
        const defaultPassword = 'password123';
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(defaultPassword, salt);
        
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { password: newHash } }
        );
        
        console.log(`   ✅ Updated MongoDB with new hash`);
        
        // Update MySQL
        await query(
          'UPDATE users SET password = ? WHERE email = ?',
          [newHash, user.email]
        );
        console.log(`   ✅ Updated MySQL`);
        
        console.log(`   📧 User: ${user.email}`);
        console.log(`   🔑 New password: ${defaultPassword}`);
        console.log('   ----------------------------------------');
      } else {
        // Verify the hash works
        const testPassword = 'Muammar123456'; // Try the password the user is entering
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log(`   Hash valid: ✅, Matches test password: ${isMatch ? '✅' : '❌'}`);
        
        if (!isMatch) {
          console.log(`   ⚠️ Hash exists but password doesn't match!`);
        }
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Password check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

fixAllPasswords();