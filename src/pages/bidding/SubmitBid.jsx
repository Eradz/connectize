import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import {
  getBiddingDocumentTypeLabel,
  getDefaultBiddingDocumentType,
  normalizeBiddingDocumentTypes,
} from "../../lib/biddingDocumentTypes";
import { webRoutes } from "../../lib/webRoutes";
import Button from "../../components/ui/Button";
import Input, { Select, Textarea } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  ArrowLeft,
  Send,
  DollarSign,
  FileText,
  Plus,
  Trash2,
  Upload,
  AlertTriangle,
  Save,
  CheckCircle2,
  Eye,
  Download,
  Image as ImageIcon,
} from "lucide-react";

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
const isImageFile = (name) => IMAGE_EXTENSIONS.test(name || "");
const getDocUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;
  const base = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
  return `${base}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
};

const RICH_TEXT_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["blockquote", "link"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const RICH_TEXT_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "align",
  "blockquote",
  "link",
];

const cleanRichTextValue = (value = "") => {
  const normalized = String(value || "").trim();
  const textOnly = normalized
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return textOnly ? normalized : "";
};

const getFileTitle = (file, fallback = "Document") =>
  file?.name?.replace(/\.[^/.]+$/, "") || file?.name || fallback;

const inferDocumentType = (requiredLabel = "", options = []) => {
  const words = requiredLabel.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const match = options.find((option) => {
    const optionText = `${option.value} ${option.label}`.toLowerCase();
    return words.some((word) => word.length > 2 && optionText.includes(word));
  });
  return match?.value || getDefaultBiddingDocumentType(options);
};

const normalizeDocumentLabel = (value = "") =>
  String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const isEnvelopeProposalDocument = (label, envelopeConfiguration = []) => {
  const normalizedLabel = normalizeDocumentLabel(label);
  return envelopeConfiguration.some((envelope) => {
    const type = normalizeDocumentLabel(envelope?.type);
    if (!type) return false;
    return [
      `${type} proposal`,
      `${type} envelope`,
      `${type} bid`,
    ].includes(normalizedLabel);
  });
};

const getComplianceItemLabel = (item) => {
  if (!item) return "Unknown requirement";
  if (typeof item === "string") return item;
  return item.requirement_name || item.name || item.title || "Unknown requirement";
};

const getComplianceIssueDescription = (issue) => {
  if (typeof issue === "string") return issue;
  const label = getComplianceItemLabel(issue);
  if (issue?.rejection_reason) {
    return `${label} (${issue.rejection_reason})`;
  }
  if (issue?.expiry_date) {
    return `${label} (expired ${issue.expiry_date})`;
  }
  return label;
};

const getCompanyId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value.id || value.company || value.company_id || "");
  }
  return String(value);
};

const getProjectCompanyId = (project) =>
  getCompanyId(project?.company || project?.company_id || project?.owner_company);

const getBidCompanyId = (bid) =>
  getCompanyId(bid?.bidder_company || bid?.bidder_company_id || bid?.company);

const normalizeList = (payload) => {
  const data = payload?.data || payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export default function SubmitBid() {
  const { id: projectId } = useParams();
  const [searchParams] = useSearchParams();
  const editBidId = searchParams.get("bid");
  const preferredCompanyId = searchParams.get("company");
  const isEditMode = !!editBidId;
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

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
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [userCompanies, setUserCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [complianceStatus, setComplianceStatus] = useState(null);
  const [envelopes, setEnvelopes] = useState({});
  const [addenda, setAddenda] = useState([]);
  const [addendaLoading, setAddendaLoading] = useState(true);
  const [acknowledgingAddenda, setAcknowledgingAddenda] = useState({});
  const [lcCategories, setLcCategories] = useState([]);
  const [lcDeclarations, setLcDeclarations] = useState({});
  const projectCompanyId = getProjectCompanyId(project);
  const eligibleUserCompanies = useMemo(
    () => userCompanies.filter((company) => {
      const companyId = getCompanyId(company);
      return companyId && (!projectCompanyId || companyId !== projectCompanyId);
    }),
    [projectCompanyId, userCompanies]
  );

  useEffect(() => {
    fetchProject();
    fetchUserCompanies();
    fetchAddenda();
    fetchLcCategories();
    fetchDocumentTypes();
  }, [projectId]);

  const defaultDocumentType = getDefaultBiddingDocumentType(documentTypeOptions);
  const hasEnvelopeSubmissions = project?.envelope_configuration?.length > 0;
  const visibleRequiredDocuments = useMemo(() => {
    const requiredDocuments = Array.isArray(project?.required_documents)
      ? project.required_documents
      : [];
    if (!hasEnvelopeSubmissions) return requiredDocuments;
    return requiredDocuments.filter(
      (label) => !isEnvelopeProposalDocument(label, project.envelope_configuration)
    );
  }, [hasEnvelopeSubmissions, project?.envelope_configuration, project?.required_documents]);

  useEffect(() => {
    if (form.bidder_company) {
      biddingAPI
        .getComplianceStatus(form.bidder_company, { project: projectId })
        .then((res) => setComplianceStatus(res?.data || res))
        .catch(() => setComplianceStatus(null));
    } else {
      setComplianceStatus(null);
    }
  }, [form.bidder_company]);

  const fetchUserCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const res = await biddingAPI.getAccessibleCompanies();
      const companies = Array.isArray(res?.data) ? res.data : res?.data?.results || res || [];
      if (Array.isArray(companies)) {
        setUserCompanies(companies);
      }
    } catch {
      console.error("Failed to load companies");
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    if (isEditMode || form.bidder_company) return;
    const preferredCompany = preferredCompanyId
      ? eligibleUserCompanies.find((company) => getCompanyId(company) === String(preferredCompanyId))
      : null;
    if (preferredCompany) {
      setForm((prev) => ({ ...prev, bidder_company: getCompanyId(preferredCompany) }));
    } else if (eligibleUserCompanies.length === 1) {
      setForm((prev) => ({ ...prev, bidder_company: getCompanyId(eligibleUserCompanies[0]) }));
    }
  }, [eligibleUserCompanies, form.bidder_company, isEditMode, preferredCompanyId]);

  useEffect(() => {
    if (isEditMode || !form.bidder_company || eligibleUserCompanies.length === 0) return;
    const selectedIsEligible = eligibleUserCompanies.some(
      (company) => getCompanyId(company) === String(form.bidder_company)
    );
    if (!selectedIsEligible) {
      setForm((prev) => ({ ...prev, bidder_company: "" }));
    }
  }, [eligibleUserCompanies, form.bidder_company, isEditMode]);

  const fetchProject = async () => {
    try {
      const res = await biddingAPI.getProject(projectId);
      const data = res?.data || res;
      setProject(data);
      setForm((prev) => ({ ...prev, currency: data.currency || "USD" }));

      // If editing an existing bid, load its data
      if (editBidId) {
        try {
          const bidRes = await biddingAPI.getBid(editBidId);
          const bid = bidRes?.data || bidRes;
          setForm({
            total_price: bid.total_price || "",
            currency: bid.currency || data.currency || "USD",
            technical_proposal: bid.technical_proposal || "",
            bidder_company: bid.bidder_company || "",
            custom_responses: bid.custom_responses || {},
          });
          if (bid.price_breakdown && Object.keys(bid.price_breakdown).length > 0) {
            setPriceBreakdown(
              Object.entries(bid.price_breakdown).map(([item, amount]) => ({
                item,
                amount: String(amount),
              }))
            );
          }
          if (Array.isArray(bid.envelopes) && bid.envelopes.length > 0) {
            setEnvelopes(
              bid.envelopes.reduce((acc, envelope) => {
                const content = envelope.content || {};
                acc[envelope.envelope_type] = content.text || content.value || "";
                return acc;
              }, {})
            );
          }
          setExistingDocuments(Array.isArray(bid.documents) ? bid.documents : []);
          try {
            const lcRes = await biddingAPI.getLocalContentDeclarations({ bid: bid.id });
            const lcList = Array.isArray(lcRes?.data)
              ? lcRes.data
              : Array.isArray(lcRes?.data?.results)
              ? lcRes.data.results
              : [];
            setLcDeclarations(
              lcList.reduce((acc, declaration) => {
                acc[declaration.category] = {
                  percentage: String(declaration.declared_percentage ?? ""),
                  evidence: declaration.evidence_description || "",
                };
                return acc;
              }, {})
            );
          } catch {
            setLcDeclarations({});
          }
        } catch {
          toast.error("Failed to load bid data");
        }
      }
    } catch {
      toast.error("Failed to load project");
      navigate(webRoutes.bidding);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddenda = async () => {
    try {
      setAddendaLoading(true);
      const res = await biddingAPI.getAddenda(projectId);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAddenda(list);
    } catch { setAddenda([]); } finally { setAddendaLoading(false); }
  };

  const isAddendumAcknowledged = (addendum) => {
    if (!form.bidder_company) return false;
    return (addendum.acknowledgments || []).some(
      (ack) => String(ack.company) === String(form.bidder_company)
    );
  };

  const handleAcknowledgeAddendum = async (addendumNumber) => {
    if (!form.bidder_company) {
      toast.error("Select your company before acknowledging addenda");
      return;
    }

    setAcknowledgingAddenda((prev) => ({ ...prev, [addendumNumber]: true }));
    try {
      await biddingAPI.acknowledgeAddendum(projectId, addendumNumber, {
        company: form.bidder_company,
      });
      toast.success(`Addendum #${addendumNumber} acknowledged`);
      await fetchAddenda();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to acknowledge addendum");
    } finally {
      setAcknowledgingAddenda((prev) => ({ ...prev, [addendumNumber]: false }));
    }
  };

  const fetchLcCategories = async () => {
    try {
      const res = await biddingAPI.getLocalContentCategories();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.results) ? res.data.results : [];
      setLcCategories(list);
    } catch { setLcCategories([]); }
  };

  const fetchDocumentTypes = async () => {
    try {
      const res = await biddingAPI.getDocumentTypes({ page_size: 50 });
      setDocumentTypeOptions(normalizeBiddingDocumentTypes(res));
    } catch {
      setDocumentTypeOptions([]);
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

  const handleCustomFileUpload = (key, file) => {
    if (!file) return;
    // Store the file name as the response value; actual upload handled with documents
    setDocuments((prev) => [
      ...prev,
      {
        file,
        title: file.name,
        documentType: defaultDocumentType,
      },
    ]);
    handleCustomResponse(key, file.name);
  };

  const buildDocumentFromFile = (file, options = {}) => ({
    file,
    title: options.title || getFileTitle(file),
    documentType: options.documentType || defaultDocumentType,
    sourceKey: options.sourceKey,
    sourceLabel: options.sourceLabel,
  });

  const addDocumentsFromFiles = (fileList, options = {}) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setDocuments((prev) => [
      ...prev,
      ...files.map((file) => buildDocumentFromFile(file, {
        ...options,
        title: options.sourceLabel ? `${options.sourceLabel} - ${getFileTitle(file)}` : getFileTitle(file),
      })),
    ]);
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
    addDocumentsFromFiles(e.target.files);
    e.target.value = "";
  };

  const handleContextDocumentAdd = (sourceKey, sourceLabel, typeHint, fileList) => {
    addDocumentsFromFiles(fileList, {
      sourceKey,
      sourceLabel,
      documentType: inferDocumentType(typeHint, documentTypeOptions),
    });
  };

  const handleRequiredDocumentAdd = (requiredLabel, fileList) => {
    const [file] = Array.from(fileList || []);
    if (!file) return;

    setDocuments((prev) => {
      const next = prev.filter((doc) => doc.requiredLabel !== requiredLabel);
      next.push({
        file,
        title: requiredLabel,
        documentType: inferDocumentType(requiredLabel, documentTypeOptions),
        requiredLabel,
      });
      return next;
    });
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const renderContextDocuments = (sourceKey, sourceLabel, typeHint) => {
    const sourceDocs = documents
      .map((doc, index) => ({ doc, index }))
      .filter(({ doc }) => doc.sourceKey === sourceKey);
    const uploadLabel = sourceLabel.includes("Envelope")
      ? "Upload Envelope Document"
      : "Upload Proposal Document";

    return (
      <div className="mt-4 space-y-2">
        {sourceDocs.map(({ doc, index }) => (
          <div key={`${sourceKey}-${index}`} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
              {doc.file?.name || doc.title}
            </span>
            <button
              type="button"
              onClick={() => removeDocument(index)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#F1C644] px-3 py-2 text-sm font-medium text-[#C89B00] transition hover:bg-yellow-50">
          <Upload className="w-4 h-4" />
          {sourceDocs.length ? "Upload Another Document" : uploadLabel}
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              handleContextDocumentAdd(sourceKey, sourceLabel, typeHint, e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    );
  };

  const updateDocument = (index, field, value) => {
    setDocuments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await handleSaveOrSubmit({ finalize: true });
  };

  const buildPayload = () => {
    const totalPrice = String(form.total_price || "").trim();
    const lcPayload = Object.entries(lcDeclarations)
      .filter(([, value]) => value?.percentage !== "" && value?.percentage !== undefined)
      .map(([categoryId, value]) => ({
        category: categoryId,
        declared_percentage: value.percentage,
        evidence_description: value.evidence || "",
      }));

    return {
      project: projectId,
      bidder_company: form.bidder_company,
      total_price: totalPrice || undefined,
      currency: form.currency,
      technical_proposal: hasEnvelopeSubmissions
        ? undefined
        : cleanRichTextValue(form.technical_proposal),
      custom_responses: { ...form.custom_responses },
      valid_until: project?.submission_deadline,
      envelopes: (project.envelope_configuration || [])
        .map((env) => ({
          envelope_type: env.type,
          content: { text: cleanRichTextValue(envelopes[env.type]) },
        }))
        .filter((env) => env.content.text),
      local_content_declarations: lcPayload,
      price_breakdown: priceBreakdown
        .filter((item) => item.item && item.amount)
        .reduce((acc, item) => {
          acc[item.item] = parseFloat(item.amount);
          return acc;
        }, {}),
    };
  };

  const validateBidForm = ({ finalize }) => {
    if (!form.bidder_company) {
      toast.error(
        eligibleUserCompanies.length === 0
          ? "You need another associated company to submit a bid for this project"
          : "Please select your company"
      );
      return false;
    }

    const specFields = project.specifications?.custom_fields || [];
    for (const field of specFields) {
      if (field.required && !form.custom_responses[field.key]) {
        toast.error(`${field.label || field.key} is required`);
        return false;
      }
    }

    if (finalize && project.envelope_configuration?.length > 0) {
      const missingEnvelope = project.envelope_configuration.find(
        (env) => !cleanRichTextValue(envelopes[env.type])
      );
      if (missingEnvelope) {
        toast.error(`Complete the ${missingEnvelope.type} envelope before submitting`);
        return false;
      }
    }

    if (finalize && visibleRequiredDocuments.length > 0) {
      const missingDocument = visibleRequiredDocuments.find(
        (requiredLabel) =>
          !documents.some((doc) => doc.requiredLabel === requiredLabel)
          && !existingDocuments.some(
            (doc) =>
              doc.document_type === inferDocumentType(requiredLabel, documentTypeOptions)
              || doc.title === requiredLabel
              || doc.title?.toLowerCase().includes(requiredLabel.toLowerCase())
          )
      );
      if (missingDocument) {
        toast.error(`Upload the required document: ${missingDocument}`);
        return false;
      }
    }

    return true;
  };

  const coerceResponses = () => {
    const specFields = project.specifications?.custom_fields || [];
    const coercedResponses = { ...form.custom_responses };
    for (const field of specFields) {
      const val = coercedResponses[field.key];
      if (val === undefined || val === "") continue;
      if (field.type === "number") {
        coercedResponses[field.key] = Number(val);
      } else if (field.type === "boolean") {
        coercedResponses[field.key] = val === "true";
      }
    }
    return coercedResponses;
  };

  const uploadPendingDocuments = async (bidId) => {
    for (const doc of documents) {
      try {
        await biddingAPI.uploadDocument({
          bid: bidId,
          title: doc.title || doc.file?.name,
          document_type: doc.documentType || defaultDocumentType,
          file: doc.file,
        });
      } catch {
        toast.error(`Failed to upload ${doc.title || doc.file?.name || "document"}`);
      }
    }
  };

  const handleSaveOrSubmit = async ({ finalize }) => {
    if (!validateBidForm({ finalize })) {
      return;
    }

    const coercedResponses = coerceResponses();
    const payload = {
      ...buildPayload(),
      custom_responses: coercedResponses,
    };

    if (finalize) {
      setSubmitting(true);
    } else {
      setSavingDraft(true);
    }

    try {
      let bid;
      let existingBidId = editBidId;
      if (!existingBidId) {
        const bidsRes = await biddingAPI.getBids({ project: projectId, page_size: 50 });
        const existingBid = normalizeList(bidsRes).find(
          (candidate) => getBidCompanyId(candidate) === String(form.bidder_company)
        );
        existingBidId = existingBid?.id;
      }

      if (existingBidId) {
        const res = await biddingAPI.updateBid(existingBidId, payload);
        bid = res?.data || res;
      } else {
        const res = await biddingAPI.submitBid(payload);
        bid = res?.data || res;
      }

      await uploadPendingDocuments(bid.id);
      if (documents.length > 0) {
        const refreshedBid = await biddingAPI.getBid(bid.id);
        const refreshed = refreshedBid?.data || refreshedBid;
        setExistingDocuments(Array.isArray(refreshed.documents) ? refreshed.documents : []);
        setDocuments([]);
      }

      if (finalize) {
        await biddingAPI.submitBidAction(bid.id);
        toast.success("Bid submitted successfully!");
      } else {
        toast.success(existingBidId ? "Draft updated successfully!" : "Draft saved successfully!");
      }

      navigate(webRoutes.biddingDetail.replace(":id", projectId));
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
      setSavingDraft(false);
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

  const customFields = project.specifications?.custom_fields || [];
  const missingItems = complianceStatus?.missing || complianceStatus?.missing_requirements || [];
  const expiredItems = complianceStatus?.expired || complianceStatus?.expired_documents || [];
  const rejectedItems = complianceStatus?.rejected || [];
  const pendingVerificationItems = complianceStatus?.pending_verification || [];
  const missingCount = Number.isFinite(complianceStatus?.missing_count)
    ? complianceStatus.missing_count
    : missingItems.length;
  const expiredCount = Number.isFinite(complianceStatus?.expired_count)
    ? complianceStatus.expired_count
    : expiredItems.length;
  const rejectedCount = Number.isFinite(complianceStatus?.rejected_count)
    ? complianceStatus.rejected_count
    : rejectedItems.length;
  const pendingVerificationCount = Number.isFinite(complianceStatus?.pending_verification_count)
    ? complianceStatus.pending_verification_count
    : pendingVerificationItems.length;
  const fallbackComplianceIssues = Array.isArray(complianceStatus?.issues)
    ? complianceStatus.issues.filter(Boolean)
    : [];
  const categorizedComplianceIssueLabels = [
    ...missingItems.map((item) => `Missing: ${getComplianceIssueDescription(item)}`),
    ...expiredItems.map((item) => `Expired: ${getComplianceIssueDescription(item)}`),
    ...rejectedItems.map((item) => `Rejected: ${getComplianceIssueDescription(item)}`),
    ...pendingVerificationItems.map((item) => `Pending verification: ${getComplianceIssueDescription(item)}`),
  ];
  const complianceIssueLabels = categorizedComplianceIssueLabels.length > 0
    ? categorizedComplianceIssueLabels
    : fallbackComplianceIssues;
  const primaryComplianceIssue =
    missingItems[0] || expiredItems[0] || rejectedItems[0] || pendingVerificationItems[0] || null;
  const complianceVaultParams = new URLSearchParams();
  if (form.bidder_company) {
    complianceVaultParams.set("company", form.bidder_company);
  }
  if (primaryComplianceIssue?.requirement_id) {
    complianceVaultParams.set("requirement", primaryComplianceIssue.requirement_id);
    complianceVaultParams.set("requirementName", getComplianceItemLabel(primaryComplianceIssue));
    if (primaryComplianceIssue.category) {
      complianceVaultParams.set("requirementCategory", primaryComplianceIssue.category);
    }
    if (primaryComplianceIssue.valid_duration_months) {
      complianceVaultParams.set("validDurationMonths", primaryComplianceIssue.valid_duration_months);
    }
    if (typeof primaryComplianceIssue.requires_verification === "boolean") {
      complianceVaultParams.set("requiresVerification", String(primaryComplianceIssue.requires_verification));
    }
  }
  const complianceVaultUrl = complianceVaultParams.toString()
    ? `${webRoutes.biddingCompliance}?${complianceVaultParams.toString()}`
    : webRoutes.biddingCompliance;
  const complianceAttentionCount = Math.max(
    missingCount + expiredCount + rejectedCount + pendingVerificationCount,
    complianceIssueLabels.length,
  );
  const hasComplianceIssues = complianceStatus?.compliant === false && complianceIssueLabels.length > 0;
  const unacknowledgedAddenda = addenda.filter((addendum) => !isAddendumAcknowledged(addendum));
  const submitDisabled =
    project.status !== "submission_open"
    || (complianceStatus && !complianceStatus.compliant)
    || unacknowledgedAddenda.length > 0;

  let submitDisabledReason = "";
  if (project.status !== "submission_open") {
    submitDisabledReason = "Bid submission is currently closed for this project.";
  } else if (complianceStatus && !complianceStatus.compliant) {
    const preview = complianceIssueLabels.slice(0, 3).join("; ");
    const remaining = complianceIssueLabels.length - 3;
    submitDisabledReason = preview
      ? `${preview}${remaining > 0 ? `; +${remaining} more` : ""}. Resolve these compliance issues before final submission.`
      : "Resolve compliance issues before final submission.";
  } else if (unacknowledgedAddenda.length > 0) {
    submitDisabledReason = `Acknowledge ${unacknowledgedAddenda.length} addendum${unacknowledgedAddenda.length === 1 ? "" : "s"} before final submission.`;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button
        onClick={() =>
          navigate(webRoutes.biddingDetail.replace(":id", projectId))
        }
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Project
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {isEditMode ? "Edit Bid" : "Submit Bid"}
      </h1>
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

      {hasComplianceIssues && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm font-semibold text-red-800">
              Compliance Issues — {complianceAttentionCount} document(s) need attention
            </p>
          </div>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {missingItems.map((r) => (
              <li key={`missing-${r.requirement_id || r.id || r.name}`}>Missing: {getComplianceIssueDescription(r)}</li>
            ))}
            {expiredItems.map((d) => (
              <li key={`expired-${d.requirement_id || d.id || d.name}`}>
                Expired: {getComplianceIssueDescription(d)}
              </li>
            ))}
            {rejectedItems.map((item) => (
              <li key={`rejected-${item.requirement_id || item.id || item.name}`}>
                Rejected: {getComplianceIssueDescription(item)}
              </li>
            ))}
            {pendingVerificationItems.map((item) => (
              <li key={`pending-${item.requirement_id || item.id || item.name}`}>
                Pending verification: {getComplianceIssueDescription(item)}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => navigate(complianceVaultUrl)}
            className="mt-2 text-sm text-red-700 underline hover:text-red-900"
          >
            Go to Compliance Vault →
          </button>
        </div>
      )}

      {addenda.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-sm font-semibold text-blue-800">
              {addenda.length} addend{addenda.length === 1 ? "um" : "a"} issued
              {unacknowledgedAddenda.length > 0
                ? ` — acknowledge ${unacknowledgedAddenda.length} before submitting`
                : " — all acknowledged"}
            </p>
          </div>
          {addendaLoading ? (
            <p className="text-sm text-blue-700">Loading addenda...</p>
          ) : (
            <div className="space-y-2">
              {addenda.map((a) => {
                const acknowledged = isAddendumAcknowledged(a);
                return (
                  <div
                    key={a.id}
                    className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-white/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        #{a.addendum_number}: {a.title}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {a.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {acknowledged ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Acknowledged
                        </span>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={!form.bidder_company || acknowledgingAddenda[a.addendum_number]}
                          onClick={() => handleAcknowledgeAddendum(a.addendum_number)}
                        >
                          {acknowledgingAddenda[a.addendum_number]
                            ? "Acknowledging..."
                            : "Acknowledge"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            {loadingCompanies ? (
              <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm">
                Loading companies...
              </div>
            ) : eligibleUserCompanies.length === 0 ? (
              <div className="w-full px-3 py-2.5 border border-red-200 rounded-lg bg-red-50 text-red-600 text-sm">
                {userCompanies.length === 0
                  ? "No companies found. You need a company to submit a bid."
                  : "No eligible bidding company. The project creator company cannot submit a bid."}
              </div>
            ) : (
              <Select
                value={form.bidder_company}
                onChange={(e) => handleChange("bidder_company", e.target.value)}
              >
                <option value="">Select your company</option>
                {eligibleUserCompanies.map((c) => (
                  <option key={getCompanyId(c)} value={getCompanyId(c)}>
                    {c.company_name || c.name}
                  </option>
                ))}
              </Select>
            )}
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
                  Total Price (Optional)
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
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-center"
                  >
                    <Input
                      value={item.item}
                      onChange={(e) =>
                        updateBreakdownItem(index, "item", e.target.value)
                      }
                      placeholder="Item description"
                      className="w-full"
                    />
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) =>
                        updateBreakdownItem(index, "amount", e.target.value)
                      }
                      placeholder="Amount"
                      className="w-full"
                      min="0"
                      step="0.01"
                    />
                    {priceBreakdown.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBreakdownItem(index)}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 px-3 text-gray-400 transition hover:text-red-500"
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
        {!hasEnvelopeSubmissions && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Technical Proposal
            </h2>
            <ReactQuill
              theme="snow"
              value={form.technical_proposal}
              onChange={(value) => handleChange("technical_proposal", cleanRichTextValue(value))}
              modules={RICH_TEXT_MODULES}
              formats={RICH_TEXT_FORMATS}
              placeholder="Describe your technical approach, methodology, timeline, team qualifications..."
              className="[&_.ql-editor]:min-h-[180px]"
            />
            {renderContextDocuments("technical_proposal", "Technical Proposal", "technical proposal")}
          </section>
        )}

        {/* Multi-Envelope Sections */}
        {hasEnvelopeSubmissions && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Envelope Submissions
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              This project requires sealed envelope submissions. Fill in each envelope section.
            </p>
            <div className="space-y-4">
              {project.envelope_configuration
                .sort((a, b) => a.order - b.order)
                .map((env) => (
                  <div key={env.type} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-800 capitalize mb-2">
                      {env.type} Envelope
                      <span className="text-gray-400 font-normal ml-2">
                        (Weight: {env.weight}%)
                      </span>
                    </h3>
                    <ReactQuill
                      theme="snow"
                      value={envelopes[env.type] || ""}
                      onChange={(value) =>
                        setEnvelopes((prev) => ({
                          ...prev,
                          [env.type]: cleanRichTextValue(value),
                        }))
                      }
                      modules={RICH_TEXT_MODULES}
                      formats={RICH_TEXT_FORMATS}
                      placeholder={`Enter your ${env.type} proposal content...`}
                      className="[&_.ql-editor]:min-h-[140px]"
                    />
                    {renderContextDocuments(`envelope_${env.type}`, `${env.type} Envelope`, `${env.type} proposal`)}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Local Content Declaration (NCDMB) */}
        {project.local_content_weight > 0 && lcCategories.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Nigerian Local Content Declaration
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              This project requires local content declarations (weight: {project.local_content_weight}%,
              minimum: {project.local_content_minimum}%).
            </p>
            <div className="space-y-4">
              {lcCategories.map((cat) => (
                <div key={cat.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {cat.name}
                      <span className="text-gray-400 font-normal ml-2">
                        (Weight: {cat.weight}%, Max: {cat.max_score})
                      </span>
                    </h3>
                    {cat.ncdmb_reference && (
                      <span className="text-xs text-gray-500">Ref: {cat.ncdmb_reference}</span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-xs text-gray-500 mb-2">{cat.description}</p>
                  )}
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Declared %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={lcDeclarations[cat.id]?.percentage || ""}
                        onChange={(e) =>
                          setLcDeclarations((prev) => ({
                            ...prev,
                            [cat.id]: { ...prev[cat.id], percentage: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="e.g., 65"
                      />
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs text-gray-600 mb-1">Evidence</label>
                      <input
                        type="text"
                        value={lcDeclarations[cat.id]?.evidence || ""}
                        onChange={(e) =>
                          setLcDeclarations((prev) => ({
                            ...prev,
                            [cat.id]: { ...prev[cat.id], evidence: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Describe supporting evidence..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Custom Response Fields (from project specifications) */}
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
                  ) : field.type === "file" ? (
                    <div>
                      <label className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-[#F1C644] transition cursor-pointer">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {form.custom_responses[field.key] || "Click to upload file"}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) =>
                            handleCustomFileUpload(field.key, e.target.files?.[0])
                          }
                        />
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
            Bid Documents
          </h2>
          {visibleRequiredDocuments.length > 0 && (
            <div className="mb-4 space-y-3">
              <p className="text-sm text-gray-600">
                Map each required document explicitly before final submission.
              </p>
              {visibleRequiredDocuments.map((requiredLabel) => {
                const existing = documents.find((doc) => doc.requiredLabel === requiredLabel);
                const alreadyUploaded = existingDocuments.find(
                  (doc) =>
                    doc.document_type === inferDocumentType(requiredLabel, documentTypeOptions)
                    || doc.title === requiredLabel
                    || doc.title?.toLowerCase().includes(requiredLabel.toLowerCase())
                );
                return (
                  <div key={requiredLabel} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        {existing && isImageFile(existing.file?.name) ? (
                          <img src={URL.createObjectURL(existing.file)} alt={requiredLabel} className="w-10 h-10 rounded object-cover border border-gray-200 shrink-0" />
                        ) : alreadyUploaded && isImageFile(alreadyUploaded.file || alreadyUploaded.title) ? (
                          <img src={getDocUrl(alreadyUploaded.file)} alt={requiredLabel} className="w-10 h-10 rounded object-cover border border-gray-200 shrink-0" />
                        ) : null}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{requiredLabel}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {existing
                              ? `${existing.file.name} selected`
                              : alreadyUploaded
                              ? `${alreadyUploaded.title} already uploaded`
                              : "No file selected yet"}
                          </p>
                        </div>
                        {existing ? (
                          <a
                            href={URL.createObjectURL(existing.file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 ml-auto shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </a>
                        ) : alreadyUploaded?.file ? (
                          <a
                            href={getDocUrl(alreadyUploaded.file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 ml-auto shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </a>
                        ) : null}
                      </div>
                      <label className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 hover:border-[#F1C644] cursor-pointer">
                        <Upload className="w-4 h-4" />
                        {existing || alreadyUploaded ? "Replace File" : "Upload File"}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleRequiredDocumentAdd(requiredLabel, e.target.files)}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="space-y-3">
            {existingDocuments.length > 0 && (
              <div className="space-y-2">
                {existingDocuments.map((doc) => {
                  const url = getDocUrl(doc.file);
                  const isImg = isImageFile(doc.file || doc.title);
                  return (
                    <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-green-100 bg-green-50/60 p-3">
                      {isImg && url ? (
                        <img src={url} alt={doc.title} className="w-10 h-10 rounded object-cover border border-gray-200 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {getBiddingDocumentTypeLabel(doc.document_type, documentTypeOptions, doc.document_type_label)}
                        </p>
                      </div>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:text-primary-600 hover:border-primary-300 transition shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
                {documents.map((doc, index) => {
                  const localUrl = doc.file ? URL.createObjectURL(doc.file) : null;
                  const isImg = isImageFile(doc.file?.name);
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {isImg && localUrl ? (
                        <img src={localUrl} alt={doc.title} className="w-12 h-12 rounded object-cover border border-gray-200 shrink-0" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <Input
                          value={doc.title}
                          onChange={(e) => updateDocument(index, "title", e.target.value)}
                          className="text-sm"
                          placeholder="Document title"
                        />
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Select
                            value={doc.documentType}
                            onChange={(e) => updateDocument(index, "documentType", e.target.value)}
                            className="max-w-[220px]"
                          >
                            {documentTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                          <span className="text-xs text-gray-400 truncate">
                            {doc.file.name} · {(doc.file.size / 1024).toFixed(0)} KB
                          </span>
                          {localUrl && (
                            <a
                              href={localUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-gray-400 hover:text-red-500 mt-1 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Submit */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          {submitDisabledReason && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-amber-800">{submitDisabledReason}</p>
                {project.status === "submission_open" && complianceIssueLabels.length > 0 && (
                  <ul className="list-disc pl-4 text-xs text-amber-900 space-y-1">
                    {complianceIssueLabels.slice(0, 5).map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                )}
                {project.status === "submission_open" && complianceIssueLabels.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate(complianceVaultUrl)}
                    className="text-xs font-medium text-amber-900 underline hover:text-amber-950"
                  >
                    Open Compliance Vault
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  navigate(
                    webRoutes.biddingDetail.replace(":id", projectId)
                  )
                }
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSaveOrSubmit({ finalize: false })}
                loading={savingDraft}
                disabled={project.status === "submission_closed" || project.status === "under_evaluation" || project.status === "awarded"}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-1" /> Save Draft
              </Button>
            </div>
            <Button
              variant="primary"
              type="submit"
              loading={submitting}
              disabled={submitDisabled}
              className="w-full sm:w-auto sm:min-w-[180px]"
            >
              <><Send className="w-4 h-4 mr-1" /> Submit Bid</>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
