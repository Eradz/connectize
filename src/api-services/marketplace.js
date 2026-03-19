import axios from "axios";
import { getSession } from "../lib/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create axios instance for marketplace
const marketplaceApi = axios.create({
  baseURL: `${API_BASE_URL}/api/marketplace`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests - fetch fresh token on each request
marketplaceApi.interceptors.request.use((config) => {
  // Get fresh session on each request
  const session = getSession();
  const token = session?.tokens?.access;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// ==================== LISTINGS ====================

export const listingService = {
  // Get all active listings (public)
  getListings: async (params = {}) => {
    const response = await marketplaceApi.get("/listings/", { params });
    return response.data;
  },

  // Get single listing
  getListing: async (id) => {
    const response = await marketplaceApi.get(`/listings/${id}/`);
    return response.data;
  },

  // Get featured listings
  getFeaturedListings: async () => {
    const response = await marketplaceApi.get("/listings/featured/");
    return response.data;
  },

  // Get top-rated listings
  getTopRatedListings: async () => {
    const response = await marketplaceApi.get("/listings/top_rated/");
    return response.data;
  },

  // Get my listings (seller view)
  getMyListings: async (params = {}) => {
    const response = await marketplaceApi.get("/listings/my_listings/", { params });
    return response.data;
  },

  // Create listing
  createListing: async (data) => {
    const response = await marketplaceApi.post("/listings/", data);
    return response.data;
  },

  // Create listing from inventory item (general marketplace inventory)
  createFromInventory: async (data) => {
    const response = await marketplaceApi.post("/listings/from_inventory/", data);
    return response.data;
  },

  // Create listing from logistics inventory item (oil & gas equipment)
  createFromLogisticsInventory: async (data) => {
    const response = await marketplaceApi.post("/listings/from-logistics-inventory/", data);
    return response.data;
  },

  // Update listing
  updateListing: async (id, data) => {
    const response = await marketplaceApi.patch(`/listings/${id}/`, data);
    return response.data;
  },

  // Delete listing
  deleteListing: async (id) => {
    const response = await marketplaceApi.delete(`/listings/${id}/`);
    return response.data;
  },

  // Upload listing image
  uploadImage: async (listingId, imageFile, isPrimary = false, altText = "") => {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("is_primary", isPrimary ? "true" : "false");
    formData.append("alt_text", altText);

    const response = await marketplaceApi.post(
      `/listings/${listingId}/upload_image/`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  // Delete listing image
  deleteImage: async (listingId, imageId) => {
    const response = await marketplaceApi.delete(
      `/listings/${listingId}/delete_image/${imageId}/`
    );
    return response.data;
  },
};

// ==================== CART ====================

export const cartService = {
  // Get cart
  getCart: async () => {
    const response = await marketplaceApi.get("/cart/");
    return response.data;
  },

  // Add item to cart
  addItem: async (listingId, quantity = 1) => {
    const response = await marketplaceApi.post("/cart/add_item/", {
      listing_id: listingId,
      quantity,
    });
    return response.data;
  },

  // Update cart item quantity
  updateItem: async (itemId, quantity) => {
    const response = await marketplaceApi.put(`/cart/update_item/${itemId}/`, {
      quantity,
    });
    return response.data;
  },

  // Remove item from cart
  removeItem: async (itemId) => {
    const response = await marketplaceApi.delete(`/cart/remove_item/${itemId}/`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await marketplaceApi.delete("/cart/clear/");
    return response.data;
  },
};

// ==================== ORDERS ====================

export const orderService = {
  // Get user's orders
  getOrders: async (params = {}) => {
    const response = await marketplaceApi.get("/orders/", { params });
    return response.data;
  },

  // Get single order
  getOrder: async (id) => {
    const response = await marketplaceApi.get(`/orders/${id}/`);
    return response.data;
  },

  // Create order from cart (checkout)
  createOrder: async (data) => {
    // Accept either object or separate params for backwards compatibility
    const payload = typeof data === 'object' && data.shipping_address 
      ? data 
      : {
          shipping_address: data,
          billing_address: arguments[1] || null,
          buyer_notes: arguments[2] || '',
        };
    
    const response = await marketplaceApi.post("/orders/", payload);
    return response.data;
  },

  // Create payment intent for order
  createPaymentIntent: async (orderId) => {
    const response = await marketplaceApi.post(`/orders/${orderId}/create_payment_intent/`);
    return response.data;
  },

  // Confirm payment
  confirmPayment: async (orderId, paymentIntentId) => {
    const response = await marketplaceApi.post(`/orders/${orderId}/confirm_payment/`, {
      payment_intent_id: paymentIntentId,
    });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await marketplaceApi.post(`/orders/${orderId}/cancel/`);
    return response.data;
  },
};

// ==================== SELLER ORDERS ====================

export const sellerOrderService = {
  // Get sold items
  getSoldItems: async (params = {}) => {
    const response = await marketplaceApi.get("/seller-orders/", { params });
    return response.data;
  },

  // Get single sold item
  getSoldItem: async (id) => {
    const response = await marketplaceApi.get(`/seller-orders/${id}/`);
    return response.data;
  },

  // Mark item as shipped
  shipItem: async (itemId, trackingNumber = "", carrier = "") => {
    const response = await marketplaceApi.post(`/seller-orders/${itemId}/ship/`, {
      tracking_number: trackingNumber,
      carrier,
    });
    return response.data;
  },

  // Mark item as delivered
  deliverItem: async (itemId) => {
    const response = await marketplaceApi.post(`/seller-orders/${itemId}/deliver/`);
    return response.data;
  },
};

// ==================== REVIEWS ====================

export const reviewService = {
  // Get reviews for a listing
  getListingReviews: async (listingId, params = {}) => {
    const response = await marketplaceApi.get("/reviews/", {
      params: { listing: listingId, ...params },
    });
    return response.data;
  },

  // Get my reviews
  getMyReviews: async () => {
    const response = await marketplaceApi.get("/reviews/my_reviews/");
    return response.data;
  },

  // Create review
  createReview: async (listingId, rating, comment, title = "", orderItemId = null) => {
    const response = await marketplaceApi.post("/reviews/", {
      listing: listingId,
      rating,
      comment,
      title,
      order_item: orderItemId,
    });
    return response.data;
  },

  // Update review
  updateReview: async (reviewId, data) => {
    const response = await marketplaceApi.patch(`/reviews/${reviewId}/`, data);
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId) => {
    const response = await marketplaceApi.delete(`/reviews/${reviewId}/`);
    return response.data;
  },

  // Seller respond to review
  respondToReview: async (reviewId, responseText) => {
    const response = await marketplaceApi.post(`/reviews/${reviewId}/respond/`, {
      response: responseText,
    });
    return response.data;
  },

  // Vote review helpful
  voteHelpful: async (reviewId) => {
    const response = await marketplaceApi.post(`/reviews/${reviewId}/helpful/`);
    return response.data;
  },

  // Vote review unhelpful
  voteUnhelpful: async (reviewId) => {
    const response = await marketplaceApi.post(`/reviews/${reviewId}/unhelpful/`);
    return response.data;
  },
};

// ==================== STRIPE CONNECT (Seller Payments) ====================

export const stripeConnectService = {
  // Start Stripe Connect onboarding for seller
  startOnboarding: async () => {
    const response = await marketplaceApi.post("/seller/connect/create_account/");
    return response.data;
  },

  // Get seller's Stripe Connect account status
  getStatus: async () => {
    const response = await marketplaceApi.get("/seller/connect/account_status/");
    return response.data;
  },

  // Get Stripe Express Dashboard link
  getDashboardLink: async () => {
    const response = await marketplaceApi.get("/seller/connect/dashboard_link/");
    return response.data;
  },

  // Refresh onboarding link if expired
  refreshOnboarding: async () => {
    const response = await marketplaceApi.get("/seller/connect/onboarding_refresh/");
    return response.data;
  },

  // Get seller earnings dashboard
  getEarnings: async (params = {}) => {
    const response = await marketplaceApi.get("/seller/earnings/dashboard/", { params });
    return response.data;
  },

  // Get seller payout history
  getPayouts: async (params = {}) => {
    const response = await marketplaceApi.get("/seller/earnings/payouts/", { params });
    return response.data;
  },
};

// ==================== WISHLIST ====================

export const wishlistService = {
  // Get user's wishlists
  getWishlists: async () => {
    const response = await marketplaceApi.get("/wishlists/");
    return response.data;
  },

  // Get single wishlist
  getWishlist: async (id) => {
    const response = await marketplaceApi.get(`/wishlists/${id}/`);
    return response.data;
  },

  // Create wishlist
  createWishlist: async (name, isPublic = false) => {
    const response = await marketplaceApi.post("/wishlists/", {
      name,
      is_public: isPublic,
    });
    return response.data;
  },

  // Update wishlist
  updateWishlist: async (id, data) => {
    const response = await marketplaceApi.patch(`/wishlists/${id}/`, data);
    return response.data;
  },

  // Delete wishlist
  deleteWishlist: async (id) => {
    const response = await marketplaceApi.delete(`/wishlists/${id}/`);
    return response.data;
  },

  // Add item to wishlist
  addItem: async (wishlistId, listingId, notes = "") => {
    const response = await marketplaceApi.post(`/wishlists/${wishlistId}/add_item/`, {
      listing_id: listingId,
      notes,
    });
    return response.data;
  },

  // Remove item from wishlist
  removeItem: async (wishlistId, itemId) => {
    const response = await marketplaceApi.delete(
      `/wishlists/${wishlistId}/remove_item/${itemId}/`
    );
    return response.data;
  },

  // Move wishlist items to cart
  moveToCart: async (wishlistId) => {
    const response = await marketplaceApi.post(`/wishlists/${wishlistId}/move_to_cart/`);
    return response.data;
  },
};

// Export all services
export default {
  listingService,
  cartService,
  orderService,
  sellerOrderService,
  reviewService,
  wishlistService,
  stripeConnectService,
  
  // Convenience methods for direct access
  getListings: (params) => listingService.getListings(params),
  getListingById: (id) => listingService.getListing(id),
  createListing: (data) => listingService.createListing(data),
  updateListing: (id, data) => listingService.updateListing(id, data),
  deleteListing: (id) => listingService.deleteListing(id),
  getMyListings: (params) => listingService.getMyListings(params),
  createFromInventory: (data) => listingService.createFromInventory(data),
  createFromLogisticsInventory: (data) => listingService.createFromLogisticsInventory(data),
  uploadListingImage: (listingId, formData) => listingService.uploadImage(listingId, formData),
  deleteListingImage: (listingId, imageId) => listingService.deleteImage(listingId, imageId),
  
  getCart: () => cartService.getCart(),
  addToCart: (listingId, quantity) => cartService.addItem(listingId, quantity),
  updateCartItem: (itemId, quantity) => cartService.updateItem(itemId, quantity),
  removeFromCart: (itemId) => cartService.removeItem(itemId),
  clearCart: () => cartService.clearCart(),
  
  getOrders: (params) => orderService.getOrders(params),
  getOrderById: (id) => orderService.getOrder(id),
  createOrder: (data) => orderService.createOrder(data),
  createPaymentIntent: (orderId) => orderService.createPaymentIntent(orderId),
  confirmPayment: (orderId, paymentIntentId) => orderService.confirmPayment(orderId, paymentIntentId),
  cancelOrder: (orderId) => orderService.cancelOrder(orderId),
  
  getSellerOrders: (params) => sellerOrderService.getSoldItems(params),
  getSellerOrderById: (id) => sellerOrderService.getSoldItem(id),
  updateOrderStatus: async (orderId, status) => {
    const response = await marketplaceApi.patch(`/orders/${orderId}/update_status/`, { status });
    return response.data;
  },
  shipOrder: (orderId, trackingNumber, carrier) => sellerOrderService.shipItem(orderId, trackingNumber, carrier),
  deliverOrder: (orderId) => sellerOrderService.deliverItem(orderId),
  
  getReviews: (listingId, params) => reviewService.getListingReviews(listingId, params),
  createReview: (listingId, rating, comment, title, orderItemId) => reviewService.createReview(listingId, rating, comment, title, orderItemId),
  
  getWishlists: () => wishlistService.getWishlists(),
  toggleWishlist: async (listingId) => {
    const response = await marketplaceApi.post(`/listings/${listingId}/toggle_wishlist/`);
    return response.data;
  },
  
  // Checkout with Stripe
  checkout: async (shippingAddress, billingAddress = null) => {
    const response = await marketplaceApi.post("/cart/checkout/", {
      shipping_address: shippingAddress,
      billing_address: billingAddress,
    });
    return response.data;
  },
  
  // Get inventory items for listing creation
  getInventoryItems: async () => {
    const session = getSession();
    const token = session?.tokens?.access;
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_BASE_URL}/api/inventory/items/`, {
      headers,
    });
    return response.data;
  },
  
  // Logistics-related methods
  // Get logistics providers
  getLogisticsProviders: async () => {
    // Use the session helper for consistent auth
    const session = getSession();
    const token = session?.tokens?.access;
    
    const headers = {
      "Content-Type": "application/json",
    };
    
    // Only add auth header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await axios.get(`${API_BASE_URL}/api/providers/`, { headers });
    return response.data;
  },
  
  // Assign logistics provider to order item
  assignLogisticsProvider: async (orderItemId, providerId) => {
    const response = await marketplaceApi.post(`/seller-orders/${orderItemId}/assign_provider/`, {
      provider_id: providerId,
    });
    return response.data;
  },
};
