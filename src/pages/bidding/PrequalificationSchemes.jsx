import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import { webRoutes } from "../../lib/webRoutes";
import HeadingText from "../../components/HeadingText";
import Button from "../../components/ui/Button";
import Input, { Select, Textarea } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  Shield,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Search,
} from "lucide-react";

const STATUS_BADGE = {
  applied: { label: "Applied", color: "bg-blue-100 text-blue-700" },
  under_review: { label: "Under Review", color: "bg-yellow-100 text-yellow-700" },
  qualified: { label: "Qualified", color: "bg-green-100 text-green-700" },
  disqualified: { label: "Disqualified", color: "bg-red-100 text-red-700" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-500" },
};

export default function PrequalificationSchemes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("browse");
  const [schemes, setSchemes] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedScheme, setExpandedScheme] = useState(null);

  // Create scheme modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    industry_category: "oil_gas",
    validity_months: 12,
    auto_approve_if_score_above: "",
    requires_compliance_check: true,
  });
  const [criteria, setCriteria] = useState([]);
  const [newCriterion, setNewCriterion] = useState({
    name: "",
    weight: "",
    scoring_method: "numeric",
    min_threshold: "0",
    evidence_requirement: "",
  });
  const [userCompanies, setUserCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [creating, setCreating] = useState(false);

  // Apply modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyScheme, setApplyScheme] = useState(null);
  const [applyCompany, setApplyCompany] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchData();
    fetchUserCompanies();
  }, []);

  async function fetchUserCompanies() {
    try {
      const { default: api } = await import("../../api-services/crud");
      const res = await api.get("/api/v1/workforce/companies/my_companies/");
      const companies = res.data?.results || res.data || [];
      setUserCompanies(companies);
      if (companies.length === 1) {
        setSelectedCompany(companies[0].id);
        setApplyCompany(companies[0].id);
      }
    } catch {
      setUserCompanies([]);
    }
  }

  async function fetchData() {
    setLoading(true);
    try {
      const [schemesRes, appsRes] = await Promise.all([
        biddingAPI.getPrequalificationSchemes(),
        biddingAPI.getPrequalificationApplications(),
      ]);
      setSchemes(schemesRes.data?.results || schemesRes.data || []);
      setMyApplications(appsRes.data?.results || appsRes.data || []);
    } catch {
      toast.error("Failed to load prequalification data");
    } finally {
      setLoading(false);
    }
  }

  function addCriterion() {
    if (!newCriterion.name || !newCriterion.weight) {
      toast.error("Criterion name and weight are required");
      return;
    }
    setCriteria((prev) => [...prev, { ...newCriterion, order: prev.length }]);
    setNewCriterion({
      name: "",
      weight: "",
      scoring_method: "numeric",
      min_threshold: "0",
      evidence_requirement: "",
    });
  }

  async function handleCreateScheme(e) {
    e.preventDefault();
    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }
    if (!createForm.name) {
      toast.error("Scheme name is required");
      return;
    }

    setCreating(true);
    try {
      const schemeRes = await biddingAPI.createPrequalificationScheme({
        ...createForm,
        company: selectedCompany,
        auto_approve_if_score_above: createForm.auto_approve_if_score_above || null,
      });
      const scheme = schemeRes.data;
      toast.success("Prequalification scheme created");
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        description: "",
        industry_category: "oil_gas",
        validity_months: 12,
        auto_approve_if_score_above: "",
        requires_compliance_check: true,
      });
      setCriteria([]);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create scheme");
    } finally {
      setCreating(false);
    }
  }

  async function handleApply() {
    if (!applyCompany) {
      toast.error("Please select a company");
      return;
    }
    setApplying(true);
    try {
      await biddingAPI.applyForPrequalification(applyScheme.id, {
        company: applyCompany,
      });
      toast.success("Application submitted");
      setShowApplyModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Application failed");
    } finally {
      setApplying(false);
    }
  }

  function getMyAppForScheme(schemeId) {
    return myApplications.find((a) => a.scheme === schemeId);
  }

  const filteredSchemes = schemes.filter(
    (s) =>
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex items-center justify-between">
        <div>
          <HeadingText>Prequalification</HeadingText>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Browse and apply for vendor prequalification schemes. Get pre-approved by buyers before bidding, or create qualification criteria to vet potential suppliers for your projects.
          </p>
        </div>
        <Button className="bg-dark hover:bg-mid_grey text-white" size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} className="mr-1" /> Create Scheme
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "browse", label: "Browse Schemes" },
          { id: "applications", label: `My Applications (${myApplications.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-gold text-gold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Browse Tab */}
      {activeTab === "browse" && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes..."
              className="pl-9"
            />
          </div>

          {filteredSchemes.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Shield className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-lg font-medium text-gray-700">No prequalification schemes yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Create a prequalification scheme to define vendor qualification criteria, then suppliers can apply.
              </p>
              <Button className="bg-dark hover:bg-mid_grey text-white" size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus size={14} className="mr-1" /> Create Scheme
              </Button>
            </div>
          ) : (
            filteredSchemes.map((scheme) => {
              const myApp = getMyAppForScheme(scheme.id);
              return (
                <div
                  key={scheme.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedScheme(expandedScheme === scheme.id ? null : scheme.id)
                    }
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Shield size={20} className="text-gold shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{scheme.name}</h3>
                        <p className="text-sm text-gray-500">
                          {scheme.company_name} · {scheme.industry_category?.replace(/_/g, " ")} ·
                          Valid {scheme.validity_months} months ·{" "}
                          {scheme.applications_count} applicant(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {myApp && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_BADGE[myApp.status]?.color || "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {STATUS_BADGE[myApp.status]?.label || myApp.status}
                        </span>
                      )}
                      {expandedScheme === scheme.id ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </button>

                  {expandedScheme === scheme.id && (
                    <div className="border-t border-gray-100 p-4 space-y-3">
                      {scheme.description && (
                        <p className="text-sm text-gray-600">{scheme.description}</p>
                      )}

                      {scheme.criteria?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Evaluation Criteria
                          </h4>
                          <div className="space-y-2">
                            {scheme.criteria.map((c) => (
                              <div
                                key={c.id}
                                className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3"
                              >
                                <div>
                                  <span className="font-medium text-gray-800">{c.name}</span>
                                  {c.evidence_requirement && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Evidence: {c.evidence_requirement}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                  <span className="font-medium text-gray-700">
                                    {c.weight}% weight
                                  </span>
                                  <br />
                                  {c.scoring_method?.replace(/_/g, " ")} · min {c.min_threshold}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {!myApp && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setApplyScheme(scheme);
                              setShowApplyModal(true);
                            }}
                          >
                            Apply for Prequalification
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              webRoutes.biddingPrequalificationReview.replace(":id", scheme.id)
                            )
                          }
                        >
                          <Users size={14} className="mr-1" /> View Applications
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* My Applications Tab */}
      {activeTab === "applications" && (
        <div className="space-y-3">
          {myApplications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              You haven't applied to any prequalification schemes yet.
            </p>
          ) : (
            myApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{app.scheme_name}</p>
                  <p className="text-sm text-gray-500">
                    Applied: {new Date(app.applied_at).toLocaleDateString()}
                    {app.expires_at &&
                      ` · Expires: ${new Date(app.expires_at).toLocaleDateString()}`}
                    {app.overall_score !== null &&
                      ` · Score: ${app.overall_score}`}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_BADGE[app.status]?.color || "bg-gray-100 text-gray-500"
                  }`}
                >
                  {STATUS_BADGE[app.status]?.label || app.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Scheme Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-4 my-auto">
            <h3 className="text-lg font-semibold">Create Prequalification Scheme</h3>
            <form onSubmit={handleCreateScheme} className="space-y-4">
              {userCompanies.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <Select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    required
                  >
                    <option value="">Select company</option>
                    {userCompanies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name || c.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheme Name *
                  </label>
                  <Input
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    placeholder="e.g. NIPEX JQS Equivalent"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <Select
                    value={createForm.industry_category}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, industry_category: e.target.value })
                    }
                  >
                    <option value="oil_gas">Oil & Gas</option>
                    <option value="mining">Mining</option>
                    <option value="construction">Construction</option>
                    <option value="maritime">Maritime</option>
                    <option value="general">General</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validity (months)
                  </label>
                  <Input
                    type="number"
                    value={createForm.validity_months}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        validity_months: parseInt(e.target.value) || 12,
                      })
                    }
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auto-Approve Threshold
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={createForm.auto_approve_if_score_above}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        auto_approve_if_score_above: e.target.value,
                      })
                    }
                    placeholder="e.g. 75.00"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={createForm.requires_compliance_check}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        requires_compliance_check: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label className="text-sm text-gray-700">
                    Require compliance check
                  </label>
                </div>
              </div>

              {/* Criteria builder */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Evaluation Criteria ({criteria.length})
                </h4>
                {criteria.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2 mb-2"
                  >
                    <span>
                      {c.name} — {c.weight}% ({c.scoring_method})
                    </span>
                    <button
                      type="button"
                      onClick={() => setCriteria(criteria.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <Input
                    placeholder="Criterion name"
                    value={newCriterion.name}
                    onChange={(e) =>
                      setNewCriterion({ ...newCriterion, name: e.target.value })
                    }
                    className="col-span-2"
                  />
                  <Input
                    type="number"
                    placeholder="Weight %"
                    value={newCriterion.weight}
                    onChange={(e) =>
                      setNewCriterion({ ...newCriterion, weight: e.target.value })
                    }
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-dark hover:bg-mid_grey text-white" disabled={creating}>
                  {creating ? "Creating..." : "Create Scheme"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">
              Apply: {applyScheme?.name}
            </h3>
            <p className="text-sm text-gray-500">
              Operated by {applyScheme?.company_name}
              {applyScheme?.requires_compliance_check &&
                " · Compliance check required"}
            </p>

            {userCompanies.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applying Company
                </label>
                <Select
                  value={applyCompany}
                  onChange={(e) => setApplyCompany(e.target.value)}
                >
                  <option value="">Select company</option>
                  {userCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name || c.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={applying}>
                {applying ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
