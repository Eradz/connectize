import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import { getCurrentUser } from "../../api-services/users";
import Button from "../../components/ui/Button";
import Input, { Textarea, Select } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
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
  Plus,
  Trash2,
  Settings,
  ChevronRight,
  ChevronDown,
  ListChecks,
  Target,
  PenLine,
  Trophy,
  Search,
} from "lucide-react";

const APPROVAL_DECISIONS = [
  { value: "approved", label: "Approve" },
  { value: "deferred", label: "Defer" },
  { value: "rejected", label: "Reject" },
];

const SCORING_METHODS = [
  { value: "numeric", label: "Numeric Score", desc: "Score from 0 to max" },
  { value: "pass_fail", label: "Pass / Fail", desc: "Binary pass or fail" },
  { value: "ranked", label: "Ranked", desc: "Rank ordering (lower is better)" },
];

const EMPTY_CRITERION = {
  name: "",
  weight: "",
  scoring_method: "numeric",
  max_score: 100,
  description: "",
};

function formatEnvelopeLabel(value) {
  return String(value || "envelope").replace(/_/g, " ");
}

function getEnvelopeConfigType(envelope) {
  return String(
    envelope?.type || envelope?.envelope_type || envelope?.key || "",
  ).trim();
}

function getEnvelopeConfigLabel(envelope) {
  return (
    envelope?.label ||
    envelope?.name ||
    formatEnvelopeLabel(getEnvelopeConfigType(envelope))
  );
}

function getEnvelopeProgress(envelopeStatus, envelopeType) {
  const status = envelopeStatus[envelopeType] || {
    total: 0,
    opened: 0,
    evaluated: 0,
  };
  return {
    ...status,
    hasSubmissions: status.total > 0,
    allOpened: status.total > 0 && status.opened === status.total,
    allEvaluated:
      status.total > 0 &&
      status.opened === status.total &&
      status.evaluated === status.total,
    partial: status.opened > 0 && status.opened < status.total,
  };
}

function uniqueById(items = []) {
  const seen = new Set();
  return items.filter((item, index) => {
    const key =
      item?.id ??
      `${item?.name || item?.title || "item"}-${item?.envelope_type || ""}-${index}`;
    if (seen.has(String(key))) return false;
    seen.add(String(key));
    return true;
  });
}

