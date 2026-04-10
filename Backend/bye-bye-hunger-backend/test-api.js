import { get, post } from 'axios';

const testAPI = async () => {
  try {
    // Test health endpoint
    const health = await get('http://localhost:5000/api/health');
    console.log('✅ Health check:', health.data);

    // Test registration
    const register = await post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Registration:', register.data);

    // Test login
    const login = await post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login:', login.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testAPI();