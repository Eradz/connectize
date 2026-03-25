import { useState, useEffect, Component } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import { getAllCompanies } from "../../api-services/companies";
import { webRoutes } from "../../lib/webRoutes";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  MapPin,
  Building2,
  Users,
  FileText,
  Calendar,
  Gavel,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Award,
  BarChart3,
  MessageSquare,
  Eye,
  ChevronDown,
  Plus,
  Download,
  Star,
  Upload,
  Trash2,
  Activity,
  User,
  Pencil,
  ScrollText,
  ShieldCheck,
  ShieldAlert,
  Search,
} from "lucide-react";

class BiddingDetailErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("BiddingDetail render crash:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="text-center py-20 bg-white rounded-xl border border-red-200">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 font-medium mb-1">Something went wrong</p>
            <p className="text-sm text-gray-500 mb-4">{this.state.error?.message}</p>
            <button
              className="px-4 py-2 bg-[#242424] hover:bg-[#373737] text-white rounded-lg text-sm"
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const STATUS_LABELS = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: FileText },
  published: { label: "Published", color: "bg-blue-100 text-blue-700", icon: Eye },
  submission_open: { label: "Submission Open", color: "bg-green-100 text-green-700", icon: Send },
  submission_closed: { label: "Submission Closed", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  under_evaluation: { label: "Under Evaluation", color: "bg-purple-100 text-purple-700", icon: BarChart3 },
  awarded: { label: "Awarded", color: "bg-emerald-100 text-emerald-700", icon: Award },
  completed: { label: "Completed", color: "bg-teal-100 text-teal-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

const ALL_TABS = [
  { key: "overview", label: "Overview", icon: FileText },
  { key: "bids", label: "Bids", icon: Gavel },
  { key: "stages", label: "Stages", icon: BarChart3 },
  { key: "invitations", label: "Invitations", icon: Users, ownerOnly: true },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "addenda", label: "Addenda", icon: ScrollText },
  { key: "clarifications", label: "Q&A", icon: MessageSquare },
  { key: "compliance", label: "Compliance", icon: ShieldCheck, ownerOnly: true },
  { key: "activity", label: "Activity", icon: Clock, ownerOnly: true },
];

function unwrapApiPayload(response) {
  if (response == null) return null;

  let payload = response;
  if (payload && typeof payload === "object" && "data" in payload) {
    payload = payload.data;
  }
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "data" in payload &&
    !("id" in payload) &&
    !("results" in payload)
  ) {
    payload = payload.data;
  }

  return payload ?? null;
}

function unwrapApiList(response) {
  const payload = unwrapApiPayload(response);
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload)) return payload;
  return [];
}

