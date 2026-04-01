import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Upload, X, Plus, Package, DollarSign, 
  Truck, Info, Loader2 
} from "lucide-react";
import { listingService } from "../../api-services/marketplace";
import { logisticsAPI } from "../../api-services/logistics";
import { getProductCategories, createProductCategory } from "../../api-services/products";
import { getServiceCategories, createServiceCategory } from "../../api-services/services";
import HeadingText from "../../components/HeadingText";
import SearchableSelect from "../../components/SearchableSelect";
import { toast } from "sonner";
import { webRoutes } from "../../lib/webRoutes";

export default function CreateListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [creationMode, setCreationMode] = useState("manual"); // "manual" or "inventory"
  const [productCategories, setProductCategories] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const initialType = searchParams.get("type");
  const [formData, setFormData] = useState({
    listing_type: ["product", "service"].includes(initialType) ? initialType : "product",
    title: "",
    description: "",
    condition: "new",
    product_category: "",
    service_category: "",
    price: "",
    compare_at_price: "",
    quantity_available: "",
    min_order_quantity: 1,
    max_order_quantity: "",
    track_inventory: true,
    free_shipping: false,
    shipping_cost: "",
    estimated_delivery_days: "",
    shipping_from_location: "",
    status: "draft",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchInventoryItems();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const [prodCats, servCats] = await Promise.all([
        getProductCategories(),
        getServiceCategories(),
      ]);
      setProductCategories(prodCats || []);
      setServiceCategories(servCats || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCreateProductCategory = async (name) => {
    const newCat = await createProductCategory(name);
    setProductCategories((prev) => [...prev, newCat]);
    toast.success(`Category "${name}" created`);
    return newCat;
  };

  const handleCreateServiceCategory = async (name) => {
    const newCat = await createServiceCategory(name);
    setServiceCategories((prev) => [...prev, newCat]);
    toast.success(`Category "${name}" created`);
    return newCat;
  };

  const fetchInventoryItems = async () => {
    try {
      // Use logistics inventory API - same items shown on the Inventory page
      const response = await logisticsAPI.getInventoryItems();
      // Handle different response structures
      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response?.results) {
        items = response.results;
      } else if (response?.data) {
        items = response.data;
      }
      console.log("📦 Logistics inventory items for listing:", items.length);
      setInventoryItems(items);
    } catch (error) {
      console.error("Error fetching logistics inventory:", error);
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleInventorySelect = (item) => {
    setSelectedInventoryItem(item);
    // Map logistics inventory fields to form fields
    const price = item.unit_cost || item.unit_price || "";
    const quantity = item.current_stock ?? item.quantity_available ?? "";
    setFormData({
      ...formData,
      title: item.name,
      description: item.description || "",
      price: String(price),
      quantity_available: String(quantity),
      condition: item.condition || "new",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!formData.quantity_available || parseInt(formData.quantity_available) < 0) {
      toast.error("Please enter available quantity");
      return;
    }
    
    if ((formData.listing_type === "product" || formData.listing_type === "inventory") && !formData.product_category) {
      toast.error("Please select a product category");
      return;
    }
    if (formData.listing_type === "service" && !formData.service_category) {
      toast.error("Please select a service category");
      return;
    }

    setLoading(true);

    try {
      let listing;

      if (creationMode === "inventory" && selectedInventoryItem) {
        // Create from logistics inventory (oil & gas equipment)
        console.log("📤 Creating listing from logistics inventory:", selectedInventoryItem.id);
        listing = await listingService.createFromLogisticsInventory({
          logistics_inventory_item_id: selectedInventoryItem.id,
          price: formData.price,
          compare_at_price: formData.compare_at_price || null,
          quantity_to_list: parseInt(formData.quantity_available) || 1,
          condition: formData.condition,
          title: formData.title,
          description: formData.description,
          free_shipping: formData.free_shipping,
          shipping_cost: formData.shipping_cost || null,
          status: formData.status,
        });
      } else {
        // Create manual listing
        const listingData = {
          ...formData,
          price: parseFloat(formData.price),
          compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
          quantity_available: parseInt(formData.quantity_available),
          min_order_quantity: parseInt(formData.min_order_quantity) || 1,
          max_order_quantity: formData.max_order_quantity ? parseInt(formData.max_order_quantity) : null,
          shipping_cost: formData.shipping_cost ? parseFloat(formData.shipping_cost) : null,
          estimated_delivery_days: formData.estimated_delivery_days ? parseInt(formData.estimated_delivery_days) : null,
          product_category: formData.product_category || null,
          service_category: formData.service_category || null,
        };
        listing = await listingService.createListing(listingData);
      }

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const isPrimary = i === 0;
        await listingService.uploadImage(listing.id, images[i].file, isPrimary);
      }

      toast.success("Listing created successfully!");
      navigate(`/marketplace/listing/${listing.id}`);

    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error(error.response?.data?.error || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-background">
      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={webRoutes.marketplaceMyListings} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <HeadingText>Create Listing</HeadingText>
        </div>

        {/* Creation Mode Toggle */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">How would you like to create your listing?</h3>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setCreationMode("manual");
                setSelectedInventoryItem(null);
              }}
              className={`flex-1 p-4 border-2 rounded-lg text-center transition ${
                creationMode === "manual" 
                  ? "border-gold bg-gold/5" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Plus size={24} className="mx-auto mb-2 text-gold" />
              <p className="font-medium">Create Manually</p>
              <p className="text-sm text-gray-500">Enter all details from scratch</p>
            </button>
            
            <button
              type="button"
              onClick={() => setCreationMode("inventory")}
              className={`flex-1 p-4 border-2 rounded-lg text-center transition ${
                creationMode === "inventory" 
                  ? "border-gold bg-gold/5" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Package size={24} className="mx-auto mb-2 text-gold" />
              <p className="font-medium">From Inventory</p>
              <p className="text-sm text-gray-500">Use existing inventory item</p>
            </button>
          </div>
        </div>

        {/* Inventory Selection */}
        {creationMode === "inventory" && (
          <div className="bg-white rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">Select Inventory Item</h3>
            
            {loadingInventory ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin mx-auto" size={24} />
              </div>
            ) : inventoryItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-2 opacity-50" />
                <p>No inventory items found</p>
                <Link to="/inventory" className="text-gold hover:underline text-sm">
                  Go to Inventory Management
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
                {inventoryItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleInventorySelect(item)}
                    className={`p-4 border-2 rounded-lg text-left transition ${
                      selectedInventoryItem?.id === item.id
                        ? "border-gold bg-gold/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium line-clamp-1">{item.name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.sku || 'N/A'}</p>
                    <p className="text-sm text-gray-500">
                      Stock: {item.current_stock ?? item.quantity_available ?? 0}
                    </p>
                    {(item.unit_cost || item.unit_price) && (
                      <p className="text-sm font-medium text-gold mt-1">
                        ${parseFloat(item.unit_cost || item.unit_price).toFixed(2)}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Type
                </label>
                <select
                  value={formData.listing_type}
                  onChange={(e) => handleInputChange('listing_type', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  disabled={creationMode === "inventory"}
                >
                  <option value="product">Product</option>
                  <option value="inventory">Inventory Item</option>
                  <option value="service">Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={4}
                  placeholder="Describe your item..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="new">New</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              {/* Category Selection */}
              {(formData.listing_type === "product" || formData.listing_type === "inventory") && (
                <SearchableSelect
                  label="Product Category"
                  options={productCategories}
                  value={formData.product_category}
                  onChange={(val) => handleInputChange('product_category', val)}
                  onCreateNew={handleCreateProductCategory}
                  placeholder="Search or create a category..."
                  required
                  loading={loadingCategories}
                />
              )}

              {formData.listing_type === "service" && (
                <SearchableSelect
                  label="Service Category"
                  options={serviceCategories}
                  value={formData.service_category}
                  onChange={(val) => handleInputChange('service_category', val)}
                  onCreateNew={handleCreateServiceCategory}
                  placeholder="Search or create a category..."
                  required
                  loading={loadingCategories}
                />
              )}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4">Images</h3>
            
            <div className="flex flex-wrap gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-gold text-white text-xs text-center py-0.5 rounded-b-lg">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gold hover:bg-gold/5 transition">
                <Upload size={24} className="text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={20} /> Pricing
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full border rounded-lg pl-8 pr-4 py-2"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare at Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.compare_at_price}
                    onChange={(e) => handleInputChange('compare_at_price', e.target.value)}
                    className="w-full border rounded-lg pl-8 pr-4 py-2"
                    placeholder="Original price (optional)"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Shows as discounted if higher than price</p>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package size={20} /> Inventory
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Available *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity_available}
                  onChange={(e) => handleInputChange('quantity_available', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Order Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.min_order_quantity}
                  onChange={(e) => handleInputChange('min_order_quantity', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Order Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_order_quantity}
                  onChange={(e) => handleInputChange('max_order_quantity', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="No limit"
                />
              </div>
            </div>
            
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.track_inventory}
                onChange={(e) => handleInputChange('track_inventory', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Track inventory</span>
            </label>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Truck size={20} /> Shipping
            </h3>
            
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.free_shipping}
                onChange={(e) => handleInputChange('free_shipping', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Free shipping</span>
            </label>
            
            {!formData.free_shipping && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.shipping_cost}
                      onChange={(e) => handleInputChange('shipping_cost', e.target.value)}
                      className="w-full border rounded-lg pl-8 pr-4 py-2"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Est. Delivery (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.estimated_delivery_days}
                    onChange={(e) => handleInputChange('estimated_delivery_days', e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ships From
              </label>
              <input
                type="text"
                value={formData.shipping_from_location}
                onChange={(e) => handleInputChange('shipping_from_location', e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="City, State or Country"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4">Tags</h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                className="flex-1 border rounded-lg px-4 py-2"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Status & Submit */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="draft">Save as Draft</option>
                  <option value="active">Publish Now</option>
                </select>
              </div>
              
              <div className="flex gap-4">
                <Link
                  to="/marketplace/my-listings"
                  className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold/90 disabled:bg-gray-300 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Creating...
                    </>
                  ) : (
                    'Create Listing'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
