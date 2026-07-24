import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Warehouse, Plus, X, Save } from "lucide-react";
import { inventoryWarehouseService, warehouseOptionService } from "../../api-services/inventory";
import HeadingText from "../../components/HeadingText";
import { toast } from "sonner";
import { webRoutes } from "../../lib/webRoutes";

export default function CreateWarehouse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Dynamic options from API
  const [warehouseTypes, setWarehouseTypes] = useState([]);
  const [securityOptions, setSecurityOptions] = useState([]);
  const [certificationOptions, setCertificationOptions] = useState([]);

  // Inline add inputs
  const [newSecurityFeature, setNewSecurityFeature] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    warehouse_type: "",
    address: "",
    city: "",
    country: "",
    total_capacity: "",
    available_capacity: "",
    climate_controlled: false,
    security_features: [],
    certifications: [],
    contact_email: "",
    contact_phone: "",
    is_active: true,
  });

  useEffect(() => {
    loadOptions();
    if (isEdit) {
      loadWarehouse();
    }
  }, [id]);

  const loadOptions = async () => {
    try {
      const [types, security, certs] = await Promise.all([
        warehouseOptionService.getByCategory("warehouse_type"),
        warehouseOptionService.getByCategory("security_feature"),
        warehouseOptionService.getByCategory("certification"),
      ]);
      setWarehouseTypes(Array.isArray(types) ? types : types?.results || []);
      setSecurityOptions(Array.isArray(security) ? security : security?.results || []);
      setCertificationOptions(Array.isArray(certs) ? certs : certs?.results || []);
      // Set default warehouse_type if not editing
      if (!isEdit) {
        const typeList = Array.isArray(types) ? types : types?.results || [];
        if (typeList.length > 0) {
          setFormData((prev) => ({ ...prev, warehouse_type: prev.warehouse_type || typeList[0].value }));
        }
      }
    } catch (error) {
      console.error("Error loading options:", error);
      toast.error("Failed to load warehouse options");
    } finally {
      if (!isEdit) setInitialLoading(false);
    }
  };

  const loadWarehouse = async () => {
    try {
      const data = await inventoryWarehouseService.getById(id);
      setFormData({
        name: data.name || "",
        warehouse_type: data.warehouse_type || "",
        address: data.address || "",
        city: data.city || "",
        country: data.country || "",
        total_capacity: data.total_capacity?.toString() || "",
        available_capacity: data.available_capacity?.toString() || "",
        climate_controlled: data.climate_controlled || false,
        security_features: data.security_features || [],
        certifications: data.certifications || [],
        contact_email: data.contact_email || "",
        contact_phone: data.contact_phone || "",
        is_active: data.is_active ?? true,
      });
    } catch (error) {
      console.error("Error loading warehouse:", error);
      toast.error("Failed to load warehouse");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleArrayItem = (field, item) => {
    const arr = formData[field];
    if (arr.includes(item)) {
      handleInputChange(field, arr.filter((i) => i !== item));
    } else {
      handleInputChange(field, [...arr, item]);
    }
  };

  const addCustomOption = async (category, inputValue, setInputValue) => {
    const label = inputValue.trim();
    if (!label) return;

    const value = label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const targetField = category === "security_feature" ? "security_features" : "certifications";
    const setOptions = category === "security_feature" ? setSecurityOptions : setCertificationOptions;

    try {
      const created = await warehouseOptionService.create({ category, value, label });
      setOptions((prev) => [...prev, created]);
      handleInputChange(targetField, [...formData[targetField], created.label]);
      setInputValue("");
      toast.success(`Added "${label}"`);
    } catch (error) {
      // If duplicate, just toggle it on
      if (error.response?.status === 400) {
        if (!formData[targetField].includes(label)) {
          handleInputChange(targetField, [...formData[targetField], label]);
        }
        setInputValue("");
      } else {
        toast.error("Failed to add option");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a warehouse name");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Please enter an address");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("Please enter a city");
      return;
    }
    if (!formData.country.trim()) {
      toast.error("Please enter a country");
      return;
    }
    if (!formData.total_capacity || parseFloat(formData.total_capacity) <= 0) {
      toast.error("Please enter a valid total capacity");
      return;
    }
    if (!formData.contact_email.trim()) {
      toast.error("Please enter a contact email");
      return;
    }
    if (!formData.contact_phone.trim()) {
      toast.error("Please enter a contact phone");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        total_capacity: parseFloat(formData.total_capacity),
        available_capacity: formData.available_capacity
          ? parseFloat(formData.available_capacity)
          : parseFloat(formData.total_capacity),
      };

      await (isEdit
        ? inventoryWarehouseService.update(id, payload)
        : inventoryWarehouseService.create(payload));
      toast.success(isEdit ? "Warehouse updated successfully!" : "Warehouse created successfully!");
      navigate(webRoutes.inventoryWarehouses);
    } catch (error) {
      console.error("Error creating warehouse:", error);
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        (typeof error.response?.data === "object"
          ? Object.values(error.response.data).flat().join(", ")
          : "Failed to save warehouse");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <section className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={32} />
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background">
      <div className="container max-w-3xl py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to={webRoutes.inventoryWarehouses}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <HeadingText>{isEdit ? 'Edit Warehouse' : 'Create Warehouse'}</HeadingText>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Warehouse size={20} /> Basic Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="e.g. Lagos Main Warehouse"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse Type *
                </label>
                <select
                  value={formData.warehouse_type}
                  onChange={(e) =>
                    handleInputChange("warehouse_type", e.target.value)
                  }
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">Select type...</option>
                  {warehouseTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4">Location</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={2}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4">Capacity</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Capacity (m³) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.total_capacity}
                  onChange={(e) =>
                    handleInputChange("total_capacity", e.target.value)
                  }
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Capacity (m³)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.available_capacity}
                  onChange={(e) =>
                    handleInputChange("available_capacity", e.target.value)
                  }
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Defaults to total capacity"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.climate_controlled}
                onChange={(e) =>
                  handleInputChange("climate_controlled", e.target.checked)
                }
                className="rounded"
              />
              <span className="text-sm">Climate Controlled</span>
            </label>
          </div>

          {/* Security Features */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4">Security Features</h3>
            <div className="flex flex-wrap gap-2">
              {securityOptions.map((feat) => (
                <button
                  key={feat.value}
                  type="button"
                  onClick={() => toggleArrayItem("security_features", feat.label)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    formData.security_features.includes(feat.label)
                      ? "bg-gold text-dark border-gold"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gold"
                  }`}
                >
                  {feat.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newSecurityFeature}
                onChange={(e) => setNewSecurityFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addCustomOption("security_feature", newSecurityFeature, setNewSecurityFeature); }
                }}
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                placeholder="Add custom security feature..."
              />
              <button
                type="button"
                onClick={() => addCustomOption("security_feature", newSecurityFeature, setNewSecurityFeature)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {certificationOptions.map((cert) => (
                <button
                  key={cert.value}
                  type="button"
                  onClick={() => toggleArrayItem("certifications", cert.label)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    formData.certifications.includes(cert.label)
                      ? "bg-gold text-dark border-gold"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gold"
                  }`}
                >
                  {cert.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addCustomOption("certification", newCertification, setNewCertification); }
                }}
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                placeholder="Add custom certification..."
              />
              <button
                type="button"
                onClick={() => addCustomOption("certification", newCertification, setNewCertification)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4">Contact Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    handleInputChange("contact_email", e.target.value)
                  }
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) =>
                    handleInputChange("contact_phone", e.target.value)
                  }
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    handleInputChange("is_active", e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">Active</span>
              </label>

              <div className="flex gap-4">
                <Link
                  to={webRoutes.inventoryWarehouses}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gold text-dark rounded-lg hover:bg-gold/90 disabled:bg-gray-300 flex items-center gap-2"
                >         
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {isEdit ? 'Saving...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {isEdit ? <Save size={20} /> : <Plus size={20} />}
                      {isEdit ? 'Save Changes' : 'Create Warehouse'}
                    </>
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