function CriteriaSetup({
  stageDefinitionId,
  criteria,
  onCriteriaChange,
  envelopeType,
}) {
  const [rows, setRows] = useState([{ ...EMPTY_CRITERION }]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const totalNewWeight = rows.reduce(
    (s, r) => s + (parseFloat(r.weight) || 0),
    0,
  );
  const existingWeight = criteria.reduce(
    (s, c) => s + (parseFloat(c.weight) || 0),
    0,
  );
  const totalWeight = existingWeight + totalNewWeight;

  const addRow = () => setRows((prev) => [...prev, { ...EMPTY_CRITERION }]);
  const updateRow = (idx, field, value) =>
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    );
  const removeRow = (idx) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    const valid = rows.filter((r) => r.name.trim() && r.weight);
    if (!valid.length) {
      toast.error("Add at least one criterion with a name and weight");
      return;
    }
    if (totalWeight > 100.5) {
      toast.error("Total criteria weight cannot exceed 100%");
      return;
    }

    setSaving(true);
    try {
      for (const row of valid) {
        await biddingAPI.createCriterion(stageDefinitionId, {
          name: row.name.trim(),
          weight: parseFloat(row.weight),
          scoring_method: row.scoring_method,
          max_score: parseInt(row.max_score) || 100,
          description: row.description || "",
          envelope_type: envelopeType || "",
          is_mandatory: true,
          order: criteria.length + valid.indexOf(row),
        });
      }
      toast.success(`${valid.length} criteria created`);
      setRows([{ ...EMPTY_CRITERION }]);
      setShowAddForm(false);
      onCriteriaChange();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to create criteria");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (criterion) => {
    setDeleting(criterion.id);
    try {
      await biddingAPI.deleteCriterion(stageDefinitionId, criterion.id);
      toast.success(`"${criterion.name}" removed`);
      onCriteriaChange();
    } catch {
      toast.error("Failed to remove criterion");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#F1C644]/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F1C644]/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-[#F1C644]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {criteria.length > 0
                ? "Evaluation Criteria"
                : "Step 1: Define Evaluation Criteria"}
            </h3>
            <p className="text-xs text-gray-500">
              {criteria.length > 0
                ? `${criteria.length} criteria defined · ${existingWeight}% total weight`
                : "How should bids be scored? Add criteria to evaluate bidders against."}
            </p>
          </div>
        </div>
      </div>

      {/* Existing criteria */}
      {criteria.length > 0 && (
        <div>
          <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-400">
              These criteria are defined on the workflow template for this
              evaluation stage. You can remove and re-add them as needed.
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {criteria.map((c, index) => (
              <div
                key={c.id || `criterion-${index}`}
                className="px-5 py-3 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {c.weight}%
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {c.scoring_method.replace("_", "/")} · max{" "}
                      {c.max_score || 100}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c)}
                  disabled={deleting === c.id}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new criteria — always open when none exist, toggle when some exist */}
      {criteria.length > 0 && !showAddForm ? (
        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 text-sm text-[#F1C644] hover:text-[#d4a832] font-medium"
          >
            <Plus className="w-4 h-4" /> Add more criteria
          </button>
        </div>
      ) : (
        <div className="p-5 bg-gray-50/50 space-y-3 border-t border-gray-100">
          {criteria.length === 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
              <p className="text-sm text-blue-800 font-medium">Quick start</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Common criteria: Technical Capability, Price Competitiveness,
                Experience &amp; References, Project Timeline, Safety Record.
                Weights must total 100%.
              </p>
            </div>
          )}

          {rows.map((row, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Criterion name (e.g. Technical Capability)"
                  value={row.name}
                  onChange={(e) => updateRow(idx, "name", e.target.value)}
                />
              </div>
              <div className="w-20">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%"
                  value={row.weight}
                  onChange={(e) => updateRow(idx, "weight", e.target.value)}
                />
              </div>
              <div className="w-36">
                <select
                  value={row.scoring_method}
                  onChange={(e) =>
                    updateRow(idx, "scoring_method", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm"
                >
                  {SCORING_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-20">
                <Input
                  type="number"
                  min="1"
                  placeholder="Max"
                  value={row.max_score}
                  onChange={(e) => updateRow(idx, "max_score", e.target.value)}
                />
              </div>
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(idx)}
                  className="text-gray-400 hover:text-red-500 mt-2"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={addRow}
              className="flex items-center gap-1 text-sm text-[#F1C644] hover:text-[#d4a832] font-medium"
            >
              <Plus className="w-4 h-4" /> Add another
            </button>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium ${totalWeight > 100.5 ? "text-red-500" : totalWeight >= 99.5 ? "text-green-600" : "text-gray-400"}`}
              >
                Total: {totalWeight.toFixed(0)}%
              </span>
              <Button
                onClick={handleSave}
                loading={saving}
                disabled={!rows.some((r) => r.name.trim() && r.weight)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Save Criteria
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StageTabs({ stages, selectedStageId, onSelect }) {
  if (!stages?.length) return null;
  const sorted = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-2 overflow-x-auto">
      {sorted.map((stage, i) => {
        const isSelected = stage.id === selectedStageId;
        const isCompleted = stage.status === "completed";
        const isActive = stage.status === "active";
        const clickable = isActive || isCompleted;

        return (
          <div key={stage.id} className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => clickable && onSelect(stage)}
              disabled={!clickable}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                isSelected
                  ? "bg-[#F1C644]/10 border border-[#F1C644]/30 font-medium text-gray-900"
                  : isCompleted
                    ? "bg-green-50/50 text-green-700 hover:bg-green-100 cursor-pointer"
                    : isActive
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                      : "bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? <CheckCircle className="w-3 h-3" /> : i + 1}
              </div>
              <span className="whitespace-nowrap">{stage.name}</span>
              {isActive && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                  Active
                </span>
              )}
            </button>
            {i < sorted.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
  const maxScore = Number(criterion.max_score) || 100;
  const numScore = Number(score) || 0;
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min="0"
        max={maxScore}
        value={score ?? ""}
        onChange={(e) =>
          onChange(
            criterion.id,
            Math.min(parseFloat(e.target.value) || 0, maxScore),
          )
        }
        className="w-24"
      />
      <span className="text-xs text-gray-400">/ {maxScore}</span>
      {score !== undefined && score !== "" && (
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(numScore / maxScore) * 100}%`,
              backgroundColor:
                numScore / maxScore > 0.7
                  ? "#22c55e"
                  : numScore / maxScore > 0.4
                    ? "#F1C644"
                    : "#ef4444",
            }}
          />
        </div>
      )}
    </div>
  );
}

/** Compute the weighted evaluation score for a single bid from its raw scores + criteria */
function computeWeightedScore(criteria, scores) {
  if (!criteria?.length) return 0;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const c of criteria) {
    const s = scores?.[c.id];
    const maxScore = Number(c.max_score) || 100;
    if (s !== undefined && s !== null && s !== "") {
      const numScore = Number(s);
      if (isNaN(numScore)) continue;
      const normalizedScore =
        c.scoring_method === "pass_fail"
          ? numScore > 0
            ? 100
            : 0
          : (numScore / maxScore) * 100;
      weightedSum += normalizedScore * (Number(c.weight) / 100);
      totalWeight += Number(c.weight);
    }
  }
  return totalWeight > 0 ? Math.round(weightedSum) : 0;
}

function BidScoreCard({
  bid,
  criteria,
  scores,
  onScoreChange,
  onNotesChange,
  notes,
}) {
  const totalWeightedScore = useMemo(
    () => computeWeightedScore(criteria, scores),
    [criteria, scores],
  );
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
                {bid.bidder_company_name ||
                  bid.bidder_name ||
                  bid.company_name ||
                  `Bid #${bid.id}`}
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
        {criteria?.map((criterion, index) => (
          <div
            key={criterion.id || `criterion-score-${index}`}
            className="space-y-1"
          >
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

function getBidDisplayName(bid) {
  return (
    bid.bidder_company_name ||
    bid.bidder_name ||
    bid.company_name ||
    `Bid #${bid.id}`
  );
}

function getBidMeta(bid) {
  const parts = [];
  if (bid.total_price)
    parts.push(`$${Number(bid.total_price).toLocaleString()}`);
  if (bid.delivery_timeline) parts.push(`${bid.delivery_timeline} days`);
  if (!parts.length && bid.status)
    parts.push(String(bid.status).replace(/_/g, " "));
  return parts.join(" · ");
}

function EvaluationCriteriaDock({
  criteria,
  bids,
  allScores,
  selectedCriterionId,
  onSelectCriterion,
}) {
  const totalWeight = criteria.reduce(
    (sum, c) => sum + (parseFloat(c.weight) || 0),
    0,
  );
  const completedScores = bids.reduce(
    (count, bid) =>
      count +
      criteria.filter((criterion) => {
        const value = allScores[bid.id]?.[criterion.id];
        return (
          value !== undefined && value !== null && String(value).trim() !== ""
        );
      }).length,
    0,
  );
  const totalScores = bids.length * criteria.length;
  const selectedCriterion =
    criteria.find(
      (criterion) => String(criterion.id) === String(selectedCriterionId),
    ) || criteria[0];

  if (!criteria.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-[#F1C644]" />
            Evaluation Criteria
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Score one criterion across all companies, then switch criteria
            without losing your place.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 min-w-full sm:min-w-[360px] lg:min-w-[420px]">
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-lg font-bold text-gray-900">{criteria.length}</p>
            <p className="text-xs text-gray-500">Criteria</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
            <p
              className={`text-lg font-bold ${totalWeight > 100 ? "text-red-500" : "text-gray-900"}`}
            >
              {totalWeight}%
            </p>
            <p className="text-xs text-gray-500">Weight</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-lg font-bold text-gray-900">
              {completedScores}/{totalScores || 0}
            </p>
            <p className="text-xs text-gray-500">Scores</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {criteria.map((criterion, index) => {
          const selected =
            String(criterion.id) === String(selectedCriterion?.id);
          return (
            <button
              key={criterion.id || `criterion-pill-${index}`}
              type="button"
              onClick={() => onSelectCriterion(criterion.id)}
              className={`min-w-[190px] rounded-lg border px-3 py-2 text-left transition ${
                selected
                  ? "border-[#F1C644] bg-[#F1C644]/10"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
            >
              <p className="text-sm font-semibold text-gray-900 truncate">
                {criterion.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {criterion.weight}% ·{" "}
                {criterion.scoring_method === "pass_fail"
                  ? "Pass/Fail"
                  : `0-${criterion.max_score || 100}`}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CriterionScoreMatrix({
  bids,
  criteria,
  selectedCriterion,
  allScores,
  onScoreChange,
  onReviewBid,
  search,
  onSearchChange,
  onSave,
  saving,
}) {
  if (!selectedCriterion) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          Select a criterion to score bids.
        </p>
      </div>
    );
  }

  const filteredBids = bids.filter((bid) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [getBidDisplayName(bid), getBidMeta(bid), bid.id, bid.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });
  const scoredCount = bids.filter((bid) => {
    const value = allScores[bid.id]?.[selectedCriterion.id];
    return value !== undefined && value !== null && String(value).trim() !== "";
  }).length;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCriterion.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {scoredCount}/{bids.length} companies scored · Weight{" "}
              {selectedCriterion.weight}%
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search companies"
                className="pl-9 sm:w-64"
              />
            </div>
            <Button onClick={onSave} loading={saving}>
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Save Scores
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden md:grid grid-cols-[minmax(220px,1.2fr)_minmax(260px,1fr)_110px] gap-4 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
          <span>Company</span>
          <span>{selectedCriterion.name}</span>
          <span className="text-right">Total</span>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredBids.map((bid, index) => {
            const weighted = computeWeightedScore(
              criteria,
              allScores[bid.id] || {},
            );
            return (
              <div
                key={bid.id || `criterion-bid-${index}`}
                className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(220px,1.2fr)_minmax(260px,1fr)_110px] md:items-center md:gap-4"
              >
                <button
                  type="button"
                  onClick={() => onReviewBid(bid)}
                  className="text-left"
                >
                  <p className="font-semibold text-gray-900 truncate">
                    {getBidDisplayName(bid)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {getBidMeta(bid)}
                  </p>
                </button>
                <ScoreInput
                  criterion={selectedCriterion}
                  score={allScores[bid.id]?.[selectedCriterion.id]}
                  onChange={(criterionId, score) =>
                    onScoreChange(bid.id, criterionId, score)
                  }
                />
                <div className="flex items-center justify-between md:justify-end gap-3">
                  <span className="text-xs text-gray-400 md:hidden">
                    Weighted total
                  </span>
                  <span className="text-lg font-bold text-[#B88A00]">
                    {weighted}
                  </span>
                </div>
              </div>
            );
          })}
          {filteredBids.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-gray-500">
              No bids match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreSummaryTable({ bids, criteria, allScores, project }) {
  const hasLC = project && Number(project.local_content_weight) > 0;
  const ranked = useMemo(() => {
    return bids
      .map((bid) => ({
        ...bid,
        weightedScore: computeWeightedScore(criteria, allScores[bid.id] || {}),
      }))
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
              {criteria?.map((c, index) => (
                <th
                  key={c.id || `criterion-head-${index}`}
                  className="px-4 py-3 text-center"
                >
                  {c.name}
                  <br />
                  <span className="font-normal text-xs text-gray-400">
                    {c.weight}%
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-center">Weighted</th>
              {hasLC && <th className="px-4 py-3 text-center">LC Score</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ranked.map((bid, i) => (
              <tr key={bid.id} className={i === 0 ? "bg-green-50/50" : ""}>
                <td className="px-4 py-3">
                  {i === 0 ? (
                    <Award className="w-5 h-5 text-[#F1C644]" />
                  ) : (
                    <span className="text-gray-500">#{i + 1}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">
                  {bid.bidder_company_name ||
                    bid.bidder_name ||
                    bid.company_name ||
                    `Bid #${bid.id}`}
                </td>
                <td className="px-4 py-3 text-right">
                  {bid.total_price
                    ? `$${Number(bid.total_price).toLocaleString()}`
                    : "—"}
                </td>
                {criteria?.map((c, index) => {
                  const s = (allScores[bid.id] || {})[c.id];
                  return (
                    <td
                      key={c.id || `criterion-value-${index}`}
                      className="px-4 py-3 text-center"
                    >
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
                {hasLC && (
                  <td className="px-4 py-3 text-center text-sm">
                    {bid.local_content_scorecard ? (
                      <span
                        className={
                          bid.local_content_scorecard.ncdmb_compliant
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        {Number(
                          bid.local_content_scorecard.total_score,
                        ).toFixed(1)}
                        %
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                )}
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
  const [stageActionLoading, setStageActionLoading] = useState(false);
  const [view, setView] = useState("criterion");
  const [selectedCriterionId, setSelectedCriterionId] = useState(null);
  const [bidSearch, setBidSearch] = useState("");
  const [activeEnvelope, setActiveEnvelope] = useState("");
  const [approvals, setApprovals] = useState([]);
  const [approvalForm, setApprovalForm] = useState({
    decision: "approved",
    comments: "",
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [awardForm, setAwardForm] = useState({
    bidIds: [],
    justification: "",
  });

  const activeStage = useMemo(
    () => project?.stages?.find((stage) => stage.status === "active") || null,
    [project],
  );

  const selectedStage = useMemo(
    () => project?.stages?.find((s) => s.id === selectedStageId) || activeStage,
    [project, selectedStageId, activeStage],
  );

  // Find the evaluation stage's definition for criteria (even when active stage is shortlist/award/etc.)
  const evaluationStageDefinition = useMemo(() => {
    if (!project?.stages) return null;
    const active = project.stages.find((s) => s.status === "active");
    if (active?.stage_type === "evaluation" && active.stage_definition)
      return active.stage_definition;
    const evalStage = project.stages
      .filter((s) => s.stage_type === "evaluation" && s.stage_definition)
      .sort((a, b) => a.order - b.order)[0];
    return evalStage?.stage_definition || active?.stage_definition || null;
  }, [project]);

  // The evaluation stage's ID — used for loading/saving scores even when on other stages
  const evaluationStageId = useMemo(() => {
    if (!project?.stages) return null;
    if (activeStage?.stage_type === "evaluation") return activeStage.id;
    if (selectedStage?.stage_type === "evaluation") return selectedStage.id;
    const evalStage = project.stages
      .filter((s) => s.stage_type === "evaluation")
      .sort((a, b) => a.order - b.order)[0];
    return evalStage?.id || null;
  }, [project, activeStage, selectedStage]);

  // Name of the next stage after the active one
  const nextStageName = useMemo(() => {
    if (!project?.stages || !activeStage) return null;
    const sorted = [...project.stages].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === activeStage.id);
    return idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1].name : null;
  }, [project, activeStage]);

  // Compute envelope open/sealed status from bid data
  const envelopeStatus = useMemo(() => {
    const statusMap = {}; // { "technical": { total: N, opened: N, evaluated: N } }
    for (const bid of bids) {
      for (const env of bid.envelope_status || []) {
        if (!statusMap[env.envelope_type])
          statusMap[env.envelope_type] = { total: 0, opened: 0, evaluated: 0 };
        statusMap[env.envelope_type].total++;
        if (!env.is_sealed) statusMap[env.envelope_type].opened++;
        if (env.is_evaluated || env.evaluated_at)
          statusMap[env.envelope_type].evaluated++;
      }
    }
    return statusMap;
  }, [bids]);

  useEffect(() => {
    fetchData();
    getCurrentUser()
      .then((user) => setCurrentUserId(user?.id || null))
      .catch(() => setCurrentUserId(null));
  }, [projectId]);

  // Sync selectedStageId to active stage when it changes
  useEffect(() => {
    if (activeStage?.id && !selectedStageId) {
      setSelectedStageId(activeStage.id);
    }
  }, [activeStage?.id]);

  // Load existing evaluations from the evaluation stage (not the current active stage)
  useEffect(() => {
    if (!project?.id || !bids.length || !evaluationStageId) return;
    loadExistingEvaluations(bids, evaluationStageId, activeEnvelope);
  }, [project?.id, bids, evaluationStageId, activeEnvelope]);

  useEffect(() => {
    if (activeStage?.stage_type === "approval") {
      fetchApprovals(activeStage.id);
    } else {
      setApprovals([]);
    }
  }, [activeStage?.id, activeStage?.stage_type]);

  const fetchData = async () => {
    try {
      setLoading(true);
      try {
        await biddingAPI.syncProjectLifecycle(projectId);
      } catch (syncErr) {
        const status = syncErr?.response?.status;
        if (status && ![400, 403, 404].includes(status)) throw syncErr;
      }
      const [projRes, bidsRes] = await Promise.all([
        biddingAPI.getProject(projectId),
        biddingAPI.getBids({ project: projectId, role: "buyer" }),
      ]);

      const projData = projRes?.data || projRes;
      const bidsData =
        (bidsRes?.data || bidsRes)?.results || bidsRes?.data || [];
      setProject(projData);
      setBids(bidsData);
      if (projData?.envelope_configuration?.length) {
        setActiveEnvelope((current) => {
          const currentIsConfigured = projData.envelope_configuration.some(
            (env) => getEnvelopeConfigType(env) === current,
          );
          if (current && currentIsConfigured) return current;
          return getEnvelopeConfigType(projData.envelope_configuration[0]) || "";
        });
      } else {
        setActiveEnvelope("");
      }

      // Criteria are now loaded by the activeEnvelope useEffect below
    } catch {
      toast.error("Failed to load evaluation data");
    } finally {
      setLoading(false);
    }
  };

  // Re-load criteria whenever the active envelope (or stage definition) changes
  // Only filter by envelope on the evaluation stage — other stages show all criteria
  const loadCriteria = useCallback(async () => {
    if (!evaluationStageDefinition) {
      setCriteria([]);
      return;
    }
    try {
      const envelopeFilter =
        selectedStage?.stage_type === "evaluation" ? activeEnvelope : undefined;
      const critRes = await biddingAPI.getStageCriteria(
        evaluationStageDefinition,
        envelopeFilter,
      );
      const critData =
        (critRes?.data || critRes)?.results || critRes?.data || [];
      const visibleCriteria =
        envelopeFilter
          ? critData.filter(
              (criterion) => criterion.envelope_type === envelopeFilter,
            )
          : critData;
      setCriteria(uniqueById(visibleCriteria));
    } catch {
      setCriteria([]);
    }
  }, [
    evaluationStageDefinition,
    activeEnvelope,
    selectedStage?.stage_type,
  ]);

  useEffect(() => {
    loadCriteria();
  }, [loadCriteria]);

  const loadExistingEvaluations = async (
    currentBids,
    stageId,
    envelopeType,
  ) => {
    const existingScores = {};
    const existingNotes = {};

    for (const bid of currentBids) {
      try {
        const evalRes = await biddingAPI.getBidEvaluations(bid.id);
        const evals =
          (evalRes?.data || evalRes)?.results || evalRes?.data || [];
        const relevantEvaluation = evals.find(
          (evaluation) =>
            evaluation.stage === stageId &&
            (evaluation.envelope_type || "") === (envelopeType || ""),
        );
        existingScores[bid.id] = {};
        const rawScores = relevantEvaluation?.scores || {};
        for (const [k, v] of Object.entries(rawScores)) {
          const num = parseFloat(v);
          existingScores[bid.id][k] = isNaN(num) ? v : num;
        }
        existingNotes[bid.id] = relevantEvaluation?.overall_comment || "";
      } catch {
        existingScores[bid.id] = {};
        existingNotes[bid.id] = "";
      }
    }

    setAllScores(existingScores);
    setAllNotes(existingNotes);
  };

  const fetchApprovals = async (stageId) => {
    try {
      const res = await biddingAPI.getApprovals({ stage: stageId });
      const data = res?.data || res;
      setApprovals(data.results || data || []);
    } catch {
      setApprovals([]);
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

  // Helper to save current scores to backend
  const saveEvaluations = async () => {
    const evalStageId = evaluationStageId;
    if (!evalStageId) return false;
    // Check eval stage is still active (scores can only be saved when active)
    const evalStage = project?.stages?.find((s) => s.id === evalStageId);
    if (evalStage?.status !== "active") {
      throw new Error(
        "Evaluation stage is no longer active. Scores are locked.",
      );
    }
    const hasScores = bids.some(
      (bid) => Object.keys(allScores[bid.id] || {}).length > 0,
    );
    if (!hasScores) return true;

    for (const bid of bids) {
      const scores = { ...(allScores[bid.id] || {}) };
      if (Object.keys(scores).length === 0) continue;

      for (const [criterionId, score] of Object.entries(scores)) {
        if (score === undefined || score === null || score === "") {
          delete scores[criterionId];
        }
      }
      if (Object.keys(scores).length === 0) continue;

      await biddingAPI.submitEvaluation(bid.id, {
        stage: evalStageId,
        envelope_type: activeEnvelope || "",
        scores,
        overall_comment: allNotes[bid.id] || "",
        comments: {},
        recommendation: "advance",
      });
    }
    return true;
  };

  const handleSubmitEvaluations = async () => {
    if (!evaluationStageId) {
      toast.error("No evaluation stage available");
      return;
    }
    setSubmitting(true);
    try {
      await saveEvaluations();
      const scoredCount = bids.filter(
        (bid) => Object.keys(allScores[bid.id] || {}).length > 0,
      ).length;
      toast.success(
        `Scores saved for ${scoredCount} bid${scoredCount !== 1 ? "s" : ""}. Click "Calculate Rankings" to compute final results.`,
      );
      await fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to save evaluations");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCalculateScores = async () => {
    try {
      setStageActionLoading(true);
      await saveEvaluations();
      if (project?.envelope_configuration?.length > 0) {
        await biddingAPI.calculateMultiEnvelopeScores(projectId);
      } else {
        await biddingAPI.calculateScores(projectId);
      }
      toast.success("Rankings calculated! Switching to summary view.");
      setView("summary");
      await fetchData();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to calculate scores",
      );
    } finally {
      setStageActionLoading(false);
    }
  };

  const handleOpenEnvelope = async () => {
    if (!activeEnvelope) {
      toast.error("Select an envelope to open");
      return;
    }
    try {
      setStageActionLoading(true);
      await biddingAPI.openEnvelope(projectId, activeEnvelope);
      toast.success(`${activeEnvelope} envelope opened`);
      await fetchData();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Failed to open envelope",
      );
    } finally {
      setStageActionLoading(false);
    }
  };

  const handleFinalizeEnvelope = async () => {
    if (!activeEnvelope) {
      toast.error("Select an envelope to mark evaluated");
      return;
    }
    try {
      setStageActionLoading(true);
      await saveEvaluations();
      await biddingAPI.finalizeEnvelope(projectId, activeEnvelope);
      toast.success(
        `${formatEnvelopeLabel(activeEnvelope)} envelope marked evaluated`,
      );
      await fetchData();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to mark envelope evaluated",
      );
    } finally {
      setStageActionLoading(false);
    }
  };

  const handleShortlistBids = async () => {
    try {
      setStageActionLoading(true);
      const res = await biddingAPI.shortlistBids(projectId, {});
      const count = res?.data?.shortlisted_count || res?.shortlisted_count || 0;
      toast.success(
        `${count} bid${count !== 1 ? "s" : ""} shortlisted based on evaluation scores`,
      );
      await fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to shortlist bids");
    } finally {
      setStageActionLoading(false);
    }
  };

  const handleAdvanceStage = async () => {
    const next = nextStageName;
    try {
      setStageActionLoading(true);
      await biddingAPI.advanceStage(projectId);
      toast.success(
        next ? `Advanced to "${next}"` : "Workflow advanced to the next stage",
      );
      setSelectedStageId(null); // Auto-select new active stage
      await fetchData();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || "Failed to advance workflow stage",
      );
    } finally {
      setStageActionLoading(false);
    }
  };

  const handleFinalizeEvaluation = async () => {
    try {
      setStageActionLoading(true);
      // Save scores, calculate rankings, then advance
      await saveEvaluations();
      if (project?.envelope_configuration?.length > 0) {
        await biddingAPI.calculateMultiEnvelopeScores(projectId);
      } else {
        await biddingAPI.calculateScores(projectId);
      }
      await biddingAPI.advanceStage(projectId);
      const next = nextStageName;
      toast.success(
        next
          ? `Evaluation complete! Advanced to "${next}"`
          : "Evaluation complete!",
      );
      setSelectedStageId(null);
      await fetchData();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to finalize evaluation",
      );
    } finally {
      setStageActionLoading(false);
    }
  };

  const handleApprovalSubmit = async () => {
    if (!activeStage?.id) {
      toast.error("No active approval stage");
      return;
    }
    try {
      setStageActionLoading(true);
      const existingApproval = approvals.find(
        (approval) =>
          String(approval.stage) === String(activeStage.id) &&
          String(approval.approver) === String(currentUserId),
      );
      if (existingApproval) {
        await biddingAPI.submitApproval(existingApproval.id, approvalForm);
      } else {
        await biddingAPI.createApproval({
          stage: activeStage.id,
          ...approvalForm,
        });
      }
      toast.success("Approval decision recorded");
      await Promise.all([fetchApprovals(activeStage.id), fetchData()]);
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || "Failed to submit approval decision",
      );
    } finally {
      setStageActionLoading(false);
    }
  };

  const handleAwardBid = async () => {
    if (!awardForm.bidIds.length) {
      toast.error("Select at least one bid to award");
      return;
    }
    try {
      setStageActionLoading(true);
      await biddingAPI.awardProject(projectId, {
        bid_ids: awardForm.bidIds,
        justification: awardForm.justification,
      });
      toast.success("Project awarded successfully!");
      setAwardForm({ bidIds: [], justification: "" });
      await fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to award project");
    } finally {
      setStageActionLoading(false);
    }
  };

  const isViewingActiveStage = selectedStage?.id === activeStage?.id;
  const sortedEnvelopeConfig = useMemo(
    () =>
      [...(project?.envelope_configuration || [])].sort(
        (a, b) => (a.order || 0) - (b.order || 0),
      ),
    [project?.envelope_configuration],
  );
  const configuredEnvelopeOptions = useMemo(
    () =>
      sortedEnvelopeConfig
        .map((env) => {
          const key = getEnvelopeConfigType(env);
          if (!key) return null;
          return {
            key,
            label: getEnvelopeConfigLabel(env),
            weight: env?.weight,
          };
        })
        .filter(Boolean),
    [sortedEnvelopeConfig],
  );
  const hasEnvelopeWorkflow = configuredEnvelopeOptions.length > 0;
  const activeEnvelopeProgress = getEnvelopeProgress(
    envelopeStatus,
    activeEnvelope,
  );
  const canOpenActiveEnvelope =
    hasEnvelopeWorkflow &&
    selectedStage?.status === "active" &&
    activeEnvelope &&
    activeEnvelopeProgress.hasSubmissions &&
    !activeEnvelopeProgress.allOpened &&
    !stageActionLoading;
  const canFinalizeActiveEnvelope =
    hasEnvelopeWorkflow &&
    selectedStage?.status === "active" &&
    activeEnvelope &&
    activeEnvelopeProgress.allOpened &&
    !activeEnvelopeProgress.allEvaluated &&
    !stageActionLoading;
  // Compute frontend-consistent scores for each bid and sort by them
  const sortedBids = useMemo(() => {
    return [...bids]
      .map((bid) => ({
        ...bid,
        computedScore: computeWeightedScore(criteria, allScores[bid.id] || {}),
      }))
      .sort((a, b) => b.computedScore - a.computedScore);
  }, [bids, criteria, allScores]);
  const selectedCriterion = useMemo(
    () =>
      criteria.find(
        (criterion) => String(criterion.id) === String(selectedCriterionId),
      ) || criteria[0],
    [criteria, selectedCriterionId],
  );
  const completedScoreCells = useMemo(
    () =>
      bids.reduce(
        (count, bid) =>
          count +
          criteria.filter((criterion) => {
            const value = allScores[bid.id]?.[criterion.id];
            return (
              value !== undefined &&
              value !== null &&
              String(value).trim() !== ""
            );
          }).length,
        0,
      ),
    [bids, criteria, allScores],
  );
  const fullyScoredBidCount = useMemo(
    () =>
      bids.filter(
        (bid) =>
          criteria.length > 0 &&
          criteria.every((criterion) => {
            const value = allScores[bid.id]?.[criterion.id];
            return (
              value !== undefined &&
              value !== null &&
              String(value).trim() !== ""
            );
          }),
      ).length,
    [bids, criteria, allScores],
  );
  const totalScoreCells = bids.length * criteria.length;

  useEffect(() => {
    if (!criteria.length) {
      setSelectedCriterionId(null);
      return;
    }
    setSelectedCriterionId((current) => {
      if (
        current &&
        criteria.some((criterion) => String(criterion.id) === String(current))
      ) {
        return current;
      }
      return criteria[0]?.id || null;
    });
  }, [criteria]);

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

      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluation Panel</h1>
          <p className="text-sm text-gray-500 mt-1">
            {project?.title} · {bids.length} bids
            {criteria.length > 0 && ` · ${criteria.length} criteria`}
          </p>
        </div>
        {selectedStage?.stage_type === "evaluation" && criteria.length > 0 && (
          <div className="flex flex-wrap bg-gray-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setView("criterion")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                view === "criterion"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              By Criterion
            </button>
            <button
              onClick={() => setView("company")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                view === "company"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              By Company
            </button>
            <button
              onClick={() => setView("summary")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                view === "summary"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              Rankings
            </button>
          </div>
        )}
      </div>

      {/* Stage Navigation */}
      <StageTabs
        stages={project?.stages || []}
        selectedStageId={selectedStage?.id}
        onSelect={(stage) => setSelectedStageId(stage.id)}
      />

      {/* ============ EVALUATION STAGE ============ */}
      {selectedStage?.stage_type === "evaluation" && (
        <>
          {/* Criteria Setup — only editable when this is the active stage */}
          {selectedStage.status === "active" && (
            <CriteriaSetup
              stageDefinitionId={evaluationStageDefinition}
              criteria={criteria}
              onCriteriaChange={loadCriteria}
              envelopeType={activeEnvelope}
            />
          )}

          {/* Completed stage indicator */}
          {selectedStage.status === "completed" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Evaluation stage completed
                </p>
                <p className="text-xs text-green-600">
                  Scores are locked. View the results below.
                </p>
              </div>
            </div>
          )}

          {criteria.length > 0 && (
            <EvaluationCriteriaDock
              criteria={criteria}
              bids={bids}
              allScores={allScores}
              selectedCriterionId={selectedCriterion?.id}
              onSelectCriterion={(criterionId) => {
                setSelectedCriterionId(criterionId);
                setView("criterion");
              }}
            />
          )}

          {hasEnvelopeWorkflow && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#F1C644]" />
                    Envelope Workflow
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Select an envelope, open it for evaluation, then review and
                    score the matching criteria.
                  </p>
                </div>
                {activeEnvelope && (
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {activeEnvelopeProgress.opened}/
                    {activeEnvelopeProgress.total} opened
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {configuredEnvelopeOptions.map((env) => {
                  const progress = getEnvelopeProgress(
                    envelopeStatus,
                    env.key,
                  );
                  return (
                    <button
                      key={env.key}
                      onClick={() => setActiveEnvelope(env.key)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition capitalize flex items-center gap-2 ${
                        activeEnvelope === env.key
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {env.label}
                      {env.weight !== undefined && env.weight !== null
                        ? ` (${env.weight}%)`
                        : ""}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          progress.allEvaluated
                            ? activeEnvelope === env.key
                              ? "bg-blue-400/30 text-blue-100"
                              : "bg-blue-100 text-blue-700"
                            : progress.allOpened
                              ? activeEnvelope === env.key
                                ? "bg-green-400/30 text-green-100"
                                : "bg-green-100 text-green-700"
                              : progress.partial
                                ? activeEnvelope === env.key
                                  ? "bg-yellow-400/30 text-yellow-100"
                                  : "bg-yellow-100 text-yellow-700"
                                : activeEnvelope === env.key
                                  ? "bg-gray-400/30 text-gray-200"
                                  : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {progress.allEvaluated
                          ? "Evaluated"
                          : progress.allOpened
                            ? "Opened"
                            : progress.partial
                              ? "Partial"
                              : progress.hasSubmissions
                                ? "Sealed"
                                : "No bids"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeEnvelope && (
                <div
                  className={`mt-4 rounded-lg border p-3 ${
                    activeEnvelopeProgress.allEvaluated
                      ? "bg-blue-50 border-blue-200"
                      : activeEnvelopeProgress.allOpened
                        ? "bg-green-50 border-green-200"
                        : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          activeEnvelopeProgress.allEvaluated
                            ? "text-blue-800"
                            : activeEnvelopeProgress.allOpened
                              ? "text-green-800"
                              : "text-amber-800"
                        }`}
                      >
                        {activeEnvelopeProgress.allEvaluated
                          ? `${formatEnvelopeLabel(activeEnvelope)} envelope is evaluated`
                          : activeEnvelopeProgress.allOpened
                            ? `${formatEnvelopeLabel(activeEnvelope)} envelope is open`
                            : `${formatEnvelopeLabel(activeEnvelope)} envelope is sealed`}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          activeEnvelopeProgress.allEvaluated
                            ? "text-blue-700"
                            : activeEnvelopeProgress.allOpened
                              ? "text-green-700"
                              : "text-amber-700"
                        }`}
                      >
                        {activeEnvelopeProgress.allEvaluated
                          ? "This envelope can now unlock the next envelope in sequence."
                          : activeEnvelopeProgress.allOpened
                            ? "Save scores for every bid, then mark this envelope evaluated to unlock the next envelope."
                            : activeEnvelopeProgress.hasSubmissions
                              ? "Open this envelope to reveal proposal text and documents. This cannot be undone."
                              : "No submitted bid contains this envelope yet."}
                      </p>
                    </div>

                    {!activeEnvelopeProgress.allOpened && (
                      <Button
                        variant="outline"
                        onClick={handleOpenEnvelope}
                        loading={stageActionLoading}
                        disabled={!canOpenActiveEnvelope}
                      >
                        <FileText className="w-4 h-4 mr-1.5" />
                        Open {formatEnvelopeLabel(activeEnvelope)}
                      </Button>
                    )}
                    {activeEnvelopeProgress.allOpened &&
                      !activeEnvelopeProgress.allEvaluated && (
                        <Button
                          variant="outline"
                          onClick={handleFinalizeEnvelope}
                          loading={stageActionLoading}
                          disabled={!canFinalizeActiveEnvelope}
                        >
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          Mark {formatEnvelopeLabel(activeEnvelope)} Evaluated
                        </Button>
                      )}
                  </div>
                </div>
              )}
            </div>
          )}

          {criteria.length > 0 && (
            <>
              {/* Evaluate vs Rankings view */}
              {hasEnvelopeWorkflow && !activeEnvelopeProgress.allOpened ? (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-gray-800 capitalize">
                    {formatEnvelopeLabel(activeEnvelope)} envelope is sealed
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                    Open this envelope before reviewing proposal text,
                    downloading envelope documents, or saving scores.
                  </p>
                </div>
              ) : view === "criterion" ? (
                <CriterionScoreMatrix
                  bids={bids}
                  criteria={criteria}
                  selectedCriterion={selectedCriterion}
                  allScores={allScores}
                  onScoreChange={handleScoreChange}
                  onReviewBid={(bid) =>
                    navigate(`/bidding/projects/${projectId}/bids/${bid.id}`)
                  }
                  search={bidSearch}
                  onSearchChange={setBidSearch}
                  onSave={handleSubmitEvaluations}
                  saving={submitting}
                />
              ) : view === "company" ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-2">
                    <div className="flex items-center gap-2">
                      <PenLine className="w-5 h-5 text-[#F1C644]" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Score by Company
                      </h2>
                    </div>
                    <span className="text-xs text-gray-500 sm:ml-auto">
                      {fullyScoredBidCount}/{bids.length} bids complete ·{" "}
                      {completedScoreCells}/{totalScoreCells || 0} scores
                      entered
                    </span>
                  </div>

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
                </div>
              ) : (
                <ScoreSummaryTable
                  bids={bids}
                  criteria={criteria}
                  allScores={allScores}
                  project={project}
                />
              )}

              {/* Action buttons — only when evaluation stage is active */}
              {selectedStage.status === "active" && view !== "summary" && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Button
                      variant="outline"
                      onClick={handleSubmitEvaluations}
                      loading={submitting}
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Save Scores
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCalculateScores}
                      loading={stageActionLoading}
                    >
                      <BarChart3 className="w-4 h-4 mr-1.5" />
                      Calculate Rankings
                    </Button>
                    <div className="sm:ml-auto">
                      <Button
                        onClick={handleFinalizeEvaluation}
                        loading={stageActionLoading}
                      >
                        <Send className="w-4 h-4 mr-1.5" />
                        {nextStageName
                          ? `Finalize & Advance to ${nextStageName}`
                          : "Finalize Evaluation"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    <strong>By Criterion</strong> is best for many companies.{" "}
                    <strong>By Company</strong> is best for a deep review of one
                    supplier. <strong>Calculate Rankings</strong> computes
                    weighted scores after saving.
                  </p>
                </div>
              )}
            </>
          )}

          {criteria.length === 0 && selectedStage.status === "active" && (
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">
                Define criteria to start evaluating
              </h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Use the form above to add evaluation criteria (e.g. Technical
                Capability 40%, Price 30%, Experience 30%). Once saved, scoring
                inputs will appear for each of the {bids.length} bids.
              </p>
            </div>
          )}
        </>
      )}

      {/* ============ SHORTLIST STAGE ============ */}
      {selectedStage?.stage_type === "shortlist" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Shortlist Bids
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedStage.status === "completed"
                    ? "Shortlisting is complete. See the results below."
                    : "Review evaluation scores and shortlist the top-performing bids."}
                </p>
              </div>
            </div>

            {selectedStage.status === "active" && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>How shortlisting works:</strong> Clicking
                  &quot;Shortlist Bids&quot; automatically selects the
                  top-scoring bids based on their evaluation rankings. Bids
                  below the minimum score threshold are disqualified, and only
                  the top bids advance.
                </p>
              </div>
            )}

            {/* Bid ranking overview */}
            <div className="divide-y divide-gray-100">
              {sortedBids.map((bid, i) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                      {bid.rank || i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {bid.bidder_company_name ||
                          bid.bidder_name ||
                          `Bid #${bid.id}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {bid.total_price
                          ? `$${Number(bid.total_price).toLocaleString()}`
                          : "No price"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">
                      Score: {bid.computedScore}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                        bid.status === "shortlisted"
                          ? "bg-green-100 text-green-700"
                          : bid.status === "rejected" ||
                              bid.status === "disqualified"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {bid.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation scores reference */}
          {criteria.length > 0 && (
            <ScoreSummaryTable
              bids={bids}
              criteria={criteria}
              allScores={allScores}
              project={project}
            />
          )}

          {/* Actions */}
          {selectedStage.status === "active" && isViewingActiveStage && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleShortlistBids}
                  loading={stageActionLoading}
                >
                  <Award className="w-4 h-4 mr-1.5" />
                  Shortlist Bids
                </Button>
                <div className="ml-auto">
                  <Button
                    onClick={handleAdvanceStage}
                    loading={stageActionLoading}
                  >
                    <ChevronRight className="w-4 h-4 mr-1.5" />
                    {nextStageName
                      ? `Advance to ${nextStageName}`
                      : "Advance Stage"}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                <strong>Shortlist</strong> automatically selects top bids by
                score. <strong>Advance</strong> moves to the next workflow
                stage.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============ APPROVAL STAGE ============ */}
      {selectedStage?.stage_type === "approval" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Approval Gate
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Record the approval decision for this workflow stage.
              </p>
            </div>

            {approvals.length > 0 && (
              <div className="space-y-2">
                {approvals.map((approval) => (
                  <div
                    key={approval.id}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-gray-900">
                        {approval.approver_name || "Approver"}
                      </span>
                      <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {approval.decision}
                      </span>
                    </div>
                    {approval.comments && (
                      <p className="text-gray-600 mt-1">{approval.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedStage.status === "active" && isViewingActiveStage && (
              <>
                <div className="grid gap-3 md:grid-cols-[220px,1fr] md:items-start">
                  <Select
                    value={approvalForm.decision}
                    onChange={(e) =>
                      setApprovalForm((prev) => ({
                        ...prev,
                        decision: e.target.value,
                      }))
                    }
                  >
                    {APPROVAL_DECISIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <Textarea
                    rows={3}
                    value={approvalForm.comments}
                    onChange={(e) =>
                      setApprovalForm((prev) => ({
                        ...prev,
                        comments: e.target.value,
                      }))
                    }
                    placeholder="Approval comments"
                  />
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <Button
                    onClick={handleApprovalSubmit}
                    loading={stageActionLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Submit Approval Decision
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAdvanceStage}
                    loading={stageActionLoading}
                  >
                    <ChevronRight className="w-4 h-4 mr-1.5" />
                    {nextStageName
                      ? `Advance to ${nextStageName}`
                      : "Advance Stage"}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Evaluation scores for reference */}
          {criteria.length > 0 && (
            <ScoreSummaryTable
              bids={bids}
              criteria={criteria}
              allScores={allScores}
              project={project}
            />
          )}
        </div>
      )}

      {/* ============ AWARD STAGE ============ */}
      {selectedStage?.stage_type === "award" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F1C644]/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#F1C644]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Award Decision
                </h2>
                <p className="text-sm text-gray-500">
                  {project?.status === "awarded"
                    ? `Awarded to ${
                        project.awarded_company_names?.length
                          ? project.awarded_company_names.join(", ")
                          : project.awarded_to_name || "winner"
                      }`
                    : "Select one or more winning bids to award this project."}
                </p>
              </div>
            </div>

            {project?.status === "awarded" ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    Project awarded to{" "}
                    {project.awarded_company_names?.length
                      ? project.awarded_company_names.join(", ")
                      : project.awarded_to_name}
                  </p>
                </div>
                {project.award_justification && (
                  <p className="text-sm text-green-700 mt-2">
                    {project.award_justification}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100 mb-4">
                  {sortedBids
                    .filter((b) =>
                      ["shortlisted", "under_review", "submitted"].includes(
                        b.status,
                      ),
                    )
                    .map((bid, i) => (
                      <div
                        key={bid.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                            {bid.rank || i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {bid.bidder_company_name ||
                                bid.bidder_name ||
                                `Bid #${bid.id}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              {bid.total_price
                                ? `$${Number(bid.total_price).toLocaleString()}`
                                : "No price"}
                              {bid.weighted_score != null &&
                                ` · Score: ${Number(bid.weighted_score).toFixed(1)}`}
                            </p>
                          </div>
                        </div>
                        {selectedStage.status === "active" &&
                          isViewingActiveStage && (
                            <button
                              onClick={() =>
                                setAwardForm((prev) => ({
                                  ...prev,
                                  bidIds: prev.bidIds.includes(bid.id)
                                    ? prev.bidIds.filter((value) => value !== bid.id)
                                    : [...prev.bidIds, bid.id],
                                }))
                              }
                              className={`text-sm px-3 py-1.5 rounded-lg border transition ${
                                awardForm.bidIds.includes(bid.id)
                                  ? "bg-[#F1C644] text-white border-[#F1C644]"
                                  : "border-gray-200 text-gray-600 hover:border-[#F1C644] hover:text-[#F1C644]"
                              }`}
                            >
                              {awardForm.bidIds.includes(bid.id)
                                ? "Selected"
                                : "Select"}
                            </button>
                          )}
                      </div>
                    ))}
                </div>

                {selectedStage.status === "active" &&
                  isViewingActiveStage &&
                  awardForm.bidIds.length > 0 && (
                    <div className="space-y-3 border-t border-gray-100 pt-4">
                      <Textarea
                        value={awardForm.justification}
                        onChange={(e) =>
                          setAwardForm((prev) => ({
                            ...prev,
                            justification: e.target.value,
                          }))
                        }
                        placeholder="Award justification (optional) — explain why this bid was selected"
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleAwardBid}
                          loading={stageActionLoading}
                        >
                          <Award className="w-4 h-4 mr-1.5" />
                          {awardForm.bidIds.length > 1
                            ? `Award ${awardForm.bidIds.length} Companies`
                            : `Award Project to ${
                                bids.find((b) => b.id === awardForm.bidIds[0])
                                  ?.bidder_company_name || "Selected Bidder"
                              }`}
                        </Button>
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>

          {/* Evaluation scores for reference */}
          {criteria.length > 0 && (
            <ScoreSummaryTable
              bids={bids}
              criteria={criteria}
              allScores={allScores}
              project={project}
            />
          )}
        </div>
      )}

      {/* ============ OTHER STAGES (submission, negotiation, etc.) ============ */}
      {selectedStage &&
        !["evaluation", "shortlist", "approval", "award"].includes(
          selectedStage.stage_type,
        ) && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {selectedStage.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Stage type: {selectedStage.stage_type} · Status:{" "}
                {selectedStage.status}
              </p>

              {selectedStage.status === "active" && isViewingActiveStage && (
                <div className="mt-4">
                  <Button
                    onClick={handleAdvanceStage}
                    loading={stageActionLoading}
                  >
                    <ChevronRight className="w-4 h-4 mr-1.5" />
                    {nextStageName
                      ? `Advance to ${nextStageName}`
                      : "Advance Stage"}
                  </Button>
                </div>
              )}

              {selectedStage.status === "completed" && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                  {selectedStage.completed_at &&
                    ` on ${new Date(selectedStage.completed_at).toLocaleDateString()}`}
                </div>
              )}
            </div>

            {/* Scores for reference when available */}
            {criteria.length > 0 && (
              <ScoreSummaryTable
                bids={bids}
                criteria={criteria}
                allScores={allScores}
                project={project}
              />
            )}
          </div>
        )}
    </div>
  );
}
