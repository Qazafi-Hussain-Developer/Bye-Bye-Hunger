// test-health.js
const testHealth = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.error('❌ Server not reachable:', error.message);
    console.log('\n🔍 Make sure backend is running:');
    console.log('   npm run dev');
  }
};

testHealth();