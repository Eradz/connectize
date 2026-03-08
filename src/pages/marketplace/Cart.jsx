import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Shopping Cart | Connectize Marketplace",
    description: "Review your selected items and proceed to checkout on Connectize Marketplace.",
  keywords: "shopping cart, checkout, marketplace, Connectize",
  });

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Truck } from "lucide-react";
import { cartService } from "../../api-services/marketplace";
import HeadingText from "../../components/HeadingText";
import { toast } from "sonner";
import { webRoutes } from "../../lib/webRoutes";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(itemId);
      const data = await cartService.updateItem(itemId, newQuantity);
      setCart(data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdating(itemId);
      const data = await cartService.removeItem(itemId);
      setCart(data);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      const data = await cartService.clearCart();
      setCart(data);
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-background">
        <div className="container py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="bg-white rounded-lg p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <section className="min-h-screen bg-background">
      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Link to={webRoutes.marketplace} className="p-2 bg-white w-fit hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </Link>
            <HeadingText>Shopping Cart</HeadingText>
            {cart && cart.total_items > 0 && (
              <span className="text-gray-500">({cart.total_items} items)</span>
            )}
          </div>
          
          {!isEmpty && (
            <button
              onClick={handleClearCart}
              className="text-red-500 text-sm hover:underline"
            >
              Clear Cart
            </button>
          )}
        </div>

        {isEmpty ? (
          /* Empty Cart */
          <div className="bg-white rounded-lg p-12 text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
            <p className="text-gray-400 mb-6">Looks like you haven't added any items yet</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-lg hover:bg-gold/90"
            >
              <ShoppingBag size={20} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className=" col-span-1 lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white relative rounded-lg p-4 ${updating === item.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link to={`/marketplace/listing/${item.listing.id}`} className="shrink-0">
                      {item.listing.images && item.listing.images.length > 0 ? (
                        <img
                          src={item.listing.images[0].image}
                          alt={item.listing.title}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ShoppingBag size={32} className="text-gray-300" />
                        </div>
                      )}
                    </Link>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <Link
                        to={`/marketplace/listing/${item.listing.id}`}
                        className="font-semibold hover:text-primary line-clamp-2"
                      >
                        {item.listing.title.length > 20 ? item.listing.title.slice(0, 22) + "..." : item.listing.title}
                      </Link>
                      
                      <p className="text-sm text-gray-500 mt-1">
                        Sold by {item.listing.seller_company_name || item.listing.seller_name}
                      </p>
                      
                      {item.listing.free_shipping && (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                          <Truck size={14} /> Free Shipping
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity */}
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updating === item.id}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2 border-x">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <p className="text-base md:text-lg font-bold text-primary">
                            ${parseFloat(item.line_total).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${parseFloat(item.unit_price).toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updating === item.id}
                      className="p-2 text-gray-400 hover:text-red-500 absolute top-0 right-0"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="col-span-1 lg:col-span-1">
              <div className="bg-white rounded-lg p-6 sticky top-4">
                <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>${parseFloat(cart.subtotal).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span>
                      {parseFloat(cart.total_shipping) > 0
                        ? `$${parseFloat(cart.total_shipping).toFixed(2)}`
                        : 'Free'
                      }
                    </span>
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">${parseFloat(cart.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/marketplace/checkout')}
                  className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Proceed to Checkout
                </button>
                
                <Link
                  to="/marketplace"
                  className="block text-center mt-4 text-blue-600 hover:underline text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
