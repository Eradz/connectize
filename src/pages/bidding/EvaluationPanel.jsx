import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import Button from "../../components/ui/Button";
import { Input, Textarea, Select } from "../../components/ui/Input";
import Skeleton from "../../components/ui/Skeleton";
import {
  ArrowLeft,
  Star,
  CheckCircle,
  XCircle,
  BarChart3,
  User,
  FileText,
  Award,
  AlertTriangle,
  Send,
} from "lucide-react";

function ScoreInput({ criterion, score, onChange }) {
  if (criterion.scoring_method === "pass_fail") {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(criterion.id, criterion.max_score)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border ${
            score === criterion.max_score
              ? "bg-green-50 border-green-300 text-green-700"
              : "border-gray-200 text-gray-500 hover:border-green-200"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Pass
        </button>
        <button
          type="button"
          onClick={() => onChange(criterion.id, 0)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border ${
            score === 0 && score !== undefined
              ? "bg-red-50 border-red-300 text-red-700"
              : "border-gray-200 text-gray-500 hover:border-red-200"
          }`}
        >
          <XCircle className="w-4 h-4" />
          Fail
        </button>
      </div>
    );
  }

  if (criterion.scoring_method === "ranked") {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          value={score || ""}
          onChange={(e) =>
            onChange(criterion.id, parseInt(e.target.value) || 0)
          }
          className="w-20"
          placeholder="Rank"
        />
        <span className="text-xs text-gray-400">Lower is better</span>
      </div>
    );
  }

  // Numeric scoring
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min="0"
        max={criterion.max_score}
        value={score ?? ""}
        onChange={(e) =>
          onChange(
            criterion.id,
            Math.min(
              parseFloat(e.target.value) || 0,
              criterion.max_score
            )
          )
        }
        className="w-24"
      />
      <span className="text-xs text-gray-400">/ {criterion.max_score}</span>
      {score !== undefined && (
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(score / criterion.max_score) * 100}%`,
              backgroundColor:
                score / criterion.max_score > 0.7
                  ? "#22c55e"
                  : score / criterion.max_score > 0.4
                  ? "#F1C644"
                  : "#ef4444",
            }}
          />
        </div>
      )}
    </div>
  );
}

