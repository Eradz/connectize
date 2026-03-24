import { useState, useEffect, Component } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
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

const TABS = [
  { key: "overview", label: "Overview", icon: FileText },
  { key: "bids", label: "Bids", icon: Gavel },
  { key: "stages", label: "Stages", icon: BarChart3 },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "clarifications", label: "Q&A", icon: MessageSquare },
  { key: "activity", label: "Activity", icon: Clock },
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

function OverviewTab({ project }) {
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
              <dd className="font-medium capitalize">{project.visibility}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Bid Mode</dt>
              <dd className="font-medium capitalize">{project.bid_mode?.replace("_", " ")}</dd>
            </div>
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
        {!project.is_owner && ["submission_open"].includes(project.status) && (
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              navigate(webRoutes.biddingSubmit.replace(":id", project.id))
            }
          >
            <Send className="w-4 h-4 mr-1" />
            Submit Bid
          </Button>
        )}
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

function StagesTab({ stages }) {
  const total = stages.length;
  const completed = stages.filter((s) => s.status === "completed").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

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
            <Button size="sm" type="submit" className="bg-dark hover:bg-mid_grey text-white">
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
        className="mt-1 bg-dark hover:bg-mid_grey text-white"
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

function DocumentsTab({ project, documents, onUpload, onDelete }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload({
        file,
        project: project.id,
        document_type: "other",
        title: file.name,
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Documents ({documents.length})
        </h3>
        {project.is_owner && (
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" as="span" loading={uploading}>
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.png,.jpg,.jpeg"
            />
          </label>
        )}
      </div>

      {/* Required documents checklist */}
      {project.required_documents && project.required_documents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Required Documents</h4>
          <div className="space-y-1.5">
            {project.required_documents.map((doc, i) => {
              const uploaded = documents.some(
                (d) => d.document_type === doc || d.title?.toLowerCase().includes(doc.toLowerCase())
              );
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {uploaded ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={uploaded ? "text-gray-700" : "text-gray-500"}>{doc}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3"
            >
              <FileText className="w-5 h-5 text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.title || doc.file?.split("/").pop() || "Document"}
                </p>
                <p className="text-xs text-gray-500">
                  {doc.document_type?.replace(/_/g, " ")}
                  {doc.uploaded_at && ` · ${new Date(doc.uploaded_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {doc.file && (
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                {project.is_owner && (
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
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

  const fetchBids = async () => {
    try {
      const res = await biddingAPI.getBids({ project: id });
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

  useEffect(() => {
    fetchProject();
    fetchBids();
    fetchStages();
    fetchClarifications();
    fetchActivity();
    fetchDocuments();
  }, [id]);

  const performAction = async (action, data = {}) => {
    setActionLoading(true);
    try {
      await action(id, data);
      toast.success("Action completed");
      fetchProject();
      fetchStages();
      fetchActivity();
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
      fetchBids();
      fetchActivity();
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
            className="bg-dark hover:bg-mid_grey text-white"
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
          className: "bg-dark hover:bg-mid_grey text-white",
        },
        project.status === "published" && {
          label: "Open Submissions",
          action: () => performAction(biddingAPI.openSubmission),
          className: "bg-dark hover:bg-mid_grey text-white",
        },
        project.status === "submission_open" && {
          label: "Close Submissions",
          action: () => performAction(biddingAPI.closeSubmission),
          variant: "outline",
        },
        project.status === "submission_closed" && {
          label: "Start Evaluation",
          action: () => performAction(biddingAPI.startEvaluation),
          className: "bg-dark hover:bg-mid_grey text-white",
        },
        project.status === "under_evaluation" && {
          label: "Calculate Scores",
          action: () => performAction(biddingAPI.calculateScores),
          variant: "outline",
        },
        project.status === "under_evaluation" && {
          label: "Award",
          action: () => setShowAwardModal(true),
          className: "bg-gold hover:bg-[#E0B533] text-dark",
        },
        !["awarded", "completed", "cancelled"].includes(project.status) && {
          label: "Cancel",
          action: () => performAction(biddingAPI.cancelProject),
          className: "bg-red-600 hover:bg-red-700 text-white",
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
          {/* Non-owner: Submit Bid button for open projects */}
          {!project.is_owner && project.status === "submission_open" && (
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
          )}
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
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
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
        <BidsTab project={project} bids={bids} onRefresh={fetchBids} />
      )}
      {activeTab === "stages" && <StagesTab stages={stages} />}
      {activeTab === "documents" && (
        <DocumentsTab
          project={project}
          documents={documents}
          onUpload={handleUploadDocument}
          onDelete={handleDeleteDocument}
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
