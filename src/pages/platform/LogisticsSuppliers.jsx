import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Search,
  Plus,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsSupplierService } from '../../api-services/oilgas';
import { toast } from 'sonner';

const LogisticsSuppliers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deletingId, setDeletingId] = useState(null);

  // Generate comprehensive mock supplier data
  const generateMockSupplierData = () => {
    const categories = [
      'drilling_equipment', 'safety_supplies', 'maintenance_services', 
      'transportation', 'manufacturing', 'engineering_services',
      'construction', 'technology', 'chemical_supplies', 'fuel_lubricants'
    ];
    
    const statuses = ['active', 'pending', 'inactive', 'preferred', 'blacklisted'];
    const locations = [
      'Houston, TX, USA', 'Aberdeen, Scotland', 'Stavanger, Norway', 
      'Singapore', 'Dubai, UAE', 'Rio de Janeiro, Brazil', 
      'Calgary, AB, Canada', 'Perth, Australia', 'Lagos, Nigeria', 'London, UK'
    ];

    const suppliers = [
      // Major Oil & Gas Suppliers
      { name: 'Halliburton Company', category: 'drilling_equipment', website: 'halliburton.com', type: 'Multinational Corporation' },
      { name: 'Schlumberger Limited', category: 'engineering_services', website: 'slb.com', type: 'Technology Corporation' },
      { name: 'Baker Hughes', category: 'drilling_equipment', website: 'bakerhughes.com', type: 'Energy Technology Company' },
      { name: 'TechnipFMC', category: 'engineering_services', website: 'technipfmc.com', type: 'Engineering Services' },
      { name: 'NOV Inc.', category: 'drilling_equipment', website: 'nov.com', type: 'Equipment Manufacturer' },
      { name: 'Weatherford International', category: 'drilling_equipment', website: 'weatherford.com', type: 'Equipment & Services' },
      
      // Safety & PPE Suppliers
      { name: '3M Safety Solutions', category: 'safety_supplies', website: '3m.com', type: 'Safety Equipment' },
      { name: 'Honeywell Safety Products', category: 'safety_supplies', website: 'honeywell.com', type: 'Industrial Safety' },
      { name: 'MSA Safety Incorporated', category: 'safety_supplies', website: 'msasafety.com', type: 'Safety Equipment' },
      { name: 'DuPont Personal Protection', category: 'safety_supplies', website: 'dupont.com', type: 'Personal Protection' },
      
      // Transportation & Logistics
      { name: 'Global Marine Transport', category: 'transportation', website: 'globalmarine.com', type: 'Marine Logistics' },
      { name: 'Offshore Helicopter Services', category: 'transportation', website: 'ohs-aviation.com', type: 'Aviation Services' },
      { name: 'North Sea Shipping Co.', category: 'transportation', website: 'northseashipping.com', type: 'Marine Transport' },
      { name: 'Gulf Coast Logistics', category: 'transportation', website: 'gulfcoastlogistics.com', type: 'Integrated Logistics' },
      
      // Maintenance & Services
      { name: 'Oceaneering International', category: 'maintenance_services', website: 'oceaneering.com', type: 'Subsea Services' },
      { name: 'Subsea 7', category: 'maintenance_services', website: 'subsea7.com', type: 'Engineering & Construction' },
      { name: 'Aker Solutions', category: 'maintenance_services', website: 'akersolutions.com', type: 'Engineering Services' },
      { name: 'Petrofac Services', category: 'maintenance_services', website: 'petrofac.com', type: 'Engineering & Construction' },
      
      // Technology & Engineering
      { name: 'Emerson Automation Solutions', category: 'technology', website: 'emerson.com', type: 'Automation Technology' },
      { name: 'ABB Oil, Gas & Chemicals', category: 'technology', website: 'abb.com', type: 'Industrial Technology' },
      { name: 'Siemens Energy', category: 'technology', website: 'siemens-energy.com', type: 'Energy Technology' },
      { name: 'General Electric Oil & Gas', category: 'technology', website: 'ge.com', type: 'Industrial Equipment' },
      
      // Chemical Supplies
      { name: 'Clariant Oil Services', category: 'chemical_supplies', website: 'clariant.com', type: 'Specialty Chemicals' },
      { name: 'Champion Technologies', category: 'chemical_supplies', website: 'championtechnologies.com', type: 'Chemical Solutions' },
      { name: 'BASF Oilfield Solutions', category: 'chemical_supplies', website: 'basf.com', type: 'Chemical Manufacturing' },
      { name: 'Nalco Champion', category: 'chemical_supplies', website: 'nalcochampion.com', type: 'Water & Process Technologies' },
      
      // Manufacturing & Construction
      { name: 'Keppel Offshore & Marine', category: 'manufacturing', website: 'keppelom.com', type: 'Offshore Construction' },
      { name: 'Hyundai Heavy Industries', category: 'manufacturing', website: 'hhi.co.kr', type: 'Heavy Industries' },
      { name: 'Samsung Heavy Industries', category: 'manufacturing', website: 'shi.samsung.co.kr', type: 'Shipbuilding & Offshore' },
      { name: 'Saipem SpA', category: 'construction', website: 'saipem.com', type: 'Engineering & Construction' },
      
      // Fuel & Lubricants
      { name: 'ExxonMobil Lubricants', category: 'fuel_lubricants', website: 'mobil.com', type: 'Lubricants & Specialties' },
      { name: 'Shell Global Solutions', category: 'fuel_lubricants', website: 'shell.com', type: 'Energy & Chemicals' },
      { name: 'Chevron Phillips Chemical', category: 'fuel_lubricants', website: 'cpchem.com', type: 'Petrochemicals' },
      { name: 'TotalEnergies Lubricants', category: 'fuel_lubricants', website: 'totalenergies.com', type: 'Lubricants & Additives' }
    ];

    return suppliers.map((supplier, index) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const rating = parseFloat((3.5 + Math.random() * 1.5).toFixed(1)); // 3.5 to 5.0
      const totalOrders = Math.floor(Math.random() * 500) + 50;
      const totalValue = Math.floor(Math.random() * 10000000) + 500000;
      const lastOrderDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const onTimeDelivery = Math.floor(85 + Math.random() * 15); // 85-100%
      const qualityScore = Math.floor(80 + Math.random() * 20); // 80-100%
      const responseTime = Math.floor(1 + Math.random() * 48); // 1-48 hours
      
      return {
        id: `SUP-${String(index + 1).padStart(3, '0')}`,
        ...supplier,
        status,
        location,
        rating,
        total_orders: totalOrders,
        total_value: totalValue,
        last_order_date: lastOrderDate.toISOString(),
        on_time_delivery: onTimeDelivery,
        quality_score: qualityScore,
        response_time: responseTime,
        contact_name: [
          'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 
          'Robert Wilson', 'Lisa Anderson', 'David Miller', 'Jennifer Taylor'
        ][Math.floor(Math.random() * 8)],
        contact_email: supplier.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@' + supplier.website,
        contact_phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        certifications: [
          'ISO 9001', 'ISO 14001', 'OHSAS 18001', 'API Q1', 
          'ISO 45001', 'NACE Certified', 'DNV GL Approved'
        ].slice(0, Math.floor(Math.random() * 4) + 2),
        capabilities: [
          'Design & Engineering', 'Manufacturing', 'Installation', 'Maintenance',
          'Training', 'Technical Support', '24/7 Support', 'Global Delivery'
        ].slice(0, Math.floor(Math.random() * 5) + 3),
        risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        contract_type: ['framework', 'spot', 'long_term', 'preferred'][Math.floor(Math.random() * 4)],
        payment_terms: ['30 days', '45 days', '60 days', 'Net 30', 'COD'][Math.floor(Math.random() * 5)],
        established_year: 1950 + Math.floor(Math.random() * 70),
        employee_count: Math.floor(Math.random() * 50000) + 100
      };
    });
  };

  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      
      try {
        const data = await logisticsSupplierService.getSuppliers();
        // Normalize backend providers to the UI shape minimally
        const normalized = (Array.isArray(data) ? data : data?.results || []).map(p => ({
          id: p.id,
          name: p.company_name || p.name,
          category: (p.service_types && p.service_types[0]) || 'transportation',
          website: p.website,
          type: 'Logistics Provider',
          status: p.is_active ? 'active' : 'inactive',
          location: Array.isArray(p.service_regions) ? p.service_regions[0] : '—',
          rating: Number(p.safety_rating || 4.2),
          total_orders: p.active_shipments_count || Math.floor(Math.random() * 200) + 20,
          total_value: Math.floor(Math.random() * 5_000_000) + 250_000,
          last_order_date: new Date().toISOString(),
          on_time_delivery: Math.floor(Number(p.on_time_delivery_rate || 92)),
          quality_score: 90,
          response_time: 12,
          contact_name: p.user_name || '—',
          contact_email: null,
          contact_phone: null,
          certifications: p.certifications || [],
          capabilities: Object.keys(p.vehicle_types || {}),
          risk_level: 'low',
          contract_type: 'preferred',
          payment_terms: '30 days',
          established_year: 2000,
          employee_count: p.fleet_size || 0,
        }));
        setSuppliers(normalized);
      } catch (error) {
        // Use mock data for demo
        console.warn('API call failed, using mock data:', error.message);
        const mockData = generateMockSupplierData();
        setSuppliers(mockData);
      }
      
    } catch (error) {
      toast.error('Failed to load supplier data');
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort suppliers
  const filteredSuppliers = suppliers
    .filter(supplier => {
      if (searchTerm && !supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !supplier.type.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !supplier.location.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'all' && supplier.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'all' && supplier.status !== selectedStatus) {
        return false;
      }
      if (selectedRating !== 'all') {
        const rating = parseFloat(selectedRating);
        if (supplier.rating < rating) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Calculate supplier statistics
  const stats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter(s => s.status === 'active').length,
    preferredSuppliers: suppliers.filter(s => s.status === 'preferred').length,
    averageRating: suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1) : '0.0'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'preferred': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'blacklisted': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(webRoutes.logistics)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
                <p className="text-gray-600 mt-1">Manage your network of suppliers and vendors</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`${webRoutes.logistics}/suppliers/create`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeSuppliers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Preferred Suppliers</p>
                <p className="text-2xl font-bold text-blue-600">{stats.preferredSuppliers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}/5.0</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search suppliers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="drilling_equipment">Drilling Equipment</option>
                <option value="safety_supplies">Safety Supplies</option>
                <option value="maintenance_services">Maintenance Services</option>
                <option value="transportation">Transportation</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="engineering_services">Engineering Services</option>
                <option value="construction">Construction</option>
                <option value="technology">Technology</option>
                <option value="chemical_supplies">Chemical Supplies</option>
                <option value="fuel_lubricants">Fuel & Lubricants</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="preferred">Preferred</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="rating-desc">Rating High-Low</option>
                <option value="total_value-desc">Value High-Low</option>
                <option value="total_orders-desc">Orders High-Low</option>
                <option value="on_time_delivery-desc">On-time Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))
          ) : (
            filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{supplier.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{supplier.type}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {supplier.location}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                        {supplier.status.toUpperCase()}
                      </span>
                      <div className="flex items-center">
                        {renderStars(supplier.rating)}
                        <span className="ml-1 text-sm text-gray-600">{supplier.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{formatCategory(supplier.category)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Orders:</span>
                      <span className="font-medium">{supplier.total_orders.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Value:</span>
                      <span className="font-medium">{formatCurrency(supplier.total_value)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">On-time Delivery:</span>
                      <span className="font-medium">{supplier.on_time_delivery}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Risk Level:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(supplier.risk_level)}`}>
                        {supplier.risk_level.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {supplier.employee_count.toLocaleString()} employees
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Est. {supplier.established_year}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(webRoutes.logisticsSupplierDetail.replace(':id', supplier.id))}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(webRoutes.logisticsSupplierEdit.replace(':id', supplier.id))}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          disabled={deletingId === supplier.id}
                          onClick={() => {
                            if (deletingId === supplier.id) return;
                            const tId = toast('Delete this supplier?', {
                              description: 'This action cannot be undone.',
                              duration: 8000,
                              action: {
                                label: 'Confirm',
                                onClick: async () => {
                                  try {
                                    setDeletingId(supplier.id);
                                    await logisticsSupplierService.delete(supplier.id);
                                    toast.success('Supplier deleted');
                                    setSuppliers((prev) => prev.filter((x) => x.id !== supplier.id));
                                  } catch (e) {
                                    if (String(supplier.id).startsWith('SUP-')) {
                                      setSuppliers((prev) => prev.filter((x) => x.id !== supplier.id));
                                      toast.success('Removed from view');
                                    } else {
                                      toast.error('Failed to delete supplier');
                                    }
                                  } finally {
                                    setDeletingId(null);
                                    try { toast.dismiss?.(tId); } catch {}
                                  }
                                },
                              },
                            });
                          }}
                          className={`text-red-600 hover:text-red-800 text-sm font-medium ${deletingId === supplier.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="flex items-center space-x-1">
                        {supplier.website && (
                          <button
                            onClick={() => window.open(`https://${supplier.website}`, '_blank')}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => window.open(`mailto:${supplier.contact_email}`, '_blank')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`tel:${supplier.contact_phone}`, '_blank')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredSuppliers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No suppliers found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsSuppliers;
