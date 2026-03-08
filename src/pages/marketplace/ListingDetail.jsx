import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Listing Details | Connectize Marketplace",
    description: "View detailed information, pricing, and seller details for this Connectize Marketplace listing.",
  keywords: "listing, marketplace, product details, oil and gas equipment, buy sell",
  });

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  ArrowLeft, 
  Star, 
  MapPin, 
  Package, 
  Truck, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Minus,
  Building2,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import marketplaceApi from '../../api-services/marketplace';
import { getSession } from '../../lib/session';
import { webRoutes } from '../../lib/webRoutes';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  
  // Check if user is logged in
  const isLoggedIn = () => {
    const session = getSession();
    return Boolean(session?.tokens?.access);
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await marketplaceApi.getListingById(id);
      setListing(response);
      setInWishlist(response.in_wishlist || false);
    } catch (err) {
      setError('Failed to load listing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      alert('Please log in to add items to your cart');
      navigate('/login');
      return;
    }
    
    try {
      setAddingToCart(true);
      await marketplaceApi.addToCart(listing.id, quantity);
      navigate('/marketplace/cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Failed to add item to cart');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      alert('Please log in to purchase');
      navigate('/login');
      return;
    }
    
    try {
      setAddingToCart(true);
      await marketplaceApi.addToCart(listing.id, quantity);
      // Go directly to checkout instead of cart
      navigate('/marketplace/checkout');
    } catch (err) {
      console.error('Failed to proceed to checkout:', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Failed to proceed to checkout');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      alert('Please log in to save items to your wishlist');
      navigate('/login');
      return;
    }
    
    try {
      await marketplaceApi.toggleWishlist(listing.id);
      setInWishlist(!inWishlist);
    } catch (err) {
      console.error('Failed to update wishlist:', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Failed to update wishlist');
      }
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = listing?.title || 'Check out this listing';
    const shareText = `Check out "${listing?.title}" on Connectize Marketplace - $${Number(listing?.price).toLocaleString()}`;
    
    // Try native share API first (works on mobile and some desktop browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
        if (err.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback: copy link to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    });
  };

  const nextImage = () => {
    if (listing?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const getConditionColor = (condition) => {
    const colors = {
      'new': 'bg-green-100 text-green-800',
      'like_new': 'bg-emerald-100 text-emerald-800',
      'good': 'bg-blue-100 text-blue-800',
      'fair': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error || 'Listing not found'}</span>
        </div>
        <button
          onClick={() => navigate(webRoutes.marketplace)}
          className="mt-4 text-blue-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Marketplace
        </button>
      </div>
    );
  }

  const images = listing.images?.length > 0 
    ? listing.images 
    : [{ image: '/placeholder-product.png', alt_text: listing.title }];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link to="/marketplace" className="hover:text-blue-600">Marketplace</Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={images[currentImageIndex]?.image || '/placeholder-product.png'}
              alt={images[currentImageIndex]?.alt_text || listing.title}
              className="w-full h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {listing.condition && (
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(listing.condition)}`}>
                {listing.condition_display || listing.condition}
              </span>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={img.image}
                    alt={img.alt_text || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleWishlist}
                  className={`p-2 rounded-full border ${
                    inWishlist 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
                  title="Share listing"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
            
            {listing.category && (
              <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {listing.category}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                ${Number(listing.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              {listing.quantity_available > 0 && (
                <span className="text-gray-500">/ unit</span>
              )}
            </div>
            {listing.quantity_available > 0 && (
              <p className="text-green-600 mt-1 flex items-center gap-1">
                <Package size={16} />
                {listing.quantity_available} available
              </p>
            )}
          </div>

          {/* Quantity Selector & Add to Cart */}
          {listing.status === 'active' && listing.quantity_available > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(listing.quantity_available, quantity + 1))}
                    className="p-2 hover:bg-gray-50"
                    disabled={quantity >= listing.quantity_available}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart size={20} />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                  className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {addingToCart ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          )}

          {listing.status !== 'active' && (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl flex items-center gap-2">
              <AlertCircle size={20} />
              This listing is currently not available for purchase.
            </div>
          )}

          {/* Seller Info */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Seller</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Building2 size={24} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {listing.seller_company_name || listing.seller_name || listing.seller?.name || 'Seller'}
                </p>
                {(listing.seller?.location || listing.seller_company?.city) && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} />
                    {listing.seller?.location || listing.seller_company?.city}
                  </p>
                )}
              </div>
              <Link
                to={`/company/${listing.seller_company || listing.seller?.id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View Profile
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <Truck size={20} className="text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Fast Shipping</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield size={20} className="text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Secure Payment</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageCircle size={20} className="text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">24/7 Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
        <div className="bg-gray-50 rounded-xl p-6">
          <p className="text-gray-700 whitespace-pre-wrap">
            {listing.description || 'No description available.'}
          </p>
        </div>
      </div>

      {/* Specifications */}
      {(listing.sku || listing.location) && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
          <div className="bg-gray-50 rounded-xl p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listing.sku && (
                <>
                  <dt className="text-gray-500">SKU</dt>
                  <dd className="font-medium text-gray-900">{listing.sku}</dd>
                </>
              )}
              {listing.location && (
                <>
                  <dt className="text-gray-500">Location</dt>
                  <dd className="font-medium text-gray-900">{listing.location}</dd>
                </>
              )}
              {listing.condition && (
                <>
                  <dt className="text-gray-500">Condition</dt>
                  <dd className="font-medium text-gray-900">{listing.condition_display || listing.condition}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
        {listing.reviews?.length > 0 ? (
          <div className="space-y-4">
            {listing.reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        fill={i < review.rating ? 'currentColor' : 'none'} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">by {review.user?.name || 'Anonymous'}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 bg-gray-50 rounded-xl p-6">No reviews yet.</p>
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
