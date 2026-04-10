// Test MongoDB connection
import connectMongoDB from './config/db';
console.log('Type of connectMongoDB:', typeof connectMongoDB);

if (typeof connectMongoDB === 'function') {
  console.log('✅ connectMongoDB is a function');
  connectMongoDB();
} else {
  console.log('❌ connectMongoDB is NOT a function');
}