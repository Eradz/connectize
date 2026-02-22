import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck,
  Package,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Eye,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Globe,
  Warehouse,
  Ship,
  User,
  Box,
  Scissors,

  FileText,
  Book
} from 'lucide-react';
import SEO from '../../components/SEO';
import { getSEOConfig } from '../../lib/seoConfig';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsAPI } from '../../api-services/logistics';
import InventoryDashboardWidget from '../../components/dashboard/InventoryDashboardWidget';
import { getSession } from '../../lib/session';
import Scroll from '../../components/Scroll';
import { DealIcon } from '../../icon/deal';
import { getCurrencySymbol } from '../../utils/currency';
import { useAuth } from '../../context/userContext';


const LogisticsHubDashboard = () => {
  const { user } = useAuth();
  const seoData = getSEOConfig("logisticsDashboard");
  // Check session for user privileges
    const session = getSession();
      const [searchQuery, setSearchQuery] = useState('');
    console.log('🔍 Session check in LogisticsDashboard:', {
      hasSession: !!session,
      user: session?.user,
      tokens: session?.tokens ? 'present' : 'missing'
    });
    
    const userIsStaff = (
      session?.user?.is_staff === true ||
      session?.user?.is_superuser === true
    );

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
      shipments: { total: 0, data: [] },
      inventory: { total: 0, data: [] },
      requests: { total: 0, data: [] },
      analytics: {
        totalShipments: 0,
        onTimeDelivery: 0,
        costSavings: 0,
        activeRoutes: 0
      }
    });
  
    const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

    // Early authentication check - redirect if not logged in
    useEffect(() => {
      const session = getSession();
      if (!session?.tokens?.access) {
        console.warn('❌ No authentication session found, redirecting to login');
        window.location.href = '/login';
        return;
      }
    }, []);
  
    useEffect(() => {
      loadDashboardData();
    }, []);
  
    useEffect(() => {
      if (!loading) {
        console.log('🔄 dashboardData updated (post-render readiness check):', dashboardData);
      }
    }, [dashboardData, loading]);
  
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Also check localStorage for any legacy tokens (for debugging)
        const accessToken = localStorage.getItem('access');
        const refreshToken = localStorage.getItem('refresh');
        
        if (!session?.tokens?.access) {
          console.error('❌ No valid authentication session found');
          throw new Error('Authentication required. Please log in.');
        }
        
        // Helper to follow pagination for a given initial payload and base path
        const fetchAllPages = async (initialPayload, baseUrl) => {
          // initialPayload may be either the already-parsed object or wrapped
          const first = (initialPayload?.data && initialPayload.data.results) ? initialPayload.data : initialPayload;
          if (!first || first.next === undefined) return first; // Not paginated
          let aggregated = {
            count: first.count ?? (first.results ? first.results.length : 0),
            results: [...(first.results || [])],
            next: first.next
          };
          // Cap pages to avoid runaway (e.g., max 5 pages / 250 records typical 50 per page assumption)
          let pageFetches = 0;
          while (aggregated.next && aggregated.results.length < aggregated.count && pageFetches < 5) {
            try {
              const nextUrl = aggregated.next;
              console.log('➡️ Fetching paginated page:', nextUrl);
              // Use api helper directly via fetch since logisticsAPI currently only exposes root endpoints
              const rel = nextUrl.replace(/^https?:\/\/[^/]+/, '');
              const pageResp = await logisticsAPI.getRequests({ page: new URL(nextUrl).searchParams.get('page') });
              if (pageResp?.results) {
                aggregated.results.push(...pageResp.results);
                aggregated.next = pageResp.next;
              } else {
                break;
              }
            } catch (e) {
              console.warn('⚠️ Failed to fetch additional page:', e);
              break;
            }
            pageFetches++;
          }
          return aggregated;
        };
  
        // Determine if we should request global scope based on component-scope userIsStaff
        const scopeParams = userIsStaff ? { scope: 'all' } : {};
        
        // Make API calls with individual error handling
        let shipmentsResponse, inventoryResponse, requestsResponse;
        
        try {
          console.log('🚛 Fetching shipments with URL: /api/v1/logistics/shipments/ and params:', scopeParams);
          shipmentsResponse = await logisticsAPI.getShipments(scopeParams);
        } catch (error) {
          console.error('❌ Shipments API error:', error);
          console.error('❌ Shipments error details:', error.response?.data);
          shipmentsResponse = { results: [], count: 0 };
        }
        
        try {
          inventoryResponse = await logisticsAPI.getInventoryItems(scopeParams);
        } catch (error) {
          console.error('❌ Inventory API error:', error);
          console.error('❌ Inventory error details:', error.response?.data);
          inventoryResponse = { results: [], count: 0 };
        }
        
        try {
          console.log('📋 Fetching requests with URL: /api/v1/logistics/requests/ and params:', scopeParams);
          requestsResponse = await logisticsAPI.getRequests(scopeParams);
          console.log('✅ Requests response type:', typeof requestsResponse);
          console.log('✅ Requests response keys:', Object.keys(requestsResponse || {}));
          console.log('✅ Requests full response:', requestsResponse);
        } catch (error) {
          console.error('❌ Requests API error:', error);
          console.error('❌ Requests error details:', error.response?.data);
          requestsResponse = { results: [], count: 0 };
        }

  
        // Normalize possible response shapes (either already the payload or wrapped in {data})
        const normalize = (resp) => {
          const payload = resp?.data && typeof resp.data === 'object' && (resp.data.results || resp.data.count !== undefined) ? resp.data : resp;
          return {
            list: payload?.results || (Array.isArray(payload) ? payload : []),
            count: payload?.count || (Array.isArray(payload?.results) ? payload.results.length : (Array.isArray(payload) ? payload.length : 0))
          };
        };
        const shipmentsNorm = normalize(shipmentsResponse);
        const inventoryNorm = normalize(inventoryResponse);
        let requestsNorm = normalize(requestsResponse);
  
        // If requests are paginated and we have more than one page, pull additional pages
        if (requestsNorm.count > requestsNorm.list.length && requestsResponse.next) {
          console.log('🔁 Expanding paginated requests to gather more records...');
          const full = await fetchAllPages(requestsResponse, '/api/v1/logistics/requests/');
          requestsNorm = {
            list: full.results,
            count: full.count
          };
          console.log('📦 Aggregated requests records:', { gathered: requestsNorm.list.length, total: requestsNorm.count });
        }
  
        const shipments = shipmentsNorm.list;
        const inventory = inventoryNorm.list;
        const requests = requestsNorm.list;
        const totalShipmentsCount = shipmentsNorm.count;
        const totalInventoryCount = inventoryNorm.count;
        const totalRequestsCount = requestsNorm.count;
  
  
        // Calculate analytics from real data with corrected field mappings
        const totalShipments = totalShipmentsCount;
        const deliveredShipments = shipments.filter(s => s.status === 'delivered');
        const onTimeDelivery = deliveredShipments.length > 0 
          ? ((deliveredShipments.length / shipments.length) * 100).toFixed(1)
          : 0;
        
        // Use corrected field mapping: budget_max from request_details
        const totalValue = shipments.reduce((sum, shipment) => {
          const budgetMax = shipment.request_details?.budget_max || 0;
          return sum + parseFloat(budgetMax);
        }, 0);
        const costSavings = totalValue * 0.15; // Estimated 15% savings
        const activeRoutes = shipments.filter(s => ['in_transit', 'picked_up', 'preparing'].includes(s.status)).length;
        
        const monthlyGrowth = 8.5; // This would come from analytics service
  
    const newData = {
          shipments: {
            total: totalShipmentsCount,
            data: shipments
          },
          inventory: {
            total: totalInventoryCount,
            data: inventory
          },
          requests: {
            total: totalRequestsCount,
            data: requests
          },
          analytics: {
            totalShipments: totalShipmentsCount,
            onTimeDelivery: parseFloat(onTimeDelivery),
            costSavings,
            activeRoutes,
            monthlyGrowth: 8.5, // This would come from analytics service
            totalValue
          }
    };
    console.log('🧩 Setting dashboardData state with:', newData);
    setDashboardData(newData);
      } catch (error) {
        console.error('❌ Failed to load logistics data:', error);
        console.error('🔍 Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        // Check if it's an authentication error
        if (error.response?.status === 401 || error.message?.includes('Authentication required')) {
          console.log('🔐 Authentication error detected - user needs to login');
          console.log('🔑 Current tokens:', {
            access: localStorage.getItem('access') ? 'present' : 'missing',
            refresh: localStorage.getItem('refresh') ? 'present' : 'missing'
          });
          // The makeApiRequest will already redirect to login, but we can add additional handling here
          return; // Don't set empty data if redirecting to login
        }
        
        // Initialize with empty data when API calls fail
        setDashboardData({
          shipments: { total: 0, data: [] },
          inventory: { total: 0, data: [] },
          requests: { total: 0, data: [] },
          analytics: {
            totalShipments: 0,
            onTimeDelivery: 0,
            costSavings: 0,
            activeRoutes: 0,
            monthlyGrowth: 0,
            totalValue: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

  
  
    const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'awarded':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'delivered':
        return 'bg-red-50 text-red-600 border border-red-200';
      case 'quoted':
        return 'bg-cyan-50 text-cyan-600 border border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getRequestIcon = (index) => {
    const icons = [CheckCircle, Ship, Truck, Box];
    const Icon = icons[index % icons.length];
    return <Icon className="w-5 h-5 text-gray-500" />;
  };

  // Filter and search functions
  const filterShipments = (shipments) => {
    let filtered = shipments.filter((shipment) => {
      const matchesSearch = 
        shipment.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.request_details?.origin_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.request_details?.destination_address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Apply sorting
    if (sortBy === 'budget_high') {
      filtered.sort((a, b) => (b.request_details?.budget_max || 0) - (a.request_details?.budget_max || 0));
    } else if (sortBy === 'budget_low') {
      filtered.sort((a, b) => (a.request_details?.budget_max || 0) - (b.request_details?.budget_max || 0));
    }

    return filtered;
  };

  const filterRequests = (requests) => {
    return requests.filter((request) => {
      const matchesSearch = 
        request.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.origin_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.destination_address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filterInventory = (inventory) => {
    return inventory.filter((item) => {
      // Search filter
      const matchesSearch = 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      let matchesStatus = true;
      if (filterStatus !== 'all') {
        const reorderPoint = item.reorder_point || item.minimum_stock || 0;
        const currentStock = item.current_stock || 0;
        
        if (filterStatus === 'in_stock') {
          matchesStatus = currentStock > reorderPoint;
        } else if (filterStatus === 'low_stock') {
          matchesStatus = currentStock <= reorderPoint && currentStock > 0;
        } else if (filterStatus === 'out_of_stock') {
          matchesStatus = currentStock === 0;
        }
      }
      
      return matchesSearch && matchesStatus;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
      />
      {/* Header */}
     <div className="lg:bg-white border-b">
  <div className="max-w-7xl mx-auto px-6 py-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Logistic Hub</h1>
        <p className="text-gray-500 mt-1">Global Supply Chain And Shipment Management</p>
      </div>
      <button
        onClick={loadDashboardData}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Refresh</span>
      </button>
    </div>
  </div>
</div>

      <div className="max-w-7xl mx-auto py-8">
       {/* Quick Action Cards - Mobile Optimized */}
<div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
  <Link to={webRoutes.logisticsShipmentCreate} className="bg-white p-4 sm:p-6 rounded-xl border hover:shadow-md transition-shadow group">
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-yellow-50 transition-colors">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-yellow-600" />
      </div>
      <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Create Shipment</h3>
      <p className="text-xs text-gray-500 leading-tight">Schedule New Cargo Shipment</p>
    </div>
  </Link>

  <Link to={webRoutes.logisticsInventory} className="bg-white p-4 sm:p-6 rounded-xl border hover:shadow-md transition-shadow group">
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-yellow-50 transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:text-yellow-600 text-gray-600 sm:w-6 sm:h-6">
          <path d="M8 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H16M12 3V11M12 11L15 8M12 11L9 8M4 13H6.58579C6.851 13 7.10536 13.1054 7.29289 13.2929L9.70711 15.7071C9.89464 15.8946 10.149 16 10.4142 16H13.5858C13.851 16 14.1054 15.8946 14.2929 15.7071L16.7071 13.2929C16.8946 13.1054 17.149 13 17.4142 13H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Manage Inventory</h3>
      <p className="text-xs text-gray-500 leading-tight">Update Stock Levels</p>
    </div>
  </Link>

  <Link to={webRoutes.logisticsTracking} className="bg-white p-4 sm:p-6 rounded-xl border hover:shadow-md transition-shadow group">
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-yellow-50 transition-colors">
        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-yellow-600" />
      </div>
      <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Track Shipment</h3>
      <p className="text-xs text-gray-500 leading-tight">Real-Time Location Tracking</p>
    </div>
  </Link>

  <Link to={webRoutes.logisticsRequests} className="bg-white p-4 sm:p-6 rounded-xl border hover:shadow-md transition-shadow group">
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-yellow-50 transition-colors">
        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-yellow-600" />
      </div>
      <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Manage Request</h3>
      <p className="text-xs text-gray-500 leading-tight">Manage Shipping Requests</p>
    </div>
  </Link>

  {/* Become A Provider - Full Width on Mobile */}
<Link to={webRoutes.logisticsBecomeProvider} className="bg-white p-4 sm:p-6 rounded-xl border hover:shadow-md transition-shadow group hidden md:block">
  <div className="flex flex-col items-center text-center">
    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-yellow-50 transition-colors">
      <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-yellow-600" />
    </div>
    <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Become A Provider</h3>
    <p className="text-xs text-gray-500 leading-tight">Offer Logistics Services</p>
  </div>
</Link>
</div>

{/* Become A Provider - Full Width on Mobile */}
<Link to={webRoutes.logisticsBecomeProvider} className="flex lg:hidden flex-col items-center text-center w-full mb-8 bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-yellow-50 transition-colors">
      <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-yellow-600" />
    </div>
    <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Become A Provider</h3>
    <p className="text-xs text-gray-500 leading-tight">Offer Logistics Services</p>
</Link>

        {/* Tab Navigation */}
        <div className="bg-white rounded-t-xl border border-b-0">
          <Scroll>
          <nav className="flex space-x-8 px-6 6 min-w-min">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'shipments', label: 'Shipments', icon: Ship },
              { key: 'requests', label: 'Shipments Request', icon: FileText },
              { key: 'inventory', label: 'Inventory', icon: Package },
              { key: 'tracking', label: 'Live Tracking', icon: MapPin }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-yellow-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          </Scroll>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-xl border p-6">
          {activeTab === 'overview' && (
            <>
              {/* Metrics Cards */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white flex items-center flex-col p-6 rounded-xl border">
                <div className="flex justify-center items-center text-center mb-4">
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="44" height="44" rx="10" fill="#FFF1C6"/>
                    <g clipPath="url(#clip0_1655_7195)">
                      <path d="M33 30C32.7348 30 32.4804 30.1054 32.2929 30.2929C32.1054 30.4804 32 30.7348 32 31C32 31.344 31.318 32 30.25 32C29.95 32.0105 29.6514 31.9542 29.3759 31.835C29.1003 31.7158 28.8548 31.5368 28.657 31.311C28.6961 31.2472 28.7388 31.1858 28.785 31.127C30.4158 29.4167 31.5126 27.268 31.941 24.944C32.0678 24.2448 31.9423 23.5233 31.5869 22.9079C31.2314 22.2926 30.6691 21.8234 30 21.584V19C30 17.9391 29.5786 16.9217 28.8284 16.1716C28.0783 15.4214 27.0609 15 26 15V14C26 12.9391 25.5786 11.9217 24.8284 11.1716C24.0783 10.4214 23.0609 10 22 10C20.9391 10 19.9217 10.4214 19.1716 11.1716C18.4214 11.9217 18 12.9391 18 14V15C16.9391 15 15.9217 15.4214 15.1716 16.1716C14.4214 16.9217 14 17.9391 14 19V21.571C13.3226 21.805 12.7513 22.2738 12.3896 22.8925C12.0279 23.5112 11.8996 24.2389 12.028 24.944C12.4672 27.2708 13.5746 29.4193 15.215 31.127C15.263 31.1873 15.3074 31.2505 15.348 31.316C15.15 31.5426 14.9036 31.7218 14.627 31.8402C14.3503 31.9586 14.0506 32.0132 13.75 32C12.661 32 12 31.306 12 31C12 30.7348 11.8946 30.4804 11.7071 30.2929C11.5196 30.1054 11.2652 30 11 30C10.7348 30 10.4804 30.1054 10.2929 30.2929C10.1054 30.4804 10 30.7348 10 31C10 32.626 11.718 34 13.75 34C14.7612 34.0091 15.7419 33.6542 16.513 33C17.2821 33.6423 18.2516 33.9955 19.2536 33.9984C20.2556 34.0014 21.2272 33.6538 22 33.016C22.7756 33.6532 23.7491 34.0002 24.7529 33.9972C25.7567 33.9943 26.7281 33.6417 27.5 33C28.2665 33.6507 29.2406 34.0054 30.246 34C32.282 34 34 32.626 34 31C34 30.7348 33.8946 30.4804 33.7071 30.2929C33.5196 30.1054 33.2652 30 33 30ZM20 14C20 13.4696 20.2107 12.9609 20.5858 12.5858C20.9609 12.2107 21.4696 12 22 12C22.5304 12 23.0391 12.2107 23.4142 12.5858C23.7893 12.9609 24 13.4696 24 14V15H20V14ZM18 17H26C26.5304 17 27.0391 17.2107 27.4142 17.5858C27.7893 17.9609 28 18.4696 28 19V20.92L22.948 19.262C22.3339 19.06 21.6711 19.06 21.057 19.262L16 20.913V19C16 18.4696 16.2107 17.9609 16.5858 17.5858C16.9609 17.2107 17.4696 17 18 17ZM19.25 32C18.9158 32.0183 18.5825 31.9497 18.2826 31.8009C17.9828 31.6521 17.7266 31.4282 17.539 31.151C17.3307 30.6517 17.0445 30.1886 16.691 29.779C15.3124 28.3517 14.3776 26.5551 14 24.607C13.9538 24.3674 13.9953 24.1191 14.1168 23.9075C14.2383 23.6959 14.4318 23.5349 14.662 23.454L21 21.383V31C21 31.344 20.318 32 19.25 32ZM24.75 32C23.661 32 23 31.306 23 31V21.384L29.305 23.453C29.536 23.5338 29.7303 23.6948 29.8526 23.9068C29.9748 24.1188 30.0168 24.3676 29.971 24.608C29.6043 26.5535 28.6794 28.3502 27.309 29.779C26.9533 30.1892 26.6668 30.6546 26.461 31.157C26.2733 31.4338 26.0169 31.657 25.717 31.8048C25.417 31.9526 25.0838 32.0198 24.75 32Z" fill="#374957"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_1655_7195">
                        <rect width="24" height="24" fill="white" transform="translate(10 10)"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.analytics.totalShipments}</p>
                <p className="text-sm text-gray-600 mb-2">Total Shipment</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{dashboardData.analytics.monthlyGrowth}% This Month
                </p>
              </div>

              <div className="bg-white flex items-center flex-col p-6 rounded-xl border">
              <div className="flex justify-center items-center text-center mb-4">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="44" height="44" rx="10" fill="#FFF1C6"/>
                  <g clipPath="url(#clip0_1655_7204)">
                    <path d="M29 10H15C13.6744 10.0016 12.4036 10.5289 11.4662 11.4662C10.5289 12.4036 10.0016 13.6744 10 15L10 29C10.0016 30.3256 10.5289 31.5964 11.4662 32.5338C12.4036 33.4711 13.6744 33.9984 15 34H29C30.3256 33.9984 31.5964 33.4711 32.5338 32.5338C33.4711 31.5964 33.9984 30.3256 34 29V15C33.9984 13.6744 33.4711 12.4036 32.5338 11.4662C31.5964 10.5289 30.3256 10.0016 29 10V10ZM32 29C32 29.7956 31.6839 30.5587 31.1213 31.1213C30.5587 31.6839 29.7956 32 29 32H15C14.2044 32 13.4413 31.6839 12.8787 31.1213C12.3161 30.5587 12 29.7956 12 29V15C12 14.2044 12.3161 13.4413 12.8787 12.8787C13.4413 12.3161 14.2044 12 15 12H29C29.7956 12 30.5587 12.3161 31.1213 12.8787C31.6839 13.4413 32 14.2044 32 15V29Z" fill="#374957"/>
                    <path d="M19.3328 25.9198L15.4138 22.0008C15.2263 21.8133 14.972 21.708 14.7068 21.708C14.4417 21.708 14.1873 21.8133 13.9998 22.0008C13.8123 22.1883 13.707 22.4426 13.707 22.7078C13.707 22.9729 13.8123 23.2273 13.9998 23.4148L17.9188 27.3338C18.1045 27.5196 18.3251 27.667 18.5678 27.7675C18.8105 27.8681 19.0706 27.9198 19.3333 27.9198C19.596 27.9198 19.8562 27.8681 20.0989 27.7675C20.3416 27.667 20.5621 27.5196 20.7478 27.3338L29.9998 18.0818C30.1873 17.8943 30.2926 17.6399 30.2926 17.3748C30.2926 17.1096 30.1873 16.8553 29.9998 16.6678C29.8123 16.4803 29.558 16.375 29.2928 16.375C29.0277 16.375 28.7733 16.4803 28.5858 16.6678L19.3328 25.9198Z" fill="#374957"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_1655_7204">
                      <rect width="24" height="24" fill="white" transform="translate(10 10)"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">+{dashboardData.analytics.onTimeDelivery}%</p>
              <p className="text-sm text-gray-600 mb-2">On Time Delivery</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Above Target
              </p>
            </div>
                               
                   <div className="bg-white flex items-center flex-col p-6 rounded-xl border">
                  <div className="flex justify-center items-center text-center mb-4">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40" height="40" rx="10" fill="#FFF1C6"/>
                      <g clipPath="url(#clip0_1655_7213)">
                        <path d="M25.8338 10H21.6671C21.4461 10 21.2342 10.0878 21.0779 10.2441C20.9216 10.4004 20.8338 10.6123 20.8338 10.8333C20.8338 11.0543 20.9216 11.2663 21.0779 11.4226C21.2342 11.5789 21.4461 11.6667 21.6671 11.6667H25.8338C26.205 11.6681 26.5711 11.7536 26.9046 11.9167L10.2446 28.5775C10.165 28.6544 10.1016 28.7463 10.0579 28.848C10.0142 28.9497 9.99123 29.059 9.99027 29.1697C9.9893 29.2803 10.0104 29.39 10.0523 29.4925C10.0942 29.5949 10.1561 29.6879 10.2343 29.7662C10.3126 29.8444 10.4056 29.9063 10.508 29.9482C10.6104 29.9901 10.7202 30.0112 10.8308 30.0102C10.9415 30.0092 11.0508 29.9863 11.1525 29.9426C11.2541 29.8989 11.3461 29.8354 11.423 29.7558L28.0838 13.0958C28.2469 13.4293 28.3324 13.7954 28.3338 14.1667V18.3333C28.3338 18.5543 28.4216 18.7663 28.5779 18.9226C28.7342 19.0789 28.9461 19.1667 29.1671 19.1667C29.3882 19.1667 29.6001 19.0789 29.7564 18.9226C29.9127 18.7663 30.0005 18.5543 30.0005 18.3333V14.1667C29.9992 13.062 29.5597 12.003 28.7786 11.2218C27.9975 10.4407 26.9385 10.0013 25.8338 10V10Z" fill="#374957"/>
                        <path d="M15.0003 18.3327C15.6596 18.3327 16.3041 18.1372 16.8522 17.7709C17.4004 17.4046 17.8276 16.884 18.0799 16.275C18.3322 15.6659 18.3982 14.9957 18.2696 14.349C18.141 13.7024 17.8235 13.1085 17.3573 12.6423C16.8912 12.1762 16.2972 11.8587 15.6506 11.7301C15.004 11.6014 14.3338 11.6675 13.7247 11.9198C13.1156 12.172 12.595 12.5993 12.2288 13.1474C11.8625 13.6956 11.667 14.3401 11.667 14.9994C11.667 15.8834 12.0182 16.7313 12.6433 17.3564C13.2684 17.9815 14.1163 18.3327 15.0003 18.3327ZM15.0003 13.3327C15.33 13.3327 15.6522 13.4304 15.9263 13.6136C16.2004 13.7967 16.414 14.057 16.5401 14.3615C16.6663 14.6661 16.6993 15.0012 16.635 15.3245C16.5707 15.6478 16.4119 15.9448 16.1788 16.1779C15.9457 16.4109 15.6488 16.5697 15.3255 16.634C15.0022 16.6983 14.6671 16.6653 14.3625 16.5392C14.058 16.413 13.7977 16.1994 13.6145 15.9253C13.4314 15.6512 13.3337 15.329 13.3337 14.9994C13.3337 14.5573 13.5093 14.1334 13.8218 13.8208C14.1344 13.5083 14.5583 13.3327 15.0003 13.3327Z" fill="#374957"/>
                        <path d="M25.0003 21.666C24.3411 21.666 23.6966 21.8615 23.1484 22.2278C22.6003 22.5941 22.173 23.1147 21.9207 23.7237C21.6684 24.3328 21.6024 25.003 21.731 25.6497C21.8597 26.2963 22.1771 26.8902 22.6433 27.3564C23.1095 27.8225 23.7034 28.14 24.35 28.2686C24.9966 28.3973 25.6669 28.3312 26.2759 28.0789C26.885 27.8267 27.4056 27.3994 27.7719 26.8512C28.1382 26.3031 28.3337 25.6586 28.3337 24.9993C28.3337 24.1153 27.9825 23.2674 27.3573 22.6423C26.7322 22.0172 25.8844 21.666 25.0003 21.666ZM25.0003 26.666C24.6707 26.666 24.3485 26.5683 24.0744 26.3851C23.8003 26.202 23.5867 25.9417 23.4605 25.6372C23.3344 25.3326 23.3014 24.9975 23.3657 24.6742C23.43 24.3509 23.5887 24.0539 23.8218 23.8208C24.0549 23.5878 24.3519 23.429 24.6752 23.3647C24.9985 23.3004 25.3336 23.3334 25.6381 23.4595C25.9427 23.5857 26.203 23.7993 26.3861 24.0734C26.5692 24.3475 26.667 24.6697 26.667 24.9993C26.667 25.4414 26.4914 25.8653 26.1788 26.1779C25.8663 26.4904 25.4424 26.666 25.0003 26.666Z" fill="#374957"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_1655_7213">
                          <rect width="20" height="20" fill="white" transform="translate(10 10)"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.analytics.costSavings.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mb-2">Cost Savings</p>
                  <p className="text-xs" style={{ color: '#158AFF' }}>YTD Savings</p>
                  </div>

                <div className="bg-white flex items-center flex-col p-6 rounded-xl border">
                  <div className="flex justify-center items-center text-center mb-4">
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="44" height="44" rx="10" fill="#FFF1C6"/>
                      <g clipPath="url(#clip0_1655_7220)">
                        <path d="M22 16C21.2089 16 20.4355 16.2346 19.7777 16.6741C19.1199 17.1136 18.6072 17.7384 18.3045 18.4693C18.0017 19.2002 17.9225 20.0044 18.0769 20.7804C18.2312 21.5563 18.6122 22.269 19.1716 22.8284C19.731 23.3878 20.4437 23.7688 21.2196 23.9231C21.9956 24.0775 22.7998 23.9983 23.5307 23.6955C24.2616 23.3928 24.8864 22.8801 25.3259 22.2223C25.7654 21.5645 26 20.7911 26 20C26 18.9391 25.5786 17.9217 24.8284 17.1716C24.0783 16.4214 23.0609 16 22 16ZM22 22C21.6044 22 21.2178 21.8827 20.8889 21.6629C20.56 21.4432 20.3036 21.1308 20.1522 20.7654C20.0009 20.3999 19.9613 19.9978 20.0384 19.6098C20.1156 19.2219 20.3061 18.8655 20.5858 18.5858C20.8655 18.3061 21.2219 18.1156 21.6098 18.0384C21.9978 17.9613 22.3999 18.0009 22.7654 18.1522C23.1308 18.3036 23.4432 18.56 23.6629 18.8889C23.8827 19.2178 24 19.6044 24 20C24 20.5304 23.7893 21.0391 23.4142 21.4142C23.0391 21.7893 22.5304 22 22 22Z" fill="#374957"/>
                        <path d="M22.0003 34.0001C21.1583 34.0044 20.3274 33.8069 19.5774 33.4241C18.8273 33.0413 18.1799 32.4844 17.6893 31.8C13.8783 26.543 11.9453 22.591 11.9453 20.053C11.9453 17.3863 13.0047 14.8288 14.8904 12.9431C16.776 11.0574 19.3336 9.99805 22.0003 9.99805C24.6671 9.99805 27.2246 11.0574 29.1103 12.9431C30.9959 14.8288 32.0553 17.3863 32.0553 20.053C32.0553 22.591 30.1223 26.543 26.3113 31.8C25.8207 32.4844 25.1733 33.0413 24.4232 33.4241C23.6732 33.8069 22.8424 34.0044 22.0003 34.0001ZM22.0003 12.181C19.9127 12.1834 17.9113 13.0138 16.4352 14.4899C14.959 15.9661 14.1287 17.9675 14.1263 20.055C14.1263 22.065 16.0193 25.782 19.4553 30.521C19.747 30.9228 20.1297 31.2498 20.572 31.4753C21.0144 31.7008 21.5038 31.8183 22.0003 31.8183C22.4968 31.8183 22.9863 31.7008 23.4286 31.4753C23.8709 31.2498 24.2536 30.9228 24.5453 30.521C27.9813 25.782 29.8743 22.065 29.8743 20.055C29.8719 17.9675 29.0416 15.9661 27.5654 14.4899C26.0893 13.0138 24.0879 12.1834 22.0003 12.181Z" fill="#374957"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_1655_7220">
                          <rect width="24" height="24" fill="white" transform="translate(10 10)"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.analytics.activeRoutes}</p>
                  <p className="text-sm text-gray-600 mb-2">Active Routes</p>
                  <p className="text-xs text-green-600">Global Network</p>
                </div>
              </div>

              {/* Search and Filter */}
              {/* <div className="flex flex-col sm:flex-row items-center justify-center mb-6 gap-4">
                <div className="relative flex-1 max-w-2xl w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div> */}

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="order-2 md:order-1 lg:col-span-2 space-y-6">
                  {/* Recent Shipments */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Shipments</h3>
                      <button 
                      onClick={() => setActiveTab('shipments')}
                       className="text-sm text-gray-600 hover:text-gray-900"
                      >
                       See All
                        </button>
                    </div>
                    <div className="space-y-3">
                      {dashboardData.shipments.data.length > 0 ? (
                        dashboardData.shipments.data.slice(0, 3).map((shipment) => (
                          <div key={shipment.id} className="bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="44" height="44" rx="22" fill="#F8F9FA"/>
                                  <g clipPath="url(#clip0_1655_7259)">
                                    <path d="M32.3186 14.431L18.4996 28.249C18.4067 28.3423 18.2963 28.4163 18.1747 28.4668C18.0531 28.5173 17.9228 28.5433 17.7911 28.5433C17.6595 28.5433 17.5291 28.5173 17.4075 28.4668C17.286 28.4163 17.1755 28.3423 17.0826 28.249L11.7386 22.9C11.6457 22.8067 11.5353 22.7327 11.4137 22.6822C11.2921 22.6317 11.1618 22.6057 11.0301 22.6057C10.8985 22.6057 10.7681 22.6317 10.6465 22.6822C10.525 22.7327 10.4145 22.8067 10.3216 22.9C10.2284 22.9929 10.1543 23.1033 10.1038 23.2249C10.0533 23.3465 10.0273 23.4769 10.0273 23.6085C10.0273 23.7402 10.0533 23.8705 10.1038 23.9921C10.1543 24.1137 10.2284 24.2241 10.3216 24.317L15.6676 29.662C16.2316 30.2249 16.9958 30.5411 17.7926 30.5411C18.5894 30.5411 19.3537 30.2249 19.9176 29.662L33.7356 15.847C33.8288 15.7541 33.9026 15.6438 33.9531 15.5223C34.0035 15.4008 34.0294 15.2705 34.0294 15.139C34.0294 15.0075 34.0035 14.8772 33.9531 14.7557C33.9026 14.6343 33.8288 14.5239 33.7356 14.431C33.6427 14.3377 33.5323 14.2637 33.4107 14.2132C33.2891 14.1627 33.1588 14.1367 33.0271 14.1367C32.8955 14.1367 32.7651 14.1627 32.6435 14.2132C32.522 14.2637 32.4115 14.3377 32.3186 14.431Z" fill="#374957"/>
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_1655_7259">
                                      <rect width="24" height="24" fill="white" transform="translate(10 10)"/>
                                    </clipPath>
                                  </defs>
                                </svg>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-semibold text-gray-900">{shipment.tracking_number}</span>
                                    <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(shipment.status)}`}>
                                      {shipment.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span>{shipment.request_details.origin_address}</span>
                                    <span className="mx-2">→</span>
                                    <span>{shipment.request_details.destination_address}</span>
                                  </div>
                                  <p className="text-sm font-semibold text-gray-900 mt-1">
                                    ${shipment.request_details.budget_max.toLocaleString()}.00
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white border rounded-xl p-8 text-center">
                          <div className="flex justify-center mb-4">
                            <Truck className="w-12 h-12 text-gray-300" />
                          </div>
                          <h4 className="text-gray-900 font-medium mb-2">No Recent Shipments</h4>
                          <p className="text-gray-500 text-sm mb-4">You don't have any recent shipments yet</p>
                          <button 
                            onClick={() => setActiveTab('shipments')}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-gold text-white rounded-lg hover:bg-custom_yellow transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Create Shipment</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Shipment Requests */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Shipment Requests</h3>
                    </div>
                    <div className="space-y-3">
                      {dashboardData.requests.data.length > 0 ? (
                        dashboardData.requests.data.slice(0, 3).map((request, index) => (
                          <div key={request.id} className="bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                {getRequestIcon(index)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-semibold text-gray-900">{request.title}</span>
                                  <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                                    {request.status}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <span>{request.origin_address}</span>
                                  <span className="mx-2">→</span>
                                  <span>{request.destination_address}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white border rounded-xl p-8 text-center">
                          <div className="flex justify-center mb-4">
                            <Package className="w-12 h-12 text-gray-300" />
                          </div>
                          <h4 className="text-gray-900 font-medium mb-2">No Recent Requests</h4>
                          <p className="text-gray-500 text-sm mb-4">You don't have any recent shipment requests yet</p>
                          <Link 
                            to={webRoutes.createShipmentRequest}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-gold text-white rounded-lg hover:bg-custom_yellow transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Create Request</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="order-1 md:order-2 space-y-6">
                  {/* Request Statistics */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Statistics</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white border rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.requests.total}</p>
                        <p className="text-xs text-gray-600">Total Shipment Requests</p>
                      </div>
                      <div className="bg-white border rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.requests.data.filter(r => r.status === 'pending').length}</p>
                        <p className="text-xs text-gray-600">Pending Quotes</p>
                      </div>
                      <div className="bg-white border rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.requests.data.filter(r => r.status === 'quoted').length}</p>
                        <p className="text-xs text-gray-600">Quoted</p>
                      </div>
                      <div className="bg-white border rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-gray-900 mb-1">{dashboardData.requests.data.filter(r => r.status === 'awarded').length}</p>
                        <p className="text-xs text-gray-600">Awarded</p>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Alerts */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
                      <button 
                         onClick={() => setActiveTab('inventory')}
                            className="text-sm text-gray-600 hover:text-gray-900"
                          >
                            View All
                          </button>
                    </div>
                    <div className="space-y-2">
                      {dashboardData.inventory.data.length > 0 ? (
                        dashboardData.inventory.data.slice(0, 5).map((item) => (
                          <div key={item.id} className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                                <p className="text-xs text-gray-500 truncate">{item.location}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-600">{item.current_stock} Remaining</span>
                                  <span className="text-xs text-gray-500">Reorder at {item.reorder_point}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white border rounded-lg p-6 text-center">
                          <div className="flex justify-center mb-3">
                            <Warehouse className="w-10 h-10 text-gray-300" />
                          </div>
                          <h4 className="text-gray-900 font-medium mb-1 text-sm">No Inventory Alerts</h4>
                          <p className="text-gray-500 text-xs mb-3">All inventory levels are healthy</p>
                          <button 
                            onClick={() => setActiveTab('inventory')}
                            className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm bg-gold text-white rounded-lg hover:bg-custom_yellow transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Inventory</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          
{activeTab === 'shipments' && (
  <>
    {/* Search and Filter */}
    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by tracking number, origin, or destination..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>
      <div className='flex gap-2'>
        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="all">All Status</option>
          <option value="awarded">Awarded</option>
          <option value="quoted">Quoted</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
        </select>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="recent">Recent</option>
          <option value="budget_high">Budget: High to Low</option>
          <option value="budget_low">Budget: Low to High</option>
        </select>
      </div>
    </div>

    {/* All Shipments Header */}
    <h2 className="text-xl font-semibold text-gray-900 mb-6">All Shipments</h2>

    {/* Shipments Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filterShipments(dashboardData.shipments.data).length > 0 ? (
        filterShipments(dashboardData.shipments.data).map((shipment) => {
          // Helper to format date
          const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
          };

          return (
            <div key={shipment.id} className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow">
              {/* Icon and Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-yellow-600" />
                </div>
                {shipment.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(shipment.status)}`}>
                    {shipment.status.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </div>

              {/* Tracking Number */}
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {shipment.tracking_number || 'N/A'}
              </h3>

              {/* Route */}
              <div className="mb-3 flex justify-between">
                <p className="text-xs text-gray-500 mb-1">Route:</p>
                <div className="flex items-start text-sm text-gray-700 text-right">
                  <div>
                    <p className="font-medium line-clamp-1">
                      {shipment.request_details?.origin_address || 'N/A'}
                    </p>
                    <p className="text-gray-500 line-clamp-1">
                      → {shipment.request_details?.destination_address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cargo */}
              {shipment.cargo && (
                <div className="mb-3 flex justify-between">
                  <p className="text-xs text-gray-500 mb-1">Cargo:</p>
                  <p className="text-sm text-gray-700">
                    {shipment.cargo}
                    {shipment.cargo_weight && ` - ${shipment.cargo_weight}`}
                    {shipment.cargo_unit && shipment.cargo_unit}
                  </p>
                </div>
              )}

              {/* Budget */}
              {shipment.request_details?.budget_max && (
                <div className="mb-3 flex justify-between">
                  <p className="text-xs text-gray-500 mb-1">Budget:</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {shipment.currency || '$'}
                    {parseFloat(shipment.request_details.budget_max).toLocaleString()}
                  </p>
                </div>
              )}

              {/* ETA */}
              <div className="mb-4 flex justify-between">
                <p className="text-xs text-gray-500 mb-1">ETA:</p>
                <p className="text-sm text-gray-700">
                  {shipment.eta 
                    ? formatDate(shipment.eta) 
                    : shipment.estimated_delivery 
                      ? formatDate(shipment.estimated_delivery)
                      : 'N/A'}
                </p>
              </div>

              {/* View Details Button */}
              <Link
              to={webRoutes.logisticsShipmentDetail.replace(":id", shipment.id)}
              className="flex justify-center w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2.5 rounded-lg transition-colors">
                View Details
              </Link>
            </div>
          );
        })
      ) : (
        <div className="col-span-full bg-white border rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
          <h4 className="text-gray-900 font-medium mb-2">No Shipments Found</h4>
          <p className="text-gray-500 text-sm mb-4">Try adjusting your search or filters to find shipments</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setSortBy('recent');
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gold text-gray-900 rounded-lg hover:bg-custom_yellow transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}
    </div>
  </>
)}

{activeTab === 'requests' && (
  <>
    {/* Search and Filter */}
    <div className="flex flex-row items-center justify-between mb-6 gap-4">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by tracking number, title, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>
      
      {/* Status Filter */}
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="quoted">Quoted</option>
        <option value="awarded">Awarded</option>
        <option value="delivered">Delivered</option>
      </select>
    </div>

    {/* Header with See All */}
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">Shipment Requests</h2>
      <Link to={webRoutes.logisticsRequests} className="px-4 py-2 bg-yellow-100 text-gray-900 rounded-lg hover:bg-yellow-200 transition-colors">
        See All
      </Link>
    </div>

    {/* Requests Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filterRequests(dashboardData.requests.data).length > 0 ? (
        filterRequests(dashboardData.requests.data).map((request) => {
          // Helper to format date
          const formatDate = (dateString) => {
            if (!dateString) return 'Date not available';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          };

          return (
            <div key={request.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
              {/* Header with Title and Badge */}
              <div className="flex items-start justify-between mb-4 border-b">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                    {request.title || request.type || 'Order'}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    #{request.shipment_tracking_number || request.order_number || 'N/A'}
                  </p>
                </div>
                {request.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                    {request.status.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </div>

              {/* Request Details - Flex Layout */}
              <div className="flex items-start justify-between pb-4">
                {/* Left Side - Request ID */}
                <div className="flex-1">
                  <div className="flex items-center space-x-1 mb-1">
                    <p className="text-xs text-gray-500">Request ID</p>
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.77 2.18133L11.2473 0.608667C11.0603 0.416644 10.8369 0.263893 10.5901 0.159374C10.3432 0.0548549 10.078 0.000670954 9.81 0L6.66667 0C5.89853 0.000969683 5.15421 0.266727 4.55917 0.752479C3.96412 1.23823 3.55473 1.91428 3.4 2.66667H3.33333C2.4496 2.66773 1.60237 3.01925 0.97748 3.64415C0.352588 4.26904 0.00105857 5.11627 0 6V12.6667C0.00105857 13.5504 0.352588 14.3976 0.97748 15.0225C1.60237 15.6474 2.4496 15.9989 3.33333 16H7.33333C8.21706 15.9989 9.0643 15.6474 9.68919 15.0225C10.3141 14.3976 10.6656 13.5504 10.6667 12.6667V12.6C11.4191 12.4453 12.0951 12.0359 12.5809 11.4408C13.0666 10.8458 13.3324 10.1015 13.3333 9.33333V3.57333C13.3343 3.05361 13.1322 2.55408 12.77 2.18133ZM7.33333 14.6667H3.33333C2.8029 14.6667 2.29419 14.456 1.91912 14.0809C1.54405 13.7058 1.33333 13.1971 1.33333 12.6667V6C1.33333 5.46957 1.54405 4.96086 1.91912 4.58579C2.29419 4.21071 2.8029 4 3.33333 4V9.33333C3.33439 10.2171 3.68592 11.0643 4.31081 11.6892C4.93571 12.3141 5.78294 12.6656 6.66667 12.6667H9.33333C9.33333 13.1971 9.12262 13.7058 8.74755 14.0809C8.37248 14.456 7.86377 14.6667 7.33333 14.6667ZM10 11.3333H6.66667C6.13623 11.3333 5.62753 11.1226 5.25245 10.7475C4.87738 10.3725 4.66667 9.86377 4.66667 9.33333V3.33333C4.66667 2.8029 4.87738 2.29419 5.25245 1.91912C5.62753 1.54405 6.13623 1.33333 6.66667 1.33333H9.33333V2.66667C9.33333 3.02029 9.47381 3.35943 9.72386 3.60948C9.97391 3.85952 10.313 4 10.6667 4H12V9.33333C12 9.86377 11.7893 10.3725 11.4142 10.7475C11.0391 11.1226 10.5304 11.3333 10 11.3333Z" fill="#374957"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {request.request_id || request.id || 'N/A'}
                  </p>
                </div>

                {/* Right Side - Cargo Type */}
                {request.cargo_type && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Cargo Type</p>
                    <span 
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-white"
                      style={{ 
                        border: '1.5px solid transparent',
                        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #4EB608 0%, #094300 100%)',
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box'
                      }}
                    >
                      <span className='capitalize' style={{
                        background: 'linear-gradient(135deg, #4EB608 0%, #094300 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>{request.cargo_type?.replace("_", " ")}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Route and Budget - Flex Layout */}
              <div className="flex items-start justify-between mb-4">
                {/* Left Side - Route */}
                <div className="flex-1 pr-4">
                  <p className="text-xs text-gray-500 mb-2">Route</p>
                  <p className="line-clamp-1 text-xs text-gray-900 font-medium mb-1">
                    {request.origin_address || 'N/A'}
                  </p>
                  <div className="flex items-start text-xs text-gray-600">
                    <span className="mr-1">→</span>
                    <span className="leading-tight line-clamp-1">
                      {request.destination_address || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Right Side - Budget */}
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-2">Budget</p>
                  <p className="text-base font-bold text-gray-900">
                    {request.budget_max 
                      ? `${getCurrencySymbol(request.currency) || '$'}${parseFloat(request.budget_max).toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Created Date */}
              {request.created_at && (
                <p className="text-xs text-gray-400 mb-2 pb-4 border-b">
                  Created {formatDate(request.created_at)}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link 
                  to={webRoutes.logisticsRequestDetail.replace(":id", request.id)} 
                  className="flex-1 flex items-center justify-center space-x-1 p-2 bg-yellow-100 text-gray-900 font-medium rounded-lg transition-all hover:opacity-90 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span className='text-gray-800 text-xs'>View Details</span>
                </Link>
              { request.requested_by == user.id &&  <Link
                  to={webRoutes.logisticsRequestEdit.replace(":id", request.id)}
                  className="flex-1 flex items-center justify-center space-x-1 p-2 font-medium rounded-lg transition-all hover:opacity-90 relative bg-white text-xs"
                  style={{ 
                    border: '2px solid transparent',
                    backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #FFC000 0%, #FF8400 100%)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1655_9103)">
                      <path d="M13.3309 0.669151C12.9343 0.273183 12.3968 0.0507813 11.8364 0.0507812C11.276 0.0507813 10.7385 0.273183 10.3419 0.669151L0.854592 10.1565C0.582905 10.4266 0.367487 10.748 0.220799 11.1019C0.0741119 11.4559 -0.000932153 11.8354 8.73905e-06 12.2186V13.4162C8.73905e-06 13.5709 0.0614669 13.7192 0.170863 13.8286C0.280259 13.938 0.428632 13.9995 0.583342 13.9995H1.78093C2.16404 14.0006 2.54356 13.9256 2.89752 13.7791C3.25148 13.6325 3.57284 13.4171 3.84301 13.1455L13.3309 3.65757C13.7267 3.26102 13.949 2.72363 13.949 2.16336C13.949 1.60309 13.7267 1.0657 13.3309 0.669151ZM3.01818 12.3207C2.68918 12.6475 2.24465 12.8315 1.78093 12.8328H1.16668V12.2186C1.16609 11.9887 1.2111 11.761 1.29911 11.5486C1.38713 11.3362 1.51639 11.1434 1.67943 10.9813L8.87951 3.78123L10.2212 5.1229L3.01818 12.3207ZM12.5055 2.83273L11.0437 4.29515L9.70201 2.9564L11.1644 1.49398C11.2525 1.40608 11.3571 1.33639 11.4721 1.28889C11.5871 1.24139 11.7104 1.21701 11.8348 1.21715C11.9593 1.21728 12.0825 1.24193 12.1974 1.28968C12.3123 1.33743 12.4167 1.40735 12.5046 1.49544C12.5925 1.58354 12.6622 1.68808 12.7097 1.80311C12.7572 1.91814 12.7816 2.0414 12.7815 2.16585C12.7813 2.2903 12.7567 2.4135 12.7089 2.52843C12.6612 2.64335 12.5913 2.74775 12.5032 2.83565L12.5055 2.83273Z" fill="url(#paint0_linear_1655_9103)"/>
                    </g>
                    <defs>
                      <linearGradient id="paint0_linear_1655_9103" x1="0" y1="7.02514" x2="13.949" y2="7.02514" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFC000"/>
                        <stop offset="1" stopColor="#FF8400"/>
                      </linearGradient>
                      <clipPath id="clip0_1655_9103">
                        <rect width="14" height="14" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <span style={{
                    background: 'linear-gradient(135deg, #FFC000 0%, #FF8400 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Edit</span>
                </Link>}
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full bg-white border rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <FileText className="w-12 h-12 text-gray-300" />
          </div>
          <h4 className="text-gray-900 font-medium mb-2">No Requests Found</h4>
          <p className="text-gray-500 text-sm mb-4">Try adjusting your search or filters to find requests</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gold text-gray-900 rounded-lg hover:bg-custom_yellow transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}
    </div>
  </>
)}

{activeTab === 'inventory' && (
                        <div className="space-y-4">
                          {/* Search and Filter */}
                          <div className="flex flex-row items-center justify-between mb-6 gap-4">
                            <div className="relative flex-1 w-full">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search by name, location, or SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              />
                            </div>
                            
                            {/* Status Filter for Inventory */}
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                              <option value="all">All Status</option>
                              <option value="in_stock">In Stock</option>
                              <option value="low_stock">Low Stock</option>
                              <option value="out_of_stock">Out of Stock</option>
                            </select>

                          </div>

                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Inventory Management</h3>
                            <Link to={webRoutes.logisticsInventory} className="bg-gold/80 hover:bg-gold text-gray-800 rounded-lg px-3 py-2 whitespace-nowrap">
                              See More
                            </Link>
                          </div>
          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filterInventory(dashboardData.inventory.data).length > 0 ? (
                              filterInventory(dashboardData.inventory.data).map((item) => (
                                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                  <div className='q'>
                                    <div className="flex items-center justify-between mb-3">
                                      <span className='bg-pale_yellow rounded-lg '>
                                        <Box className='m-2'/>
                                      </span>
                                      <Link
                                        to={webRoutes.logisticsInventoryDetail.replace(':id', item.id)}
                                        className="w-fit text-center px-3 py-2 bg-gold text-white rounded text-sm hover:bg-yellow-600"
                                      >
                                        View Details
                                      </Link>
                                    </div>
                                    <div>
                                        <span className="capitalize text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full mb-2">
                                          {item.category?.name?.replace('_', ' ') || item.category?.replace('_', ' ') || 'N/A'}
                                        </span>
                                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                                      </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Available:</span>
                                      <span className={`font-medium ${item.current_stock <= (item.reorder_point || item.minimum_stock) ? 'text-orange-600' : 'text-gray-900'}`}>
                                        {item.current_stock} {item.unit}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Min Stock:</span>
                                      <span className="text-gray-900">{item.minimum_stock} {item.unit}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Location:</span>
                                      <span className="text-gray-900">{item.warehouse || item.location || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Unit Cost:</span>
                                      <span className="text-gray-900">${item.unit_cost}</span>
                                    </div>
                                  </div>
          
                                  {item.current_stock <= (item.reorder_point || item.minimum_stock) && (
                                    <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded text-xs text-orange-700">
                                      ⚠️ Below reorder level ({item.reorder_point || item.minimum_stock})
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="col-span-3 text-center py-8 text-gray-500">
                                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="font-medium">No inventory items found</p>
                                <p className="text-sm mb-4">Try adjusting your search or filters to find inventory items{userIsStaff ? ', or view all items across users.' : '.'}</p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                  {searchQuery && (
                                    <button
                                      onClick={() => setSearchQuery('')}
                                      className="inline-flex items-center px-4 py-2 bg-gold text-white rounded-lg hover:bg-yellow-600 text-sm"
                                    >
                                      <Search className="w-4 h-4 mr-2" /> Clear Search
                                    </button>
                                  )}
                                  <Link
                                    to={webRoutes.logisticsInventoryCreate || webRoutes.logisticsInventory}
                                    className="inline-flex items-center px-4 py-2 bg-gold text-white rounded-lg hover:bg-yellow-600 text-sm"
                                  >
                                    <Plus className="w-4 h-4 mr-2" /> Add Inventory
                                  </Link>
                                  {userIsStaff && (
                                    <button
                                      onClick={() => {
                                        localStorage.setItem('force_inventory_scope_all','1');
                                        loadDashboardData();
                                      }}
                                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                                    >
                                      View All (Staff)
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
          
                      {activeTab === 'tracking' && (
                        <div className="text-center py-12">
                          <Ship className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Live Tracking</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Real-time shipment tracking will be displayed here
                          </p>
                          <div className="mt-6">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gold hover:bg-yellow-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              View Map
                            </button>
                          </div>
                        </div>
                      )}
        </div>
      </div>
    </div>
  );
};

export default LogisticsHubDashboard;