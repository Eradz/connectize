// Test authentication script
const fs = require('fs');

async function testAuth() {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('🔐 Testing authentication with info@connectize.co...');
    
    const response = await fetch('http://localhost:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'info@connectize.co',
        email: 'info@connectize.co',
        password: 'Access2024'
      })
    });

    const responseText = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Authentication successful!');
        console.log('User ID:', data.results?.id);
        console.log('Email:', data.results?.email);
        console.log('Has tokens:', !!(data.results?.tokens?.access));
        
        // Test protected endpoint
        if (data.results?.tokens?.access) {
          console.log('\n🔒 Testing protected endpoint...');
          const protectedResponse = await fetch('http://localhost:8000/api/v1/subscriptions/current/', {
            headers: {
              'Authorization': `Bearer ${data.results.tokens.access}`,
              'Content-Type': 'application/json'
            }
          });
          
          const protectedData = await protectedResponse.text();
          console.log('Protected endpoint status:', protectedResponse.status);
          console.log('Protected endpoint response:', protectedData.substring(0, 200));
          
          // Test analytics endpoint
          console.log('\n📊 Testing analytics endpoint...');
          const analyticsResponse = await fetch('http://localhost:8000/api/v1/subscriptions/analytics/', {
            headers: {
              'Authorization': `Bearer ${data.results.tokens.access}`,
              'Content-Type': 'application/json'
            }
          });
          
          const analyticsData = await analyticsResponse.text();
          console.log('Analytics endpoint status:', analyticsResponse.status);
          console.log('Analytics endpoint response:', analyticsData.substring(0, 200));
        }
      } catch (parseError) {
        console.log('Could not parse response as JSON');
      }
    } else {
      console.log('❌ Authentication failed');
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAuth();
