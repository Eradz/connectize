import React, { useState, useEffect, useMemo } from "react";
import { toast as notify } from "sonner";
import { makeApiRequest } from "../../lib/helpers";
import Modal from "../ui/Modal";
import CurrencyPicker from "../CurrencyPicker";
import { getCurrencySymbol } from "../../utils/currency";
import { 
  Plus, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  PieChart,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";

// Valuation method display names and descriptions
const VALUATION_METHODS = {
  dcf: { 
    label: "Discounted Cash Flow", 
    description: "Projects future cash flows and discounts to present value",
    icon: TrendingUp,
    color: "text-blue-600"
  },
  comparable: { 
    label: "Comparable Analysis", 
    description: "Compares to similar transactions in the market",
    icon: BarChart3,
    color: "text-green-600"
  },
  asset_based: { 
    label: "Asset Based", 
    description: "Values based on underlying asset values",
    icon: PieChart,
    color: "text-purple-600"
  },
  market_multiple: { 
    label: "Market Multiple", 
    description: "Applies industry multiples to key metrics",
    icon: Calculator,
    color: "text-orange-600"
  },
  risk_adjusted: { 
    label: "Risk Adjusted NPV", 
    description: "NPV adjusted for project-specific risks",
    icon: AlertCircle,
    color: "text-red-600"
  },
};

// Format currency values
function formatCurrency(value, currency = "USD") {
  const symbol = getCurrencySymbol(currency);
  const numValue = parseFloat(value) || 0;

  if (numValue >= 1000000000) {
    return `${symbol}${(numValue / 1000000000).toFixed(2)}B`;
  } else if (numValue >= 1000000) {
    return `${symbol}${(numValue / 1000000).toFixed(2)}M`;
  } else if (numValue >= 1000) {
    return `${symbol}${(numValue / 1000).toFixed(2)}K`;
  }
  return `${symbol}${numValue.toLocaleString()}`;
}

// Format date
function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ValuationsPanel({ dealRoomId, canEdit = false }) {
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingValuation, setEditingValuation] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    valuation_method: "dcf",
    base_value: "",
    adjusted_value: "",
    currency: "USD",
    notes: "",
    assumptions: {},
    is_final: false,
  });

  // Assumptions editor state
  const [assumptionKey, setAssumptionKey] = useState("");
  const [assumptionValue, setAssumptionValue] = useState("");

  // Fetch valuations
  useEffect(() => {
    fetchValuations();
  }, [dealRoomId]);

  async function fetchValuations() {
    if (!dealRoomId) return;
    setLoading(true);
    try {
      const res = await makeApiRequest({
        url: "api/v1/deals/valuations/",
        method: "GET",
        params: { deal_room: dealRoomId },
      });
      setValuations(res?.results || res?.data || res || []);
    } catch (error) {
      console.error("Error fetching valuations:", error);
      notify.error("Failed to load valuations");
    } finally {
      setLoading(false);
    }
  }

  // Reset form
  function resetForm() {
    setFormData({
      valuation_method: "dcf",
      base_value: "",
      adjusted_value: "",
      currency: "USD",
      notes: "",
      assumptions: {},
      is_final: false,
    });
    setAssumptionKey("");
    setAssumptionValue("");
  }

  // Add assumption to form
  function addAssumption() {
    if (!assumptionKey.trim()) return;
    setFormData(prev => ({
      ...prev,
      assumptions: {
        ...prev.assumptions,
        [assumptionKey.trim()]: assumptionValue.trim(),
      },
    }));
    setAssumptionKey("");
    setAssumptionValue("");
  }

  // Remove assumption from form
  function removeAssumption(key) {
    setFormData(prev => {
      const newAssumptions = { ...prev.assumptions };
      delete newAssumptions[key];
      return { ...prev, assumptions: newAssumptions };
    });
  }

  // Create valuation
  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        deal_room: dealRoomId,
        valuation_method: formData.valuation_method,
        base_value: parseFloat(formData.base_value) || 0,
        adjusted_value: parseFloat(formData.adjusted_value) || parseFloat(formData.base_value) || 0,
        currency: formData.currency,
        assumptions: formData.assumptions,
        notes: formData.notes,
        is_final: formData.is_final,
      };
      
      await makeApiRequest({
        url: "api/v1/deals/valuations/",
        method: "POST",
        data: payload,
      });
      
      notify.success("Valuation created successfully");
      setShowCreateModal(false);
      resetForm();
      fetchValuations();
    } catch (error) {
      console.error("Error creating valuation:", error);
      notify.error(error?.response?.data?.detail || "Failed to create valuation");
    } finally {
      setSubmitting(false);
    }
  }

  // Update valuation
  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingValuation?.id) return;
    setSubmitting(true);
    try {
      const payload = {
        deal_room: dealRoomId,
        valuation_method: formData.valuation_method,
        base_value: parseFloat(formData.base_value) || 0,
        adjusted_value: parseFloat(formData.adjusted_value) || parseFloat(formData.base_value) || 0,
        currency: formData.currency,
        assumptions: formData.assumptions,
        notes: formData.notes,
        is_final: formData.is_final,
      };
      
      await makeApiRequest({
        url: `api/v1/deals/valuations/${editingValuation.id}/`,
        method: "PUT",
        data: payload,
      });
      
      notify.success("Valuation updated successfully");
      setShowEditModal(false);
      setEditingValuation(null);
      resetForm();
      fetchValuations();
    } catch (error) {
      console.error("Error updating valuation:", error);
      notify.error(error?.response?.data?.detail || "Failed to update valuation");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete valuation
  async function handleDelete() {
    if (!editingValuation?.id) return;
    setSubmitting(true);
    try {
      await makeApiRequest({
        url: `api/v1/deals/valuations/${editingValuation.id}/`,
        method: "DELETE",
      });
      
      notify.success("Valuation deleted");
      setShowDeleteModal(false);
      setEditingValuation(null);
      fetchValuations();
    } catch (error) {
      console.error("Error deleting valuation:", error);
      notify.error("Failed to delete valuation");
    } finally {
      setSubmitting(false);
    }
  }

  // Mark as final
  async function toggleFinal(valuation) {
    try {
      await makeApiRequest({
        url: `api/v1/deals/valuations/${valuation.id}/`,
        method: "PATCH",
        data: { is_final: !valuation.is_final },
      });
      
      notify.success(valuation.is_final ? "Marked as draft" : "Marked as final");
      fetchValuations();
    } catch (error) {
      console.error("Error toggling final:", error);
      notify.error("Failed to update status");
    }
  }

  // Open edit modal
  function openEditModal(valuation) {
    setEditingValuation(valuation);
    setFormData({
      valuation_method: valuation.valuation_method || "dcf",
      base_value: valuation.base_value || "",
      adjusted_value: valuation.adjusted_value || "",
      currency: valuation.currency || "USD",
      notes: valuation.notes || "",
      assumptions: valuation.assumptions || {},
      is_final: valuation.is_final || false,
    });
    setShowEditModal(true);
  }

  // Toggle card expansion
  function toggleExpanded(id) {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  // Summary stats
  const summary = useMemo(() => {
    if (!valuations.length) return null;
    
    const finalValuations = valuations.filter(v => v.is_final);
    const latestFinal = finalValuations.length > 0 
      ? finalValuations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0]
      : null;
    
    const avgBase = valuations.reduce((sum, v) => sum + (parseFloat(v.base_value) || 0), 0) / valuations.length;
    const avgAdjusted = valuations.reduce((sum, v) => sum + (parseFloat(v.adjusted_value) || 0), 0) / valuations.length;
    
    const methods = [...new Set(valuations.map(v => v.valuation_method))];
    
    return {
      total: valuations.length,
      finalCount: finalValuations.length,
      latestFinal,
      avgBase,
      avgAdjusted,
      methods,
      primaryCurrency: latestFinal?.currency || valuations[0]?.currency || "USD",
    };
  }, [valuations]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-36 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Valuations</h2>
          <p className="text-sm text-gray-500">
            {valuations.length} valuation{valuations.length !== 1 ? "s" : ""} • 
            {summary?.finalCount || 0} marked as final
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchValuations}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {canEdit && (
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F1C644] hover:bg-[#FFCF3F] text-gray-900 font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Valuation</span>
          </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Final Valuation */}
          <div className="bg-gradient-to-br from-[#FFE7A4] to-[#F1C644]/30 border border-[#F1C644]/40 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 text-xs font-medium uppercase tracking-wide mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Final Valuation
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {summary.latestFinal 
                ? formatCurrency(summary.latestFinal.adjusted_value || summary.latestFinal.base_value, summary.latestFinal.currency)
                : "—"
              }
            </div>
            {summary.latestFinal && (
              <div className="text-xs text-gray-500 mt-1">
                {VALUATION_METHODS[summary.latestFinal.valuation_method]?.label || summary.latestFinal.valuation_method}
              </div>
            )}
          </div>

          {/* Average Valuation */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 text-xs font-medium uppercase tracking-wide mb-1">
              <Calculator className="h-3.5 w-3.5" />
              Average (Adjusted)
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.avgAdjusted, summary.primaryCurrency)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Base: {formatCurrency(summary.avgBase, summary.primaryCurrency)}
            </div>
          </div>

          {/* Methods Used */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 text-xs font-medium uppercase tracking-wide mb-1">
              <BarChart3 className="h-3.5 w-3.5" />
              Methods Used
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {summary.methods.length}
            </div>
            <div className="text-xs text-gray-500 mt-1 truncate">
              {summary.methods.map(m => VALUATION_METHODS[m]?.label || m).join(", ")}
            </div>
          </div>

          {/* Total Valuations */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 text-xs font-medium uppercase tracking-wide mb-1">
              <FileText className="h-3.5 w-3.5" />
              Total Reports
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {summary.total}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {summary.finalCount} final, {summary.total - summary.finalCount} draft
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {valuations.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Valuations Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first valuation to track the estimated value of this deal using various methods.
          </p>
          {canEdit && (
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F1C644] hover:bg-[#FFCF3F] text-gray-900 font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Valuation</span>
          </button>
          )}
        </div>
      )}

      {/* Valuations List */}
      {valuations.length > 0 && (
        <div className="space-y-3">
          {valuations.map((valuation) => {
            const method = VALUATION_METHODS[valuation.valuation_method] || {};
            const MethodIcon = method.icon || Calculator;
            const isExpanded = expandedCards[valuation.id];
            const assumptions = valuation.assumptions || {};
            const assumptionKeys = Object.keys(assumptions);
            
            return (
              <div
                key={valuation.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  valuation.is_final 
                    ? "border-[#F1C644] ring-1 ring-[#F1C644]/20" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Card Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg bg-gray-50 ${method.color || "text-gray-600"}`}>
                        <MethodIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-gray-900">
                            {method.label || valuation.valuation_method}
                          </h3>
                          {valuation.is_final && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F1C644]/20 text-[#8B6914] text-xs font-medium rounded-full">
                              <CheckCircle2 className="h-3 w-3" />
                              Final
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {method.description || "Valuation analysis"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(valuation.adjusted_value || valuation.base_value, valuation.currency)}
                      </div>
                      {valuation.adjusted_value && valuation.base_value && valuation.adjusted_value !== valuation.base_value && (
                        <div className="text-xs text-gray-500">
                          Base: {formatCurrency(valuation.base_value, valuation.currency)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Currency: {valuation.currency}</span>
                    <span>•</span>
                    <span>Updated: {formatDate(valuation.updated_at)}</span>
                    {assumptionKeys.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{assumptionKeys.length} assumption{assumptionKeys.length !== 1 ? "s" : ""}</span>
                      </>
                    )}
                  </div>

                  {/* Notes Preview */}
                  {valuation.notes && !isExpanded && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {valuation.notes}
                    </p>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                    {/* Notes */}
                    {valuation.notes && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Notes</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{valuation.notes}</p>
                      </div>
                    )}

                    {/* Assumptions */}
                    {assumptionKeys.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Assumptions</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {assumptionKeys.map((key) => (
                            <div key={key} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-sm text-gray-600">{key}</span>
                              <span className="text-sm font-medium text-gray-900">{assumptions[key]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
                      <span>Created: {formatDate(valuation.created_at)}</span>
                      {valuation.created_by_name && (
                        <>
                          <span>•</span>
                          <span>By: {valuation.created_by_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => toggleExpanded(valuation.id)}
                    className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span>Show Less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>Show Details</span>
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {canEdit && (
                    <>
                    <button
                      onClick={() => toggleFinal(valuation)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        valuation.is_final
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-[#F1C644]/20 text-[#8B6914] hover:bg-[#F1C644]/30"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{valuation.is_final ? "Unmark Final" : "Mark Final"}</span>
                    </button>
                    <button
                      onClick={() => openEditModal(valuation)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingValuation(valuation);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Create & Edit Modals */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          if (showCreateModal) setShowCreateModal(false);
          if (showEditModal) {
            setShowEditModal(false);
            setEditingValuation(null);
          }
        }}
        title={showCreateModal ? "Create Valuation" : "Edit Valuation"}
        size="lg"
        className="max-h-[90vh] overflow-y-scroll scrollbar-hidden"
      >
        <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="space-y-5">
          {/* Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valuation Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(VALUATION_METHODS).map(([key, method]) => {
                const Icon = method.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, valuation_method: key }))}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                      formData.valuation_method === key
                        ? "border-[#F1C644] bg-[#F1C644]/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${method.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{method.label}</div>
                      <div className="text-xs text-gray-500 truncate">{method.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.base_value}
                onChange={(e) => setFormData(prev => ({ ...prev, base_value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F1C644] focus:border-[#F1C644] outline-none"
                placeholder="0"
                min="0"
                step="1000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjusted Value
              </label>
              <input
                type="number"
                value={formData.adjusted_value}
                onChange={(e) => setFormData(prev => ({ ...prev, adjusted_value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F1C644] focus:border-[#F1C644] outline-none"
                placeholder="Leave empty to use base"
                min="0"
                step="1000"
              />
            </div>
            <CurrencyPicker
              value={formData.currency}
              onChange={(code) => setFormData(prev => ({ ...prev, currency: code }))}
            />
          </div>

          {/* Assumptions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assumptions
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={assumptionKey}
                onChange={(e) => setAssumptionKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAssumption())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F1C644] focus:border-[#F1C644] outline-none text-sm"
                placeholder="e.g., Discount Rate"
              />
              <input
                type="text"
                value={assumptionValue}
                onChange={(e) => setAssumptionValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAssumption())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F1C644] focus:border-[#F1C644] outline-none text-sm"
                placeholder="e.g., 10%"
              />
              <button
                type="button"
                onClick={addAssumption}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {Object.keys(formData.assumptions).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(formData.assumptions).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-sm"
                  >
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium text-gray-900">{value}</span>
                    <button
                      type="button"
                      onClick={() => removeAssumption(key)}
                      className="ml-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F1C644] focus:border-[#F1C644] outline-none resize-none"
              rows={3}
              placeholder="Additional notes, methodology details, or justifications..."
            />
          </div>

          {/* Mark as Final */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_final}
              onChange={(e) => setFormData(prev => ({ ...prev, is_final: e.target.checked }))}
              className="w-4 h-4 text-[#F1C644] border-gray-300 rounded focus:ring-[#F1C644]"
            />
            <span className="text-sm text-gray-700">Mark as final valuation</span>
          </label>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (showCreateModal) setShowCreateModal(false);
                if (showEditModal) {
                  setShowEditModal(false);
                  setEditingValuation(null);
                }
              }}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#F1C644] hover:bg-[#FFCF3F] text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? (showCreateModal ? "Creating..." : "Saving...") : (showCreateModal ? "Create Valuation" : "Save Changes")}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setEditingValuation(null);
        }}
        title="Delete Valuation"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this valuation? This action cannot be undone.
          </p>
          {editingValuation && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium text-gray-900">
                {VALUATION_METHODS[editingValuation.valuation_method]?.label || editingValuation.valuation_method}
              </div>
              <div className="text-sm text-gray-500">
                {formatCurrency(editingValuation.adjusted_value || editingValuation.base_value, editingValuation.currency)}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setEditingValuation(null);
              }}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

