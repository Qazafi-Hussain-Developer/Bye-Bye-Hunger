// test-login.js - No axios needed, uses built-in fetch
const testLogin = async () => {
  try {
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
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('\n🔑 Your JWT Token:', data.token);
    } else {
      console.log('❌ Login failed!');
      console.log('Status:', response.status);
      console.log('Error:', data);
    }
  } catch (error) {
    console.log('❌ Request failed!');
    console.log('Error:', error.message);
  }
};

testLogin();