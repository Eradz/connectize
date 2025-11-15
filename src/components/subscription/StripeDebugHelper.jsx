import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';

/**
 * Stripe Debug Helper Component
 * Helps debug Stripe SetupIntent issues
 */
const StripeDebugHelper = () => {
  const [debugInfo, setDebugInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testCards = [
    {
      number: '4242424242424242',
      description: 'Succeeds',
      expiry: '12/25',
      cvc: '123',
      type: 'success'
    },
    {
      number: '4000002500003155',
      description: 'Requires Authentication (3D Secure)',
      expiry: '12/25',
      cvc: '123',
      type: 'auth'
    },
    {
      number: '4000000000009995',
      description: 'Declined',
      expiry: '12/25',
      cvc: '123',
      type: 'declined'
    },
    {
      number: '4000000000000069',
      description: 'Expired Card',
      expiry: '12/25',
      cvc: '123',
      type: 'expired'
    }
  ];

  const testSetupIntent = async () => {
    setIsLoading(true);
    setDebugInfo('Testing SetupIntent creation...\n');

    try {
      // Import subscriptions API
      const { default: subscriptionsApi } = await import('@/api-services/subscriptions');
      
      const { data } = await subscriptionsApi.createSetupIntent();
      
      setDebugInfo(prev => prev + `✅ SetupIntent created successfully!\n`);
      setDebugInfo(prev => prev + `📋 Client Secret: ${data.client_secret}\n`);
      setDebugInfo(prev => prev + `🆔 Setup Intent ID: ${data.setup_intent_id}\n`);
      
      // Test if we can fetch the setup intent from Stripe
      const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      setDebugInfo(prev => prev + `🔑 Using Stripe Key: ${stripePublishableKey?.substring(0, 20)}...\n`);
      
    } catch (error) {
      setDebugInfo(prev => prev + `❌ Error: ${error.message}\n`);
      if (error.response?.data) {
        setDebugInfo(prev => prev + `📄 Response: ${JSON.stringify(error.response.data, null, 2)}\n`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyCardNumber = (cardNumber) => {
    navigator.clipboard.writeText(cardNumber);
  };

  return (
    <div className="space-y-6">
      {/* Test Cards Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Test Cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testCards.map((card, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-mono text-sm font-medium">{card.number}</div>
                  <div className="text-sm text-gray-600">{card.description}</div>
                  <div className="text-xs text-gray-500">Expiry: {card.expiry} | CVC: {card.cvc}</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyCardNumber(card.number)}
                >
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debug SetupIntent */}
      <Card>
        <CardHeader>
          <CardTitle>Debug SetupIntent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testSetupIntent}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test SetupIntent Creation'}
          </Button>
          
          {debugInfo && (
            <div className="mt-4">
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                {debugInfo}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Common Issues */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Common 402 Error Causes:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Using a card that requires authentication (4000002500003155)</li>
            <li>• Using a declined card (4000000000009995)</li>
            <li>• Missing or invalid billing details</li>
            <li>• Stripe account not properly configured</li>
            <li>• Client-side/server-side key mismatch</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Stripe Key:</strong> {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 20)}...
            </div>
            <div>
              <strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL}
            </div>
            <div>
              <strong>Environment:</strong> {import.meta.env.MODE}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeDebugHelper;
