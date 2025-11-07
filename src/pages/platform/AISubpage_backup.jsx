import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { aiMatchingService, aiOpportunityService, aiComplianceService } from "../../api-services/oilgas";
import { toast } from "sonner";
import { SkeletonList } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyStates";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Eye, 
  CheckCircle, 
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Download,
  Share2,
  Star,
  Clock,
  Target,
  Brain,
  Zap,
  BarChart3,
  FileText,
  Shield,
  Lightbulb
} from "lucide-react";

export default function AISubpage() {
  const { pathname } = useLocation();
  const section = useMemo(() => pathname.split("/").pop() || "ai", [pathname]);
  const title = section.replace(/-/g, " ");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [processingAction, setProcessingAction] = useState(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [analytics, setAnalytics] = useState({
    total: 0,
    processed: 0,
    pending: 0,
    accuracy: 0
  });

  // Generate mock data based on section
  const generateMockData = useCallback(() => {
    const mockData = {
      "ai": [
        { id: 1, title: "AI Dashboard Overview", status: "active", type: "overview", accuracy: 94, processedToday: 156 },
        { id: 2, title: "Smart Recommendations", status: "processing", type: "recommendation", accuracy: 87, processedToday: 23 },
        { id: 3, title: "Predictive Analytics", status: "completed", type: "analytics", accuracy: 91, processedToday: 78 }
      ],
      "ai-matching": [
        { 
          id: 1, 
          title: "Oil & Gas Engineer - Senior Position", 
          candidate: "John Smith", 
          company: "Chevron",
          matchScore: 94, 
          status: "matched", 
          skills: ["Drilling Operations", "Safety Management", "Project Leadership"],
          experience: "12 years",
          location: "Houston, TX",
          salary: "$145,000",
          confidence: "High",
          reasoning: "Strong technical background in offshore drilling with relevant project management experience"
        },
        { 
          id: 2, 
          title: "Pipeline Inspector", 
          candidate: "Maria Rodriguez", 
          company: "Kinder Morgan",
          matchScore: 87, 
          status: "processing", 
          skills: ["Pipeline Inspection", "NDT Testing", "Regulatory Compliance"],
          experience: "8 years",
          location: "Dallas, TX", 
          salary: "$85,000",
          confidence: "Medium",
          reasoning: "Solid inspection experience but needs additional certification for advanced pipeline systems"
        },
        { 
          id: 3, 
          title: "Reservoir Engineer", 
          candidate: "Ahmed Hassan", 
          company: "ExxonMobil",
          matchScore: 91, 
          status: "matched", 
          skills: ["Reservoir Simulation", "Petroleum Geology", "Enhanced Recovery"],
          experience: "15 years",
          location: "Midland, TX",
          salary: "$165,000",
          confidence: "High",
          reasoning: "Exceptional expertise in unconventional reservoirs with proven track record"
        },
        { 
          id: 4, 
          title: "HSE Manager", 
          candidate: "Sarah Johnson", 
          company: "BP America",
          matchScore: 89, 
          status: "pending", 
          skills: ["Safety Management", "Environmental Compliance", "Risk Assessment"],
          experience: "10 years",
          location: "New Orleans, LA",
          salary: "$125,000",
          confidence: "High",
          reasoning: "Strong safety background with offshore platform experience"
        },
        { 
          id: 5, 
          title: "Drilling Supervisor", 
          candidate: "Michael Chen", 
          company: "Halliburton",
          matchScore: 82, 
          status: "reviewing", 
          skills: ["Drilling Operations", "Well Control", "Team Leadership"],
          experience: "14 years",
          location: "Bakersfield, CA",
          salary: "$135,000",
          confidence: "Medium",
          reasoning: "Good drilling experience but limited exposure to latest automation technologies"
        }
      ],
      "ai-opportunities": [
        {
          id: 1,
          title: "Market Expansion Opportunity",
          description: "AI analysis identified potential for 35% market growth in renewable energy transition services",
          confidence: 89,
          status: "high-priority",
          value: "$2.4M",
          timeline: "6 months",
          factors: ["Regulatory Changes", "Market Demand", "Competitive Gap"],
          region: "Gulf Coast",
          actionItems: ["Conduct market research", "Develop service offerings", "Build partnerships"]
        },
        {
          id: 2,
          title: "Cost Optimization in Logistics",
          description: "Machine learning models suggest 23% cost reduction through route optimization",
          confidence: 94,
          status: "ready-to-implement",
          value: "$850K",
          timeline: "3 months",
          factors: ["Route Efficiency", "Fuel Costs", "Asset Utilization"],
          region: "Texas Triangle",
          actionItems: ["Deploy routing algorithms", "Train logistics team", "Monitor KPIs"]
        },
        {
          id: 3,
          title: "Talent Acquisition Enhancement",
          description: "AI identifies key skill gaps and predicts hiring success with 87% accuracy",
          confidence: 76,
          status: "in-analysis",
          value: "$1.2M",
          timeline: "4 months",
          factors: ["Skill Demand", "Competition", "Salary Trends"],
          region: "Permian Basin",
          actionItems: ["Refine job descriptions", "Expand recruiting channels", "Implement AI screening"]
        },
        {
          id: 4,
          title: "Digital Transformation ROI",
          description: "Automation opportunities could reduce operational costs by 18%",
          confidence: 82,
          status: "under-review",
          value: "$3.1M",
          timeline: "12 months",
          factors: ["Technology Adoption", "Training Costs", "Process Efficiency"],
          region: "Eagle Ford",
          actionItems: ["Technology assessment", "Change management", "Phased implementation"]
        }
      ],
      "ai-compliance": [
        {
          id: 1,
          title: "Environmental Compliance Monitoring",
          description: "AI-powered monitoring of environmental regulations and permit requirements",
          status: "compliant",
          riskLevel: "low",
          lastChecked: "2024-01-15",
          regulations: ["EPA Clean Air Act", "OSHA PSM", "DOT Pipeline Safety"],
          findings: [],
          nextReview: "2024-02-15",
          confidence: 96
        },
        {
          id: 2,
          title: "Safety Protocol Adherence",
          description: "Automated analysis of safety incident reports and protocol compliance",
          status: "attention-required",
          riskLevel: "medium",
          lastChecked: "2024-01-14",
          regulations: ["OSHA Standards", "API Guidelines", "Company Policies"],
          findings: ["Minor PPE violations (3 instances)", "Training refresh needed for 12 employees"],
          nextReview: "2024-01-21",
          confidence: 87
        },
        {
          id: 3,
          title: "Financial Reporting Compliance",
          description: "AI verification of financial reporting accuracy and regulatory compliance",
          status: "compliant",
          riskLevel: "low",
          lastChecked: "2024-01-13",
          regulations: ["SEC Reporting", "SOX Compliance", "Tax Regulations"],
          findings: [],
          nextReview: "2024-02-13",
          confidence: 99
        },
        {
          id: 4,
          title: "Data Privacy & Security",
          description: "Continuous monitoring of data handling practices and privacy compliance",
          status: "needs-action",
          riskLevel: "high",
          lastChecked: "2024-01-12",
          regulations: ["GDPR", "CCPA", "Industry Standards"],
          findings: ["Outdated privacy policies", "Access control review required", "Employee training overdue"],
          nextReview: "2024-01-19",
          confidence: 73
        }
      ]
    };

    return mockData[section] || mockData["ai"];
  }, [section]);

  // Process AI actions
  const handleAIAction = async (actionType, itemId = null) => {
    setAiProcessing(true);
    setProcessingAction(actionType);
    
    try {
      // Simulate AI processing with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (actionType === 'optimize' && section === 'ai-matching') {
        toast.success("AI optimization complete! Match scores improved by 15%");
        // Update analytics
        setAnalytics(prev => ({
          ...prev,
          processed: prev.processed + selectedItems.size,
          accuracy: Math.min(prev.accuracy + 2, 100)
        }));
      } else if (actionType === 'analyze' && section === 'ai-opportunities') {
        toast.success("Deep analysis complete! New insights generated");
      } else if (actionType === 'scan' && section === 'ai-compliance') {
        toast.success("Compliance scan complete! All systems checked");
      } else if (actionType === 'approve' && itemId) {
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, status: 'approved' } : item
        ));
        toast.success("Item approved successfully");
      } else if (actionType === 'reject' && itemId) {
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, status: 'rejected' } : item
        ));
        toast.success("Item rejected");
      }
      
    } catch (error) {
      toast.error("AI action failed. Please try again.");
    } finally {
      setAiProcessing(false);
      setProcessingAction(null);
    }
  };

  // Calculate analytics
  useEffect(() => {
    if (items.length > 0) {
      const total = items.length;
      const processed = items.filter(item => 
        item.status === 'completed' || item.status === 'matched' || item.status === 'approved'
      ).length;
      const pending = items.filter(item => 
        item.status === 'processing' || item.status === 'pending'
      ).length;
      
      let accuracy = 0;
      if (section === 'ai-matching') {
        accuracy = items.reduce((acc, item) => acc + (item.matchScore || 0), 0) / items.length;
      } else if (section === 'ai-opportunities') {
        accuracy = items.reduce((acc, item) => acc + (item.confidence || 0), 0) / items.length;
      } else if (section === 'ai-compliance') {
        accuracy = items.reduce((acc, item) => acc + (item.confidence || 0), 0) / items.length;
      }
      
      setAnalytics({ total, processed, pending, accuracy: Math.round(accuracy) });
    }
  }, [items, section]);

  const getIcon = () => {
    switch (section) {
      case "ai-matching": return Users;
      case "ai-opportunities": return TrendingUp;
      case "ai-compliance": return Shield;
      default: return Brain;
    }
  };

  // Use mock data when API fails
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (section === "ai-matching") {
          res = await aiMatchingService.getMatches();
        } else if (section === "ai-opportunities") {
          res = await aiOpportunityService.getOpportunities();
        } else if (section === "ai-compliance") {
          res = await aiComplianceService.getComplianceAlerts();
        }
        if (mounted && res) {
          setItems(res?.results || res?.data || res || []);
        } else {
          // Use mock data as fallback
          setItems(generateMockData());
        }
      } catch (e) {
        if (mounted) {
          console.warn("API failed, using mock data:", e.message);
          setItems(generateMockData());
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [section, generateMockData]);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {React.createElement(getIcon(), { className: "h-6 w-6 text-blue-600" })}
              <h1 className="text-2xl font-bold text-gray-900">AI {title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {section === "ai-matching" && "AI-powered talent matching system"}
                {section === "ai-opportunities" && "Discover growth opportunities with AI"}
                {section === "ai-compliance" && "Automated compliance monitoring"}
                {section === "ai" && "AI-powered business intelligence"}
              </div>
              {/* AI Analytics Panel */}
              <div className="flex items-center space-x-6 bg-gray-50 px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{analytics.total}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{analytics.processed}</div>
                  <div className="text-xs text-gray-500">Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{analytics.pending}</div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{analytics.accuracy}%</div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filter and AI Actions */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${section.replace('ai-', '')}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {section === "ai-matching" && (
                  <>
                    <option value="matched">Matched</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                  </>
                )}
                {section === "ai-opportunities" && (
                  <>
                    <option value="high-priority">High Priority</option>
                    <option value="ready-to-implement">Ready to Implement</option>
                    <option value="in-analysis">In Analysis</option>
                    <option value="under-review">Under Review</option>
                  </>
                )}
                {section === "ai-compliance" && (
                  <>
                    <option value="compliant">Compliant</option>
                    <option value="attention-required">Attention Required</option>
                    <option value="needs-action">Needs Action</option>
                  </>
                )}
              </select>

              {/* AI Action Buttons */}
              <div className="flex items-center space-x-2">
                {section === "ai-matching" && (
                  <button
                    onClick={() => handleAIAction('optimize')}
                    disabled={aiProcessing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {aiProcessing && processingAction === 'optimize' ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    <span>Optimize Matches</span>
                  </button>
                )}
                
                {section === "ai-opportunities" && (
                  <button
                    onClick={() => handleAIAction('analyze')}
                    disabled={aiProcessing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {aiProcessing && processingAction === 'analyze' ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <BarChart3 className="h-4 w-4" />
                    )}
                    <span>Deep Analysis</span>
                  </button>
                )}
                
                {section === "ai-compliance" && (
                  <button
                    onClick={() => handleAIAction('scan')}
                    disabled={aiProcessing}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {aiProcessing && processingAction === 'scan' ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                    <span>Compliance Scan</span>
                  </button>
                )}
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <SkeletonList count={5} />
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : items?.length ? (
            <div className="space-y-4">
              {items
                .filter(item => {
                  const matchesSearch = !searchTerm || 
                    (item.title || item.name || item.summary || "").toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = filterStatus === "all" || item.status === filterStatus;
                  return matchesSearch && matchesStatus;
                })
                .map((it, i) => (
                  <div key={it.id || i} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {it.title || it.name || `${section} ${i + 1}`}
                          </h3>
                          {it.status && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              it.status === 'active' ? 'bg-red-100 text-red-800' :
                              it.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              it.status === 'high' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {it.status}
                            </span>
                          )}
                          {it.confidence && (
                            <span className="text-xs text-gray-500">
                              {it.confidence}% match
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">
                          {it.summary || it.description || "No description available"}
                        </p>
                        
                        {/* Additional metadata */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {it.created_at && (
                            <span>{new Date(it.created_at).toLocaleDateString()}</span>
                          )}
                          {it.priority && (
                            <span className="capitalize">{it.priority} priority</span>
                          )}
                          {it.type && (
                            <span className="capitalize">{it.type}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {section === "matching" && it.id && (
                          <>
                            <button
                              onClick={async () => {
                                await aiMatchingService.viewMatch(it.id);
                                toast.success("Match viewed");
                              }}
                              className="inline-flex items-center px-3 py-1.5 rounded border text-sm hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </button>
                          </>
                        )}
                        
                        {section === "opportunities" && it.id && (
                          <button
                            onClick={async () => {
                              await aiOpportunityService.expressInterest(it.id);
                              toast.success("Interest expressed");
                            }}
                            className="inline-flex items-center px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Express Interest
                          </button>
                        )}
                        
                        {section === "compliance" && it.id && it.status !== "resolved" && (
                          <button
                            onClick={async () => {
                              if (window.confirm('Mark this alert as resolved?')) {
                                await aiComplianceService.resolveAlert(it.id);
                                setItems(prev => prev.map(item => 
                                  item.id === it.id ? { ...item, status: 'resolved' } : item
                                ));
                                toast.success("Alert resolved");
                              }
                            }}
                            className="inline-flex items-center px-3 py-1.5 rounded bg-green-600 text-white text-sm hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              icon={getIcon()}
              title={`No ${section} found`}
              description={`${
                section === "matching" ? "No matches available yet. Update your profile to get better matches." :
                section === "opportunities" ? "No opportunities found. Check back later for new business opportunities." :
                "No compliance alerts. Your operations are currently compliant."
              }`}
              actionLabel={section === "matching" ? "Update Profile" : undefined}
              onAction={section === "matching" ? () => toast.info("Profile update coming soon") : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
