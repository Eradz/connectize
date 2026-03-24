import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import { getCompanyByIdOrEmail } from "../../api-services/companies";
import { webRoutes } from "../../lib/webRoutes";
import Button from "../../components/ui/Button";
import Input, { Select, Textarea } from "../../components/ui/Input";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  FileText,
  Settings,
} from "lucide-react";

const PROJECT_TYPES = [
  { value: "rfp", label: "Request for Proposal (RFP)" },
  { value: "rfq", label: "Request for Quotation (RFQ)" },
  { value: "tender", label: "Tender" },
  { value: "auction", label: "Auction" },
  { value: "expression_of_interest", label: "Expression of Interest (EOI)" },
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public — visible to all companies" },
  { value: "invited", label: "Invited only — only invited companies can bid" },
  { value: "private", label: "Private — hidden, share via link" },
];

const BID_MODES = [
  { value: "open", label: "Open — bidders can see other bids" },
  { value: "sealed", label: "Sealed — bids hidden until deadline" },
  { value: "reverse_auction", label: "Reverse auction — lowest price wins" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "CAD", "AUD", "AED", "SAR"];

export default function CreateBiddingProject() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEditMode = !!editId;
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingProject, setLoadingProject] = useState(!!editId);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [userCompanies, setUserCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    project_type: "rfp",
    category: "",
    visibility: "public",
    bid_mode: "sealed",
    currency: "USD",
    budget_min: "",
    budget_max: "",
    submission_deadline: "",
    expected_award_date: "",
    company: "",
    workflow_template: "",
    terms_and_conditions: "",
    custom_fields: {},
  });

  // Custom fields that the user defines for their project
  const [customFieldDefs, setCustomFieldDefs] = useState([]);

  useEffect(() => {
    fetchTemplates();
    fetchUserCompanies();
    if (editId) fetchProject();
  }, []);

  const fetchUserCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const companies = await getCompanyByIdOrEmail();
      if (Array.isArray(companies)) {
        setUserCompanies(companies);
        // Auto-select if user has only one company and no company set yet
        if (companies.length === 1 && !form.company) {
          setForm((prev) => ({ ...prev, company: companies[0].id }));
        }
      }
    } catch {
      console.error("Failed to load companies");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchProject = async () => {
    try {
      setLoadingProject(true);
      const res = await biddingAPI.getProject(editId);
      const p = res?.data || res;
      setForm({
        title: p.title || "",
        description: p.description || "",
        project_type: p.project_type || "rfp",
        category: p.category || "",
        visibility: p.visibility || "public",
        bid_mode: p.bid_mode || "sealed",
        currency: p.currency || "USD",
        budget_min: p.budget_min || "",
        budget_max: p.budget_max || "",
        submission_deadline: p.submission_deadline ? p.submission_deadline.slice(0, 16) : "",
        expected_award_date: p.expected_award_date || "",
        company: p.company || "",
        workflow_template: p.workflow_template || "",
        terms_and_conditions: p.terms_and_conditions || "",
        custom_fields: p.custom_fields || {},
      });
      if (p.specifications?.custom_fields && Array.isArray(p.specifications.custom_fields)) {
        setCustomFieldDefs(p.specifications.custom_fields);
      }
      if (p.terms_and_conditions) setShowAdvanced(true);
    } catch {
      toast.error("Failed to load project");
      navigate(webRoutes.bidding);
    } finally {
      setLoadingProject(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await biddingAPI.getTemplates();
      const data = (res?.data || res)?.results || res?.data || [];
      setTemplates(data);
    } catch {}
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template);
    if (template) {
      setForm((prev) => ({
        ...prev,
        workflow_template: template.id,
        bid_mode: template.bid_mode || prev.bid_mode,
        project_type: template.default_project_type || prev.project_type,
      }));
      // If template has specifications with custom fields, load them
      if (template.specifications?.custom_fields && Array.isArray(template.specifications.custom_fields)) {
        setCustomFieldDefs(template.specifications.custom_fields);
      }
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomFieldChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      custom_fields: { ...prev.custom_fields, [key]: value },
    }));
  };

  // Custom field definition management
  const addCustomField = () => {
    setCustomFieldDefs((prev) => [
      ...prev,
      { key: "", label: "", type: "text", required: false, options: [] },
    ]);
  };

  const updateCustomFieldDef = (index, field, value) => {
    setCustomFieldDefs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // Auto-generate key from label
      if (field === "label") {
        updated[index].key = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, "");
      }
      return updated;
    });
  };

  const removeCustomFieldDef = (index) => {
    setCustomFieldDefs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Project title is required");
      return;
    }
    if (!form.company) {
      toast.error("Please select a company");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      // Include custom field definitions in specifications
      if (customFieldDefs.length > 0) {
        payload.specifications = {
          ...payload.specifications,
          custom_fields: customFieldDefs.filter(
            (f) => f.key && f.label
          ),
        };
      }
      // Remove empty optional fields
      if (!payload.budget_min) delete payload.budget_min;
      if (!payload.budget_max) delete payload.budget_max;
      if (!payload.workflow_template) delete payload.workflow_template;
      if (!payload.expected_award_date) delete payload.expected_award_date;

      if (isEditMode) {
        await biddingAPI.updateProject(editId, payload);
        if (publishing) {
          await biddingAPI.publishProject(editId);
          toast.success("Project published");
        } else {
          toast.success("Project updated");
        }
        navigate(webRoutes.biddingDetail.replace(":id", editId));
      } else {
        const res = await biddingAPI.createProject(payload);
        const newProject = res?.data || res;
        toast.success("Project created as draft");
        navigate(webRoutes.biddingDetail.replace(":id", newProject.id));
      }
    } catch (err) {
      const data = err?.response?.data || err;
      if (typeof data === "object") {
        Object.entries(data).forEach(([key, val]) => {
          toast.error(`${key}: ${Array.isArray(val) ? val[0] : val}`);
        });
      } else {
        toast.error("Failed to create project");
      }
    } finally {
      setLoading(false);
      setPublishing(false);
    }
  };

  if (loadingProject) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F1C644]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate(webRoutes.bidding)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {isEditMode ? "Edit Bid Project" : "Create Bid Project"}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {isEditMode
          ? "Update your draft project details."
          : "Set up a new procurement project. It will be created as a draft."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selection */}
        {templates.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-blue-600" />
              <label className="text-sm font-medium text-blue-900">
                Start from Template (optional)
              </label>
            </div>
            <Select
              value={form.workflow_template}
              onChange={(e) => handleTemplateSelect(e.target.value)}
            >
              <option value="">No template — configure manually</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.stages_count || 0} stages)
                </option>
              ))}
            </Select>
            {selectedTemplate?.description && (
              <p className="text-xs text-blue-700 mt-1">
                {selectedTemplate.description}
              </p>
            )}
          </div>
        )}

        {/* Basic Info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g. Supply of Drilling Equipment - Q2 2026"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the project scope, requirements, and deliverables..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type *
                </label>
                <Select
                  value={form.project_type}
                  onChange={(e) => handleChange("project_type", e.target.value)}
                >
                  {PROJECT_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Input
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="e.g. Equipment, Services"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Bidding Configuration */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Bidding Configuration
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <Select
                  value={form.visibility}
                  onChange={(e) => handleChange("visibility", e.target.value)}
                >
                  {VISIBILITY_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bid Mode
                </label>
                <Select
                  value={form.bid_mode}
                  onChange={(e) => handleChange("bid_mode", e.target.value)}
                >
                  {BID_MODES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <Select
                  value={form.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Budget
                </label>
                <Input
                  type="number"
                  value={form.budget_min}
                  onChange={(e) => handleChange("budget_min", e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Budget
                </label>
                <Input
                  type="number"
                  value={form.budget_max}
                  onChange={(e) => handleChange("budget_max", e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submission Deadline
                </label>
                <Input
                  type="datetime-local"
                  value={form.submission_deadline}
                  onChange={(e) =>
                    handleChange("submission_deadline", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Award Date
                </label>
                <Input
                  type="date"
                  value={form.expected_award_date}
                  onChange={(e) =>
                    handleChange("expected_award_date", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Company */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Company
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company *
            </label>
            {loadingCompanies ? (
              <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm">
                Loading companies...
              </div>
            ) : userCompanies.length === 0 ? (
              <div className="w-full px-3 py-2.5 border border-red-200 rounded-lg bg-red-50 text-red-600 text-sm">
                No companies found. You need a company to create a project.
              </div>
            ) : (
              <Select
                value={form.company}
                onChange={(e) => handleChange("company", e.target.value)}
              >
                <option value="">Select a company</option>
                {userCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </Select>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Select the company publishing this project
            </p>
          </div>
        </section>

        {/* Custom Fields Builder - CLIENT-SIDE CUSTOMIZABLE */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Custom Bid Fields
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Define additional fields that bidders must fill out
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={addCustomField}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Field
            </Button>
          </div>

          {customFieldDefs.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No custom fields defined</p>
              <p className="text-xs text-gray-400 mt-1">
                Add fields to customize what information bidders must provide
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customFieldDefs.map((field, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <GripVertical className="w-4 h-4 text-gray-400 mt-2 shrink-0 cursor-grab" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <Input
                        value={field.label}
                        onChange={(e) =>
                          updateCustomFieldDef(index, "label", e.target.value)
                        }
                        placeholder="Field label"
                      />
                    </div>
                    <Select
                      value={field.type}
                      onChange={(e) =>
                        updateCustomFieldDef(index, "type", e.target.value)
                      }
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="select">Dropdown</option>
                      <option value="textarea">Long Text</option>
                      <option value="file">File Upload</option>
                      <option value="boolean">Yes/No</option>
                    </Select>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) =>
                            updateCustomFieldDef(
                              index,
                              "required",
                              e.target.checked
                            )
                          }
                          className="rounded text-[#F1C644]"
                        />
                        Required
                      </label>
                      <button
                        type="button"
                        onClick={() => removeCustomFieldDef(index)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {field.type === "select" && (
                      <div className="sm:col-span-4">
                        <Input
                          value={(field.options || []).join(", ")}
                          onChange={(e) =>
                            updateCustomFieldDef(
                              index,
                              "options",
                              e.target.value.split(",").map((s) => s.trim())
                            )
                          }
                          placeholder="Options (comma-separated)"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Terms */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Terms & Conditions
            </h2>
            {showAdvanced ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {showAdvanced && (
            <div className="mt-4">
              <Textarea
                value={form.terms_and_conditions}
                onChange={(e) =>
                  handleChange("terms_and_conditions", e.target.value)
                }
                placeholder="Enter terms and conditions for bidders..."
                rows={6}
              />
            </div>
          )}
        </section>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate(webRoutes.bidding)}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              loading={loading && !publishing}
              className="bg-[#F1C644] hover:bg-[#E0B533] text-gray-900 font-medium px-6"
            >
              {isEditMode ? "Save Changes" : "Create Draft Project"}
            </Button>
            {isEditMode && (
              <Button
                type="button"
                loading={loading && publishing}
                className="bg-dark hover:bg-mid_grey text-white font-medium px-6"
                onClick={() => {
                  setPublishing(true);
                  document.querySelector("form").requestSubmit();
                }}
              >
                Publish
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
