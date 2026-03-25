import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import { webRoutes } from "../../lib/webRoutes";
import Button from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import HeadingText from "../../components/HeadingText";
import {
  ArrowLeft,
  Star,
  Award,
  TrendingUp,
  Save,
  CheckCircle,
} from "lucide-react";

const TIER_CONFIG = {
  gold: { label: "Gold", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: "🥇" },
  silver: { label: "Silver", color: "bg-gray-100 text-gray-700 border-gray-300", icon: "🥈" },
  bronze: { label: "Bronze", color: "bg-orange-100 text-orange-700 border-orange-300", icon: "🥉" },
  unrated: { label: "Unrated", color: "bg-gray-50 text-gray-500 border-gray-200", icon: "—" },
};

export default function SupplierScorecard() {
  const { companyId, projectId } = useParams();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState([]);
  const [review, setReview] = useState(null);
  const [performanceScore, setPerformanceScore] = useState(null);
  const [scores, setScores] = useState({});
  const [overallScore, setOverallScore] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [companyId, projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, reviewsRes, scoreRes] = await Promise.all([
        biddingAPI.getPerformanceMetrics(),
        biddingAPI.getPerformanceReviews({ project: projectId, company: companyId }),
        biddingAPI.getSupplierPerformanceScore(companyId),
      ]);

      setMetrics(metricsRes.data?.results || metricsRes.data || []);
      setPerformanceScore(scoreRes.data);

      const existingReview = (reviewsRes.data?.results || reviewsRes.data || [])[0];
      if (existingReview) {
        setReview(existingReview);
        setScores(existingReview.scores || {});
        setOverallScore(existingReview.overall_score?.toString() || "");
      }
    } catch (err) {
      console.error("Failed to load scorecard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (metricId, field, value) => {
    setScores((prev) => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (finalize = false) => {
    setSaving(true);
    try {
      const payload = {
        project: projectId,
        supplier_company: companyId,
        scores,
        overall_score: overallScore || null,
        is_draft: !finalize,
      };

      if (review) {
        await biddingAPI.updatePerformanceReview(review.id, payload);
      } else {
        await biddingAPI.createPerformanceReview(payload);
      }

      toast.success(finalize ? "Review submitted successfully" : "Draft saved");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(webRoutes.biddingDetail.replace(":id", projectId))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <HeadingText>Supplier Performance Scorecard</HeadingText>
          <p className="text-sm text-gray-500 mt-1">
            Rate supplier performance for this project
          </p>
        </div>
      </div>

      {/* Performance Summary Card */}
      {performanceScore && (
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overall Performance Record
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Average Score</p>
              <p className="text-2xl font-bold">{Number(performanceScore.average_score).toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Reviews</p>
              <p className="text-2xl font-bold">{performanceScore.total_reviews}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Performance Tier</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${TIER_CONFIG[performanceScore.performance_tier]?.color || TIER_CONFIG.unrated.color}`}>
                {TIER_CONFIG[performanceScore.performance_tier]?.icon}{" "}
                {TIER_CONFIG[performanceScore.performance_tier]?.label || "Unrated"}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Company</p>
              <p className="text-sm font-medium">{performanceScore.company_name || "—"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Star className="w-4 h-4" />
          Performance Review
          {review?.is_draft === false && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Submitted
            </span>
          )}
          {review?.is_draft === true && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              Draft
            </span>
          )}
        </h3>

        {/* Overall Score */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overall Score (0-100)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={overallScore}
            onChange={(e) => setOverallScore(e.target.value)}
            className="w-40 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F1C644] focus:border-transparent"
            placeholder="0-100"
            disabled={review?.is_draft === false}
          />
        </div>

        {/* Per-Metric Scores */}
        {metrics.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-600">Score by Metric</h4>
            {metrics.map((metric) => (
              <div key={metric.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{metric.name}</p>
                    {metric.description && (
                      <p className="text-xs text-gray-500">{metric.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    Weight: {metric.weight}%
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Score (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={scores[metric.id]?.score || ""}
                      onChange={(e) => handleScoreChange(metric.id, "score", e.target.value)}
                      className="w-full border rounded px-3 py-1.5 text-sm"
                      disabled={review?.is_draft === false}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Comments</label>
                    <input
                      type="text"
                      value={scores[metric.id]?.comments || ""}
                      onChange={(e) => handleScoreChange(metric.id, "comments", e.target.value)}
                      className="w-full border rounded px-3 py-1.5 text-sm"
                      placeholder="Optional comments"
                      disabled={review?.is_draft === false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {(review?.is_draft !== false) && (
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              loading={saving}
            >
              <Save className="w-4 h-4 mr-1" />
              Save Draft
            </Button>
            <Button
              className="bg-gold hover:bg-[#E0B533] text-dark"
              onClick={() => handleSave(true)}
              loading={saving}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Submit Review
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
