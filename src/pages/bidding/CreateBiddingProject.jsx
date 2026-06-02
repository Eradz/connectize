import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import {
  getDefaultBiddingDocumentType,
  normalizeBiddingDocumentTypes,
} from "../../lib/biddingDocumentTypes";
import { webRoutes } from "../../lib/webRoutes";
import Button from "../../components/ui/Button";
import Input, { Select, Textarea } from "../../components/ui/Input";
import CurrencyPicker from "../../components/CurrencyPicker";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  FileText,
  Settings,
  Upload,
  Paperclip,
} from "lucide-react";

const PROJECT_TYPES = [
  { value: "rfp", label: "Request for Proposal (RFP)" },
  { value: "rfq", label: "Request for Quotation (RFQ)" },
  { value: "itb", label: "Invitation to Bid (ITB)" },
  { value: "eoi", label: "Expression of Interest (EOI)" },
  { value: "rfi", label: "Request for Information (RFI)" },
  { value: "reverse_auction", label: "Reverse Auction" },
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public - all companies can discover and bid" },
  { value: "invited", label: "Private - invited companies only" },
  { value: "prequalified", label: "Prequalified - qualified suppliers only" },
];

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const normalizeDateTimeForApi = (value, fallbackHour = 12) => {
  if (!value) return "";
  const trimmed = String(value).trim();
  const dateOnlyMatch = trimmed.match(DATE_ONLY_RE);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      fallbackHour,
      fallbackHour === 23 ? 59 : 0,
      fallbackHour === 23 ? 59 : 0,
      fallbackHour === 23 ? 999 : 0
    ).toISOString();
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString();
};

