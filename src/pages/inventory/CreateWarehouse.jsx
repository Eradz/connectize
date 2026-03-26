import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Warehouse, Plus, X } from "lucide-react";
import { inventoryWarehouseService } from "../../api-services/inventory";
import HeadingText from "../../components/HeadingText";
import { toast } from "sonner";
import { webRoutes } from "../../lib/webRoutes";

const WAREHOUSE_TYPES = [
  { value: "general", label: "General Purpose" },
  { value: "hazmat", label: "Hazardous Materials" },
  { value: "refrigerated", label: "Refrigerated" },
  { value: "bulk_liquid", label: "Bulk Liquid" },
  { value: "equipment", label: "Equipment Storage" },
  { value: "offshore", label: "Offshore Platform" },
];

const SECURITY_OPTIONS = [
  "24/7 CCTV",
  "Armed Guards",
  "Biometric Access",
  "Fire Suppression",
  "Perimeter Fencing",
  "Alarm System",
  "Access Logging",
];

const CERTIFICATION_OPTIONS = [
  "ISO 9001",
  "ISO 14001",
  "OHSAS 18001",
  "Bonded Warehouse",
  "GDP Certified",
  "IATA Certified",
  "TAPA Certified",
  "C-TPAT Certified",
];

export default function CreateWarehouse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    warehouse_type: "general",
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

      await inventoryWarehouseService.create(payload);
      toast.success("Warehouse created successfully!");
      navigate(webRoutes.inventoryWarehouses);
    } catch (error) {
      console.error("Error creating warehouse:", error);
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        (typeof error.response?.data === "object"
          ? Object.values(error.response.data).flat().join(", ")
          : "Failed to create warehouse");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
          <HeadingText>Create Warehouse</HeadingText>
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
                  {WAREHOUSE_TYPES.map((t) => (
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
              {SECURITY_OPTIONS.map((feat) => (
                <button
                  key={feat}
                  type="button"
                  onClick={() => toggleArrayItem("security_features", feat)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    formData.security_features.includes(feat)
                      ? "bg-gold text-white border-gold"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gold"
                  }`}
                >
                  {feat}
                </button>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-4">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATION_OPTIONS.map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => toggleArrayItem("certifications", cert)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    formData.certifications.includes(cert)
                      ? "bg-gold text-white border-gold"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gold"
                  }`}
                >
                  {cert}
                </button>
              ))}
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
                  className="px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold/90 disabled:bg-gray-300 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Create Warehouse
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
