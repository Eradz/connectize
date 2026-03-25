import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
import { getCompanyByIdOrEmail } from "../../api-services/companies";
import { webRoutes } from "../../lib/webRoutes";
import HeadingText from "../../components/HeadingText";
import Button from "../../components/ui/Button";
import Input, { Select } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  Search,
  Plus,
  Filter,
  Clock,
  DollarSign,
  MapPin,
  Building2,
  ChevronRight,
  Gavel,
  FileText,
  Send,
  Users,
  Calendar,
  ShieldCheck,
  ClipboardCheck,
  LayoutTemplate,
} from "lucide-react";

const STATUS_LABELS = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  published: { label: "Published", color: "bg-blue-100 text-blue-700" },
  submission_open: { label: "Open", color: "bg-green-100 text-green-700" },
  submission_closed: { label: "Closed", color: "bg-yellow-100 text-yellow-700" },
  under_evaluation: { label: "Evaluating", color: "bg-purple-100 text-purple-700" },
  awarded: { label: "Awarded", color: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Completed", color: "bg-teal-100 text-teal-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

const PROJECT_TYPES = [
  { value: "", label: "All Types" },
  { value: "rfp", label: "RFP" },
  { value: "rfq", label: "RFQ" },
  { value: "tender", label: "Tender" },
  { value: "auction", label: "Auction" },
  { value: "expression_of_interest", label: "EOI" },
];

function StatusBadge({ status }) {
  const config = STATUS_LABELS[status] || { label: status, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function ProjectCard({ project, onClick, onApply }) {
  const deadline = project.submission_deadline
    ? new Date(project.submission_deadline)
    : null;
  const isExpired = deadline && deadline < new Date();
  const canApply = !project.is_owner && project.status === "submission_open";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#F1C644]/40 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-[#F1C644] transition-colors">
            {project.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{project.reference_number}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {project.description?.replace(/<[^>]+>/g, "").slice(0, 150)}
      </p>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
        {project.project_type && (
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span className="uppercase">{project.project_type}</span>
          </div>
        )}
        {project.category && (
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">{project.category}</span>
          </div>
        )}
        {project.budget_max && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            <span>
              {project.currency} {Number(project.budget_max).toLocaleString()}
            </span>
          </div>
        )}
        {deadline && (
          <div className={`flex items-center gap-1.5 ${isExpired ? "text-red-500" : ""}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{deadline.toLocaleDateString()}</span>
          </div>
        )}
        {project.country && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{project.country}</span>
          </div>
        )}
        {project.bid_count !== undefined && (
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{project.bid_count} bids</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {project.company_logo && (
            <img
              src={project.company_logo}
              alt=""
              className="w-5 h-5 rounded-full object-cover"
            />
          )}
          <span className="text-xs text-gray-500 truncate">
            {project.company_name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canApply ? (
            <Button
              size="sm"
              className="bg-gold hover:bg-[#E0B533] text-dark"
              onClick={(e) => {
                e.stopPropagation();
                onApply();
              }}
            >
              <Send className="w-4 h-4 mr-1" />
              Apply
            </Button>
          ) : (
            <span className="text-xs text-gray-400">
              {project.status === "published" && !project.is_owner
                ? "Awaiting submission opening"
                : "View details"}
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#F1C644] transition-colors" />
        </div>
      </div>
    </div>
  );
}

export default function BiddingProjects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState({
    role: searchParams.get("role") || "",
    status: searchParams.get("status") || "",
    project_type: searchParams.get("type") || "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({ total: 0, open: 0, myProjects: 0 });
  const [userCompanies, setUserCompanies] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [respondingInvitationId, setRespondingInvitationId] = useState(null);

  // Fetch stats from multiple queries for accuracy (stable across tab switches)
  const fetchStats = async () => {
    try {
      const [allRes, openRes, myRes] = await Promise.all([
        biddingAPI.getProjects({}),
        biddingAPI.getProjects({ status: 'published,submission_open' }),
        biddingAPI.getProjects({ role: 'buyer' }),
      ]);
      const allData = allRes?.data || allRes;
      const allList = allData.results || allData || [];
      const openData = openRes?.data || openRes;
      const openList = openData.results || openData || [];
      const myData = myRes?.data || myRes;
      const myList = myData.results || myData || [];
      setStats({
        total: allData.count ?? allList.length,
        open: openData.count ?? openList.length,
        myProjects: myData.count ?? myList.length,
      });
    } catch {
      // stats fetch failure is non-critical
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = { search };
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.project_type) params.project_type = filters.project_type;

      const res = await biddingAPI.getProjects(params);
      const data = res?.data || res;
      setProjects(data.results || data || []);
    } catch (err) {
      toast.error("Failed to load bid projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCompanies = async () => {
    try {
      const companies = await getCompanyByIdOrEmail();
      setUserCompanies(Array.isArray(companies) ? companies : []);
    } catch {
      setUserCompanies([]);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await biddingAPI.getAllInvitations();
      const data = res?.data || res;
      const list = data.results || (Array.isArray(data) ? data : []);
      setInvitations(list);
    } catch {
      setInvitations([]);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUserCompanies();
    fetchInvitations();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.reference_number?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [projects, search]);

  const inboundInvitations = useMemo(() => {
    const companyIds = new Set(userCompanies.map((company) => String(company.id)));
    return invitations.filter((invitation) => companyIds.has(String(invitation.invited_company)));
  }, [invitations, userCompanies]);

  const handleInvitationResponse = async (invitationId, decision) => {
    try {
      setRespondingInvitationId(invitationId);
      await biddingAPI.respondToInvitation(invitationId, { decision });
      toast.success(`Invitation ${decision}`);
      await Promise.all([fetchInvitations(), fetchProjects(), fetchStats()]);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to respond to invitation");
    } finally {
      setRespondingInvitationId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gavel className="w-7 h-7 text-[#F1C644]" />
            Bidding & Procurement
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse open tenders, submit bids, and manage procurement workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(webRoutes.biddingTemplates)}
          >
            <FileText className="w-4 h-4 mr-1" />
            Templates
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(webRoutes.biddingCreate)}
          >
            <Plus className="w-4 h-4 mr-1" />
            New Project
          </Button>
        </div>
      </div>

      {/* Quick Filter Tabs — primary discovery for bidders */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto bg-white rounded-lg border border-gray-200 p-1">
        {[
          { label: "All Projects", role: "", status: "" },
          { label: "Open for Bidding", role: "", status: "published,submission_open" },
          { label: "My Projects", role: "buyer", status: "" },
          { label: "My Bids", role: "bidder", status: "" },
        ].map((preset) => {
          const isActive =
            filters.role === preset.role &&
            filters.status === preset.status;
          return (
            <button
              key={preset.label}
              onClick={() =>
                setFilters({ ...filters, role: preset.role, status: preset.status })
              }
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ${
                isActive
                  ? "bg-[#F1C644] text-gray-900 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Quick Access Tools */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Compliance Vault",
            desc: "Manage vendor documents",
            icon: ShieldCheck,
            color: "text-indigo-600 bg-indigo-50",
            to: webRoutes.biddingCompliance,
          },
          {
            label: "Prequalification",
            desc: "Vendor qualification schemes",
            icon: ClipboardCheck,
            color: "text-emerald-600 bg-emerald-50",
            to: webRoutes.biddingPrequalification,
          },
          {
            label: "Templates",
            desc: "Workflow & evaluation",
            icon: LayoutTemplate,
            color: "text-orange-600 bg-orange-50",
            to: webRoutes.biddingTemplates,
          },
          {
            label: "New Project",
            desc: "Create a bid project",
            icon: Plus,
            color: "text-[#F1C644] bg-[#F1C644]/10",
            to: webRoutes.biddingCreate,
          },
        ].map((tool) => (
          <div
            key={tool.label}
            onClick={() => navigate(tool.to)}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-[#F1C644]/40 transition-all cursor-pointer group"
          >
            <div className={`inline-flex p-2 rounded-lg ${tool.color} mb-2`}>
              <tool.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-[#F1C644] transition-colors">
              {tool.label}
            </p>
            <p className="text-xs text-gray-500">{tool.desc}</p>
          </div>
        ))}
      </div>

      {inboundInvitations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3 gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bid Invitations</h2>
              <p className="text-sm text-gray-500">
                Respond to invited tenders before they remain hidden from your bidding list.
              </p>
            </div>
            <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
              {inboundInvitations.filter((invitation) => invitation.status === "pending").length} pending
            </span>
          </div>

          <div className="space-y-3">
            {inboundInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="rounded-xl border border-gray-200 px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{invitation.project_title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {invitation.project_reference} · {invitation.project_company_name}
                  </p>
                  {invitation.message && (
                    <p className="text-sm text-gray-600 mt-2">{invitation.message}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
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
                  {invitation.status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInvitationResponse(invitation.id, "declined")}
                        loading={respondingInvitationId === invitation.id}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gold hover:bg-[#E0B533] text-dark"
                        onClick={() => handleInvitationResponse(invitation.id, "accepted")}
                        loading={respondingInvitationId === invitation.id}
                      >
                        Accept Invitation
                      </Button>
                    </>
                  ) : invitation.status === "accepted" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(webRoutes.biddingDetail.replace(":id", invitation.project))
                      }
                    >
                      Open Project
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Projects</p>
            </div>
          </div>
        </div>
        <div
          className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-green-300 transition"
          onClick={() => setFilters({ ...filters, role: "", status: "submission_open" })}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Gavel className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              <p className="text-xs text-gray-500">Open for Bidding</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F1C644]/10 rounded-lg">
              <Building2 className="w-5 h-5 text-[#F1C644]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.myProjects}</p>
              <p className="text-xs text-gray-500">My Projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search projects by name, reference, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </form>
          <div className="flex gap-2">
            <Select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-32"
            >
              <option value="">All Roles</option>
              <option value="buyer">My Projects</option>
              <option value="bidder">My Bids</option>
            </Select>
            <Button
              variant={showFilters ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.project_type}
              onChange={(e) =>
                setFilters({ ...filters, project_type: e.target.value })
              }
            >
              {PROJECT_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({ role: "", status: "", project_type: "" })
              }
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/3 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-3" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700">No bid projects found</h3>
          <p className="text-sm text-gray-500 mt-1">
            Create a new project or adjust your filters
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => navigate(webRoutes.biddingCreate)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onApply={() =>
                navigate(webRoutes.biddingSubmit.replace(":id", project.id))
              }
              onClick={() =>
                navigate(
                  webRoutes.biddingDetail.replace(":id", project.id)
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
