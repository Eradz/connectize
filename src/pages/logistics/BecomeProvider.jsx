import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Truck, Ship, Plane, Train, Package, 
  CheckCircle, ArrowRight, ArrowLeft, Building2,
  FileCheck, Globe, Award, AlertCircle, Plus, X,
  Shield, MapPin, Users, Warehouse
} from 'lucide-react';
import { logisticsAPI } from '../../api-services/logistics';
import { getSession } from '../../lib/session';
import { useAuth } from '../../context/userContext';
import { getMyActionableCompanies } from '../../api-services/representatives';
import { webRoutes } from '../../lib/webRoutes';

const SERVICE_TYPES = [
  { id: 'trucking', name: 'Trucking', icon: Truck, description: 'Road freight transport' },
  { id: 'marine', name: 'Marine Transport', icon: Ship, description: 'Ocean and sea freight' },
  { id: 'air', name: 'Air Transport', icon: Plane, description: 'Air cargo services' },
  { id: 'rail', name: 'Rail Transport', icon: Train, description: 'Railway freight' },
  { id: 'warehousing', name: 'Warehousing', icon: Package, description: 'Storage and distribution' },
  { id: 'freight_forwarding', name: 'Freight Forwarding', icon: Globe, description: 'End-to-end logistics' },
  { id: 'customs_brokerage', name: 'Customs Brokerage', icon: FileCheck, description: 'Import/export clearance' },
  { id: 'hazmat', name: 'Hazardous Materials', icon: AlertCircle, description: 'Specialized hazmat handling' },
];

const COVERAGE_TYPES = [
  { id: 'local', name: 'Local', description: 'City/metro area' },
  { id: 'regional', name: 'Regional', description: 'State/province' },
  { id: 'national', name: 'National', description: 'Country-wide' },
  { id: 'international', name: 'International', description: 'Multiple countries' },
  { id: 'global', name: 'Global', description: 'Worldwide' },
];

const CERTIFICATIONS = [
  'ISO 9001', 'ISO 14001', 'ISO 45001', 'HAZMAT Certified', 
  'C-TPAT', 'AEO', 'SmartWay Partner', 'Licensed Carrier',
  'Bonded Warehouse', 'GDP Certified', 'IATA Certified'
];

const getCompanyId = (company) => company?.id ?? company?.company_id ?? company?.company;
const getCompanyName = (company) => company?.company_name || company?.name || '';

