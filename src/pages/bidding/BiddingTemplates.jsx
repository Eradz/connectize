import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import { webRoutes } from "../../lib/webRoutes";
import Button from "../../components/ui/Button";
import { Input, Select, Textarea } from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Settings,
  ChevronRight,
  GripVertical,
  Copy,
  Pencil,
  Layers,
  CheckCircle,
  Target,
  AlertTriangle,
} from "lucide-react";

const STAGE_TYPES = [
  { value: "submission", label: "Submission", desc: "Vendors submit bids" },
  { value: "evaluation", label: "Evaluation", desc: "Review and score bids" },
  { value: "shortlist", label: "Shortlist", desc: "Narrow down finalists" },
  { value: "clarification", label: "Clarification", desc: "Q&A with bidders" },
  { value: "negotiation", label: "Negotiation", desc: "Negotiate with selected bidders" },
  { value: "approval", label: "Approval", desc: "Internal approval gate" },
  { value: "award", label: "Award", desc: "Final award decision" },
];

const SCORING_METHODS = [
  { value: "numeric", label: "Numeric (1-100)" },
  { value: "pass_fail", label: "Pass / Fail" },
  { value: "ranked", label: "Ranked" },
  { value: "formula", label: "Formula-based" },
];

const BID_MODES = [
  { value: "open", label: "Open" },
  { value: "sealed", label: "Sealed" },
  { value: "reverse_auction", label: "Reverse Auction" },
];

