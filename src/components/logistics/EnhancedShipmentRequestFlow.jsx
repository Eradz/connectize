/**
 * Enhanced Shipment Request Flow
 * Removes premature carrier selection and implements proper request → comparison → assignment workflow
 */
import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Package, MapPin, Calendar, DollarSign, FileText, 
  ArrowRight, CheckCircle, AlertTriangle, Info,
  Plus, Minus, Upload, Save, Send
} from 'lucide-react';
import { logisticsAPI } from '../../api-services/logistics';
import ProviderComparisonSystem from './ProviderComparisonSystem';

const EnhancedShipmentRequestFlow = ({ onRequestCreated, onShipmentAssigned }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdRequest, setCreatedRequest] = useState(null);
  const [showProviderComparison, setShowProviderComparison] = useState(false);
  
  const [requestData, setRequestData] = useState({
    cargo_type: '',
    origin_address: '',
    destination_address: '',
    pickup_date: '',
    delivery_date: '',
    weight: '',
    volume: '',
    budget_min: '',
    budget_max: '',
    special_instructions: '',
    priority_level: 'standard',
    insurance_required: false,
    insurance_value: '',
  allow_bids: true,
    items: [
      {
        description: '',
        quantity: 1,
        weight: '',
        dimensions: {
          length: '',
          width: '',
          height: ''
        },
        value: '',
        commodity_code: ''
      }
    ],
    contact_info: {
      pickup_contact: {
        name: '',
        phone: '',
        email: ''
      },
      delivery_contact: {
        name: '',
        phone: '',
        email: ''
      }
    }
  });

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Cargo type, addresses, and dates' },
    { id: 2, title: 'Cargo Details', description: 'Weight, dimensions, and itemization' },
    { id: 3, title: 'Requirements', description: 'Budget, insurance, and special needs' },
    { id: 4, title: 'Review & Submit', description: 'Confirm details and create request' },
    { id: 5, title: 'Provider Selection', description: 'Compare and select logistics provider' }
  ];

  const handleInputChange = (field, value) => {
    setRequestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (path, value) => {
    setRequestData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleItemChange = (index, field, value) => {
    setRequestData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

  const handleItemDimensionChange = (index, dimension, value) => {
    setRequestData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? { 
              ...item, 
              dimensions: { 
                ...item.dimensions, 
                [dimension]: value 
              }
            }
          : item
      )
    }));
  };

  const addItem = () => {
    setRequestData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          weight: '',
          dimensions: {
            length: '',
            width: '',
            height: ''
          },
          value: '',
          commodity_code: ''
        }
      ]
    }));
  };

  const removeItem = (index) => {
    if (requestData.items.length > 1) {
      setRequestData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return requestData.cargo_type && 
               requestData.origin_address && 
               requestData.destination_address && 
               requestData.pickup_date;
      case 2:
        return requestData.weight && 
               requestData.volume && 
               requestData.items.every(item => 
                 item.description && 
                 item.quantity > 0
               );
      case 3:
        return requestData.budget_min && requestData.budget_max;
      case 4:
        return true; // Review step doesn't need validation
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitRequest = async () => {
    try {
      setLoading(true);
      
      // Format data for API submission
      const submitData = {
        ...requestData,
        pickup_date: new Date(requestData.pickup_date).toISOString().split('T')[0],
        delivery_date: requestData.delivery_date ? new Date(requestData.delivery_date).toISOString().split('T')[0] : null,
        weight: parseFloat(requestData.weight),
        volume: parseFloat(requestData.volume),
        budget_min: parseFloat(requestData.budget_min),
        budget_max: parseFloat(requestData.budget_max),
        insurance_value: requestData.insurance_required ? parseFloat(requestData.insurance_value || 0) : 0,
  allow_bids: requestData.allow_bids,
        items: requestData.items.map(item => ({
          ...item,
          quantity: parseInt(item.quantity),
          weight: parseFloat(item.weight || 0),
          value: parseFloat(item.value || 0),
          dimensions: {
            length: parseFloat(item.dimensions.length || 0),
            width: parseFloat(item.dimensions.width || 0),
            height: parseFloat(item.dimensions.height || 0)
          }
        }))
      };

      const response = await logisticsAPI.createRequest(submitData);
      
      if (response.data) {
        setCreatedRequest(response.data);
        toast.success('Shipment request created successfully!');
        setShowProviderComparison(true);
        setCurrentStep(5);
        
        if (onRequestCreated) {
          onRequestCreated(response.data);
        }
      } else {
        throw new Error('Failed to create request');
      }
      
    } catch (error) {
      console.error('Request creation error:', error);
      toast.error('Failed to create request', {
        description: error.response?.data?.error || error.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProviderAssignment = (assignmentData) => {
    toast.success(`Provider ${assignmentData.provider_name} assigned successfully!`);
    
    if (onShipmentAssigned) {
      onShipmentAssigned({
        request: createdRequest,
        assignment: assignmentData
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Basic Shipment Information</h3>
            
            {/* Cargo Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo Type *
              </label>
              <select
                value={requestData.cargo_type}
                onChange={(e) => handleInputChange('cargo_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select cargo type</option>
                <option value="general">General Cargo</option>
                <option value="electronics">Electronics</option>
                <option value="textiles">Textiles</option>
                <option value="machinery">Machinery</option>
                <option value="food">Food Products</option>
                <option value="chemicals">Chemicals</option>
                <option value="automotive">Automotive Parts</option>
                <option value="medical">Medical Supplies</option>
                <option value="documents">Documents</option>
                <option value="fragile">Fragile Items</option>
                <option value="hazardous">Hazardous Materials</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Origin Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Address *
              </label>
              <textarea
                value={requestData.origin_address}
                onChange={(e) => handleInputChange('origin_address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Enter complete pickup address including city, state, and country"
                required
              />
            </div>

            {/* Destination Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address *
              </label>
              <textarea
                value={requestData.destination_address}
                onChange={(e) => handleInputChange('destination_address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Enter complete delivery address including city, state, and country"
                required
              />
            </div>

            {/* Pickup Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Date *
                </label>
                <input
                  type="date"
                  value={requestData.pickup_date}
                  onChange={(e) => handleInputChange('pickup_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Delivery Date
                </label>
                <input
                  type="date"
                  value={requestData.delivery_date}
                  onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  min={requestData.pickup_date}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Cargo Details</h3>
            
            {/* Weight and Volume */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Weight (tons) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={requestData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Volume (m³) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={requestData.volume}
                  onChange={(e) => handleInputChange('volume', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Cargo Items</h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-gold text-white rounded-lg hover:bg-custom_yellow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              {requestData.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-gray-900">Item {index + 1}</h5>
                    {requestData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe the item"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight per item (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.weight}
                        onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Length (cm)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.dimensions.length}
                        onChange={(e) => handleItemDimensionChange(index, 'length', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width (cm)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.dimensions.width}
                        onChange={(e) => handleItemDimensionChange(index, 'width', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.dimensions.height}
                        onChange={(e) => handleItemDimensionChange(index, 'height', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value per item (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.value}
                        onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Requirements & Preferences</h3>
            
            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range (USD) *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={requestData.budget_min}
                    onChange={(e) => handleInputChange('budget_min', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Minimum budget"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum budget</p>
                </div>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={requestData.budget_max}
                    onChange={(e) => handleInputChange('budget_max', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Maximum budget"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum budget</p>
                </div>
              </div>
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                value={requestData.priority_level}
                onChange={(e) => handleInputChange('priority_level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low - Cost effective, flexible timing</option>
                <option value="standard">Standard - Balanced cost and speed</option>
                <option value="high">High - Fast delivery, premium service</option>
                <option value="urgent">Urgent - Fastest possible delivery</option>
              </select>
            </div>

            {/* Insurance */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="insurance_required"
                  checked={requestData.insurance_required}
                  onChange={(e) => handleInputChange('insurance_required', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="insurance_required" className="text-sm font-medium text-gray-700">
                  Require cargo insurance
                </label>
              </div>
              
              {requestData.insurance_required && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Value (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={requestData.insurance_value}
                    onChange={(e) => handleInputChange('insurance_value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Total insured value"
                  />
                </div>
              )}
            </div>

            {/* Allow Provider Bids */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start space-x-3">
                <input
                  id="allow_bids"
                  type="checkbox"
                  checked={!!requestData.allow_bids}
                  onChange={(e) => handleInputChange('allow_bids', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="allow_bids" className="text-sm font-medium text-gray-700">
                    Allow provider bids
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    When enabled, providers can view this request (once posted) and submit quotes. Disable if you want to keep this request private.
                  </p>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                value={requestData.special_instructions}
                onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Any special handling requirements, delivery instructions, or notes..."
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pickup Contact</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={requestData.contact_info.pickup_contact.name}
                    onChange={(e) => handleNestedInputChange('contact_info.pickup_contact.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contact name"
                  />
                  <input
                    type="tel"
                    value={requestData.contact_info.pickup_contact.phone}
                    onChange={(e) => handleNestedInputChange('contact_info.pickup_contact.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Phone number"
                  />
                  <input
                    type="email"
                    value={requestData.contact_info.pickup_contact.email}
                    onChange={(e) => handleNestedInputChange('contact_info.pickup_contact.email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Delivery Contact</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={requestData.contact_info.delivery_contact.name}
                    onChange={(e) => handleNestedInputChange('contact_info.delivery_contact.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contact name"
                  />
                  <input
                    type="tel"
                    value={requestData.contact_info.delivery_contact.phone}
                    onChange={(e) => handleNestedInputChange('contact_info.delivery_contact.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Phone number"
                  />
                  <input
                    type="email"
                    value={requestData.contact_info.delivery_contact.email}
                    onChange={(e) => handleNestedInputChange('contact_info.delivery_contact.email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email address"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Review Your Request</h3>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Cargo Information
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Type:</strong> {requestData.cargo_type}</p>
                  <p><strong>Weight:</strong> {requestData.weight} tons</p>
                  <p><strong>Volume:</strong> {requestData.volume} m³</p>
                  <p><strong>Items:</strong> {requestData.items.length}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Shipping Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>From:</strong> {requestData.origin_address.slice(0, 50)}...</p>
                  <p><strong>To:</strong> {requestData.destination_address.slice(0, 50)}...</p>
                  <p><strong>Pickup:</strong> {requestData.pickup_date}</p>
                  {requestData.delivery_date && <p><strong>Delivery:</strong> {requestData.delivery_date}</p>}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Budget & Requirements
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Budget:</strong> ${requestData.budget_min} - ${requestData.budget_max}</p>
                  <p><strong>Priority:</strong> {requestData.priority_level}</p>
                  <p><strong>Insurance:</strong> {requestData.insurance_required ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Additional Info
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Special Instructions:</strong></p>
                  <p className="text-gray-600">
                    {requestData.special_instructions || 'None specified'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Ready to Create Request</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    Once you submit this request, you'll be able to compare quotes from multiple logistics providers 
                    and select the best option based on price, transit time, and service quality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Request Created Successfully!</h4>
                  <p className="text-sm text-green-800 mt-1">
                    Your shipment request has been created. Now compare providers and select the best option.
                  </p>
                  {createdRequest && (
                    <p className="text-sm text-green-700 mt-2">
                      <strong>Request ID:</strong> #{createdRequest.id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {showProviderComparison && createdRequest && (
              <ProviderComparisonSystem
                shipmentRequest={createdRequest}
                onProviderSelected={handleProviderAssignment}
                onSuccess={handleProviderAssignment}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center items-center gap-3 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step circle */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium 
              ${ currentStep > step.id 
                  ? 'bg-gold border-gold text-white'
                  : currentStep === step.id
                  ? 'bg-gold border-gold text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
          >
             {currentStep > step.id ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
          </div>
  
          {/* Connector */}
          {index < 4 && (
            <div className="w-10 h-px bg-gray-300" />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        {renderStepIndicator()}
        {/* <div className="flex justify-center items-center gap-3">
          {steps.map((step, index) => (
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep > step.id 
                  ? 'bg-green-600 border-green-600 text-white'
                  : currentStep === step.id
                  ? 'bg-gold border-gold text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              {index < steps.length - 1 && (
                <div className={`w-full h-1 mx-4 ${
                  currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
              </div>
              
          ))}
        </div> */}
        
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {steps[currentStep - 1]?.title}
          </h2>
          <p className="text-sm text-gray-600">
            {steps[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border p-8">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="text-sm text-gray-500">
          Step {currentStep} of {steps.length}
        </div>

        {currentStep < 4 ? (
          <button
            onClick={nextStep}
            disabled={!validateStep(currentStep)}
            className="px-6 py-3 bg-gold text-white rounded-lg hover:bg-custom_yellow disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : currentStep === 4 ? (
          <button
            onClick={submitRequest}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Create Request</span>
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default EnhancedShipmentRequestFlow;