function BidScoreCard({ bid, criteria, scores, onScoreChange, onNotesChange, notes }) {
  const totalWeightedScore = useMemo(() => {
    if (!criteria?.length) return 0;
    let totalWeight = 0;
    let weightedSum = 0;
    for (const c of criteria) {
      const s = scores[c.id];
      if (s !== undefined) {
        const normalizedScore =
          c.scoring_method === "pass_fail"
            ? s > 0
              ? 100
              : 0
            : (s / c.max_score) * 100;
        weightedSum += normalizedScore * (c.weight / 100);
        totalWeight += c.weight;
      }
    }
    return totalWeight > 0 ? Math.round(weightedSum) : 0;
  }, [criteria, scores]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F1C644]/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-[#F1C644]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {bid.bidder_name || bid.company_name || `Bid #${bid.id}`}
              </h3>
              <p className="text-xs text-gray-500">
                {bid.total_price
                  ? `$${Number(bid.total_price).toLocaleString()}`
                  : "No price submitted"}
                {bid.delivery_timeline && ` · ${bid.delivery_timeline} days`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                totalWeightedScore >= 70
                  ? "text-green-600"
                  : totalWeightedScore >= 40
                  ? "text-yellow-600"
                  : "text-red-500"
              }`}
            >
              {totalWeightedScore}
            </div>
            <div className="text-xs text-gray-400">weighted score</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {criteria?.map((criterion) => (
          <div key={criterion.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {criterion.name}
              </label>
              <span className="text-xs text-gray-400">
                {criterion.weight}% weight · {criterion.scoring_method}
              </span>
            </div>
            <ScoreInput
              criterion={criterion}
              score={scores[criterion.id]}
              onChange={onScoreChange}
            />
          </div>
        ))}

        <div className="pt-3 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Evaluation Notes
          </label>
          <Textarea
            value={notes || ""}
            onChange={(e) => onNotesChange(bid.id, e.target.value)}
            placeholder="Comments about this bid..."
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}

function ScoreSummaryTable({ bids, criteria, allScores }) {
  const ranked = useMemo(() => {
    return bids
      .map((bid) => {
        const scores = allScores[bid.id] || {};
        let totalWeighted = 0;
        let totalWeight = 0;
        for (const c of criteria || []) {
          const s = scores[c.id];
          if (s !== undefined) {
            const norm =
              c.scoring_method === "pass_fail"
                ? s > 0
                  ? 100
                  : 0
                : (s / c.max_score) * 100;
            totalWeighted += norm * (c.weight / 100);
            totalWeight += c.weight;
          }
        }
        return {
          ...bid,
          weightedScore: totalWeight > 0 ? Math.round(totalWeighted) : 0,
        };
      })
      .sort((a, b) => b.weightedScore - a.weightedScore);
  }, [bids, criteria, allScores]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#F1C644]" />
          Score Summary & Rankings
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Bidder</th>
              <th className="px-4 py-3 text-right">Price</th>
              {criteria?.map((c) => (
                <th key={c.id} className="px-4 py-3 text-center">
                  {c.name}
                  <br />
                  <span className="font-normal text-xs text-gray-400">
                    {c.weight}%
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-center">Weighted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ranked.map((bid, i) => (
              <tr
                key={bid.id}
                className={i === 0 ? "bg-green-50/50" : ""}
              >
                <td className="px-4 py-3">
                  {i === 0 ? (
                    <Award className="w-5 h-5 text-[#F1C644]" />
                  ) : (
                    <span className="text-gray-500">#{i + 1}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">
                  {bid.bidder_name || bid.company_name || `Bid #${bid.id}`}
                </td>
                <td className="px-4 py-3 text-right">
                  {bid.total_price
                    ? `$${Number(bid.total_price).toLocaleString()}`
                    : "—"}
                </td>
                {criteria?.map((c) => {
                  const s = (allScores[bid.id] || {})[c.id];
                  return (
                    <td key={c.id} className="px-4 py-3 text-center">
                      {s !== undefined
                        ? c.scoring_method === "pass_fail"
                          ? s > 0
                            ? "✓"
                            : "✗"
                          : s
                        : "—"}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center font-bold">
                  <span
                    className={
                      bid.weightedScore >= 70
                        ? "text-green-600"
                        : bid.weightedScore >= 40
                        ? "text-yellow-600"
                        : "text-red-500"
                    }
                  >
                    {bid.weightedScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function EvaluationPanel() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [allScores, setAllScores] = useState({});
  const [allNotes, setAllNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState("evaluate"); // evaluate | summary

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, bidsRes] = await Promise.all([
        biddingAPI.getProject(projectId),
        biddingAPI.getBids({ bid_project: projectId }),
      ]);

      const projData = projRes?.data || projRes;
      const bidsData = (bidsRes?.data || bidsRes)?.results || bidsRes?.data || [];
      setProject(projData);
      setBids(bidsData);

      // Load evaluation criteria from the current active stage
      if (projData?.current_stage) {
        try {
          const critRes = await biddingAPI.getStageCriteria(
            projData.current_stage
          );
          const critData =
            (critRes?.data || critRes)?.results || critRes?.data || [];
          setCriteria(critData);
        } catch {
          setCriteria([]);
        }
      }

      // Load existing evaluations
      const existingScores = {};
      const existingNotes = {};
      for (const bid of bidsData) {
        try {
          const evalRes = await biddingAPI.getBidEvaluations(bid.id);
          const evals =
            (evalRes?.data || evalRes)?.results || evalRes?.data || [];
          const myScores = {};
          for (const ev of evals) {
            if (ev.criterion) {
              myScores[ev.criterion] = ev.score;
            }
            if (ev.comments) {
              existingNotes[bid.id] = ev.comments;
            }
          }
          existingScores[bid.id] = myScores;
        } catch {
          existingScores[bid.id] = {};
        }
      }
      setAllScores(existingScores);
      setAllNotes(existingNotes);
    } catch {
      toast.error("Failed to load evaluation data");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (bidId, criterionId, score) => {
    setAllScores((prev) => ({
      ...prev,
      [bidId]: {
        ...(prev[bidId] || {}),
        [criterionId]: score,
      },
    }));
  };

  const handleNotesChange = (bidId, notes) => {
    setAllNotes((prev) => ({ ...prev, [bidId]: notes }));
  };

  const handleSubmitEvaluations = async () => {
    setSubmitting(true);
    try {
      for (const bid of bids) {
        const scores = allScores[bid.id] || {};
        for (const [criterionId, score] of Object.entries(scores)) {
          await biddingAPI.submitEvaluation(bid.id, {
            criterion: criterionId,
            score,
            comments: allNotes[bid.id] || "",
          });
        }
      }
      toast.success("Evaluations submitted successfully");
    } catch {
      toast.error("Failed to submit evaluations");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCalculateScores = async () => {
    try {
      await biddingAPI.calculateScores(projectId);
      toast.success("Scores calculated and rankings updated");
      fetchData();
    } catch {
      toast.error("Failed to calculate scores");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Project
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Evaluation Panel
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {project?.title} · {bids.length} bids ·{" "}
            {criteria.length} criteria
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView("evaluate")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                view === "evaluate"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              Evaluate
            </button>
            <button
              onClick={() => setView("summary")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                view === "summary"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              Summary
            </button>
          </div>
        </div>
      </div>

      {criteria.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              No evaluation criteria found
            </p>
            <p className="text-xs text-yellow-600">
              Please define evaluation criteria in the workflow template first.
            </p>
          </div>
        </div>
      )}

      {view === "evaluate" ? (
        <div className="space-y-6">
          {bids.map((bid) => (
            <BidScoreCard
              key={bid.id}
              bid={bid}
              criteria={criteria}
              scores={allScores[bid.id] || {}}
              notes={allNotes[bid.id] || ""}
              onScoreChange={(critId, score) =>
                handleScoreChange(bid.id, critId, score)
              }
              onNotesChange={handleNotesChange}
            />
          ))}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleCalculateScores}>
              <BarChart3 className="w-4 h-4 mr-1.5" />
              Calculate Rankings
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitEvaluations}
              loading={submitting}
            >
              <Send className="w-4 h-4 mr-1.5" />
              Submit Evaluations
            </Button>
          </div>
        </div>
      ) : (
        <ScoreSummaryTable
          bids={bids}
          criteria={criteria}
          allScores={allScores}
        />
      )}
    </div>
  );
}
