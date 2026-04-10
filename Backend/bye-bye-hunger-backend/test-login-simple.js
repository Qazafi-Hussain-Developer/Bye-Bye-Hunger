// test-login-simple.js
import http from 'http';

const data = JSON.stringify({
  email: 'admin@byebyhunger.com',
  password: 'Admin@123'
});

console.log('📡 Sending POST request to http://localhost:5000/api/auth/login');
console.log('📦 Request body:', data);
console.log('');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  
  console.log('📥 Response Status:', res.statusCode);
  console.log('📥 Response Headers:', res.headers);
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('📥 Response Body:', responseData);
    try {
      const json = JSON.parse(responseData);
      if (json.success) {
        console.log('\n✅ LOGIN SUCCESSFUL! 🎉');
        console.log('Token:', json.token);
        console.log('User:', json.user.email);
        console.log('Role:', json.user.role);
      } else {
        console.log('\n❌ Login failed:', json.message);
      }
    } catch (e) {
      console.log('Invalid JSON response');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  console.log('\nMake sure backend is running on port 5000');
});

req.write(data);
req.end();