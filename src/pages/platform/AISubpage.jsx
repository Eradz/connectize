import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { aiMatchingService, aiOpportunityService, aiComplianceService } from "../../api-services/oilgas";
import { toast } from "sonner";
import { SkeletonList } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyStates";
import { Search, Filter, TrendingUp, AlertTriangle, Users, Eye, CheckCircle, ThumbsUp } from "lucide-react";

export default function AISubpage() {
  const { pathname } = useLocation();
  const section = useMemo(() => pathname.split("/").pop() || "ai", [pathname]);
  const title = section.replace(/-/g, " ");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const getIcon = () => {
    switch (section) {
      case "matching": return Users;
      case "opportunities": return TrendingUp;
      case "compliance": return AlertTriangle;
      default: return Users;
    }
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (section === "matching") {
          res = await aiMatchingService.getMatches();
        } else if (section === "opportunities") {
          res = await aiOpportunityService.getOpportunities();
        } else if (section === "compliance") {
          res = await aiComplianceService.getComplianceAlerts();
        }
        if (mounted && res) setItems(res?.results || res?.data || res || []);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.detail || e?.message || "Failed to load AI data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [section]);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {React.createElement(getIcon(), { className: "h-6 w-6 text-blue-600" })}
              <h1 className="text-2xl font-bold text-gray-900">AI {title}</h1>
            </div>
            <div className="text-sm text-gray-500">
              {section === "matching" && "Find the perfect matches for your profile"}
              {section === "opportunities" && "Discover new business opportunities"}
              {section === "compliance" && "Stay compliant with regulatory requirements"}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${section}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {section === "compliance" && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Alerts</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="high">High Priority</option>
              </select>
            )}
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
