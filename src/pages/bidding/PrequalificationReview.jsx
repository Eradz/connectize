import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import HeadingText from "../../components/HeadingText";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Star,
} from "lucide-react";

const STATUS_BADGE = {
  applied: { label: "Applied", color: "bg-blue-100 text-blue-700" },
  under_review: { label: "Under Review", color: "bg-yellow-100 text-yellow-700" },
  qualified: { label: "Qualified", color: "bg-green-100 text-green-700" },
  disqualified: { label: "Disqualified", color: "bg-red-100 text-red-700" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-500" },
};

export default function PrequalificationReview() {
  const { id: schemeId } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review state
  const [reviewingApp, setReviewingApp] = useState(null);
  const [scores, setScores] = useState({});
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchData();
  }, [schemeId]);

  async function fetchData() {
    setLoading(true);
    try {
      const [schemeRes, appsRes] = await Promise.all([
        biddingAPI.getPrequalificationScheme(schemeId),
        biddingAPI.getPrequalificationApplications({ scheme: schemeId }),
      ]);
      setScheme(schemeRes.data || schemeRes);
      setApplications(appsRes.data?.results || appsRes.data || []);
    } catch {
      toast.error("Failed to load scheme data");
    } finally {
      setLoading(false);
    }
  }

  function openReview(app) {
    setReviewingApp(app);
    // Pre-fill existing scores
    const existing = {};
    if (app.scores && typeof app.scores === "object") {
      Object.entries(app.scores).forEach(([critId, data]) => {
        existing[critId] = data.score || 0;
      });
    }
    setScores(existing);
  }

  async function handleReview(decision) {
    setSubmittingReview(true);
    try {
      const scorePayload = {};
      Object.entries(scores).forEach(([critId, score]) => {
        scorePayload[critId] = { score: parseFloat(score) || 0 };
      });

      await biddingAPI.reviewPrequalification(reviewingApp.id, {
        scores: scorePayload,
        decision,
      });
      toast.success(
        decision === "qualified"
          ? "Supplier qualified!"
          : decision === "disqualified"
          ? "Supplier disqualified"
          : "Review submitted"
      );
      setReviewingApp(null);
      fetchData();
    } catch {
      toast.error("Review failed");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!scheme) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="flex items-center gap-3">
        <Shield size={24} className="text-gold" />
        <div>
          <HeadingText>{scheme.name}</HeadingText>
          <p className="text-sm text-gray-500">
            {scheme.company_name} · {scheme.industry_category?.replace(/_/g, " ")} ·
            Valid {scheme.validity_months} months ·{" "}
            {applications.length} application(s)
          </p>
        </div>
      </div>

      {scheme.description && (
        <p className="text-gray-600">{scheme.description}</p>
      )}

      {/* Criteria Summary */}
      {scheme.criteria?.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Criteria</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {scheme.criteria.map((c) => (
              <div key={c.id} className="bg-white rounded-lg p-2 text-sm border border-gray-200">
                <span className="font-medium">{c.name}</span>
                <span className="text-gray-400 ml-1">({c.weight}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Applications</h3>
        {applications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No applications yet.</p>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{app.company_name}</p>
                <p className="text-sm text-gray-500">
                  Applied: {new Date(app.applied_at).toLocaleDateString()}
                  {app.overall_score !== null && (
                    <span className="ml-2">
                      <Star size={12} className="inline text-gold" /> Score:{" "}
                      {parseFloat(app.overall_score).toFixed(1)}
                    </span>
                  )}
                  {app.expires_at && (
                    <span className="ml-2">
                      · Expires: {new Date(app.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_BADGE[app.status]?.color || "bg-gray-100 text-gray-500"
                  }`}
                >
                  {STATUS_BADGE[app.status]?.label || app.status}
                </span>
                {["applied", "under_review"].includes(app.status) && (
                  <Button variant="outline" size="sm" onClick={() => openReview(app)}>
                    Review
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {reviewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 my-auto">
            <h3 className="text-lg font-semibold">
              Review: {reviewingApp.company_name}
            </h3>

            {scheme.criteria?.length > 0 ? (
              <div className="space-y-3">
                {scheme.criteria.map((c) => (
                  <div key={c.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {c.name}{" "}
                      <span className="text-gray-400 font-normal">
                        ({c.weight}% · {c.scoring_method?.replace(/_/g, " ")} · min{" "}
                        {c.min_threshold})
                      </span>
                    </label>
                    {c.scoring_method === "pass_fail" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setScores({ ...scores, [c.id]: 100 })}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                            scores[c.id] === 100
                              ? "bg-green-100 border-green-300 text-green-700"
                              : "border-gray-200 text-gray-500"
                          }`}
                        >
                          Pass
                        </button>
                        <button
                          type="button"
                          onClick={() => setScores({ ...scores, [c.id]: 0 })}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                            scores[c.id] === 0
                              ? "bg-red-100 border-red-300 text-red-700"
                              : "border-gray-200 text-gray-500"
                          }`}
                        >
                          Fail
                        </button>
                      </div>
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={scores[c.id] ?? ""}
                        onChange={(e) =>
                          setScores({ ...scores, [c.id]: e.target.value })
                        }
                        placeholder="0 - 100"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No criteria defined. Make a qualitative decision.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setReviewingApp(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleReview("disqualified")}
                disabled={submittingReview}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle size={14} className="mr-1" /> Disqualify
              </Button>
              <Button
                onClick={() => handleReview("qualified")}
                disabled={submittingReview}
              >
                <CheckCircle size={14} className="mr-1" /> Qualify
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
