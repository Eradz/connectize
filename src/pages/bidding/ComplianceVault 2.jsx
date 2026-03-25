import { useState, useEffect } from "react";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import HeadingText from "../../components/HeadingText";
import Button from "../../components/ui/Button";
import Input, { Select } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  Shield,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  Plus,
  FolderPlus,
} from "lucide-react";

const STATUS_CONFIG = {
  verified: { label: "Verified", color: "bg-green-100 text-green-700", icon: CheckCircle },
  pending_review: { label: "Uploaded", color: "bg-blue-100 text-blue-700", icon: Clock },
  expired: { label: "Expired", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  missing: { label: "Missing", color: "bg-gray-100 text-gray-500", icon: FileText },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.missing;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

export default function ComplianceVault() {
  const [categories, setCategories] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadRequirement, setUploadRequirement] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    company: "",
    issue_date: "",
    expiry_date: "",
    document_file: null,
    metadata: {},
  });
  const [uploading, setUploading] = useState(false);
  const [userCompanies, setUserCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");

  // Create Category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", is_mandatory: false, industry_sector: "oil_gas", company: "" });
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Create Requirement modal
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [requirementForm, setRequirementForm] = useState({ category: "", name: "", description: "", valid_duration_months: 12, requires_verification: true });
  const [creatingRequirement, setCreatingRequirement] = useState(false);

  useEffect(() => {
    fetchUserCompanies();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedCompany]);

  async function fetchUserCompanies() {
    try {
      const { default: api } = await import("../../api-services/crud");
      const res = await api.get("/api/v1/workforce/companies/my_companies/");
      const companies = res.data?.results || res.data || [];
      setUserCompanies(companies);
      if (companies.length === 1) {
        setSelectedCompany(companies[0].id);
        setCategoryForm((prev) => ({ ...prev, company: companies[0].id }));
      }
    } catch {
      setUserCompanies([]);
    }
  }

  async function fetchData() {
    setLoading(true);
    try {
      const params = selectedCompany ? { company: selectedCompany } : {};
      const [catRes, reqRes, docRes] = await Promise.all([
        biddingAPI.getComplianceCategories(params),
        biddingAPI.getComplianceRequirements(params),
        biddingAPI.getComplianceDocuments(params),
      ]);
      setCategories(catRes.data?.results || catRes.data || []);
      setRequirements(reqRes.data?.results || reqRes.data || []);
      setDocuments(docRes.data?.results || docRes.data || []);
    } catch (err) {
      toast.error("Failed to load compliance data");
    } finally {
      setLoading(false);
    }
  }

  function getDocForRequirement(reqId, companyId) {
    return documents
      .filter((d) => d.requirement === reqId && d.company === companyId)
      .sort((a, b) => b.version - a.version)[0];
  }

  function toggleCategory(catId) {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }

  function openUploadModal(requirement) {
    setUploadRequirement(requirement);
    const expiryMonths = requirement.valid_duration_months || 12;
    const today = new Date().toISOString().split("T")[0];
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + expiryMonths);

    setUploadForm({
      company: selectedCompany || (userCompanies.length === 1 ? userCompanies[0].id : ""),
      issue_date: today,
      expiry_date: expiry.toISOString().split("T")[0],
      document_file: null,
      metadata: {},
    });
    setShowUploadModal(true);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!uploadForm.document_file || !uploadForm.company) {
      toast.error("Please select a company and a file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("company", uploadForm.company);
      formData.append("requirement", uploadRequirement.id);
      formData.append("document_file", uploadForm.document_file);
      formData.append("issue_date", uploadForm.issue_date);
      formData.append("expiry_date", uploadForm.expiry_date);
      formData.append("metadata", JSON.stringify(uploadForm.metadata));

      await biddingAPI.uploadComplianceDocument(formData);
      toast.success("Document uploaded successfully");
      setShowUploadModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!categoryForm.name.trim()) { toast.error("Category name is required"); return; }
    if (!categoryForm.company) { toast.error("Please select a company"); return; }
    setCreatingCategory(true);
    try {
      await biddingAPI.createComplianceCategory(categoryForm);
      toast.success("Category created");
      setShowCategoryModal(false);
      setCategoryForm({ name: "", description: "", is_mandatory: false, industry_sector: "oil_gas", company: selectedCompany || "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.name?.[0] || "Failed to create category");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleCreateRequirement(e) {
    e.preventDefault();
    if (!requirementForm.name.trim() || !requirementForm.category) { toast.error("Name and category are required"); return; }
    setCreatingRequirement(true);
    try {
      await biddingAPI.createComplianceRequirement(requirementForm);
      toast.success("Requirement created");
      setShowRequirementModal(false);
      setRequirementForm({ category: "", name: "", description: "", valid_duration_months: 12, requires_verification: true });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.name?.[0] || "Failed to create requirement");
    } finally {
      setCreatingRequirement(false);
    }
  }

  const filteredRequirements = requirements.filter((r) => {
    if (filterCategory && r.category !== filterCategory) return false;
    return true;
  });

  const groupedByCategory = categories
    .filter((c) => !filterCategory || c.id === filterCategory)
    .map((cat) => ({
      ...cat,
      reqs: filteredRequirements.filter((r) => r.category === cat.id),
    }));

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="space-y-3">
        <div>
          <HeadingText>Compliance Vault</HeadingText>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Centrally manage and track all your compliance documents, certifications, and regulatory requirements. Upload, verify, and monitor expiration dates to stay audit-ready.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {userCompanies.length > 0 && (
            <Select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setCategoryForm((prev) => ({ ...prev, company: e.target.value }));
              }}
              className="w-56"
            >
              <option value="">{userCompanies.length > 1 ? "All My Companies" : "Select Company"}</option>
              {userCompanies.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name || c.name}</option>
              ))}
            </Select>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield size={16} />
            <span>{documents.filter((d) => d.status === "verified").length} verified</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => setShowCategoryModal(true)}>
              <FolderPlus size={14} className="mr-1" /> Add Category
            </Button>
            <Button className="bg-dark hover:bg-mid_grey text-white" size="sm" onClick={() => setShowRequirementModal(true)}>
              <Plus size={14} className="mr-1" /> Add Requirement
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-48"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
        </Select>
      </div>

      {/* Documents */}
      <div className="space-y-4">
          {groupedByCategory.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Shield className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-lg font-medium text-gray-700">No compliance requirements yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Start by creating a compliance category (e.g. HSE, Quality, Insurance), then add requirements within it.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowCategoryModal(true)}>
                  <FolderPlus size={14} className="mr-1" /> Create Category
                </Button>
                <Button className="bg-dark hover:bg-mid_grey text-white" size="sm" onClick={() => setShowRequirementModal(true)}>
                  <Plus size={14} className="mr-1" /> Add Requirement
                </Button>
              </div>
            </div>
          ) : (
            groupedByCategory.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(group.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-gray-600" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-xs text-gray-500">
                        {group.reqs.length} requirement{group.reqs.length !== 1 && "s"}
                        {group.is_mandatory && (
                          <span className="ml-2 text-red-500 font-medium">• Mandatory</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {expandedCategories[group.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {expandedCategories[group.id] && (
                  <div className="divide-y divide-gray-100">
                    {group.reqs.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-gray-500 mb-2">No requirements in this category yet.</p>
                        <Button variant="outline" size="sm" onClick={() => { setRequirementForm({ ...requirementForm, category: group.id }); setShowRequirementModal(true); }}>
                          <Plus size={14} className="mr-1" /> Add Requirement
                        </Button>
                      </div>
                    ) : group.reqs.map((req) => {
                      const doc = selectedCompany ? getDocForRequirement(req.id, selectedCompany) : null;
                      const docStatus = doc ? doc.status : "missing";

                      return (
                        <div key={req.id} className="flex items-center justify-between p-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{req.name}</p>
                            {req.description && (
                              <p className="text-sm text-gray-500 mt-1">{req.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Valid for {req.valid_duration_months} months
                              {req.requires_verification && " • Requires verification"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={docStatus} />
                            {doc && doc.document_file && (
                              <a
                                href={doc.document_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Eye size={16} />
                              </a>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUploadModal(req)}
                            >
                              <Upload size={14} className="mr-1" />
                              {doc ? "Re-upload" : "Upload"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Upload: {uploadRequirement?.name}
              </h3>
              <button onClick={() => setShowUploadModal(false)}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {userCompanies.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <Select
                    value={uploadForm.company}
                    onChange={(e) => setUploadForm({ ...uploadForm, company: e.target.value })}
                    required
                  >
                    <option value="">Select company</option>
                    {userCompanies.map((c) => (
                      <option key={c.id} value={c.id}>{c.company_name || c.name}</option>
                    ))}
                  </Select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, document_file: e.target.files[0] })
                  }
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <Input
                    type="date"
                    value={uploadForm.issue_date}
                    onChange={(e) => setUploadForm({ ...uploadForm, issue_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <Input
                    type="date"
                    value={uploadForm.expiry_date}
                    onChange={(e) => setUploadForm({ ...uploadForm, expiry_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-dark hover:bg-mid_grey text-white" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create Compliance Category</h3>
              <button onClick={() => setShowCategoryModal(false)}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              {userCompanies.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <Select
                    value={categoryForm.company}
                    onChange={(e) => setCategoryForm({ ...categoryForm, company: e.target.value })}
                    required
                  >
                    <option value="">Select company</option>
                    {userCompanies.map((c) => (
                      <option key={c.id} value={c.id}>{c.company_name || c.name}</option>
                    ))}
                  </Select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. HSE Certifications, Quality Management, Insurance"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Brief description of what this category covers"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry Sector</label>
                  <select
                    value={categoryForm.industry_sector}
                    onChange={(e) => setCategoryForm({ ...categoryForm, industry_sector: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F1C644]"
                  >
                    <option value="oil_gas">Oil & Gas</option>
                    <option value="mining">Mining</option>
                    <option value="construction">Construction</option>
                    <option value="maritime">Maritime</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_mandatory"
                    checked={categoryForm.is_mandatory}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_mandatory: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_mandatory" className="text-sm text-gray-700">Mandatory for all bidders</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-dark hover:bg-mid_grey text-white" disabled={creatingCategory}>
                  {creatingCategory ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Requirement Modal */}
      {showRequirementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Compliance Requirement</h3>
              <button onClick={() => setShowRequirementModal(false)}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            {categories.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-sm text-gray-500">You need to create a category first.</p>
                <Button variant="outline" size="sm" onClick={() => { setShowRequirementModal(false); setShowCategoryModal(true); }}>
                  <FolderPlus size={14} className="mr-1" /> Create Category
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateRequirement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={requirementForm.category}
                    onChange={(e) => setRequirementForm({ ...requirementForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F1C644]"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirement Name *</label>
                  <Input
                    value={requirementForm.name}
                    onChange={(e) => setRequirementForm({ ...requirementForm, name: e.target.value })}
                    placeholder="e.g. ISO 14001, Safety Training Certificate, Workers Comp Policy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    rows={2}
                    value={requirementForm.description}
                    onChange={(e) => setRequirementForm({ ...requirementForm, description: e.target.value })}
                    placeholder="Details about what this requirement covers"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Validity (months)</label>
                    <Input
                      type="number"
                      min="1"
                      value={requirementForm.valid_duration_months}
                      onChange={(e) => setRequirementForm({ ...requirementForm, valid_duration_months: parseInt(e.target.value) || 12 })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="requires_verification"
                      checked={requirementForm.requires_verification}
                      onChange={(e) => setRequirementForm({ ...requirementForm, requires_verification: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="requires_verification" className="text-sm text-gray-700">Requires verification</label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowRequirementModal(false)}>Cancel</Button>
                  <Button type="submit" className="bg-dark hover:bg-mid_grey text-white" disabled={creatingRequirement}>
                    {creatingRequirement ? "Creating..." : "Add Requirement"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
