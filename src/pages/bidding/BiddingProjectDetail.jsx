import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import { webRoutes } from "../../lib/webRoutes";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
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
} from "lucide-react";

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
          <h4 className="font-semibold text-gray-900 mb-3">Specifications</h4>
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

      {/* Custom form fields rendered from template */}
      {project.custom_fields && Object.keys(project.custom_fields).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Custom Fields</h4>
          <dl className="space-y-3">
            {Object.entries(project.custom_fields).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <dt className="text-gray-500 capitalize">{key.replace(/_/g, " ")}</dt>
                <dd className="font-medium">{String(value)}</dd>
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
              navigate(webRoutes.biddingSubmitBid.replace(":projectId", project.id))
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
              onClick={() => navigate(webRoutes.biddingBidDetail.replace(":id", bid.id))}
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
              {bid.weighted_score !== null && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3.5 h-3.5 text-[#F1C644]" />
                  <span className="text-sm font-medium">{bid.weighted_score} pts</span>
                  {bid.rank && (
                    <span className="text-xs text-gray-500 ml-2">Rank #{bid.rank}</span>
                  )}
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
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Workflow Stages</h3>
      {stages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No stages defined</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`bg-white rounded-xl border p-4 ${
                stage.status === "active"
                  ? "border-[#F1C644] ring-1 ring-[#F1C644]/20"
                  : stage.status === "completed"
                  ? "border-green-200 bg-green-50/30"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    stage.status === "active"
                      ? "bg-[#F1C644] text-gray-900"
                      : stage.status === "completed"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stage.status === "completed" ? "✓" : index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{stage.name}</h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        stage.status === "active"
                          ? "bg-[#F1C644]/20 text-[#b8952e]"
                          : stage.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 capitalize">
                    {stage.stage_type?.replace(/_/g, " ")}
                  </p>
                </div>
                {stage.deadline && (
                  <span className="text-xs text-gray-500">
                    Due: {new Date(stage.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
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
            <Button variant="primary" size="sm" type="submit">
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
        variant="primary"
        size="xs"
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

function ActivityTab({ activities }) {
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
            {activities.map((act) => (
              <div key={act.id} className="relative pl-10">
                <div className="absolute left-2.5 w-3 h-3 bg-[#F1C644] rounded-full border-2 border-white" />
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <p className="text-sm text-gray-900">{act.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {act.actor_name} · {new Date(act.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BiddingProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [bids, setBids] = useState([]);
  const [stages, setStages] = useState([]);
  const [clarifications, setClarifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedBidForAward, setSelectedBidForAward] = useState(null);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await biddingAPI.getProject(id);
      setProject(res?.data || res);
    } catch {
      toast.error("Failed to load project");
      navigate(webRoutes.bidding);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const res = await biddingAPI.getBids({ project: id });
      setBids((res?.data || res)?.results || res?.data || []);
    } catch {}
  };

  const fetchStages = async () => {
    try {
      const res = await biddingAPI.getProjectStages(id);
      setStages((res?.data || res)?.results || res?.data || []);
    } catch {}
  };

  const fetchClarifications = async () => {
    try {
      const res = await biddingAPI.getClarifications(id);
      setClarifications((res?.data || res)?.results || res?.data || []);
    } catch {}
  };

  const fetchActivity = async () => {
    try {
      const res = await biddingAPI.getProjectActivity(id);
      setActivities((res?.data || res)?.results || res?.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchProject();
    fetchBids();
    fetchStages();
    fetchClarifications();
    fetchActivity();
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
      toast.error(err?.error || err?.detail || "Action failed");
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

  if (!project) return null;

  const ownerActions = project.is_owner
    ? [
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
          variant: "primary",
        },
        !["awarded", "completed", "cancelled"].includes(project.status) && {
          label: "Cancel",
          action: () => performAction(biddingAPI.cancelProject),
          variant: "danger",
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
        {ownerActions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ownerActions.map((a, i) => (
              <Button
                key={i}
                variant={a.variant || "outline"}
                size="sm"
                onClick={a.action}
                loading={actionLoading}
              >
                {a.label}
              </Button>
            ))}
          </div>
        )}
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
