import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Search, Filter, Star, ChevronRight, Truck, Store } from "lucide-react";
import SEO from "../../components/SEO";
import { getSEOConfig } from "../../lib/seoConfig";
import { listingService, cartService, wishlistService } from "../../api-services/marketplace";
import HeadingText from "../../components/HeadingText";
import { toast } from "sonner";

export default function Marketplace() {
  const seoData = getSEOConfig("marketplace");
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);
  const [wishlistItems, setWishlistItems] = useState(new Set()); // Track wishlist item IDs
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    listing_type: "",
    condition: "",
    min_price: "",
    max_price: "",
    free_shipping: false,
    in_stock: true,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchListings();
    fetchFeaturedListings();
    fetchCart();
    fetchWishlist();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (searchQuery) params.search = searchQuery;
      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === false) delete params[key];
      });
      const data = await listingService.getListings(params);
      setListings(data.results || data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedListings = async () => {
    try {
      const data = await listingService.getFeaturedListings();
      setFeaturedListings(data);
    } catch (error) {
      console.error("Error fetching featured listings:", error);
    }
  };

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      // User may not be logged in
      console.log("Cart not available");
    }
  };

  const fetchWishlist = async () => {
    try {
      const wishlistsResponse = await wishlistService.getWishlists();
      const wishlists = wishlistsResponse.results || wishlistsResponse;
      if (wishlists && wishlists.length > 0) {
        // Get items from the first wishlist
        const wishlist = await wishlistService.getWishlist(wishlists[0].id);
        // Extract listing IDs from wishlist items
        const listingIds = new Set(
          (wishlist.items || []).map(item => item.listing?.id || item.listing)
        );
        setWishlistItems(listingIds);
      }
    } catch (error) {
      console.log("Wishlist not available");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleAddToCart = async (listingId) => {
    try {
      const data = await cartService.addItem(listingId, 1);
      setCart(data);
      toast.success("Added to cart!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add to cart");
    }
  };

  const handleAddToWishlist = async (listingId) => {
    try {
      // Check if already in wishlist
      if (wishlistItems.has(listingId)) {
        toast.info("Already in wishlist");
        return;
      }
      
      // Get or create default wishlist
      let wishlistsResponse = await wishlistService.getWishlists();
      // Handle paginated response
      let wishlists = wishlistsResponse.results || wishlistsResponse;
      let defaultWishlist;
      
      if (!wishlists || wishlists.length === 0) {
        defaultWishlist = await wishlistService.createWishlist("My Wishlist");
      } else {
        defaultWishlist = wishlists[0];
      }
      
      await wishlistService.addItem(defaultWishlist.id, listingId);
      // Update local state to show the heart as filled
      setWishlistItems(prev => new Set([...prev, listingId]));
      toast.success("Added to wishlist!");
    } catch (error) {
      if (error.response?.data?.error === "Item already in wishlist") {
        // Also update local state in case it wasn't tracked
        setWishlistItems(prev => new Set([...prev, listingId]));
        toast.info("Already in wishlist");
      } else {
        toast.error(error.response?.data?.error || "Failed to add to wishlist");
      }
    }
  };

  const renderListingCard = (listing) => (
    <div
      key={listing.id}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images.find(img => img.is_primary)?.image || listing.images[0].image}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Store size={48} />
          </div>
        )}
        
        {/* Discount badge */}
        {listing.discount_percentage > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            -{listing.discount_percentage}%
          </span>
        )}
        
        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddToWishlist(listing.id);
          }}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
        >
          <Heart 
            size={18} 
            className={wishlistItems.has(listing.id) ? "text-red-500 fill-red-500" : "text-gray-600"} 
          />
        </button>
        
        {/* Free shipping badge */}
        {listing.free_shipping && (
          <span className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Truck size={12} /> Free Shipping
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <Link
          to={`/marketplace/listing/${listing.id}`}
          className="block hover:text-primary"
        >
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">{listing.title}</h3>
        </Link>
        
        {/* Seller */}
        <p className="text-xs text-gray-500 mb-2">
          by {listing.seller_company_name || listing.seller_name}
        </p>
        
        {/* Rating */}
        {listing.average_rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium">{listing.average_rating}</span>
            <span className="text-xs text-gray-500">({listing.review_count})</span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-primary">
            ${parseFloat(listing.price).toFixed(2)}
          </span>
          {listing.compare_at_price && (
            <span className="text-sm text-gray-400 line-through">
              ${parseFloat(listing.compare_at_price).toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Stock status */}
        {!listing.is_in_stock ? (
          <span className="text-xs text-red-500">Out of Stock</span>
        ) : listing.quantity_available <= 5 ? (
          <span className="text-xs text-orange-500">Only {listing.quantity_available} left</span>
        ) : null}
        
        {/* Add to cart button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddToCart(listing.id);
          }}
          disabled={!listing.is_in_stock}
          className="w-full mt-3 py-2 px-4 bg-gold text-white rounded-lg text-sm font-medium hover:bg-gold/90 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );

  return (
    <section className="min-h-screen bg-background">
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
      />
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            <HeadingText>Marketplace</HeadingText>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, services, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </form>
            
            {/* Cart */}
            <Link
              to="/marketplace/cart"
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <ShoppingCart size={24} />
              {cart && cart.total_items > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.total_items}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container py-6">
        {/* Type Toggle + Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            {/* Type Toggle Buttons */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
              {[
                { value: '', label: 'All' },
                { value: 'product', label: 'Products' },
                { value: 'inventory', label: 'Inventory' },
                { value: 'service', label: 'Services' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, listing_type: type.value }));
                    // Auto-fetch on toggle
                    setTimeout(() => fetchListings(), 0);
                  }}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    filters.listing_type === type.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
              >
                <Filter size={18} />
                Filters
              </button>
              <Link to="/marketplace/my-listings" className="text-sm text-primary hover:underline hidden sm:block">
                My Listings
              </Link>
              <Link to="/marketplace/orders" className="text-sm text-primary hover:underline hidden sm:block">
                My Orders
              </Link>
            </div>
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              
              <select
                value={filters.condition}
                onChange={(e) => setFilters({...filters, condition: e.target.value})}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Any Condition</option>
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="refurbished">Refurbished</option>
              </select>
              
              <input
                type="number"
                placeholder="Min Price"
                value={filters.min_price}
                onChange={(e) => setFilters({...filters, min_price: e.target.value})}
                className="border rounded-lg px-3 py-2"
              />
              
              <input
                type="number"
                placeholder="Max Price"
                value={filters.max_price}
                onChange={(e) => setFilters({...filters, max_price: e.target.value})}
                className="border rounded-lg px-3 py-2"
              />
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.free_shipping}
                  onChange={(e) => setFilters({...filters, free_shipping: e.target.checked})}
                  className="rounded"
                />
                Free Shipping
              </label>
              
              <button
                onClick={fetchListings}
                className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold/90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Featured Listings */}
        {featuredListings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Featured Listings</h2>
              <Link to="/marketplace/featured" className="text-gold text-sm flex items-center gap-1">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {featuredListings.slice(0, 5).map(renderListingCard)}
            </div>
          </div>
        )}
        
        {/* All Listings */}
        <div>
          <h2 className="text-xl font-bold mb-4">Browse All</h2>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <Store size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">No listings found</h3>
              <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {listings.map(renderListingCard)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
