// test-fetch.js - ES Module version with fetch
const testLogin = async () => {
  try {
    console.log('📡 Sending login request...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@byebyhunger.com',
        password: 'Admin@123'
      })
    });

    const data = await response.json();
    
    console.log('Status Code:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('\n✅ LOGIN SUCCESSFUL! 🎉');
      console.log('🔑 Token:', data.token);
      console.log('👤 User:', data.user.email);
      console.log('👑 Role:', data.user.role);
    } else {
      console.log('\n❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Request error:', error.message);
    console.log('\n🔍 Make sure the backend is running:');
    console.log('   Check your terminal - should show "🚀 Server running on port 5000"');
  }
};

testLogin();