const BecomeProvider = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState('');
  const [existingProvider, setExistingProvider] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  const [formData, setFormData] = useState({
    license_number: '',
    service_types: [],
    coverage_type: 'regional',
    service_regions: [],
    fleet_size: 0,
    warehouse_capacity: '',
    certifications: [],
    insurance_coverage: '',
  });

  const [newRegion, setNewRegion] = useState('');

  // Fetch companies the user can act on behalf of for logistics (owner + active rep with permission)
  const [userCompanies, setUserCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentUser?.id) return;
      setCompaniesLoading(true);
      try {
        const list = await getMyActionableCompanies('company_manage_logistics');
        if (!cancelled) setUserCompanies(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) setUserCompanies([]);
      } finally {
        if (!cancelled) setCompaniesLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentUser]);

  useEffect(() => {
    // Auto-select company if user has only one
    if (userCompanies.length === 1 && !selectedCompany) {
      setSelectedCompany(userCompanies[0]);
    }
  }, [userCompanies, selectedCompany]);

  useEffect(() => {
    checkExistingProvider(selectedCompany);
  }, [currentUser, selectedCompany, companiesLoading]);

  const checkExistingProvider = async (company) => {
    try {
      const session = getSession();
      
      // Session has { id, email, tokens } structure
      if (!session?.id) {
        setCheckingStatus(false);
        return;
      }
      if (companiesLoading) {
        return;
      }

      const companyId = getCompanyId(company);
      if (!companyId) {
        setExistingProvider(null);
        setCheckingStatus(false);
        return;
      }

      setCheckingStatus(true);
      try {
        const response = await logisticsAPI.getMyProviderProfile({ company: companyId });
        const provider = response?.provider || (response?.is_registered === false ? null : response);

        if (provider?.id) {
          setExistingProvider(provider);
        } else {
          setExistingProvider(null);
        }
      } catch (err) {
        if (err?.response?.status !== 404) {
          console.log('No existing provider found or API error:', err);
        }
        setExistingProvider(null);
      }
    } catch (err) {
      console.error('Error checking provider status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const toggleServiceType = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      service_types: prev.service_types.includes(serviceId)
        ? prev.service_types.filter(s => s !== serviceId)
        : [...prev.service_types, serviceId]
    }));
  };

  const toggleCertification = (cert) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const addRegion = () => {
    if (newRegion.trim() && !formData.service_regions.includes(newRegion.trim())) {
      setFormData(prev => ({
        ...prev,
        service_regions: [...prev.service_regions, newRegion.trim()]
      }));
      setNewRegion('');
    }
  };

  const removeRegion = (region) => {
    setFormData(prev => ({
      ...prev,
      service_regions: prev.service_regions.filter(r => r !== region)
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!selectedCompany) {
          setError('Please select a company to register');
          return false;
        }
        if (formData.service_types.length === 0) {
          setError('Please select at least one service type');
          return false;
        }
        break;
      case 2:
        if (!formData.coverage_type) {
          setError('Please select your coverage area');
          return false;
        }
        if (formData.service_regions.length === 0) {
          setError('Please add at least one service region');
          return false;
        }
        break;
      case 3:
        if (!formData.fleet_size || formData.fleet_size < 1) {
          setError('Please enter your fleet size');
          return false;
        }
        break;
      default:
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const session = getSession();
      console.log('BecomeProvider: Full session object:', session);
      
      // Session has { id, email, tokens } structure, not { user, tokens }
      if (!session?.id || !session?.tokens?.access) {
        setError('Please log in to continue.');
        setTimeout(() => {
          navigate('/login?redirect=/logistics/become-provider');
        }, 2000);
        setLoading(false);
        return;
      }

      // Validate company selection
      const companyId = getCompanyId(selectedCompany);
      if (!companyId) {
        setError('Please select a company to register');
        setLoading(false);
        return;
      }

      const companyName = getCompanyName(selectedCompany);
      if (!companyName) {
        setError('Selected company is missing a display name.');
        setLoading(false);
        return;
      }

      const payload = {
        company: companyId,
        company_name: companyName,
        license_number: formData.license_number || null,
        service_types: formData.service_types,
        coverage_type: formData.coverage_type,
        service_regions: formData.service_regions,
        fleet_size: parseInt(formData.fleet_size) || 1,
        warehouse_capacity: formData.warehouse_capacity ? parseFloat(formData.warehouse_capacity) : null,
        certifications: formData.certifications,
        insurance_coverage: formData.insurance_coverage ? parseFloat(formData.insurance_coverage) : 0,
        on_time_delivery_rate: 95,
        safety_rating: 4.5,
        is_active: true,
      };

      console.log('Creating provider with payload:', payload);
      const result = await logisticsAPI.createLogisticsProvider(payload);
      console.log('Provider created successfully:', result);
      
      if (result) {
        setCurrentStep(5);
      } else {
        // API returned null (usually means error was handled internally)
        setError('Registration failed. Please check your information and try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response data:', err.response?.data);
      
      // Handle different error formats from DRF
      let errorMessage = 'Failed to register. Please try again.';
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.user) {
          // Field-specific error for user
          errorMessage = Array.isArray(data.user) ? data.user[0] : data.user;
        } else if (data.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        } else {
          // Try to get first field error
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            const fieldError = data[firstKey];
            errorMessage = `${firstKey}: ${Array.isArray(fieldError) ? fieldError[0] : fieldError}`;
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking provider status...</p>
        </div>
      </div>
    );
  }

  if (existingProvider) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You are Already a Provider!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your company <strong className="text-gray-900 dark:text-white">{existingProvider.company_name}</strong> is registered as a logistics provider.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to={webRoutes.logisticsProviderDashboard}
              className="px-6 py-3 bg-gold text-white rounded-lg hover:bg-custom_yellow transition-colors font-medium"
            >
              Go to Provider Dashboard
            </Link>
            <Link
              to={webRoutes.logisticsRequests}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              View Shipment Requests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 5) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registration Complete!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Congratulations! You are now registered as a logistics provider. Start responding to shipment requests and grow your business.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to={webRoutes.logisticsProviderDashboard}
              className="px-6 py-3 bg-gold text-white rounded-lg hover:bg-custom_yellow transition-colors font-medium"
            >
              Go to Provider Dashboard
            </Link>
            <Link
              to={webRoutes.logisticsRequests}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Browse Shipment Requests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Become a Logistics Provider</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join our network of trusted logistics providers and connect with businesses looking for shipping solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-gold dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Access More Clients</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Connect with businesses actively looking for logistics services.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Build Trust</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Showcase your certifications and track record to win more contracts.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Expand Your Reach</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Get discovered by companies in your service regions.</p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/login?redirect=/logistics/become-provider"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-white rounded-lg hover:bg-custom_yellow transition-colors font-medium text-lg"
          >
            Sign In to Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            Do not have an account? <Link to="/signup" className="text-gold dark:text-blue-400 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    );
  }

  // Wait for companies to finish loading before deciding
  if (companiesLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your companies...</p>
        </div>
      </div>
    );
  }

  if (!selectedCompany && userCompanies.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Your Company Profile First</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            To register as a logistics provider, you need to have a company profile. This helps clients trust and verify your business.
          </p>
          <Link
            to="/company/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white rounded-lg hover:bg-custom_yellow transition-colors font-medium"
          >
            Create Company Profile
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, title: 'Services' },
    { num: 2, title: 'Coverage' },
    { num: 3, title: 'Fleet' },
    { num: 4, title: 'Credentials' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Register as Logistics Provider</h1>
        <div className="mt-4">
          <label htmlFor="company-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Company to Register
          </label>
          <select
            id="company-select"
            value={getCompanyId(selectedCompany) || ''}
            onChange={(e) => {
              const company = userCompanies.find(c => String(getCompanyId(c)) === e.target.value);
              setSelectedCompany(company || null);
            }}
            className="w-full max-w-md px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a company...</option>
            {userCompanies.map((company) => (
              <option key={getCompanyId(company)} value={getCompanyId(company)}>
                {getCompanyName(company)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        {steps.map((step, idx) => (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStep >= step.num 
                  ? 'bg-gold text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}>
                {currentStep > step.num ? <CheckCircle className="w-5 h-5" /> : step.num}
              </div>
              <span className={`hidden sm:block text-sm font-medium ${
                currentStep >= step.num ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded ${
                currentStep > step.num ? 'bg-gold' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">What services do you offer?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Select all that apply to your logistics operations.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SERVICE_TYPES.map(service => {
                const Icon = service.icon;
                const isSelected = formData.service_types.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleServiceType(service.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-gold bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-gold dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                    <div className={`font-medium text-sm ${isSelected ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                      {service.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{service.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Where do you operate?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Define your service coverage area.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Coverage Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {COVERAGE_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, coverage_type: type.id }))}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      formData.coverage_type === type.id
                        ? 'border-gold bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`font-medium text-sm ${formData.coverage_type === type.id ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                      {type.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Regions</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRegion())}
                  placeholder="e.g., Texas, Gulf Coast, Southeast US"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addRegion}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.service_regions.map(region => (
                  <span
                    key={region}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                  >
                    <MapPin className="w-3 h-3" />
                    {region}
                    <button
                      type="button"
                      onClick={() => removeRegion(region)}
                      className="ml-1 hover:text-gold dark:hover:text-blue-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fleet and Capacity</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Tell us about your operational capacity.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Truck className="w-4 h-4 inline mr-1" />
                  Fleet Size (vehicles)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.fleet_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, fleet_size: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Number of vehicles"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Warehouse className="w-4 h-4 inline mr-1" />
                  Warehouse Capacity (sq ft) - Optional
                </label>
                <input
                  type="number"
                  value={formData.warehouse_capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, warehouse_capacity: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 50000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Operating License Number - Optional
                </label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., MC-123456"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Credentials and Insurance</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Add your certifications and insurance coverage.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Award className="w-4 h-4 inline mr-1" />
                Certifications (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATIONS.map(cert => {
                  const isSelected = formData.certifications.includes(cert);
                  return (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCertification(cert)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {isSelected && <CheckCircle className="w-4 h-4 inline mr-1" />}
                      {cert}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Shield className="w-4 h-4 inline mr-1" />
                Insurance Coverage Amount ($)
              </label>
              <input
                type="number"
                value={formData.insurance_coverage}
                onChange={(e) => setFormData(prev => ({ ...prev, insurance_coverage: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1000000"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter your cargo/liability insurance coverage amount</p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2 bg-gold text-white rounded-lg hover:bg-custom_yellow transition-colors font-medium"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Registering...
                </>
              ) : (
                <>
                  Complete Registration
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BecomeProvider;
