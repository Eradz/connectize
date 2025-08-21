// Quick test to check subscription API response
const API_BASE_URL = 'http://localhost:8000';

async function testSubscriptionAPI() {
    try {
        console.log('Testing subscription API...');
        
        // Test without auth first to see structure
        const response = await fetch(`${API_BASE_URL}/api/subscriptions/current/`);
        const data = await response.json();
        
        console.log('Response status:', response.status);
        console.log('Response data structure:');
        console.log(JSON.stringify(data, null, 2));
        
        if (data.subscription) {
            console.log('\nSubscription dates:');
            console.log('- next_payment_date:', data.subscription.next_payment_date);
            console.log('- current_period_end:', data.subscription.current_period_end);
            console.log('- next_billing_date:', data.subscription.next_billing_date);
        }
        
        if (data.usage) {
            console.log('\nUsage dates:');
            console.log('- next_billing_date:', data.usage.next_billing_date);
        }
        
    } catch (error) {
        console.error('Error testing API:', error);
    }
}

testSubscriptionAPI();
