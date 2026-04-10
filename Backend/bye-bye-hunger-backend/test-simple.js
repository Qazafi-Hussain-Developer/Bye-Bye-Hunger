// test-simple.js - ES Module version
import http from 'http';

const data = JSON.stringify({
  email: 'admin@byebyhunger.com',
  password: 'Admin@123'
});

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
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', responseData);
    
    try {
      const json = JSON.parse(responseData);
      if (json.success) {
        console.log('\n✅ LOGIN SUCCESSFUL!');
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
  console.log('\n🔍 Make sure the backend is running:');
  console.log('   cd D:\\Projects\\Bye-Bye-Hunger\\Backend\\bye-bye-hunger-backend');
  console.log('   npm run dev');
});

req.write(data);
req.end();