import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "My Listings | Connectize Marketplace",
    description: "Manage your product and service listings on Connectize Marketplace.",
  keywords: "my listings, seller listings, manage products, Connectize marketplace",
  });

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, Edit2, Trash2, Eye, MoreVertical, Package, 
  DollarSign, ArrowLeft, ChevronDown, AlertCircle, CreditCard
} from "lucide-react";
import { listingService } from "../../api-services/marketplace";
import HeadingText from "../../components/HeadingText";
import { toast } from "sonner";
import { webRoutes } from "../../lib/webRoutes";

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await listingService.getMyListings(params);
      setListings(data.results || data);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (listingId, newStatus) => {
    try {
      await listingService.updateListing(listingId, { status: newStatus });
      toast.success(`Listing status updated to ${newStatus}`);
      fetchListings();
    } catch (error) {
      toast.error("Failed to update status");
    }
    setActiveMenu(null);
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    
    try {
      await listingService.deleteListing(listingId);
      toast.success("Listing deleted");
      fetchListings();
    } catch (error) {
      toast.error("Failed to delete listing");
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-600",
      active: "bg-green-100 text-green-600",
      paused: "bg-yellow-100 text-yellow-600",
      out_of_stock: "bg-red-100 text-red-600",
      discontinued: "bg-gray-300 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    draft: listings.filter(l => l.status === 'draft').length,
    outOfStock: listings.filter(l => l.status === 'out_of_stock').length,
  };

  return (
    <section className="min-h-screen bg-background">
      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to={webRoutes.marketplace} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </Link>
            <HeadingText>My Listings</HeadingText>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to={webRoutes.marketplaceSellerPayments}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CreditCard size={18} />
              <span className="hidden sm:inline">Payment Settings</span>
            </Link>
            <Link
              to={webRoutes.marketplaceCreateListing}
              className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold/90"
            >
              <Plus size={20} />
              Create Listing
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Listings</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Edit2 size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-sm text-gray-500">Drafts</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.outOfStock}</p>
                <p className="text-sm text-gray-500">Out of Stock</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 bg-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>

        {/* Listings Table */}
        {loading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full mx-auto" />
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No listings yet</h3>
            <p className="text-gray-400 mb-6">Create your first listing to start selling</p>
            <Link
              to="/marketplace/create-listing"
              className="inline-flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-lg hover:bg-gold/90"
            >
              <Plus size={20} />
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Product</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Price</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Stock</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Views</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              src={listing.images[0].image}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={20} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/marketplace/listing/${listing.id}`}
                            className="font-medium hover:text-primary line-clamp-1"
                          >
                            {listing.title}
                          </Link>
                          <p className="text-sm text-gray-500 capitalize">{listing.listing_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(listing.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-gray-400" />
                        <span className="font-medium">{parseFloat(listing.price).toFixed(2)}</span>
                      </div>
                      {listing.compare_at_price && (
                        <span className="text-sm text-gray-400 line-through">
                          ${parseFloat(listing.compare_at_price).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={listing.quantity_available <= 5 ? "text-orange-500 font-medium" : ""}>
                        {listing.quantity_available}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {listing.view_count}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 relative">
                        <Link
                          to={`/marketplace/edit-listing/${listing.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 size={16} className="text-gray-600" />
                        </Link>
                        
                        <button
                          onClick={() => setActiveMenu(activeMenu === listing.id ? null : listing.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical size={16} className="text-gray-600" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeMenu === listing.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-2 z-10 min-w-[160px]">
                            <Link
                              to={`/marketplace/listing/${listing.id}`}
                              className="block px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              View Listing
                            </Link>
                            <hr className="my-2" />
                            <p className="px-4 py-1 text-xs text-gray-400 uppercase">Change Status</p>
                            {['active', 'paused', 'draft'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(listing.id, status)}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize ${
                                  listing.status === status ? 'text-primary font-medium' : ''
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                            <hr className="my-2" />
                            <button
                              onClick={() => {
                                setActiveMenu(null);
                                handleDelete(listing.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                            >
                              Delete Listing
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </section>
  );
}
