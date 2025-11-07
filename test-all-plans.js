// Test different subscription plans to verify they show different data
const API_BASE_URL = 'http://localhost:8000';

async function testDifferentPlans() {
    try {
        console.log('=== Testing Different Subscription Plans ===\n');
        
        // First, get all available plans using the correct subscription API
        const plansResponse = await fetch(`${API_BASE_URL}/api/v1/plans/`);
        
        if (plansResponse.status === 404) {
            console.log('❌ Plans API not found at /api/v1/plans/');
            console.log('Trying alternative endpoint...');
            
            // Try alternative endpoint
            const altResponse = await fetch(`${API_BASE_URL}/api/v1/subscriptions/plans/`);
            if (altResponse.status === 404) {
                console.log('❌ Alternative endpoint also not found');
                return;
            } else {
                console.log('✅ Found plans at alternative endpoint');
                const altData = await altResponse.json();
                console.log('Alternative endpoint response:', Object.keys(altData));
                return;
            }
        }
        
        const plansData = await plansResponse.json();
        
        console.log('Plans API Response Status:', plansResponse.status);
        console.log('Response type:', typeof plansData);
        console.log('Response keys:', Object.keys(plansData));
        
        // Handle different response structures
        let plans = [];
        if (Array.isArray(plansData)) {
            plans = plansData;
        } else if (plansData.results && Array.isArray(plansData.results)) {
            plans = plansData.results;
        } else if (plansData.data && Array.isArray(plansData.data)) {
            plans = plansData.data;
        }
        
        console.log(`Found ${plans.length} plans\n`);
        
        if (plans.length > 0) {
            console.log('=== Testing Plan-Specific Features ===');
            
            // Test first few plans to see differences
            for (let i = 0; i < Math.min(plans.length, 4); i++) {
                const plan = plans[i];
                console.log(`\n--- Plan ${i + 1}: ${plan.name} (${plan.plan_type}) ---`);
                console.log(`Plan ID: ${plan.id}`);
                console.log(`Price: $${plan.price}/${plan.billing_cycle}`);
                
                // Test the enhanced plans API
                try {
                    const enhancedResponse = await fetch(`${API_BASE_URL}/api/permissions/api/v2/enhanced-plans/${plan.id}/`);
                    
                    if (enhancedResponse.status === 200) {
                        const enhancedData = await enhancedResponse.json();
                        console.log('✅ Enhanced Plans API response received');
                        
                        if (enhancedData.features) {
                            const categories = enhancedData.features;
                            const categoryCount = Object.keys(categories).length;
                            const totalFeatures = Object.values(categories).reduce((sum, features) => sum + features.length, 0);
                            
                            console.log(`📊 Categories: ${categoryCount}`);
                            console.log(`📊 Total Features: ${totalFeatures}`);
                            console.log(`📊 Category Names: ${Object.keys(categories).slice(0, 3).join(', ')}${categoryCount > 3 ? '...' : ''}`);
                            
                            // Test URL for this plan
                            console.log(`🔗 Test URL: http://localhost:3000/subscriptions/plans/${plan.id}`);
                            
                        } else {
                            console.log('⚠️ No features found in enhanced response');
                            console.log('Response structure:', Object.keys(enhancedData));
                        }
                    } else {
                        console.log(`❌ Enhanced Plans API error: ${enhancedResponse.status}`);
                        const errorText = await enhancedResponse.text();
                        console.log('Error details:', errorText.substring(0, 100));
                    }
                } catch (error) {
                    console.log(`❌ Request failed: ${error.message}`);
                }
            }
            
            console.log('\n=== Comparison Test ===');
            if (plans.length >= 2) {
                console.log('🔍 Compare these URLs to verify different data:');
                plans.slice(0, 3).forEach((plan, index) => {
                    console.log(`${index + 1}. ${plan.name}: http://localhost:3000/subscriptions/plans/${plan.id}`);
                });
            }
        } else {
            console.log('❌ No plans found in response');
            console.log('Raw response:', JSON.stringify(plansData, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error testing plans:', error.message);
        console.log('\n📝 Manual test URLs (if you know plan IDs):');
        console.log('Enterprise: http://localhost:3000/subscriptions/plans/304d8c9d-d225-4489-bd8e-a6b3b24e6bfd');
        console.log('Professional: http://localhost:3000/subscriptions/plans/[professional-plan-id]');
        console.log('Starter: http://localhost:3000/subscriptions/plans/[starter-plan-id]');
    }
}

testDifferentPlans();
