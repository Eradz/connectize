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
  Star,
  X,
  MessageSquare
} from 'lucide-react';
import marketplaceApi from '../../api-services/marketplace';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await marketplaceApi.getOrders();
      setOrders(response.results || response || []);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const openReviewModal = (item) => {
    setSelectedItem(item);
    setReviewData({ rating: 5, title: '', comment: '' });
    setShowReviewModal(true);
  };
  
  const submitReview = async () => {
    if (!selectedItem || !reviewData.comment.trim()) return;
    
    try {
      setSubmittingReview(true);
      await marketplaceApi.createReview(
        selectedItem.listing?.id || selectedItem.listing_id,
        reviewData.rating,
        reviewData.comment,
        reviewData.title,
        selectedItem.id  // order_item_id
      );
      setShowReviewModal(false);
      setSelectedItem(null);
      // Refresh orders to update review status
      await fetchOrders();
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Review Modal */}
      {showReviewModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {/* Product Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                  {selectedItem.listing?.images?.[0] ? (
                    <img
                      src={selectedItem.listing.images[0].image}
                      alt={selectedItem.listing?.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedItem.listing?.title || selectedItem.title}</p>
                </div>
              </div>
              
              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="p-1"
                    >
                      <Star
                        size={28}
                        className={star <= reviewData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Title (optional)</label>
                <input
                  type="text"
                  value={reviewData.title}
                  onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                  placeholder="Sum up your experience"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Submit Button */}
              <button
                onClick={submitReview}
                disabled={!reviewData.comment.trim() || submittingReview}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your purchases</p>
        </div>
        <Link
          to="/marketplace"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          Continue Shopping
          <ChevronRight size={18} />
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              statusFilter === tab.value
                ? 'bg-blue-600 text-white'
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
          <p className="text-gray-600 mb-4">
            {statusFilter === 'all' 
              ? "You haven't placed any orders yet"
              : `No ${statusFilter} orders`}
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div 
              key={order.id} 
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
            >
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Order #</p>
                    <p className="font-semibold text-gray-900">{order.order_number}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} />
                      Placed on
                    </p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <DollarSign size={14} />
                      Total
                    </p>
                    <p className="font-semibold text-gray-900">
                      ${Number(order.total || order.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                  {order.items?.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
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
                          {item.listing?.title || item.title || 'Product'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × ${Number(item.unit_price || item.price).toFixed(2)}
                        </p>
                        {/* Review Button - Only for delivered orders */}
                        {order.status === 'delivered' && !item.review && (
                          <button
                            onClick={() => openReviewModal(item)}
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <MessageSquare size={14} />
                            Write a Review
                          </button>
                        )}
                        {item.review && (
                          <span className="mt-1 text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle size={14} />
                            Reviewed
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${(item.quantity * Number(item.unit_price || item.price)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  
                  {order.items?.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

                {/* Order Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {order.shipping_address && (
                      <span>
                        Shipping to: {typeof order.shipping_address === 'object' 
                          ? [order.shipping_address.address, order.shipping_address.city, order.shipping_address.state, order.shipping_address.country]
                              .filter(Boolean)
                              .join(', ')
                          : order.shipping_address}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {order.status === 'shipped' && order.tracking_number && (
                      <button className="text-blue-600 hover:underline text-sm">
                        Track Package
                      </button>
                    )}
                    <Link
                      to={`/marketplace/order-confirmation/${order.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