function TemplateCard({ template, onEdit, onDuplicate, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#F1C644]/40 transition group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-[#F1C644] transition">
            {template.name}
          </h3>
          {template.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
              {template.description}
            </p>
          )}
        </div>
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
          {template.bid_mode?.replace("_", " ")}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          {template.stages_count || 0} stages
        </span>
        {template.min_bidders > 0 && (
          <span>Min {template.min_bidders} bidders</span>
        )}
        {template.auto_create_deal_room && (
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Auto Deal Room
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <Button variant="ghost" size="xs" onClick={() => onEdit(template)}>
          <Pencil className="w-3.5 h-3.5 mr-1" />
          Edit
        </Button>
        <Button variant="ghost" size="xs" onClick={() => onDuplicate(template)}>
          <Copy className="w-3.5 h-3.5 mr-1" />
          Duplicate
        </Button>
        <Button variant="ghost" size="xs" onClick={() => onDelete(template)}>
          <Trash2 className="w-3.5 h-3.5 mr-1 text-red-400" />
        </Button>
      </div>
    </div>
  );
}

function StageEditor({ stage, index, onUpdate, onRemove, onEditCriteria }) {
  return (
    <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <GripVertical className="w-4 h-4 text-gray-400 mt-2 shrink-0 cursor-grab" />
      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input
            value={stage.name || ""}
            onChange={(e) => onUpdate(index, "name", e.target.value)}
            placeholder="Stage name"
          />
          <Select
            value={stage.stage_type || "evaluation"}
            onChange={(e) => onUpdate(index, "stage_type", e.target.value)}
          >
            {STAGE_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={stage.duration_days || ""}
              onChange={(e) => onUpdate(index, "duration_days", e.target.value)}
              placeholder="Days"
              min="1"
              className="w-20"
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">days</span>
            <div className="flex items-center gap-1 ml-auto">
              <label className="flex items-center gap-1 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={stage.auto_advance || false}
                  onChange={(e) =>
                    onUpdate(index, "auto_advance", e.target.checked)
                  }
                  className="rounded text-[#F1C644]"
                />
                Auto-advance
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stage.stage_type === "evaluation" && (
            <Button
              variant="outline"
              size="xs"
              type="button"
              onClick={() => onEditCriteria(index)}
            >
              <Target className="w-3 h-3 mr-1" />
              Criteria ({stage.criteria?.length || 0})
            </Button>
          )}
          <Textarea
            value={stage.description || ""}
            onChange={(e) => onUpdate(index, "description", e.target.value)}
            placeholder="Stage description (optional)"
            rows={1}
            className="flex-1 text-xs"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-gray-400 hover:text-red-500 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CriteriaEditor({ criteria, onUpdate, onAdd, onRemove }) {
  return (
    <div className="space-y-3">
      {criteria.map((criterion, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg"
        >
          <Input
            value={criterion.name || ""}
            onChange={(e) => onUpdate(index, "name", e.target.value)}
            placeholder="Criterion name"
          />
          <Input
            type="number"
            value={criterion.weight || ""}
            onChange={(e) => onUpdate(index, "weight", e.target.value)}
            placeholder="Weight %"
            min="0"
            max="100"
            step="1"
          />
          <Select
            value={criterion.scoring_method || "numeric"}
            onChange={(e) => onUpdate(index, "scoring_method", e.target.value)}
          >
            {SCORING_METHODS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <div className="flex items-center gap-2">
            <Input
              value={criterion.max_score || "100"}
              onChange={(e) => onUpdate(index, "max_score", e.target.value)}
              placeholder="Max"
              type="number"
              min="1"
              className="w-16"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="xs" type="button" onClick={onAdd}>
        <Plus className="w-3 h-3 mr-1" />
        Add Criterion
      </Button>
    </div>
  );
}

export default function BiddingTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [criteriaModal, setCriteriaModal] = useState({
    open: false,
    stageIndex: null,
  });

  // Editor form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    bid_mode: "sealed",
    min_bidders: 1,
    max_bidders: 0,
    auto_create_deal_room: false,
    auto_create_shipment_request: false,
    is_active: true,
    company: "",
  });
  const [stages, setStages] = useState([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await biddingAPI.getTemplates();
      const data = (res?.data || res)?.results || res?.data || [];
      setTemplates(data);
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        description: template.description || "",
        bid_mode: template.bid_mode || "sealed",
        min_bidders: template.min_bidders || 1,
        max_bidders: template.max_bidders || 0,
        auto_create_deal_room: template.auto_create_deal_room || false,
        auto_create_shipment_request:
          template.auto_create_shipment_request || false,
        is_active: template.is_active !== false,
        company: template.company || "",
      });
      // Load stages from template
      loadStages(template.id);
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: "",
        description: "",
        bid_mode: "sealed",
        min_bidders: 1,
        max_bidders: 0,
        auto_create_deal_room: false,
        auto_create_shipment_request: false,
        is_active: true,
        company: "",
      });
      setStages([
        {
          name: "Submission",
          stage_type: "submission",
          duration_days: 14,
          auto_advance: true,
          description: "",
          criteria: [],
        },
        {
          name: "Evaluation",
          stage_type: "evaluation",
          duration_days: 7,
          auto_advance: false,
          description: "",
          criteria: [
            { name: "Technical Score", weight: 40, scoring_method: "numeric", max_score: 100 },
            { name: "Price Score", weight: 30, scoring_method: "numeric", max_score: 100 },
            { name: "Experience", weight: 20, scoring_method: "numeric", max_score: 100 },
            { name: "Compliance", weight: 10, scoring_method: "pass_fail", max_score: 1 },
          ],
        },
        {
          name: "Award",
          stage_type: "award",
          duration_days: 3,
          auto_advance: false,
          description: "",
          criteria: [],
        },
      ]);
    }
    setShowEditor(true);
  };

  const loadStages = async (templateId) => {
    try {
      const res = await biddingAPI.getTemplateStages(templateId);
      const stageData = (res?.data || res)?.results || res?.data || [];
      // For each stage, load criteria
      const stagesWithCriteria = await Promise.all(
        stageData.map(async (stage) => {
          if (stage.stage_type === "evaluation") {
            try {
              const critRes = await biddingAPI.getStageCriteria(stage.id);
              const criteria =
                (critRes?.data || critRes)?.results || critRes?.data || [];
              return { ...stage, criteria };
            } catch {
              return { ...stage, criteria: [] };
            }
          }
          return { ...stage, criteria: [] };
        })
      );
      setStages(stagesWithCriteria);
    } catch {
      setStages([]);
    }
  };

  const handleSave = async () => {
    if (!templateForm.name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!templateForm.company) {
      toast.error("Please select a company");
      return;
    }

    setSaving(true);
    try {
      let template;
      if (editingTemplate) {
        const res = await biddingAPI.updateTemplate(
          editingTemplate.id,
          templateForm
        );
        template = res?.data || res;
        toast.success("Template updated");
      } else {
        const res = await biddingAPI.createTemplate(templateForm);
        template = res?.data || res;
        toast.success("Template created");
      }

      // Save stages
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const stageData = {
          name: stage.name,
          stage_type: stage.stage_type,
          order: i + 1,
          duration_days: parseInt(stage.duration_days) || 7,
          auto_advance: stage.auto_advance || false,
          description: stage.description || "",
        };

        let savedStage;
        if (stage.id) {
          const res = await biddingAPI.updateStage(
            template.id,
            stage.id,
            stageData
          );
          savedStage = res?.data || res;
        } else {
          const res = await biddingAPI.createStage(template.id, stageData);
          savedStage = res?.data || res;
        }

        // Save criteria for evaluation stages
        if (
          stage.stage_type === "evaluation" &&
          stage.criteria?.length > 0
        ) {
          for (const criterion of stage.criteria) {
            const critData = {
              name: criterion.name,
              weight: parseFloat(criterion.weight) || 0,
              scoring_method: criterion.scoring_method || "numeric",
              max_score: parseInt(criterion.max_score) || 100,
            };
            if (criterion.id) {
              await biddingAPI.updateCriterion(
                savedStage.id,
                criterion.id,
                critData
              );
            } else {
              await biddingAPI.createCriterion(savedStage.id, critData);
            }
          }
        }
      }

      setShowEditor(false);
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (template) => {
    try {
      const res = await biddingAPI.createTemplate({
        ...template,
        name: `${template.name} (Copy)`,
        id: undefined,
      });
      toast.success("Template duplicated");
      fetchTemplates();
    } catch {
      toast.error("Failed to duplicate");
    }
  };

  const handleDelete = async (template) => {
    if (!confirm("Delete this template?")) return;
    try {
      await biddingAPI.deleteTemplate(template.id);
      toast.success("Template deleted");
      fetchTemplates();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Stage management
  const addStage = () => {
    setStages((prev) => [
      ...prev,
      {
        name: "",
        stage_type: "evaluation",
        duration_days: 7,
        auto_advance: false,
        description: "",
        criteria: [],
      },
    ]);
  };

  const updateStage = (index, field, value) => {
    setStages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeStage = (index) => {
    setStages((prev) => prev.filter((_, i) => i !== index));
  };

  // Criteria management for a specific stage
  const updateCriterion = (stageIndex, critIndex, field, value) => {
    setStages((prev) => {
      const updated = [...prev];
      const criteria = [...(updated[stageIndex].criteria || [])];
      criteria[critIndex] = { ...criteria[critIndex], [field]: value };
      updated[stageIndex] = { ...updated[stageIndex], criteria };
      return updated;
    });
  };

  const addCriterion = (stageIndex) => {
    setStages((prev) => {
      const updated = [...prev];
      const criteria = [...(updated[stageIndex].criteria || [])];
      criteria.push({
        name: "",
        weight: 0,
        scoring_method: "numeric",
        max_score: 100,
      });
      updated[stageIndex] = { ...updated[stageIndex], criteria };
      return updated;
    });
  };

  const removeCriterion = (stageIndex, critIndex) => {
    setStages((prev) => {
      const updated = [...prev];
      const criteria = updated[stageIndex].criteria.filter(
        (_, i) => i !== critIndex
      );
      updated[stageIndex] = { ...updated[stageIndex], criteria };
      return updated;
    });
  };

  if (showEditor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => setShowEditor(false)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Templates
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {editingTemplate ? "Edit Template" : "Create Workflow Template"}
        </h1>

        <div className="space-y-6">
          {/* Basic Info */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Template Settings</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input
                    value={templateForm.name}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Standard RFP Workflow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bid Mode
                  </label>
                  <Select
                    value={templateForm.bid_mode}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        bid_mode: e.target.value,
                      })
                    }
                  >
                    {BID_MODES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={templateForm.description}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe when to use this template..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Bidders
                  </label>
                  <Input
                    type="number"
                    value={templateForm.min_bidders}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        min_bidders: e.target.value,
                      })
                    }
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Bidders
                  </label>
                  <Input
                    type="number"
                    value={templateForm.max_bidders}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        max_bidders: e.target.value,
                      })
                    }
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">0 = unlimited</p>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <input
                      type="checkbox"
                      checked={templateForm.auto_create_deal_room}
                      onChange={(e) =>
                        setTemplateForm({
                          ...templateForm,
                          auto_create_deal_room: e.target.checked,
                        })
                      }
                      className="rounded text-[#F1C644]"
                    />
                    Auto Deal Room
                  </label>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <input
                      type="checkbox"
                      checked={templateForm.auto_create_shipment_request}
                      onChange={(e) =>
                        setTemplateForm({
                          ...templateForm,
                          auto_create_shipment_request: e.target.checked,
                        })
                      }
                      className="rounded text-[#F1C644]"
                    />
                    Auto Shipment
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <Input
                  value={templateForm.company}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      company: e.target.value,
                    })
                  }
                  placeholder="Company ID"
                />
              </div>
            </div>
          </section>

          {/* Stages */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Workflow Stages</h2>
                <p className="text-xs text-gray-500">
                  Define the stages of your bidding process
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={addStage}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Stage
              </Button>
            </div>

            <div className="space-y-3">
              {stages.map((stage, index) => (
                <StageEditor
                  key={index}
                  stage={stage}
                  index={index}
                  onUpdate={updateStage}
                  onRemove={removeStage}
                  onEditCriteria={(i) =>
                    setCriteriaModal({ open: true, stageIndex: i })
                  }
                />
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setShowEditor(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {editingTemplate ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </div>

        {/* Criteria Modal */}
        {criteriaModal.open && criteriaModal.stageIndex !== null && (
          <Modal
            isOpen={criteriaModal.open}
            onClose={() => setCriteriaModal({ open: false, stageIndex: null })}
            title={`Evaluation Criteria — ${stages[criteriaModal.stageIndex]?.name || "Stage"}`}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Define how bids will be scored. Weights should total 100%.
              </p>
              <CriteriaEditor
                criteria={
                  stages[criteriaModal.stageIndex]?.criteria || []
                }
                onUpdate={(critIndex, field, value) =>
                  updateCriterion(
                    criteriaModal.stageIndex,
                    critIndex,
                    field,
                    value
                  )
                }
                onAdd={() => addCriterion(criteriaModal.stageIndex)}
                onRemove={(critIndex) =>
                  removeCriterion(criteriaModal.stageIndex, critIndex)
                }
              />
              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setCriteriaModal({ open: false, stageIndex: null })
                  }
                >
                  Done
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate(webRoutes.bidding)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Bidding
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-[#F1C644]" />
            Workflow Templates
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create reusable bidding workflows for your company
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => openEditor()}>
          <Plus className="w-4 h-4 mr-1" />
          New Template
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700">
            No templates yet
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Create workflow templates to standardize your bidding process. 
            Each template defines stages, evaluation criteria, and scoring methods.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => openEditor()}
          >
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={openEditor}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
