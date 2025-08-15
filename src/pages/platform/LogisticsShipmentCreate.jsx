import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  Ship,
  Plane,
  User,
  Phone,
  Mail,
  Upload,
  Plus,
  Minus,
  AlertTriangle,
  Save,
  Send
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsShipmentService } from '../../api-services/oilgas';
import { toast } from 'sonner';

const LogisticsShipmentCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    // Shipment Basic Info
    cargo_type: '',
    description: '',
    dangerous_goods: false,
    priority: 'medium',
    
    // Origin Details
    origin: {
      name: '',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      contact_name: '',
      contact_phone: '',
      contact_email: ''
    },
    
    // Destination Details
    destination: {
      name: '',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      contact_name: '',
      contact_phone: '',
      contact_email: ''
    },
    
    // Cargo Details
    items: [
      {
        description: '',
        quantity: 1,
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        value: '',
        commodity_code: ''
      }
    ],
    
    // Shipping Details
    shipping_method: '',
    preferred_carrier: '',
    pickup_date: '',
    requested_delivery_date: '',
    special_instructions: '',
    
    // Insurance & Documentation
    insurance_required: true,
    customs_documents: [],
    special_handling: []
  });

    const handleInputChange = useCallback((field, value) => {
    if (field.includes('.')) {
      const [parentField, childField] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parentField]: {
          ...prev[parentField],
          [childField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, []);

  const handleItemChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      if (field.includes('.')) {
        const [parentField, childField] = field.split('.');
        newItems[index][parentField][childField] = value;
      } else {
        newItems[index][field] = value;
      }
      return { ...prev, items: newItems };
    });
  }, []);

  const addItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          weight: '',
          dimensions: { length: '', width: '', height: '' },
          value: '',
          commodity_code: ''
        }
      ]
    }));
  }, []);

  const removeItem = useCallback((index) => {
    setFormData(prev => {
      if (prev.items.length > 1) {
        return {
          ...prev,
          items: prev.items.filter((_, i) => i !== index)
        };
      }
      return prev;
    });
  }, []);

  const handleSubmit = async (isDraft = false) => {
    try {
      setLoading(true);
      
      const { logisticsAPI } = await import('../../api-services/logistics');
      
      // Calculate total weight and volume
      const totalWeight = formData.items.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
      const totalVolume = formData.items.reduce((sum, item) => {
        const dims = item.dimensions;
        const volume = (dims.length || 0) * (dims.width || 0) * (dims.height || 0) / 1000000; // Convert to cubic meters
        return sum + volume;
      }, 0);
      
      const shipmentData = {
        title: `${formData.cargo_type} - ${formData.origin.city} to ${formData.destination.city}`,
        description: formData.description,
        cargo_type: formData.cargo_type,
        origin_address: `${formData.origin.address}, ${formData.origin.city}, ${formData.origin.country}`,
        destination_address: `${formData.destination.address}, ${formData.destination.city}, ${formData.destination.country}`,
        weight: totalWeight,
        volume: totalVolume,
        dimensions: {
          items: formData.items.map(item => item.dimensions)
        },
        special_requirements: formData.dangerous_goods ? 'Dangerous goods handling required' : '',
        pickup_date_requested: formData.pickup_date,
        delivery_date_requested: formData.requested_delivery_date,
        urgency: formData.priority,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        currency: formData.currency || 'USD',
        status: isDraft ? 'draft' : 'posted'
      };

      const response = await logisticsAPI.createRequest(shipmentData);
      toast.success(`Shipment ${isDraft ? 'saved as draft' : 'created'} successfully!`);
      navigate(`/platform/logistics/shipments/${response.data.id}`);
      
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.detail ||
        'Failed to create shipment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.cargo_type && formData.description;
      case 2:
        return (
          formData.origin.name && formData.origin.address && formData.origin.contact_name &&
          formData.destination.name && formData.destination.address && formData.destination.contact_name
        );
      case 3:
        return formData.items.every(item => item.description && item.weight && item.value);
      case 4:
        return formData.shipping_method && formData.pickup_date && formData.requested_delivery_date;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < totalSteps && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(webRoutes.logisticsShipments)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Shipment</h1>
                <p className="text-gray-600 mt-1">Schedule and manage your cargo shipment</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepIndicator()}

        <div className="bg-white rounded-xl shadow-sm border p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Shipment Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo Type *
                    </label>
                    <select
                      value={formData.cargo_type}
                      onChange={(e) => handleInputChange(null, 'cargo_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select cargo type</option>
                      <option value="drilling_equipment">Drilling Equipment</option>
                      <option value="safety_supplies">Safety Supplies</option>
                      <option value="technical_parts">Technical Parts</option>
                      <option value="fuel">Fuel</option>
                      <option value="maintenance_tools">Maintenance Tools</option>
                      <option value="personnel_transfer">Personnel Transfer</option>
                      <option value="food_supplies">Food Supplies</option>
                      <option value="chemical_supplies">Chemical Supplies</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange(null, 'priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange(null, 'description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide detailed description of the cargo including specifications, handling requirements, etc."
                    required
                  />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dangerous_goods"
                      checked={formData.dangerous_goods}
                      onChange={(e) => handleInputChange(null, 'dangerous_goods', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="dangerous_goods" className="ml-2 text-sm text-gray-900">
                      This shipment contains dangerous goods
                    </label>
                  </div>

                  {formData.dangerous_goods && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                        <p className="text-sm text-orange-700">
                          Dangerous goods require special handling and documentation. Additional fees may apply.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Origin & Destination */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-900">Pickup & Delivery Locations</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Origin */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-gray-900">Pickup Location</h4>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company/Facility Name *</label>
                    <input
                      type="text"
                      value={formData.origin.name}
                      onChange={(e) => handleInputChange('origin', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      value={formData.origin.address}
                      onChange={(e) => handleInputChange('origin', 'address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={formData.origin.city}
                        onChange={(e) => handleInputChange('origin', 'city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.origin.country}
                        onChange={(e) => handleInputChange('origin', 'country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                    <input
                      type="text"
                      value={formData.origin.contact_name}
                      onChange={(e) => handleInputChange('origin', 'contact_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.origin.contact_phone}
                        onChange={(e) => handleInputChange('origin', 'contact_phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.origin.contact_email}
                        onChange={(e) => handleInputChange('origin', 'contact_email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Destination */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <h4 className="font-medium text-gray-900">Delivery Location</h4>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company/Facility Name *</label>
                    <input
                      type="text"
                      value={formData.destination.name}
                      onChange={(e) => handleInputChange('destination', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      value={formData.destination.address}
                      onChange={(e) => handleInputChange('destination', 'address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={formData.destination.city}
                        onChange={(e) => handleInputChange('destination', 'city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.destination.country}
                        onChange={(e) => handleInputChange('destination', 'country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                    <input
                      type="text"
                      value={formData.destination.contact_name}
                      onChange={(e) => handleInputChange('destination', 'contact_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.destination.contact_phone}
                        onChange={(e) => handleInputChange('destination', 'contact_phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.destination.contact_email}
                        onChange={(e) => handleInputChange('destination', 'contact_email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Cargo Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Cargo Items</h3>
                <button
                  onClick={addItem}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              </div>

              <div className="space-y-6">
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                      {formData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Item Description *
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Weight (tons) *</label>
                        <input
                          type="number"
                          step="0.1"
                          value={item.weight}
                          onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (L x W x H in meters)</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Length"
                            value={item.dimensions.length}
                            onChange={(e) => handleItemChange(index, 'dimensions.length', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Width"
                            value={item.dimensions.width}
                            onChange={(e) => handleItemChange(index, 'dimensions.width', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Height"
                            value={item.dimensions.height}
                            onChange={(e) => handleItemChange(index, 'dimensions.height', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Value (USD) *</label>
                        <input
                          type="number"
                          value={item.value}
                          onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Commodity Code</label>
                        <input
                          type="text"
                          value={item.commodity_code}
                          onChange={(e) => handleItemChange(index, 'commodity_code', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="HS/HTS Code"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Shipping & Timeline */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Shipping Details & Timeline</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Method *
                  </label>
                  <select
                    value={formData.shipping_method}
                    onChange={(e) => handleInputChange(null, 'shipping_method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select shipping method</option>
                    <option value="ocean_freight">Ocean Freight</option>
                    <option value="air_freight">Air Freight</option>
                    <option value="road_transport">Road Transport</option>
                    <option value="rail_transport">Rail Transport</option>
                    <option value="multimodal">Multimodal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Carrier
                  </label>
                  <select
                    value={formData.preferred_carrier}
                    onChange={(e) => handleInputChange(null, 'preferred_carrier', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No preference</option>
                    <option value="global_logistics">Global Logistics Solutions</option>
                    <option value="ocean_transport">Ocean Transport Co</option>
                    <option value="sky_cargo">Sky Cargo</option>
                    <option value="fasttrack">FastTrack Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Pickup Date *
                  </label>
                  <input
                    type="date"
                    value={formData.pickup_date}
                    onChange={(e) => handleInputChange(null, 'pickup_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requested Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={formData.requested_delivery_date}
                    onChange={(e) => handleInputChange(null, 'requested_delivery_date', e.target.value)}
                    min={formData.pickup_date || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={formData.special_instructions}
                  onChange={(e) => handleInputChange(null, 'special_instructions', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special handling requirements, delivery instructions, or other notes..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="insurance_required"
                    checked={formData.insurance_required}
                    onChange={(e) => handleInputChange(null, 'insurance_required', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="insurance_required" className="ml-2 text-sm text-gray-900">
                    Cargo insurance required
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {currentStep === totalSteps ? (
                <>
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={loading || !validateStep(currentStep)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Create Shipment
                  </button>
                </>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsShipmentCreate;
