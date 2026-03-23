import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { biddingAPI } from "../../api-services/bidding";
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
  Users,
  Calendar,
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

function ProjectCard({ project, onClick }) {
  const deadline = project.submission_deadline
    ? new Date(project.submission_deadline)
    : null;
  const isExpired = deadline && deadline < new Date();

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
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#F1C644] transition-colors" />
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
      setStats({
        total: data.count || (data.results || data || []).length,
        open: (data.results || data || []).filter(
          (p) => p.status === "submission_open"
        ).length,
        myProjects: (data.results || data || []).filter(
          (p) => p.is_owner
        ).length,
      });
    } catch (err) {
      toast.error("Failed to load bid projects");
    } finally {
      setLoading(false);
    }
  };

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
          { label: "Open for Bidding", role: "", status: "submission_open" },
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
