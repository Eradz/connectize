/**
 * DHL Integration Component for Connectize Frontend
 * Handles DHL-specific shipment creation and tracking
 */
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Truck, Package, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { logisticsAPI } from '../../api-services/logistics';

const DHLIntegration = ({ shipmentRequest, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [dhlConfig, setDhlConfig] = useState({
    apiKey: '',
    secret: '',
    environment: 'test'
  });

  const handleDHLSubmit = async () => {
    try {
      setLoading(true);
      
      // Award shipment to DHL
      const response = await logisticsAPI.awardToDHL(shipmentRequest.id, dhlConfig);
      
      toast.success('Shipment successfully created with DHL!');
      if (onSuccess) {
        onSuccess(response.data);
      }
      
    } catch (error) {
      console.error('DHL integration error:', error);
      toast.error(error.response?.data?.error || 'Failed to create DHL shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-red-100 p-2 rounded-lg">
          <Truck className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">DHL Express Integration</h3>
          <p className="text-sm text-gray-600">Create shipment directly with DHL</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            DHL API Key
          </label>
          <input
            type="text"
            value={dhlConfig.apiKey}
            onChange={(e) => setDhlConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter your DHL API key"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            DHL Secret
          </label>
          <input
            type="password"
            value={dhlConfig.secret}
            onChange={(e) => setDhlConfig(prev => ({ ...prev, secret: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter your DHL secret"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Environment
          </label>
          <select
            value={dhlConfig.environment}
            onChange={(e) => setDhlConfig(prev => ({ ...prev, environment: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="test">Test Environment</option>
            <option value="prod">Production Environment</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Shipment Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Cargo:</span>
            <span className="ml-2 font-medium">{shipmentRequest.cargo_type}</span>
          </div>
          <div>
            <span className="text-gray-600">Weight:</span>
            <span className="ml-2 font-medium">{shipmentRequest.weight} tons</span>
          </div>
          <div>
            <span className="text-gray-600">Volume:</span>
            <span className="ml-2 font-medium">{shipmentRequest.volume} m³</span>
          </div>
          <div>
            <span className="text-gray-600">Budget:</span>
            <span className="ml-2 font-medium">
              {shipmentRequest.budget_min && shipmentRequest.budget_max 
                ? `${shipmentRequest.budget_min} - ${shipmentRequest.budget_max} ${shipmentRequest.currency}`
                : 'Not specified'
              }
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleDHLSubmit}
        disabled={loading || !dhlConfig.apiKey || !dhlConfig.secret}
        className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Creating DHL Shipment...
          </>
        ) : (
          <>
            <Package className="w-4 h-4 mr-2" />
            Create DHL Shipment
          </>
        )}
      </button>

      <div className="mt-4 text-xs text-gray-500">
        <p>• DHL shipments will be automatically tracked</p>
        <p>• Real-time status updates via DHL API</p>
        <p>• Estimated delivery times provided</p>
      </div>
    </div>
  );
};

export default DHLIntegration;