function StatusBadge({ status }) {
  const config = STATUS_LABELS[status] || { label: status, color: "bg-gray-100" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function formatLabel(value) {
  if (!value) return "-";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function summarizeStages(stages = []) {
  const activeStage = stages.find((stage) => stage.status === "active") || null;
  const evaluationStages = stages.filter((stage) => stage.stage_type === "evaluation");
  const approvalStages = stages.filter((stage) => stage.stage_type === "approval");

  return {
    activeStage,
    pendingCount: stages.filter((stage) => stage.status === "pending").length,
    evaluationCount: evaluationStages.length,
    evaluationSubmissions: evaluationStages.reduce(
      (total, stage) => total + (stage.evaluations_count || 0),
      0
    ),
    approvalCount: approvalStages.length,
    approvalDecisions: approvalStages.reduce(
      (total, stage) => total + (stage.approvals_count || 0),
      0
    ),
  };
}

function OverviewTab({ project }) {
  const bidHandlingMode = project.workflow_template_bid_mode
    || (project.envelope_configuration?.length > 1 ? "multi_envelope" : null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: project.description }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Project Info</h4>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Project Type</dt>
              <dd className="font-medium uppercase">{project.project_type}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Category</dt>
              <dd className="font-medium">{project.category || "—"}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Visibility</dt>
              <dd className="font-medium">{formatLabel(project.visibility)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Workflow Template</dt>
              <dd className="font-medium text-right">{project.workflow_template_name || "Standard workflow"}</dd>
            </div>
            {bidHandlingMode && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Bid Handling</dt>
                <dd className="font-medium">{formatLabel(bidHandlingMode)}</dd>
              </div>
            )}
            {project.country && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Location</dt>
                <dd className="font-medium">{project.country}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Budget & Timeline</h4>
          <dl className="space-y-3">
            {project.budget_min && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Min Budget</dt>
                <dd className="font-medium">
                  {project.currency} {Number(project.budget_min).toLocaleString()}
                </dd>
              </div>
            )}
            {project.budget_max && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Max Budget</dt>
                <dd className="font-medium">
                  {project.currency} {Number(project.budget_max).toLocaleString()}
                </dd>
              </div>
            )}
            {project.submission_deadline && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Submission Deadline</dt>
                <dd className="font-medium">
                  {new Date(project.submission_deadline).toLocaleDateString()}
                </dd>
              </div>
            )}
            {project.expected_award_date && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Expected Award Date</dt>
                <dd className="font-medium">
                  {new Date(project.expected_award_date).toLocaleDateString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Procurement Setup</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Submission Model</p>
            <p className="text-sm font-medium text-gray-900">{formatLabel(bidHandlingMode || "sealed")}</p>
            <p className="text-xs text-gray-500 mt-1">
              {project.workflow_template_name
                ? `Driven by ${project.workflow_template_name}`
                : "Using the default project workflow"}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Supplier Access</p>
            <p className="text-sm font-medium text-gray-900">{formatLabel(project.visibility)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {project.required_prequalification_scheme?.name
                ? `Prequalification scheme: ${project.required_prequalification_scheme.name}`
                : "No prequalification gate configured"}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Required Documents</p>
            <p className="text-sm font-medium text-gray-900">{project.required_documents?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">
              Document checklist enforced before final bid submission
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Local Content</p>
            <p className="text-sm font-medium text-gray-900">
              {project.local_content_weight
                ? `${project.local_content_weight}% weighted`
                : "Not configured"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {project.local_content_minimum
                ? `Minimum threshold: ${project.local_content_minimum}%`
                : "No minimum threshold set"}
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Envelope Status */}
      {project.envelope_configuration?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Envelope Configuration</h4>
          <div className="space-y-2">
            {project.envelope_configuration
              .sort((a, b) => a.order - b.order)
              .map((env) => (
                <div
                  key={env.type}
                  className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                >
                  <span className="font-medium text-gray-700 capitalize">
                    {env.type} Envelope
                  </span>
                  <span className="text-gray-500">
                    Order {env.order} · Weight {env.weight}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Custom form fields rendered from specifications */}
      {project.specifications && Object.keys(project.specifications).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Specifications</h4>

          {/* Custom field definitions */}
          {Array.isArray(project.specifications.custom_fields) &&
            project.specifications.custom_fields.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Required Fields
                </p>
                <div className="space-y-2">
                  {project.specifications.custom_fields.map((field, i) => (
                    <div
                      key={field.key || i}
                      className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <span className="text-gray-700 font-medium">
                        {field.label || field.key}
                        {field.required && (
                          <span className="text-red-400 ml-0.5">*</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {field.type || "text"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Other specification key-value pairs */}
          <dl className="space-y-3">
            {Object.entries(project.specifications)
              .filter(([key]) => key !== "custom_fields")
              .map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <dt className="text-gray-500 capitalize">{key.replace(/_/g, " ")}</dt>
                  <dd className="font-medium">
                    {typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : Array.isArray(value)
                      ? value.join(", ")
                      : String(value)}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      )}
    </div>
  );
}

function BidsTab({ project, bids, onRefresh }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Bids ({bids.length})
        </h3>
        {!project.is_owner && ["submission_open"].includes(project.status) && (() => {
          const myBid = bids.find(b => b.status !== "draft");
          const myDraft = bids.find(b => b.status === "draft");
          if (myBid && project.allow_bid_amendments !== false) return (
            <Button
              size="sm"
              className="bg-gold hover:bg-[#E0B533] text-dark"
              onClick={() =>
                navigate(`${webRoutes.biddingSubmit.replace(":id", project.id)}?bid=${myBid.id}`)
              }
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit Bid
            </Button>
          );
          if (myBid) return null; // submitted but amendments disabled
          if (myDraft) return (
            <Button
              size="sm"
              className="bg-gold hover:bg-[#E0B533] text-dark"
              onClick={() =>
                navigate(`${webRoutes.biddingSubmit.replace(":id", project.id)}?bid=${myDraft.id}`)
              }
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit Draft
            </Button>
          );
          return (
            <Button
              size="sm"
              className="bg-gold hover:bg-[#E0B533] text-dark"
              onClick={() =>
                navigate(webRoutes.biddingSubmit.replace(":id", project.id))
              }
            >
              <Send className="w-4 h-4 mr-1" />
              Submit Bid
            </Button>
          );
        })()}
      </div>

      {bids.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Gavel className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No bids submitted yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => (
            <div
              key={bid.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#F1C644]/40 transition cursor-pointer"
              onClick={() => navigate(webRoutes.biddingDetail.replace(":id", project.id))}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {bid.bidder_company_name || "Company"}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      bid.status === "submitted"
                        ? "bg-blue-100 text-blue-700"
                        : bid.status === "shortlisted"
                        ? "bg-green-100 text-green-700"
                        : bid.status === "awarded"
                        ? "bg-emerald-100 text-emerald-700"
                        : bid.status === "withdrawn"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {bid.status}
                  </span>
                </div>
                <span className="font-semibold text-gray-900">
                  {bid.currency} {Number(bid.total_price).toLocaleString()}
                </span>
              </div>
              {bid.technical_proposal && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {bid.technical_proposal.replace(/<[^>]+>/g, "").slice(0, 200)}
                </p>
              )}
              {/* Custom specification responses */}
              {bid.custom_responses && Object.keys(bid.custom_responses).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(() => {
                    const fieldDefs = project.specifications?.custom_fields || [];
                    const fieldMap = Object.fromEntries(fieldDefs.map(f => [f.key, f]));
                    return Object.entries(bid.custom_responses).map(([key, val]) => {
                      const def = fieldMap[key];
                      const label = def?.label || key.replace(/_/g, " ");
                      let display = val;
                      if (typeof val === "boolean") display = val ? "Yes" : "No";
                      else if (val === "true") display = "Yes";
                      else if (val === "false") display = "No";
                      return (
                        <span key={key} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          <span className="font-medium text-gray-700">{label}:</span> {String(display)}
                        </span>
                      );
                    });
                  })()}
                </div>
              )}
              {bid.weighted_score !== null && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3.5 h-3.5 text-[#F1C644]" />
                  <span className="text-sm font-medium">{bid.weighted_score} pts</span>
                  {bid.rank && (
                    <span className="text-xs text-gray-500 ml-2">Rank #{bid.rank}</span>
                  )}
                </div>
              )}
              {bid.status === "draft" && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `${webRoutes.biddingSubmit.replace(":id", project.id)}?bid=${bid.id}`
                      );
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-[#F1C644] hover:text-[#d4ad3a] transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Draft
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StagesTab({ project, stages, bidCount }) {
  const total = stages.length;
  const completed = stages.filter((s) => s.status === "completed").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const summary = summarizeStages(stages);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Workflow Stages</h3>
        {total > 0 && (
          <span className="text-sm text-gray-500">
            {completed}/{total} completed
          </span>
        )}
      </div>

      {total === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No stages defined</p>
        </div>
      ) : (
        <>
          {project?.is_owner && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Active Stage</p>
                <p className="text-sm font-semibold text-gray-900">
                  {summary.activeStage?.name || "Waiting to start"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.activeStage
                    ? formatLabel(summary.activeStage.stage_type)
                    : `${summary.pendingCount} pending stage${summary.pendingCount === 1 ? "" : "s"}`}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Evaluation Progress</p>
                <p className="text-sm font-semibold text-gray-900">
                  {bidCount} bid{bidCount === 1 ? "" : "s"} received
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.evaluationSubmissions} evaluation{summary.evaluationSubmissions === 1 ? "" : "s"} submitted
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Approval Progress</p>
                <p className="text-sm font-semibold text-gray-900">
                  {summary.approvalDecisions} decision{summary.approvalDecisions === 1 ? "" : "s"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Across {summary.approvalCount} approval gate{summary.approvalCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Workflow Completion</p>
                <p className="text-sm font-semibold text-gray-900">
                  {completed}/{total} stages complete
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.pendingCount} remaining pending stage{summary.pendingCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-dark rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {progress}%
              </span>
            </div>
            {/* Stage dots */}
            <div className="flex items-center justify-between">
              {stages.map((stage, i) => (
                <div key={stage.id} className="flex flex-col items-center" style={{ flex: 1 }}>
                  <div
                    className={`w-3 h-3 rounded-full border-2 transition-all ${
                      stage.status === "completed"
                        ? "bg-dark border-dark"
                        : stage.status === "active"
                        ? "bg-gold border-gold ring-4 ring-gold/20"
                        : "bg-white border-light_grey"
                    }`}
                    title={stage.name}
                  />
                  {total <= 10 && (
                    <span className="text-[10px] text-custom_grey mt-1 text-center leading-tight max-w-[60px] truncate">
                      {stage.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stage cards */}
          <div className="space-y-2">
            {stages.map((stage, index) => {
              const isActive = stage.status === "active";
              const isDone = stage.status === "completed";

              return (
                <div
                  key={stage.id}
                  className={`bg-white rounded-xl border p-4 transition-all ${
                    isActive
                      ? "border-gold shadow-sm"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isDone
                          ? "bg-dark text-white"
                          : isActive
                          ? "bg-gold text-dark"
                          : "bg-gray-100 text-custom_grey border-2 border-light_grey"
                      }`}
                    >
                      {isDone ? "✓" : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-dark">{stage.name}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            isDone
                              ? "bg-gray-100 text-dark"
                              : isActive
                              ? "bg-gold/10 text-mid_grey"
                              : "bg-gray-100 text-custom_grey"
                          }`}
                        >
                          {stage.status || "pending"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize bg-gray-50 text-custom_grey">
                          {stage.stage_type?.replace(/_/g, " ")}
                        </span>
                      </div>
                      {stage.notes && (
                        <p className="text-xs text-custom_grey mt-0.5 truncate">{stage.notes}</p>
                      )}
                      {(stage.evaluations_count > 0 || stage.approvals_count > 0) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {stage.evaluations_count > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              {stage.evaluations_count} evaluation{stage.evaluations_count === 1 ? "" : "s"}
                            </span>
                          )}
                          {stage.approvals_count > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                              {stage.approvals_count} approval{stage.approvals_count === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0 text-xs text-custom_grey space-y-0.5">
                      {stage.deadline && (
                        <div>Due: {new Date(stage.deadline).toLocaleDateString()}</div>
                      )}
                      {stage.started_at && (
                        <div>Started: {new Date(stage.started_at).toLocaleDateString()}</div>
                      )}
                      {stage.completed_at && (
                        <div className="font-medium text-dark">
                          Done: {new Date(stage.completed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ClarificationsTab({ project, clarifications, onAsk, onAnswer }) {
  const [question, setQuestion] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    onAsk({ question, is_private: isPrivate });
    setQuestion("");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Clarifications ({clarifications.length})
      </h3>

      {["submission_open", "published"].includes(project.status) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a clarification question..."
            className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-[#F1C644]/50 focus:border-[#F1C644]"
            rows={3}
          />
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded"
              />
              Private (only visible to project owner)
            </label>
            <Button size="sm" type="submit" variant="primary">
              Submit Question
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {clarifications.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{c.question}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Asked by {c.asked_by_name} · {new Date(c.created_at).toLocaleDateString()}
                  {c.is_private && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 rounded">Private</span>
                  )}
                </p>
                {c.answer ? (
                  <div className="mt-3 pl-3 border-l-2 border-green-300">
                    <p className="text-sm text-gray-700">{c.answer}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Answered {c.answered_at ? new Date(c.answered_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                ) : project.is_owner ? (
                  <AnswerForm clarificationId={c.id} onAnswer={onAnswer} />
                ) : (
                  <p className="text-xs text-gray-400 mt-2 italic">Awaiting response</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnswerForm({ clarificationId, onAnswer }) {
  const [answer, setAnswer] = useState("");

  return (
    <div className="mt-2">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer..."
        className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-none focus:ring-2 focus:ring-[#F1C644]/50"
        rows={2}
      />
      <Button
        size="xs"
        variant="primary"
        className="mt-1"
        onClick={() => {
          if (answer.trim()) {
            onAnswer({ clarification_id: clarificationId, answer });
            setAnswer("");
          }
        }}
      >
        Answer
      </Button>
    </div>
  );
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: "technical", label: "Technical Proposal" },
  { value: "commercial", label: "Commercial Proposal" },
  { value: "certificate", label: "Certificate / License" },
  { value: "insurance", label: "Insurance Certificate" },
  { value: "financial", label: "Financial Statement" },
  { value: "reference", label: "Reference / Past Performance" },
  { value: "bid_bond", label: "Bid Bond / Guarantee" },
  { value: "hse", label: "HSE Documentation" },
  { value: "other", label: "Other" },
];

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ComplianceStatusBadge({ status }) {
  const config = {
    verified: { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle, label: "Verified" },
    submitted: { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle, label: "Submitted" },
    pending_review: { bg: "bg-yellow-50", text: "text-yellow-700", icon: Clock, label: "Pending Review" },
    expired: { bg: "bg-orange-50", text: "text-orange-700", icon: AlertTriangle, label: "Expired" },
    rejected: { bg: "bg-red-50", text: "text-red-700", icon: XCircle, label: "Rejected" },
    missing: { bg: "bg-red-50", text: "text-red-600", icon: XCircle, label: "Not Submitted" },
  };
  const c = config[status] || config.missing;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

function BidderReviewSection({ companyId, projectId, requiredDocs, bidderDocs }) {
  const [compliance, setCompliance] = useState(null);
  const [loadingCompliance, setLoadingCompliance] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingCompliance(true);
    biddingAPI
      .getComplianceStatus(companyId, { project: projectId })
      .then((res) => {
        if (!cancelled) setCompliance(res.data || res);
      })
      .catch(() => {
        if (!cancelled) setCompliance(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingCompliance(false);
      });
    return () => { cancelled = true; };
  }, [companyId, projectId]);

  // Check each required document against this bidder's uploaded docs
  const docChecks = (requiredDocs || []).map((reqDoc) => {
    const reqLower = reqDoc.toLowerCase();
    const match = bidderDocs.find(
      (d) =>
        d.title?.toLowerCase() === reqLower ||
        d.title?.toLowerCase().includes(reqLower) ||
        reqLower.includes(d.document_type?.replace(/_/g, " "))
    );
    return { name: reqDoc, submitted: !!match, doc: match };
  });

  const submittedCount = docChecks.filter((d) => d.submitted).length;
  const missingCount = docChecks.length - submittedCount;

  // Compliance requirements (formal certificates)
  const complianceItems = compliance
    ? [
        ...(compliance.missing || []).map((r) => ({ ...r, status: "missing" })),
        ...(compliance.expired || []).map((r) => ({ ...r, status: "expired" })),
        ...(compliance.rejected || []).map((r) => ({ ...r, status: "rejected" })),
        ...(compliance.pending_verification || []).map((r) => ({ ...r, status: "pending_review" })),
      ]
    : [];
  const hasComplianceReqs = compliance && (compliance.total_requirements || 0) > 0;

  const allGood = missingCount === 0 && (!hasComplianceReqs || compliance?.compliant);

  return (
    <div className={`rounded-lg border p-3 mb-3 ${
      allGood ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"
    }`}>
      {/* Overall status header */}
      <div className="flex items-center gap-2 mb-3">
        {allGood ? (
          <ShieldCheck className="w-4 h-4 text-green-600" />
        ) : (
          <ShieldAlert className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-xs font-bold ${allGood ? "text-green-700" : "text-red-700"}`}>
          {allGood ? "All Requirements Met" : "Action Required"}
        </span>
      </div>

      {/* Required Documents Section */}
      {docChecks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-700">
              Required Documents
            </span>
            <span className="text-xs text-gray-500">
              {submittedCount}/{docChecks.length} submitted
            </span>
          </div>
          <div className="space-y-1">
            {docChecks.map((check, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-xs py-1 px-2 rounded bg-white/60">
                <span className={`truncate flex-1 ${check.submitted ? "text-gray-700" : "text-red-700 font-medium"}`}>
                  {check.name}
                </span>
                <ComplianceStatusBadge status={check.submitted ? "submitted" : "missing"} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Certificates Section */}
      {loadingCompliance ? (
        <div className="animate-pulse flex items-center gap-2 text-xs text-gray-400 py-1">
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          Loading compliance certificates...
        </div>
      ) : hasComplianceReqs ? (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-700">
              Compliance Certificates
            </span>
            <span className="text-xs text-gray-500">
              {compliance.verified_count || 0}/{compliance.total_requirements} verified
            </span>
          </div>
          {complianceItems.length > 0 ? (
            <div className="space-y-1">
              {complianceItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-xs py-1 px-2 rounded bg-white/60">
                  <span className="text-gray-700 truncate flex-1">
                    {item.name}
                    {item.category && <span className="text-gray-400"> · {item.category}</span>}
                  </span>
                  <ComplianceStatusBadge status={item.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-green-600 pl-2">All compliance certificates verified</p>
          )}
        </div>
      ) : compliance && docChecks.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No compliance requirements configured for this project</p>
      ) : null}
    </div>
  );
}

function DocumentGroupedList({ documents, project, bids, onDelete }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10; // groups per page

  // Split into project-level docs and bid docs grouped by bidder
  const projectDocs = documents.filter((d) => !d.bid);
  const bidDocs = documents.filter((d) => d.bid);

  const bidderGroups = {};
  bidDocs.forEach((doc) => {
    const key = doc.bidder_company_id || doc.uploaded_by || "unknown";
    if (!bidderGroups[key]) {
      bidderGroups[key] = {
        name: doc.bidder_company_name || doc.uploaded_by_name || "Unknown Bidder",
        companyId: doc.bidder_company_id,
        docs: [],
      };
    }
    bidderGroups[key].docs.push(doc);
  });

  if (project.is_owner && bids) {
    bids.forEach((bid) => {
      const cId = bid.bidder_company || bid.bidder_company_id;
      if (cId && !bidderGroups[cId]) {
        bidderGroups[cId] = {
          name: bid.bidder_company_name || "Unknown Bidder",
          companyId: cId,
          docs: [],
        };
      }
    });
  }

  // Build unified groups list: project first, then each bidder
  const allGroups = [
    ...(projectDocs.length > 0
      ? [{ key: "__project__", name: project.title || "Project Documents", icon: "building", companyId: null, docs: projectDocs }]
      : []),
    ...Object.entries(bidderGroups).map(([key, g]) => ({ key, ...g, icon: "user" })),
  ];

  // Unique doc types
  const docTypes = [...new Set(documents.map((d) => d.document_type).filter(Boolean))].sort();

  // Filter groups/docs
  const filteredGroups = allGroups
    .map((group) => {
      let docs = group.docs;
      if (typeFilter !== "all") docs = docs.filter((d) => d.document_type === typeFilter);
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = group.name.toLowerCase().includes(q);
        if (!nameMatch) {
          docs = docs.filter(
            (d) =>
              (d.title || "").toLowerCase().includes(q) ||
              (d.uploaded_by_name || "").toLowerCase().includes(q)
          );
        }
      }
      return { ...group, docs };
    })
    .filter((g) => g.docs.length > 0 || (search && g.name.toLowerCase().includes(search.toLowerCase())));

  const totalFilteredDocs = filteredGroups.reduce((sum, g) => sum + g.docs.length, 0);

  // Paginate groups
  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedGroups = filteredGroups.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, typeFilter]);

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const all = {};
    filteredGroups.forEach((g) => { all[g.key] = true; });
    setExpandedGroups(all);
  };

  const collapseAll = () => setExpandedGroups({});

  const expandedCount = Object.values(expandedGroups).filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or document..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 focus:border-primary-500 outline-none"
        >
          <option value="all">All Types</option>
          {docTypes.map((t) => (
            <option key={t} value={t}>
              {DOCUMENT_TYPE_OPTIONS.find((o) => o.value === t)?.label || t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button
          onClick={expandedCount > 0 ? collapseAll : expandAll}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1.5"
        >
          {expandedCount > 0 ? "Collapse All" : "Expand All"}
        </button>
        <span className="text-xs text-gray-400 ml-auto">
          {filteredGroups.length} source{filteredGroups.length !== 1 ? "s" : ""} · {totalFilteredDocs} document{totalFilteredDocs !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-xs text-gray-500 uppercase tracking-wide">
                <th className="py-2.5 px-3 font-medium w-[50%]">Document</th>
                <th className="py-2.5 px-3 font-medium">Type</th>
                <th className="py-2.5 px-3 font-medium">Size</th>
                <th className="py-2.5 px-3 font-medium">Date</th>
                <th className="py-2.5 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                    {search || typeFilter !== "all"
                      ? "No documents match your filters"
                      : "No documents found"}
                  </td>
                </tr>
              ) : (
                paginatedGroups.map((group) => {
                  const isExpanded = expandedGroups[group.key];
                  return (
                    <GroupRows
                      key={group.key}
                      group={group}
                      isExpanded={isExpanded}
                      onToggle={() => toggleGroup(group.key)}
                      project={project}
                      onDelete={onDelete}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2 bg-gray-50">
            <span className="text-xs text-gray-500">
              Page {safePage} of {totalPages} ({filteredGroups.length} source{filteredGroups.length !== 1 ? "s" : ""})
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (safePage <= 3) p = i + 1;
                else if (safePage >= totalPages - 2) p = totalPages - 4 + i;
                else p = safePage - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-2 py-1 text-xs rounded border ${
                      p === safePage
                        ? "bg-primary-600 text-white border-primary-600"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
                className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GroupRows({ group, isExpanded, onToggle, project, onDelete }) {
  const docCount = group.docs.length;
  const totalSize = group.docs.reduce((sum, d) => sum + (d.file_size || 0), 0);
  const isProject = group.key === "__project__";

  return (
    <>
      {/* Parent row — company/source */}
      <tr
        onClick={onToggle}
        className={`cursor-pointer select-none border-t border-gray-200 ${
          isExpanded ? "bg-gray-50" : "hover:bg-gray-50"
        }`}
      >
        <td className="py-2.5 px-3" colSpan={5}>
          <div className="flex items-center gap-2">
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
            />
            {isProject ? (
              <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
            ) : (
              <User className="w-4 h-4 text-gray-500 shrink-0" />
            )}
            <span className="text-sm font-semibold text-gray-800">{group.name}</span>
            <span className="text-xs text-gray-400 ml-1">
              {docCount} doc{docCount !== 1 ? "s" : ""}
              {totalSize > 0 && ` · ${formatFileSize(totalSize)}`}
            </span>
            {/* Compliance badge inline for bidder groups (owner view) */}
            {!isProject && project.is_owner && group.companyId && project.required_documents?.length > 0 && (
              <ComplianceInlineBadge
                requiredDocs={project.required_documents}
                bidderDocs={group.docs}
              />
            )}
          </div>
        </td>
      </tr>
      {/* Sub-rows — documents */}
      {isExpanded &&
        group.docs.map((doc) => {
          const fileName = doc.file?.split("/").pop() || "";
          const typeLabel =
            DOCUMENT_TYPE_OPTIONS.find((o) => o.value === doc.document_type)?.label ||
            doc.document_type?.replace(/_/g, " ");
          return (
            <tr key={doc.id} className="hover:bg-blue-50/40 transition border-t border-gray-100">
              <td className="py-2 pl-12 pr-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                  <span className="text-sm text-gray-800 truncate">
                    {doc.title || fileName || "Untitled Document"}
                  </span>
                </div>
              </td>
              <td className="py-2 px-3">
                <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600 capitalize whitespace-nowrap">
                  {typeLabel}
                </span>
              </td>
              <td className="py-2 px-3 text-xs text-gray-500 whitespace-nowrap">
                {doc.file_size > 0 ? formatFileSize(doc.file_size) : "—"}
              </td>
              <td className="py-2 px-3 text-xs text-gray-500 whitespace-nowrap">
                {(doc.created_at || doc.uploaded_at)
                  ? new Date(doc.created_at || doc.uploaded_at).toLocaleDateString()
                  : "—"}
              </td>
              <td className="py-2 px-3">
                <div className="flex items-center gap-1 justify-end">
                  {doc.file && (
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-primary-600 transition rounded hover:bg-gray-100"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {project.is_owner && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                      className="p-1 text-gray-400 hover:text-red-500 transition rounded hover:bg-gray-100"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
    </>
  );
}

function ComplianceInlineBadge({ requiredDocs, bidderDocs }) {
  const submitted = (requiredDocs || []).filter((reqDoc) => {
    const reqLower = reqDoc.toLowerCase();
    return bidderDocs.some(
      (d) =>
        d.title?.toLowerCase() === reqLower ||
        d.title?.toLowerCase().includes(reqLower) ||
        reqLower.includes(d.document_type?.replace(/_/g, " "))
    );
  }).length;
  const total = (requiredDocs || []).length;
  const allMet = submitted === total;

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ml-auto ${
        allMet ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {allMet ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <AlertTriangle className="w-3 h-3" />
      )}
      {submitted}/{total} required
    </span>
  );
}

function DocumentsTab({ project, documents, bids, onUpload, onDelete }) {
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    title: "",
    document_type: "other",
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadForm((prev) => ({
      ...prev,
      file,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
    }));
  };

  const handleSubmitUpload = async () => {
    if (!uploadForm.file) {
      toast.error("Please select a file");
      return;
    }
    if (!uploadForm.title.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    setUploading(true);
    try {
      await onUpload({
        file: uploadForm.file,
        project: project.id,
        document_type: uploadForm.document_type,
        title: uploadForm.title.trim(),
      });
      setUploadForm({ file: null, title: "", document_type: "other" });
      setShowUploadForm(false);
    } finally {
      setUploading(false);
    }
  };

  // Check which required docs have matching uploads
  const getRequiredDocStatus = (reqDoc) => {
    const reqLower = reqDoc.toLowerCase();
    return documents.find(
      (d) =>
        d.title?.toLowerCase() === reqLower ||
        d.title?.toLowerCase().includes(reqLower) ||
        reqLower.includes(d.document_type?.replace(/_/g, " "))
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Documents ({documents.length})
        </h3>
        {project.is_owner && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploadForm((v) => !v)}
          >
            <Upload className="w-4 h-4 mr-1" />
            {showUploadForm ? "Cancel" : "Upload"}
          </Button>
        )}
      </div>

      {/* Upload form */}
      {showUploadForm && (
        <div className="bg-white rounded-xl border-2 border-dashed border-primary-300 p-5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-800">Upload Document</h4>

          {/* File picker */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">File</label>
            {uploadForm.file ? (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="flex-1 truncate text-gray-800">{uploadForm.file.name}</span>
                <span className="text-xs text-gray-400">{formatFileSize(uploadForm.file.size)}</span>
                <button
                  onClick={() => setUploadForm((p) => ({ ...p, file: null }))}
                  className="text-gray-400 hover:text-red-500"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-3 py-3 cursor-pointer hover:bg-gray-50 transition text-sm text-gray-500">
                <Upload className="w-4 h-4" />
                Choose file
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.png,.jpg,.jpeg"
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Technical Proposal v2"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          {/* Document type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={uploadForm.document_type}
              onChange={(e) => setUploadForm((p) => ({ ...p, document_type: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            >
              {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={handleSubmitUpload} loading={uploading}>
              <Upload className="w-4 h-4 mr-1" />
              Upload Document
            </Button>
          </div>
        </div>
      )}

      {/* Required documents checklist (shown to bidders, not owners — owners see per-bidder breakdown) */}
      {!project.is_owner && project.required_documents && project.required_documents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Required Documents</h4>
          <div className="space-y-2">
            {project.required_documents.map((doc, i) => {
              const match = getRequiredDocStatus(doc);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    match ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  {match ? (
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span className={`flex-1 ${match ? "text-green-800" : "text-red-700"}`}>
                    {doc}
                  </span>
                  <span className={`text-xs font-medium ${match ? "text-green-600" : "text-red-500"}`}>
                    {match ? "Uploaded" : "Missing"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Uploaded documents grouped */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No documents uploaded yet</p>
          {project.is_owner && (
            <p className="text-xs text-gray-400 mt-1">
              Click "Upload" above to add project documents
            </p>
          )}
        </div>
      ) : (
        <DocumentGroupedList documents={documents} project={project} bids={bids} onDelete={onDelete} />
      )}
    </div>
  );
}

function ActivityTab({ activities }) {
  const getEventIcon = (eventType) => {
    const map = {
      created: FileText,
      published: Eye,
      submission_opened: Send,
      submission_closed: Clock,
      bid_submitted: Gavel,
      bid_withdrawn: XCircle,
      evaluation_started: BarChart3,
      stage_advanced: BarChart3,
      awarded: Award,
      cancelled: XCircle,
      clarification_asked: MessageSquare,
      clarification_answered: MessageSquare,
      score_calculated: Star,
    };
    return map[eventType] || Activity;
  };

  const getEventColor = (eventType) => {
    if (["awarded", "completed"].includes(eventType)) return "bg-green-500";
    if (["cancelled", "bid_withdrawn"].includes(eventType)) return "bg-red-400";
    if (["bid_submitted"].includes(eventType)) return "bg-blue-500";
    if (["evaluation_started", "score_calculated"].includes(eventType)) return "bg-purple-500";
    return "bg-[#F1C644]";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Activity Log</h3>
      {activities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No activity yet</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-4">
            {activities.map((act) => {
              const IconComp = getEventIcon(act.event_type);
              const dotColor = getEventColor(act.event_type);
              return (
                <div key={act.id} className="relative pl-10">
                  <div
                    className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${dotColor}`}
                  >
                    <IconComp className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <p className="text-sm text-gray-900">{act.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {act.actor_name && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          {act.actor_name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                      {act.event_type && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded capitalize">
                          {act.event_type.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ADDENDA TAB
// =============================================================================

const ADDENDUM_TYPE_LABELS = {
  clarification: "Clarification",
  specification_change: "Specification Change",
  deadline_extension: "Deadline Extension",
  scope_change: "Scope Change",
  document_update: "Document Update",
};

function AddendaTab({ project, addenda, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    addendum_type: "clarification",
    new_deadline: "",
  });

  const handleIssue = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    try {
      setSubmitting(true);
      const payload = { ...form };
      if (!payload.new_deadline) delete payload.new_deadline;
      await biddingAPI.issueAddendum(project.id, payload);
      toast.success("Addendum issued successfully");
      setShowForm(false);
      setForm({ title: "", description: "", addendum_type: "clarification", new_deadline: "" });
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to issue addendum");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledge = async (addendumNumber) => {
    try {
      await biddingAPI.acknowledgeAddendum(project.id, addendumNumber);
      toast.success(`Addendum #${addendumNumber} acknowledged`);
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to acknowledge");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Tender Addenda ({addenda.length})
        </h3>
        {project.is_owner && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" />
            Issue Addendum
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <input
            type="text"
            placeholder="Addendum title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description of changes..."
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <div className="flex gap-3">
            <select
              value={form.addendum_type}
              onChange={(e) => setForm((f) => ({ ...f, addendum_type: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {Object.entries(ADDENDUM_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            {form.addendum_type === "deadline_extension" && (
              <input
                type="datetime-local"
                value={form.new_deadline}
                onChange={(e) => setForm((f) => ({ ...f, new_deadline: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleIssue} disabled={submitting}>
              {submitting ? "Issuing..." : "Issue Addendum"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {addenda.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <ScrollText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No addenda issued yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addenda.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      #{a.addendum_number}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded capitalize">
                      {ADDENDUM_TYPE_LABELS[a.addendum_type] || a.addendum_type}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mt-1">{a.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                  {a.new_deadline && (
                    <p className="text-xs text-orange-600 mt-1">
                      New deadline: {new Date(a.new_deadline).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Issued by {a.issued_by_name} on {new Date(a.issued_at).toLocaleString()}
                    {" · "}{a.acknowledged_count} acknowledgment(s)
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAcknowledge(a.addendum_number)}
                  disabled={project.is_owner}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Acknowledge
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InvitationsTab({ project, invitations, availableCompanies, onRefresh }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ invited_company: "", message: "" });

  const invitedCompanyIds = new Set(
    invitations.map((invitation) => String(invitation.invited_company))
  );
  const inviteOptions = availableCompanies.filter(
    (company) =>
      String(company.id) !== String(project.company)
      && !invitedCompanyIds.has(String(company.id))
  );

  const handleSendInvitation = async () => {
    if (!form.invited_company) {
      toast.error("Select a company to invite");
      return;
    }

    try {
      setSubmitting(true);
      await biddingAPI.sendInvitations(project.id, form);
      toast.success("Invitation sent");
      setForm({ invited_company: "", message: "" });
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to send invitation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Project Invitations ({invitations.length})
        </h3>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Invite Suppliers</h4>
        {inviteOptions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No additional companies are available to invite from the current company list.
          </p>
        ) : (
          <>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              value={form.invited_company}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, invited_company: e.target.value }))
              }
            >
              <option value="">Select company</option>
              {inviteOptions.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Optional invitation note"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSendInvitation} loading={submitting}>
                <Send className="w-4 h-4 mr-1" />
                Send Invitation
              </Button>
            </div>
          </>
        )}
      </div>

      {invitations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No invitations sent yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{invitation.invited_company_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Sent by {invitation.invited_by_name || "Project owner"} on {new Date(invitation.created_at).toLocaleString()}
                  </p>
                  {invitation.message && (
                    <p className="text-sm text-gray-600 mt-2">{invitation.message}</p>
                  )}
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    invitation.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : invitation.status === "declined"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {invitation.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComplianceReviewTab({ project }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [rejectDoc, setRejectDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  async function fetchData() {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await biddingAPI.getComplianceReview(project.id, params);
      setData(res.data || res);
    } catch {
      toast.error("Failed to load compliance review data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [project.id, statusFilter]);

  async function handleVerify(docId) {
    try {
      await biddingAPI.verifyComplianceDocument(docId);
      toast.success("Document verified");
      fetchData();
    } catch {
      toast.error("Verification failed");
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) { toast.error("Please provide a rejection reason"); return; }
    try {
      await biddingAPI.rejectComplianceDocument(rejectDoc.id, rejectReason);
      toast.success("Document rejected");
      setRejectDoc(null);
      setRejectReason("");
      fetchData();
    } catch {
      toast.error("Rejection failed");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!data || !data.bidders || data.bidders.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto" />
        <h3 className="text-lg font-medium text-gray-700">No bidder compliance documents</h3>
        <p className="text-sm text-gray-500">
          Compliance documents from bidders will appear here once they submit bids.
        </p>
      </div>
    );
  }

  const pendingCount = data.bidders.reduce(
    (sum, b) => sum + b.documents.filter((d) => d.status === "pending_review").length, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Compliance Review</h3>
          {pendingCount > 0 && (
            <span className="bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
              {pendingCount} pending review
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {data.bidders.map((bidder) => (
        <div key={bidder.company_id} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">{bidder.company_name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{bidder.documents.filter((d) => d.status === "verified").length} verified</span>
              <span>{bidder.documents.filter((d) => d.status === "pending_review").length} pending</span>
              <span>{data.requirements.length - bidder.documents.length} missing</span>
            </div>
          </div>

          {bidder.documents.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 italic">
              No compliance documents uploaded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bidder.documents.map((doc) => {
                const statusColors = {
                  verified: "bg-green-100 text-green-700",
                  pending_review: "bg-yellow-100 text-yellow-700",
                  rejected: "bg-red-100 text-red-700",
                  expired: "bg-red-100 text-red-700",
                };
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{doc.requirement_name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.category_name} &middot; Issued: {doc.issue_date} &middot; Expires: {doc.expiry_date} &middot; v{doc.version}
                      </p>
                      {doc.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1">Rejected: {doc.rejection_reason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[doc.status] || "bg-gray-100 text-gray-600"}`}>
                        {doc.status.replace("_", " ")}
                      </span>
                      {doc.document_file && (
                        <a href={doc.document_file} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-sm">
                          View
                        </a>
                      )}
                      {doc.status === "pending_review" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleVerify(doc.id)} className="text-green-600 border-green-300 hover:bg-green-50">
                            <CheckCircle size={14} className="mr-1" /> Verify
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setRejectDoc(doc); setRejectReason(""); }} className="text-red-600 border-red-300 hover:bg-red-50">
                            <XCircle size={14} className="mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Reject Modal */}
      {rejectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Reject Document</h3>
            <p className="text-sm text-gray-500">
              Rejecting: {rejectDoc.requirement_name} from {rejectDoc.company_name}
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this document is being rejected..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRejectDoc(null); setRejectReason(""); }}>Cancel</Button>
              <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white">Reject Document</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BiddingProjectDetailInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [bids, setBids] = useState([]);
  const [stages, setStages] = useState([]);
  const [clarifications, setClarifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedBidForAward, setSelectedBidForAward] = useState(null);
  const [error, setError] = useState(null);
  const [addenda, setAddenda] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState([]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await biddingAPI.getProject(id);
      const projectData = unwrapApiPayload(res);
      if (!projectData) {
        setError("Project not found or failed to load.");
        setProject(null);
        return;
      }
      setProject(projectData);
    } catch (err) {
      console.error("fetchProject error:", err);
      setError("Failed to load project. Please try again.");
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async (roleOverride) => {
    try {
      const params = { project: id };
      if (roleOverride) {
        params.role = roleOverride;
      }
      const res = await biddingAPI.getBids(params);
      setBids(unwrapApiList(res));
    } catch {
      setBids([]);
    }
  };

  const fetchStages = async () => {
    try {
      const res = await biddingAPI.getProjectStages(id);
      setStages(unwrapApiList(res));
    } catch {
      setStages([]);
    }
  };

  const fetchClarifications = async () => {
    try {
      const res = await biddingAPI.getClarifications(id);
      setClarifications(unwrapApiList(res));
    } catch {
      setClarifications([]);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await biddingAPI.getProjectActivity(id);
      setActivities(unwrapApiList(res));
    } catch {
      setActivities([]);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await biddingAPI.getDocuments({ bid_project: id });
      setDocuments(unwrapApiList(res));
    } catch {
      setDocuments([]);
    }
  };

  const fetchAddenda = async () => {
    try {
      const res = await biddingAPI.getAddenda(id);
      setAddenda(unwrapApiList(res));
    } catch {
      setAddenda([]);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await biddingAPI.getInvitations(id);
      setInvitations(unwrapApiList(res));
    } catch {
      setInvitations([]);
    }
  };

  const fetchAvailableCompanies = async () => {
    try {
      const companies = await getAllCompanies({ page_size: 100 });
      setAvailableCompanies(Array.isArray(companies) ? companies : []);
    } catch {
      setAvailableCompanies([]);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchStages();
    fetchClarifications();
    fetchDocuments();
    fetchAddenda();
  }, [id]);

  useEffect(() => {
    if (!project) {
      return;
    }

    fetchBids(project.is_owner ? "buyer" : undefined);

    if (project.is_owner) {
      fetchInvitations();
      fetchActivity();
      fetchAvailableCompanies();
    } else {
      setInvitations([]);
      setActivities([]);
      setAvailableCompanies([]);
    }
  }, [project?.id, project?.is_owner]);

  const performAction = async (action, data = {}) => {
    setActionLoading(true);
    try {
      await action(id, data);
      toast.success("Action completed");
      fetchProject();
      fetchStages();
      if (project?.is_owner) {
        fetchInvitations();
      }
      fetchBids(project?.is_owner ? "buyer" : undefined);
      if (project?.is_owner) fetchActivity();
    } catch (err) {
      const errData = err?.response?.data;
      const message = errData?.detail || errData?.error || (typeof errData === "string" ? errData : null) || "Action failed";
      toast.error(message);
      console.error("Action error:", err?.response?.status, errData);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAskClarification = async (data) => {
    try {
      await biddingAPI.askClarification(id, data);
      toast.success("Question submitted");
      fetchClarifications();
    } catch {
      toast.error("Failed to submit question");
    }
  };

  const handleAnswerClarification = async (data) => {
    try {
      await biddingAPI.answerClarification(id, data);
      toast.success("Answer submitted");
      fetchClarifications();
    } catch {
      toast.error("Failed to submit answer");
    }
  };

  const handleUploadDocument = async (data) => {
    try {
      await biddingAPI.uploadDocument(data);
      toast.success("Document uploaded");
      fetchDocuments();
    } catch {
      toast.error("Failed to upload document");
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await biddingAPI.deleteDocument(docId);
      toast.success("Document deleted");
      fetchDocuments();
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const handleAward = async () => {
    if (!selectedBidForAward) return;
    try {
      setActionLoading(true);
      await biddingAPI.awardProject(id, { bid_id: selectedBidForAward });
      toast.success("Project awarded!");
      setShowAwardModal(false);
      fetchProject();
      fetchBids("buyer");
      if (project?.is_owner) fetchActivity();
    } catch (err) {
      toast.error(err?.error || "Award failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(webRoutes.bidding)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">{error || "Project not found"}</p>
          <p className="text-sm text-gray-400 mb-4">The project may have been removed or you may not have access.</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setError(null); fetchProject(); }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const ownerActions = project.is_owner
    ? [
        project.status === "draft" && {
          label: "Edit Draft",
          action: () => navigate(webRoutes.biddingEdit.replace(":id", project.id)),
          variant: "outline",
        },
        project.status === "draft" && {
          label: "Publish",
          action: () => performAction(biddingAPI.publishProject),
          variant: "primary",
        },
        project.status === "published" && {
          label: "Open Submissions",
          action: () => performAction(biddingAPI.openSubmission),
          variant: "primary",
        },
        project.status === "submission_open" && {
          label: "Close Submissions",
          action: () => performAction(biddingAPI.closeSubmission),
          variant: "outline",
        },
        project.status === "submission_closed" && {
          label: "Start Evaluation",
          action: () => performAction(biddingAPI.startEvaluation),
          variant: "primary",
        },
        project.status === "under_evaluation" && {
          label: "Calculate Scores",
          action: () => performAction(biddingAPI.calculateScores),
          variant: "outline",
        },
        project.status === "under_evaluation" && {
          label: "Award",
          action: () => setShowAwardModal(true),
          variant: "warning",
        },
        !['awarded', 'completed', 'cancelled'].includes(project.status) && {
          label: 'Cancel',
          action: () => performAction(biddingAPI.cancelProject),
          variant: 'danger',
        },
      ].filter(Boolean)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back & Header */}
      <button
        onClick={() => navigate(webRoutes.bidding)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm text-gray-500">
            {project.reference_number} · {project.company_name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ownerActions.map((a, i) => (
            <Button
              key={i}
              variant={a.variant || "ghost"}
              size="sm"
              onClick={a.action}
              loading={actionLoading}
              className={a.className || ""}
            >
              {a.label}
            </Button>
          ))}
          {/* Non-owner: Submit / Edit Bid button for open projects */}
          {!project.is_owner && project.status === "submission_open" && (() => {
            const myBid = bids.find(b => b.status !== "draft");
            const myDraft = bids.find(b => b.status === "draft");
            if (myBid && project.allow_bid_amendments !== false) return (
              <Button
                size="sm"
                className="bg-gold hover:bg-[#E0B533] text-dark"
                onClick={() =>
                  navigate(`${webRoutes.biddingSubmit.replace(":id", project.id)}?bid=${myBid.id}`)
                }
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit Bid
              </Button>
            );
            if (myBid) return null; // submitted but amendments disabled
            if (myDraft) return (
              <Button
                size="sm"
                className="bg-gold hover:bg-[#E0B533] text-dark"
                onClick={() =>
                  navigate(`${webRoutes.biddingSubmit.replace(":id", project.id)}?bid=${myDraft.id}`)
                }
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit Draft
              </Button>
            );
            return (
              <Button
                size="sm"
                className="bg-gold hover:bg-[#E0B533] text-dark"
                onClick={() =>
                  navigate(webRoutes.biddingSubmit.replace(":id", project.id))
                }
              >
                <Send className="w-4 h-4 mr-1" />
                Submit Bid
              </Button>
            );
          })()}
          {/* Owner: Evaluate link */}
          {project.is_owner && project.status === "under_evaluation" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(webRoutes.biddingEvaluate.replace(":id", project.id))
              }
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Evaluate Bids
            </Button>
          )}
          {/* Owner: Rate Supplier for awarded/completed projects */}
          {project.is_owner && ["awarded", "completed"].includes(project.status) && project.awarded_to && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(webRoutes.supplierScorecard.replace(":companyId", project.awarded_to).replace(":projectId", project.id))
              }
            >
              <Star className="w-4 h-4 mr-1" />
              Rate Supplier
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 overflow-x-auto">
          {ALL_TABS.filter(t => !t.ownerOnly || project.is_owner).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === key
                  ? "border-[#F1C644] text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {key === "bids" && bids.length > 0 && (
                <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {bids.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab project={project} />}
      {activeTab === "bids" && (
        <BidsTab project={project} bids={bids} onRefresh={() => fetchBids(project?.is_owner ? "buyer" : undefined)} />
      )}
      {activeTab === 'stages' && <StagesTab project={project} stages={stages} bidCount={bids.length} />}
      {activeTab === "invitations" && project.is_owner && (
        <InvitationsTab
          project={project}
          invitations={invitations}
          availableCompanies={availableCompanies}
          onRefresh={fetchInvitations}
        />
      )}
      {activeTab === "documents" && (
        <DocumentsTab
          project={project}
          documents={documents}
          bids={bids}
          onUpload={handleUploadDocument}
          onDelete={handleDeleteDocument}
        />
      )}
      {activeTab === "addenda" && (
        <AddendaTab
          project={project}
          addenda={addenda}
          onRefresh={fetchAddenda}
        />
      )}
      {activeTab === "clarifications" && (
        <ClarificationsTab
          project={project}
          clarifications={clarifications}
          onAsk={handleAskClarification}
          onAnswer={handleAnswerClarification}
        />
      )}
      {activeTab === "activity" && <ActivityTab activities={activities} />}
      {activeTab === "compliance" && project.is_owner && (
        <ComplianceReviewTab project={project} />
      )}

      {/* Award Modal */}
      {showAwardModal && (
        <Modal
          isOpen={showAwardModal}
          onClose={() => setShowAwardModal(false)}
          title="Award Project"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a bid to award this project to:
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bids
                .filter((b) => ["submitted", "shortlisted"].includes(b.status))
                .map((bid) => (
                  <label
                    key={bid.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selectedBidForAward === bid.id
                        ? "border-[#F1C644] bg-[#F1C644]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="awardBid"
                      value={bid.id}
                      checked={selectedBidForAward === bid.id}
                      onChange={() => setSelectedBidForAward(bid.id)}
                      className="text-[#F1C644]"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{bid.bidder_company_name}</p>
                      <p className="text-xs text-gray-500">
                        {bid.currency} {Number(bid.total_price).toLocaleString()}
                        {bid.weighted_score && ` · Score: ${bid.weighted_score}`}
                      </p>
                    </div>
                  </label>
                ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAwardModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAward}
                loading={actionLoading}
                disabled={!selectedBidForAward}
              >
                <Award className="w-4 h-4 mr-1" />
                Award
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function BiddingProjectDetail() {
  return (
    <BiddingDetailErrorBoundary>
      <BiddingProjectDetailInner />
    </BiddingDetailErrorBoundary>
  );
}
