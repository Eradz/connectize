import React, { useState } from 'react';
import EnhancedMultiProviderIntegration from '../../components/logistics/MultiProviderIntegration';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';

const LogisticsTest = () => {
  // Mock shipment data for testing
  const [mockShipment] = useState({
    id: 1,
    cargo_type: 'Electronics',
    weight: 1.5,
    volume: 0.5,
    budget_min: 50,
    budget_max: 200,
    origin: {
      address: 'New York, NY, USA',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    destination: {
      address: 'Los Angeles, CA, USA', 
      coordinates: { lat: 34.0522, lng: -118.2437 }
    },
    length: 30,
    width: 20,
    height: 15,
    value: 1000,
    description: 'Test shipment for logistics providers'
  });

  const handleSuccess = (result) => {
    console.log('Shipment created successfully:', result);
    alert('Shipment created successfully! Check console for details.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Logistics Provider Integration Test
          </h1>
          <p className="text-gray-600">
            Test the enhanced multi-provider logistics system with automatic rate fetching
          </p>
        </div>

        {/* Instructions */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <h3 className="flex items-center text-blue-900 text-lg font-semibold">
              <span className="mr-2">ℹ️</span>
              Test Instructions
            </h3>
            <p className="text-blue-700 text-sm mt-1">
              This page demonstrates the new secure multi-provider logistics integration
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-800">
            <div>
              <strong>✅ Features to Test:</strong>
              <ul className="list-disc ml-6 mt-1 space-y-1">
                <li>Automatic rate fetching from multiple providers</li>
                <li>Provider comparison with business intelligence</li>
                <li>Enhanced UI with provider metadata</li>
                <li>Secure backend credential management</li>
                <li>Service selection within providers</li>
              </ul>
            </div>
            <div>
              <strong>🔧 Backend Setup Required:</strong>
              <ul className="list-disc ml-6 mt-1 space-y-1">
                <li>Configure provider API keys in .env file</li>
                <li>Run: <code className="bg-blue-100 px-1 rounded">python setup_logistics.py</code></li>
                <li>Ensure Django server is running on port 8000</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Mock Shipment Info */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">📦 Test Shipment Details</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Origin:</strong> {mockShipment.origin.address}
              </div>
              <div>
                <strong>Destination:</strong> {mockShipment.destination.address}
              </div>
              <div>
                <strong>Weight:</strong> {mockShipment.weight} tons
              </div>
              <div>
                <strong>Volume:</strong> {mockShipment.volume} m³
              </div>
              <div>
                <strong>Cargo:</strong> {mockShipment.cargo_type}
              </div>
              <div>
                <strong>Value:</strong> ${mockShipment.value}
              </div>
              <div>
                <strong>Budget:</strong> ${mockShipment.budget_min} - ${mockShipment.budget_max}
              </div>
              <div>
                <strong>Dimensions:</strong> {mockShipment.length}×{mockShipment.width}×{mockShipment.height} cm
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Multi-Provider Integration Component */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">🌐 Enhanced Multi-Provider Integration</h3>
            <p className="text-gray-600 text-sm mt-1">
              The component below will automatically fetch rates from all configured providers
            </p>
          </CardHeader>
          <CardContent>
            <EnhancedMultiProviderIntegration 
              shipmentRequest={mockShipment}
              onSuccess={handleSuccess}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            💡 <strong>Note:</strong> This is a test page to demonstrate the new logistics features.
            Real shipments should be created through the main logistics workflow.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogisticsTest;
