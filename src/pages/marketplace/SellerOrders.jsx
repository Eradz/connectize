import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Eye,
  X
} from 'lucide-react';
import marketplaceApi from '../../api-services/marketplace';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  
  // Logistics state
  const [logisticsProviders, setLogisticsProviders] = useState([]);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [assigningProvider, setAssigningProvider] = useState(false);

  useEffect(() => {
    fetchSellerOrders();
    fetchLogisticsProviders();
  }, []);
  
  const fetchLogisticsProviders = async () => {
    try {
      const response = await marketplaceApi.getLogisticsProviders();
      setLogisticsProviders(response.results || response || []);
    } catch (err) {
      console.error('Failed to fetch logistics providers:', err);
    }
  };

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      const response = await marketplaceApi.getSellerOrders();
      setOrders(response.results || response || []);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      await marketplaceApi.updateOrderStatus(orderId, newStatus);
      // Refresh orders
      await fetchSellerOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <Clock className="text-yellow-500" size={20} />,
      'confirmed': <CheckCircle className="text-blue-500" size={20} />,
      'processing': <Package className="text-purple-500" size={20} />,
      'shipped': <Truck className="text-cyan-500" size={20} />,
      'delivered': <CheckCircle className="text-green-500" size={20} />,
      'cancelled': <XCircle className="text-red-500" size={20} />,
      'refunded': <RefreshCw className="text-orange-500" size={20} />
    };
    return icons[status] || <Clock className="text-gray-500" size={20} />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'processing': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-cyan-100 text-cyan-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getNextStatusOptions = (currentStatus) => {
    const transitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': [],
      'refunded': []
    };
    return transitions[currentStatus] || [];
  };
  
  const openProviderModal = (orderItem) => {
    setSelectedOrderItem(orderItem);
    setShowProviderModal(true);
  };
  
  const handleAssignProvider = async (providerId) => {
    if (!selectedOrderItem) return;
    
    try {
      setAssigningProvider(true);
      await marketplaceApi.assignLogisticsProvider(selectedOrderItem.id, providerId);
      // Refresh orders to get updated shipment status
      await fetchSellerOrders();
      setShowProviderModal(false);
      setSelectedOrderItem(null);
    } catch (err) {
      console.error('Failed to assign provider:', err);
      alert('Failed to assign logistics provider');
    } finally {
      setAssigningProvider(false);
    }
  };
  
  const getShipmentStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'quoted': 'bg-blue-100 text-blue-800',
      'awarded': 'bg-purple-100 text-purple-800',
      'in_transit': 'bg-cyan-100 text-cyan-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const statusTabs = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders
      .filter(o => !['cancelled', 'refunded'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.line_total || o.total_amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Logistics Provider Assignment Modal */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Assign Logistics Provider</h3>
              <button
                onClick={() => {
                  setShowProviderModal(false);
                  setSelectedOrderItem(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {selectedOrderItem && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Order Item</p>
                  <p className="font-medium text-gray-900">{selectedOrderItem.listing?.title || 'Product'}</p>
                  <p className="text-sm text-gray-600">Qty: {selectedOrderItem.quantity}</p>
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-4">Select a logistics provider to handle shipping:</p>
              
              {logisticsProviders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No logistics providers available</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {logisticsProviders.map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => handleAssignProvider(provider.id)}
                      disabled={assigningProvider}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{provider.name}</p>
                          <p className="text-sm text-gray-500">{provider.service_type || 'General Shipping'}</p>
                          {provider.coverage_area && (
                            <p className="text-xs text-gray-400">Coverage: {provider.coverage_area}</p>
                          )}
                        </div>
                        <Truck size={24} className="text-blue-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {assigningProvider && (
                <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Assigning provider...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Orders</h1>
          <p className="text-gray-600">Manage orders for your listings</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/marketplace/seller-payments"
            className="text-gold hover:underline flex items-center gap-1"
          >
            <DollarSign size={18} />
            Payment Settings
          </Link>
          <Link
            to="/marketplace/my-listings"
            className="text-gold hover:underline flex items-center gap-1"
          >
            Manage Listings
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-700">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm text-purple-700">Processing</p>
          <p className="text-2xl font-bold text-purple-900">{stats.processing}</p>
        </div>
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
          <p className="text-sm text-cyan-700">Shipped</p>
          <p className="text-2xl font-bold text-cyan-900">{stats.shipped}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700">Revenue</p>
          <p className="text-2xl font-bold text-green-900">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              statusFilter === tab.value
                ? 'bg-gold text-dark'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {statusFilter === 'all' 
              ? "You haven't received any orders yet"
              : `No ${statusFilter} orders`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div 
              key={order.id} 
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
            >
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Order #</p>
                    <p className="font-semibold text-gray-900">{order.order_number}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} />
                      Date
                    </p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <User size={14} />
                      Customer
                    </p>
                    <p className="font-medium text-gray-900">
                      {order.buyer?.name || order.buyer?.email || 'Customer'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <DollarSign size={14} />
                      Total
                    </p>
                    <p className="font-semibold text-gray-900">
                      ${Number(order.line_total || order.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status_display || order.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.listing?.images?.[0] ? (
                          <img
                            src={item.listing.images[0].image}
                            alt={item.listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.listing?.title || 'Product'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                        </p>
                        
                        {/* Shipment Status */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {item.shipment_status ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getShipmentStatusColor(item.shipment_status)}`}>
                              <Truck size={12} className="inline mr-1" />
                              Shipment: {item.shipment_status.replace('_', ' ')}
                            </span>
                          ) : item.shipment_request_id ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Truck size={12} className="inline mr-1" />
                              Shipment: Pending Assignment
                            </span>
                          ) : null}
                          
                          {/* Assign Provider Button */}
                          {!item.shipment_status || item.shipment_status === 'pending' ? (
                            <button
                              onClick={() => openProviderModal(item)}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                            >
                              <Truck size={12} className="inline mr-1" />
                              Assign Provider
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${(item.quantity * Number(item.price)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  
                  {/* If this is a single item order (from seller-orders endpoint) */}
                  {!order.items && (
                    <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {order.listing?.images?.[0] ? (
                          <img
                            src={order.listing.images[0].image}
                            alt={order.listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {order.listing?.title || 'Product'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {order.quantity} × ${Number(order.unit_price || order.price || 0).toFixed(2)}
                        </p>
                        
                        {/* Shipment Status */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {order.shipment_status ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getShipmentStatusColor(order.shipment_status)}`}>
                              <Truck size={12} className="inline mr-1" />
                              Shipment: {order.shipment_status.replace('_', ' ')}
                            </span>
                          ) : order.shipment_request_id ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Truck size={12} className="inline mr-1" />
                              Shipment: Pending Assignment
                            </span>
                          ) : null}
                          
                          {/* Assign Provider Button */}
                          {(!order.shipment_status || order.shipment_status === 'pending') && (
                            <button
                              onClick={() => openProviderModal(order)}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                            >
                              <Truck size={12} className="inline mr-1" />
                              Assign Provider
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${Number(order.line_total || order.total_amount || 0).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                {order.shipping_address && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                      <MapPin size={14} />
                      Shipping Address
                    </p>
                    <div className="text-sm text-gray-700">
                      {typeof order.shipping_address === 'object' ? (
                        <div>
                          {order.shipping_address.name && <div className="font-medium">{order.shipping_address.name}</div>}
                          {order.shipping_address.address && <div>{order.shipping_address.address}</div>}
                          <div>
                            {[order.shipping_address.city, order.shipping_address.state, order.shipping_address.postal_code]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                          {order.shipping_address.country && <div>{order.shipping_address.country}</div>}
                          {order.shipping_address.phone && <div className="text-gray-500">Phone: {order.shipping_address.phone}</div>}
                        </div>
                      ) : (
                        <span>{order.shipping_address}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Update Status:</span>
                    {getNextStatusOptions(order.status).length > 0 ? (
                      <div className="flex gap-2">
                        {getNextStatusOptions(order.status).map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(order.order || order.id, status)}
                            disabled={updatingOrder === order.id}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                              status === 'cancelled'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            } ${updatingOrder === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No actions available</span>
                    )}
                  </div>
                  <Link
                    to={`/marketplace/order-confirmation/${order.order || order.id}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium flex items-center gap-1"
                  >
                    <Eye size={16} />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
