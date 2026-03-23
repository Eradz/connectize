import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import { webRoutes } from "../../lib/webRoutes";
import Button from "../../components/ui/Button";
import { Input, Select, Textarea } from "../../components/ui/Input";
import Skeleton from "../../components/ui/Skeleton";
import {
  ArrowLeft,
  Send,
  DollarSign,
  FileText,
  Plus,
  Trash2,
  Upload,
  AlertTriangle,
} from "lucide-react";

export default function SubmitBid() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    total_price: "",
    currency: "USD",
    technical_proposal: "",
    bidder_company: "",
    custom_responses: {},
  });

  const [priceBreakdown, setPriceBreakdown] = useState([
    { item: "", amount: "" },
  ]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await biddingAPI.getProject(projectId);
      const data = res?.data || res;
      setProject(data);
      setForm((prev) => ({ ...prev, currency: data.currency || "USD" }));
    } catch {
      toast.error("Failed to load project");
      navigate(webRoutes.bidding);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomResponse = (key, value) => {
    setForm((prev) => ({
      ...prev,
      custom_responses: { ...prev.custom_responses, [key]: value },
    }));
  };

  // Price breakdown management
  const addBreakdownItem = () => {
    setPriceBreakdown((prev) => [...prev, { item: "", amount: "" }]);
  };

  const updateBreakdownItem = (index, field, value) => {
    setPriceBreakdown((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeBreakdownItem = (index) => {
    setPriceBreakdown((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocumentAdd = (e) => {
    const files = Array.from(e.target.files);
    setDocuments((prev) => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.total_price) {
      toast.error("Total price is required");
      return;
    }
    if (!form.bidder_company) {
      toast.error("Please select your company");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        project: projectId,
        bidder_company: form.bidder_company,
        total_price: form.total_price,
        currency: form.currency,
        technical_proposal: form.technical_proposal,
        custom_responses: form.custom_responses,
        price_breakdown: priceBreakdown
          .filter((item) => item.item && item.amount)
          .reduce((acc, item) => {
            acc[item.item] = parseFloat(item.amount);
            return acc;
          }, {}),
      };

      const res = await biddingAPI.submitBid(payload);
      const bid = res?.data || res;

      // Upload documents
      for (const file of documents) {
        try {
          await biddingAPI.uploadDocument({
            bid: bid.id,
            document_type: "technical",
            file,
          });
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      toast.success("Bid submitted successfully!");
      navigate(webRoutes.biddingProjectDetail.replace(":id", projectId));
    } catch (err) {
      const data = err?.response?.data || err;
      if (typeof data === "object" && !Array.isArray(data)) {
        Object.entries(data).forEach(([key, val]) => {
          toast.error(`${key}: ${Array.isArray(val) ? val[0] : val}`);
        });
      } else {
        toast.error("Failed to submit bid");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) return null;

  const customFields = project.custom_fields_schema || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button
        onClick={() =>
          navigate(webRoutes.biddingProjectDetail.replace(":id", projectId))
        }
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Project
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Submit Bid</h1>
      <p className="text-sm text-gray-500 mb-6">
        {project.title} · {project.reference_number}
      </p>

      {project.status !== "submission_open" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-800">
            Submissions are currently closed for this project.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Selection */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Bidding Company
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Company *
            </label>
            <Input
              value={form.bidder_company}
              onChange={(e) => handleChange("bidder_company", e.target.value)}
              placeholder="Select your company"
            />
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pricing
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    value={form.total_price}
                    onChange={(e) => handleChange("total_price", e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <Select
                  value={form.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                >
                  {["USD", "EUR", "GBP", "NGN", "CAD", "AUD", "AED", "SAR"].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </Select>
              </div>
            </div>

            {/* Price Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Price Breakdown
                </label>
                <button
                  type="button"
                  onClick={addBreakdownItem}
                  className="text-xs text-[#F1C644] hover:text-[#d4ad3a] font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Line
                </button>
              </div>
              <div className="space-y-2">
                {priceBreakdown.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item.item}
                      onChange={(e) =>
                        updateBreakdownItem(index, "item", e.target.value)
                      }
                      placeholder="Item description"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) =>
                        updateBreakdownItem(index, "amount", e.target.value)
                      }
                      placeholder="Amount"
                      className="w-32"
                      min="0"
                      step="0.01"
                    />
                    {priceBreakdown.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBreakdownItem(index)}
                        className="text-gray-400 hover:text-red-500 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technical Proposal */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Technical Proposal
          </h2>
          <Textarea
            value={form.technical_proposal}
            onChange={(e) =>
              handleChange("technical_proposal", e.target.value)
            }
            placeholder="Describe your technical approach, methodology, timeline, team qualifications..."
            rows={8}
          />
        </section>

        {/* Custom Response Fields (from project's custom_fields_schema) */}
        {customFields.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Requirements
            </h2>
            <div className="space-y-4">
              {customFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                  </label>
                  {field.type === "textarea" ? (
                    <Textarea
                      value={form.custom_responses[field.key] || ""}
                      onChange={(e) =>
                        handleCustomResponse(field.key, e.target.value)
                      }
                      rows={3}
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={form.custom_responses[field.key] || ""}
                      onChange={(e) =>
                        handleCustomResponse(field.key, e.target.value)
                      }
                    >
                      <option value="">Select...</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Select>
                  ) : field.type === "boolean" ? (
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={field.key}
                          value="true"
                          checked={form.custom_responses[field.key] === "true"}
                          onChange={() =>
                            handleCustomResponse(field.key, "true")
                          }
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={field.key}
                          value="false"
                          checked={form.custom_responses[field.key] === "false"}
                          onChange={() =>
                            handleCustomResponse(field.key, "false")
                          }
                        />
                        No
                      </label>
                    </div>
                  ) : (
                    <Input
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      value={form.custom_responses[field.key] || ""}
                      onChange={(e) =>
                        handleCustomResponse(field.key, e.target.value)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Documents */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Supporting Documents
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#F1C644] transition cursor-pointer">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">
                Click to upload documents
              </span>
              <input
                type="file"
                multiple
                onChange={handleDocumentAdd}
                className="hidden"
              />
            </label>
            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              navigate(
                webRoutes.biddingProjectDetail.replace(":id", projectId)
              )
            }
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={submitting}
            disabled={project.status !== "submission_open"}
          >
            <Send className="w-4 h-4 mr-1" />
            Submit Bid
          </Button>
        </div>
      </form>
    </div>
  );
}