const normalizePaginatedList = (payload) => {
  const data = payload?.data ?? payload;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data?.results)) return data.data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const dedupeById = (items) => {
  const seen = new Set();
  return items.filter((item, index) => {
    const key = item?.id == null ? `index-${index}` : String(item.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export default function CreateBiddingProject() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEditMode = !!editId;
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingProject, setLoadingProject] = useState(!!editId);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [userCompanies, setUserCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [prequalSchemes, setPrequalSchemes] = useState([]);
  const [prequalSchemesCompany, setPrequalSchemesCompany] = useState("");
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [envelopeConfig, setEnvelopeConfig] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [projectDocuments, setProjectDocuments] = useState([]);
  const submitIntentRef = useRef("draft");
  // Each entry: { file: File, title: string, document_type: string }

  const [form, setForm] = useState({
    title: "",
    description: "",
    project_type: "rfp",
    category: "",
    visibility: "public",
    currency: "USD",
    budget_min: "",
    budget_max: "",
    submission_deadline: "",
    expected_award_date: "",
    company: "",
    workflow_template: "",
    terms_and_conditions: "",
    custom_fields: {},
    required_prequalification_scheme_id: "",
    local_content_weight: "",
    local_content_minimum: "",
    allow_bid_amendments: true,
  });

  // Custom fields that the user defines for their project
  const [customFieldDefs, setCustomFieldDefs] = useState([]);

  useEffect(() => {
    fetchTemplates();
    fetchUserCompanies();
    fetchDocumentTypes();
    if (editId) fetchProject();
  }, []);

  useEffect(() => {
    fetchPrequalSchemes(form.company);
  }, [form.company]);

  useEffect(() => {
    if (!form.required_prequalification_scheme_id) return;
    if (String(prequalSchemesCompany) !== String(form.company)) return;
    const hasSelectedScheme = prequalSchemes.some(
      (scheme) => String(scheme.id) === String(form.required_prequalification_scheme_id)
    );
    if (!hasSelectedScheme) {
      setForm((prev) => ({ ...prev, required_prequalification_scheme_id: "" }));
    }
  }, [
    form.company,
    form.required_prequalification_scheme_id,
    prequalSchemes,
    prequalSchemesCompany,
  ]);

  const defaultDocumentType = getDefaultBiddingDocumentType(documentTypeOptions);

  const fetchUserCompanies = async () => {
    try {
      setLoadingCompanies(true);
      // Use bidding-specific endpoint so representatives (not just owners) are included
      const res = await biddingAPI.getAccessibleCompanies();
      const companies = Array.isArray(res?.data) ? res.data : res?.data?.results || [];
      setUserCompanies(companies);
      // Auto-select if user has only one company and no company set yet
      if (companies.length === 1 && !form.company) {
        setForm((prev) => ({ ...prev, company: companies[0].id }));
      }
    } catch {
      console.error("Failed to load companies");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchPrequalSchemes = async (companyId) => {
    const normalizedCompanyId = companyId ? String(companyId) : "";
    if (!companyId) {
      setPrequalSchemes([]);
      setPrequalSchemesCompany("");
      return;
    }
    try {
      const res = await biddingAPI.getPrequalificationSchemes({
        active: true,
        company: companyId,
        page_size: 50,
      });
      setPrequalSchemes(res.data?.results || res.data || []);
      setPrequalSchemesCompany(normalizedCompanyId);
    } catch {
      setPrequalSchemes([]);
      // non-critical
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const res = await biddingAPI.getDocumentTypes({ page_size: 50 });
      setDocumentTypeOptions(normalizeBiddingDocumentTypes(res));
    } catch {
      setDocumentTypeOptions([]);
    }
  };

  const fetchProject = async () => {
    try {
      setLoadingProject(true);
      const res = await biddingAPI.getProject(editId);
      const p = res?.data || res;
      setEditProject(p);
      setForm({
        title: p.title || "",
        description: p.description || "",
        project_type: p.project_type || "rfp",
        category: p.category || "",
        visibility: p.visibility || "public",
        currency: p.currency || "USD",
        budget_min: p.budget_min || "",
        budget_max: p.budget_max || "",
        submission_deadline: p.submission_deadline ? p.submission_deadline.slice(0, 16) : "",
        expected_award_date: p.expected_award_date || "",
        company: p.company || "",
        workflow_template: p.workflow_template || "",
        terms_and_conditions: p.terms_and_conditions || "",
        custom_fields: p.custom_fields || {},
        required_prequalification_scheme_id: p.required_prequalification_scheme?.id || p.required_prequalification_scheme_id || "",
        allow_bid_amendments: p.allow_bid_amendments !== false,
      });
      if (p.specifications?.custom_fields && Array.isArray(p.specifications.custom_fields)) {
        setCustomFieldDefs(p.specifications.custom_fields);
      }
      if (Array.isArray(p.required_documents)) {
        setRequiredDocuments(p.required_documents.map((doc) => ({ label: doc })));
      }
      if (p.terms_and_conditions) setShowAdvanced(true);
      if (Array.isArray(p.envelope_configuration) && p.envelope_configuration.length > 0) {
        setEnvelopeConfig(p.envelope_configuration);
      }
      if (p.company) {
        setUserCompanies((prev) => {
          const companyId = String(p.company);
          if (prev.some((company) => String(company.id) === companyId)) return prev;
          return [
            ...prev,
            {
              id: companyId,
              company_name: p.company_name || p.owner_company_name || `Company #${companyId}`,
            },
          ];
        });
      }
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
      setTemplates(dedupeById(normalizePaginatedList(res)));
    } catch {}
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template);
    if (template) {
      setForm((prev) => ({
        ...prev,
        workflow_template: template.id,
        project_type: template.default_project_type || prev.project_type,
      }));
      // If template has specifications with custom fields, load them
      if (template.specifications?.custom_fields && Array.isArray(template.specifications.custom_fields)) {
        setCustomFieldDefs(template.specifications.custom_fields);
      }
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "company" ? { required_prequalification_scheme_id: "" } : {}),
    }));
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

  const addRequiredDocument = () => {
    setRequiredDocuments((prev) => [...prev, { label: "" }]);
  };

  const updateRequiredDocument = (index, value) => {
    setRequiredDocuments((prev) => {
      const updated = [...prev];
      updated[index] = { label: value };
      return updated;
    });
  };

  const removeRequiredDocument = (index) => {
    setRequiredDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Project document file attachments
  const addProjectDocument = (files) => {
    const newDocs = Array.from(files).map((file) => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ""),
      document_type: defaultDocumentType,
    }));
    setProjectDocuments((prev) => [...prev, ...newDocs]);
  };

  const updateProjectDocument = (index, field, value) => {
    setProjectDocuments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeProjectDocument = (index) => {
    setProjectDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadProjectDocuments = async (projectId) => {
    if (projectDocuments.length === 0) return;
    const results = await Promise.allSettled(
      projectDocuments.map((doc) =>
        biddingAPI.uploadDocument({
          project: projectId,
          title: doc.title,
          document_type: doc.document_type,
          file: doc.file,
        })
      )
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      toast.warning(`${failed} of ${projectDocuments.length} document(s) failed to upload. You can upload them from the project details page.`);
    }
  };

  const isProjectCompanyLocked =
    isEditMode &&
    editProject &&
    (editProject.status !== "draft" || Number(editProject.bids_count || 0) > 0);
  const prequalificationHint = !form.company
    ? "Select a project company first, or create a scheme from Prequalification and return here."
    : prequalSchemes.length > 0
      ? "Only schemes created for the selected company are shown here."
      : "This company has no prequalification schemes yet. Create one if you want to restrict bidding to qualified suppliers.";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const shouldPublish = submitIntentRef.current === "publish";

    if (!form.title.trim()) {
      toast.error("Project title is required");
      return;
    }
    if (!form.company) {
      toast.error("Please select a company");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Project description is required");
      return;
    }
    if (!form.submission_deadline) {
      toast.error("Submission deadline is required");
      return;
    }

    setLoading(true);
    setPublishing(shouldPublish);
    try {
      const payload = { ...form };
      if (payload.submission_deadline) {
        payload.submission_deadline = normalizeDateTimeForApi(payload.submission_deadline, 23);
      }
      if (payload.expected_award_date) {
        payload.expected_award_date = normalizeDateTimeForApi(payload.expected_award_date, 12);
      }
      if (isProjectCompanyLocked) {
        delete payload.company;
      }
      // Include custom field definitions in specifications
      if (customFieldDefs.length > 0) {
        payload.specifications = {
          ...payload.specifications,
          custom_fields: customFieldDefs.filter(
            (f) => f.key && f.label
          ),
        };
      }
      payload.required_documents = requiredDocuments
        .map((doc) => doc.label.trim())
        .filter(Boolean);
      // Remove empty optional fields
      if (!payload.budget_min) delete payload.budget_min;
      if (!payload.budget_max) delete payload.budget_max;
      if (!payload.workflow_template) delete payload.workflow_template;
      if (!payload.expected_award_date) delete payload.expected_award_date;
      if (!payload.required_prequalification_scheme_id) payload.required_prequalification_scheme_id = null;
      payload.envelope_configuration = envelopeConfig.filter(e => e.type);

      if (isEditMode) {
        await biddingAPI.updateProject(editId, payload);
        await uploadProjectDocuments(editId);
        if (shouldPublish) {
          await biddingAPI.publishProject(editId);
          toast.success("Project published");
        } else {
          toast.success("Project updated");
        }
        navigate(webRoutes.biddingDetail.replace(":id", editId));
      } else {
        const res = await biddingAPI.createProject(payload);
        const newProject = res?.data || res;
        if (!newProject?.id) {
          // Creation failed (400 validation, etc.) — makeApiRequest already showed a toast
          return;
        }
        // Upload attached documents
        await uploadProjectDocuments(newProject.id);
        if (shouldPublish) {
          await biddingAPI.publishProject(newProject.id);
          toast.success("Project published");
        } else {
          toast.success("Project created as draft");
        }
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
      submitIntentRef.current = "draft";
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
          ? isProjectCompanyLocked
            ? "Update project details. Company is locked after publishing."
            : "Update your draft project details."
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
              {templates.map((t, index) => (
                <option key={t.id || `workflow-template-${index}`} value={t.id}>
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
                  Supplier Access
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
                <p className="mt-1 text-xs text-gray-500">
                  Choose Private when only selected or invited companies should be able to view and bid.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                <input
                  type="checkbox"
                  id="allow_bid_amendments"
                  checked={form.allow_bid_amendments}
                  onChange={(e) => handleChange("allow_bid_amendments", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                />
                <label htmlFor="allow_bid_amendments" className="cursor-pointer">
                  <p className="text-sm font-medium text-gray-900">Allow Bid Amendments</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Bidders can edit their submission while the project is open
                  </p>
                </label>
              </div>
            </div>

            <CurrencyPicker
              value={form.currency}
              onChange={(code) => handleChange("currency", code)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Budget <span className="text-gray-400 font-normal">(Optional)</span>
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
                  Max Budget <span className="text-gray-400 font-normal">(Optional)</span>
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
                  Expected Award Date <span className="text-gray-400 font-normal">(Optional)</span>
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

        {/* Required Documents */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Required Bid Documents
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Define the document checklist every bidder must provide before final submission.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={addRequiredDocument}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Document
            </Button>
          </div>

          {requiredDocuments.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No required documents defined</p>
              <p className="text-xs text-gray-400 mt-1">
                Add items like Technical proposal, Commercial schedule, or HSE certificate.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requiredDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                  <Input
                    value={doc.label}
                    onChange={(e) => updateRequiredDocument(index, e.target.value)}
                    placeholder="e.g. Technical proposal"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeRequiredDocument(index)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Project Documents (ITT/RFP Attachments) */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Project Documents
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Attach ITT, RFP, scope of work, or other tender documents for bidders to download.
              </p>
            </div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Upload Files
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files?.length) addProjectDocument(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          {projectDocuments.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <Paperclip className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No documents attached</p>
              <p className="text-xs text-gray-400 mt-1">
                Upload scope documents, drawings, specifications, or tender packages for bidders.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {projectDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-600 truncate flex-1">{doc.file.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {(doc.file.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeProjectDocument(index)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={doc.title}
                      onChange={(e) => updateProjectDocument(index, "title", e.target.value)}
                      placeholder="Document title"
                    />
                    <Select
                      value={doc.document_type}
                      onChange={(e) => updateProjectDocument(index, "document_type", e.target.value)}
                    >
                      {documentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                disabled={isProjectCompanyLocked}
              >
                <option value="">Select a company</option>
                {userCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name || c.name || `Company #${c.id}`}
                  </option>
                ))}
              </Select>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {isProjectCompanyLocked
                ? "Project company is locked after publishing or receiving bids."
                : "Select the company publishing this project"}
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

        {/* Prequalification */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Prequalification Requirement
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Require suppliers to be prequalified before they can bid.
          </p>
          <Select
            value={form.required_prequalification_scheme_id}
            onChange={(e) =>
              handleChange("required_prequalification_scheme_id", e.target.value)
            }
            disabled={!form.company}
          >
            <option value="">None — any supplier can bid</option>
            {prequalSchemes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.industry_category?.replace(/_/g, " ")})
              </option>
            ))}
          </Select>
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm text-gray-600">{prequalificationHint}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                navigate(webRoutes.biddingPrequalification, {
                  state: {
                    openCreate: true,
                    companyId: form.company || "",
                  },
                })
              }
            >
              <Plus size={14} className="mr-1" />
              Create prequalification scheme
            </Button>
          </div>
        </section>

        {/* Multi-Envelope Configuration */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Multi-Envelope Evaluation
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Split bids into sealed envelopes evaluated sequentially (e.g. Technical then Commercial).
          </p>
          {envelopeConfig.map((env, idx) => {
            const presetTypes = ["technical", "commercial", "hse", "financial"];
            const isCustom = env.type && !presetTypes.includes(env.type);
            const selectValue = isCustom ? "__custom__" : env.type;
            return (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <select
                  value={selectValue}
                  onChange={(e) => {
                    const updated = [...envelopeConfig];
                    if (e.target.value === "__custom__") {
                      updated[idx] = { ...updated[idx], type: "" };
                    } else {
                      updated[idx] = { ...updated[idx], type: e.target.value };
                    }
                    setEnvelopeConfig(updated);
                  }}
                  className={`${isCustom ? "w-32" : "flex-1"} min-w-0 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F1C644] appearance-none`}
                >
                  <option value="">Select type</option>
                  <option value="technical">Technical</option>
                  <option value="commercial">Commercial</option>
                  <option value="hse">HSE</option>
                  <option value="financial">Financial</option>
                  <option value="__custom__">Other (Custom)</option>
                </select>
                {(selectValue === "__custom__") && (
                  <input
                    type="text"
                    placeholder="Custom type name"
                    value={env.type}
                    onChange={(e) => {
                      const updated = [...envelopeConfig];
                      updated[idx] = { ...updated[idx], type: e.target.value.toLowerCase().replace(/\s+/g, '_') };
                      setEnvelopeConfig(updated);
                    }}
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F1C644]"
                  />
                )}
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Weight %"
                  value={env.weight || ""}
                  onChange={(e) => {
                    const updated = [...envelopeConfig];
                    updated[idx] = { ...updated[idx], weight: parseInt(e.target.value) || 0 };
                    setEnvelopeConfig(updated);
                  }}
                  className="!w-28"
                />
                <button
                  type="button"
                  onClick={() => setEnvelopeConfig(envelopeConfig.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() =>
              setEnvelopeConfig([
                ...envelopeConfig,
                { type: "", order: envelopeConfig.length + 1, weight: 0 },
              ])
            }
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"
          >
            <Plus size={14} /> Add Envelope
          </button>
        </section>

        {/* Local Content (NCDMB) */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Local Content (NCDMB)
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Nigerian local content requirements for evaluation scoring.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LC Weight in Evaluation (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.local_content_weight || ""}
                onChange={(e) => handleChange("local_content_weight", e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-gray-400 mt-1">0 = LC not used in scoring</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum LC Threshold (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.local_content_minimum || ""}
                onChange={(e) => handleChange("local_content_minimum", e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-gray-400 mt-1">Bids below this are non-compliant</p>
            </div>
          </div>
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
              onClick={() => {
                submitIntentRef.current = "draft";
              }}
            >
              {isEditMode ? "Save Changes" : "Create Draft Project"}
            </Button>
            {(!isEditMode || editProject?.status === "draft") && (
              <Button
                type="button"
                variant="primary"
                loading={loading && publishing}
                className="font-medium px-6"
                onClick={() => {
                  submitIntentRef.current = "publish";
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
