import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { webRoutes } from "../../lib/webRoutes";
import {
  dealRoomService,
  dealMilestoneService,
  dealActivityService,
} from "../../api-services/oilgas";
import { baseURL, getAuthorizationHeader, makeApiRequest } from "../../lib/helpers";
import { dealDocumentService, dealValuationService } from "../../api-services/oilgas";
import axios from "axios";
import { toast } from "sonner";
import Modal from "../../components/ui/Modal";
import { SkeletonList, SkeletonCard } from "../../components/ui/Skeleton";
import { EmptyDocuments, EmptyParticipants, EmptyMilestones, EmptyValuations, EmptySearch } from "../../components/ui/EmptyStates";
import { Search, Filter, Download, Eye, UserPlus, Plus, Settings, FileText, BarChart3 } from "lucide-react";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "documents", label: "Documents" },
  { key: "participants", label: "Participants" },
  { key: "milestones", label: "Milestones" },
  { key: "activities", label: "Activities" },
  { key: "valuations", label: "Valuations" },
  { key: "reports", label: "Reports" },
];

function currentSection(pathname) {
  if (pathname.includes("/documents")) return "documents";
  if (pathname.includes("/participants")) return "participants";
  if (pathname.includes("/milestones")) return "milestones";
  if (pathname.includes("/activities")) return "activities";
  if (pathname.includes("/valuations")) return "valuations";
  if (pathname.includes("/reports")) return "reports";
  return "overview";
}

export default function DealRoomDetail() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const active = useMemo(() => currentSection(pathname), [pathname]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deal, setDeal] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activities, setActivities] = useState([]);
  const [valuations, setValuations] = useState([]);
  const [participants, setParticipants] = useState([]);
  // UI state for forms
  const [docUploading, setDocUploading] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocFile, setNewDocFile] = useState(null);
  const [participantUserId, setParticipantUserId] = useState("");
  const [valuationMethod, setValuationMethod] = useState("DCF");
  const [valuationNotes, setValuationNotes] = useState("");
  const [actPage, setActPage] = useState(1);
  const pageSize = 10;
  
  // Modal states
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState({ notes: "", progress: 0 });
  const [participantForm, setParticipantForm] = useState({ userId: "", role: "viewer", email: "" });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [dealRes] = await Promise.all([dealRoomService.getById(id)]);
        if (!isMounted) return;
        setDeal(dealRes?.data || dealRes);

        // Load tab-specific data
        if (active === "documents") {
          const docs = await makeApiRequest({
            url: "api/v1/deals/documents/",
            method: "GET",
            params: { deal_room: id },
          });
          if (isMounted) setDocuments(docs?.results || docs?.data || docs || []);
        } else if (active === "milestones") {
          const res = await dealMilestoneService.getByDealRoom(id);
          if (isMounted) setMilestones(res?.results || res?.data || res || []);
        } else if (active === "activities") {
          const res = await dealActivityService.getByDealRoom(id);
          const list = res?.results || res?.data || res || [];
          if (isMounted) {
            setActivities(Array.isArray(list) ? list.slice(0, pageSize) : []);
            setActPage(1);
          }
        } else if (active === "valuations") {
          const res = await makeApiRequest({
            url: "api/v1/deals/valuations/",
            method: "GET",
            params: { deal_room: id },
          });
          if (isMounted) setValuations(res?.results || res?.data || res || []);
        } else if (active === "participants") {
          // Try from deal detail first
          const list = (dealRes?.data || dealRes)?.participants;
          if (Array.isArray(list) && list.length) {
            if (isMounted) setParticipants(list);
          } else {
            const res = await makeApiRequest({
              url: `api/v1/deals/deal-rooms/${id}/participants/`,
              method: "GET",
            });
            if (isMounted) setParticipants(res?.results || res?.data || res || []);
          }
        }
      } catch (e) {
        if (!isMounted) return;
        setError(e?.response?.data?.detail || e?.message || "Failed to load");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id, active]);

  const linkFor = (key) => {
    switch (key) {
      case "documents":
        return webRoutes.dealRoomDocuments.replace(":id", id);
      case "participants":
        return webRoutes.dealRoomParticipants.replace(":id", id);
      case "milestones":
        return webRoutes.dealRoomMilestones.replace(":id", id);
      case "activities":
        return webRoutes.dealRoomActivities.replace(":id", id);
      case "valuations":
        return webRoutes.dealRoomValuations.replace(":id", id);
      case "reports":
        return webRoutes.dealRoomReports.replace(":id", id);
      default:
        return webRoutes.dealRoomDetail.replace(":id", id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li><Link to={webRoutes.platformDashboard} className="text-gray-500 hover:text-gray-700">Dashboard</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><Link to={webRoutes.dealRooms} className="text-gray-500 hover:text-gray-700">Deal Rooms</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><span className="text-gray-900">Deal #{id}</span></li>
              <li><span className="text-gray-400">/</span></li>
              <li><span className="text-blue-600 capitalize">{active}</span></li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Deal Room #{id}</h1>
              <p className="text-gray-600 mt-1">Manage documents, participants, milestones, and more.</p>
            </div>
            <div className="flex space-x-2">
              <Link to={webRoutes.dealRooms} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Back to Deals</Link>
              <Link to={webRoutes.dealRoomEdit.replace(":id", id)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Edit Deal Room</Link>
            </div>
          </div>
          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => document.querySelector('input[type="file"]')?.click()} className="inline-flex items-center px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </button>
            <button onClick={() => setShowParticipantModal(true)} className="inline-flex items-center px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Participant
            </button>
            <Link to={linkFor("milestones")} className="inline-flex items-center px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              <Settings className="h-4 w-4 mr-2" />
              Update Milestones
            </Link>
            <Link to={linkFor("valuations")} className="inline-flex items-center px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              <BarChart3 className="h-4 w-4 mr-2" />
              Run Valuation
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <Link
                key={t.key}
                to={linkFor(t.key)}
                className={`px-3 py-2 rounded-md text-sm ${
                  active === t.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border rounded-xl p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              {active === "documents" && <SkeletonList count={3} />}
              {active === "participants" && <SkeletonList count={4} />}
              {active === "milestones" && <SkeletonCard />}
              {active === "activities" && <SkeletonList count={5} />}
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <>
              {/* Search and Filter Bar */}
              {(active === "documents" || active === "participants" || active === "activities") && (
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${active}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {active === "participants" && (
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  )}
                </div>
              )}

              <h2 className="text-lg font-semibold text-gray-900 mb-4">{active[0].toUpperCase() + active.slice(1)}</h2>
              {active === "overview" && (
                <div className="space-y-2 text-gray-700">
                  <div><span className="font-medium">Title:</span> {deal?.title || `Deal #${id}`}</div>
                  <div><span className="font-medium">Status:</span> {deal?.status || "—"}</div>
                  <div><span className="font-medium">Type:</span> {deal?.deal_type || "—"}</div>
                  <div><span className="font-medium">Participants:</span> {deal?.participants_count ?? 0}</div>
                  <div><span className="font-medium">Documents:</span> {deal?.documents_count ?? 0}</div>
                </div>
              )}
              {active === "documents" && (
                <div className="space-y-4">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newDocFile) return;
                      try {
                        setDocUploading(true);
                        const fd = new FormData();
                        if (newDocName) fd.append("name", newDocName);
                        fd.append("file", newDocFile);
                        fd.append("deal_room", id);
                        await dealDocumentService.uploadDocument(fd);
                        toast.success("Document uploaded");
                        // refresh list
                        const docs = await makeApiRequest({
                          url: "api/v1/deals/documents/",
                          method: "GET",
                          params: { deal_room: id },
                        });
                        setDocuments(docs?.results || docs?.data || docs || []);
                        setNewDocFile(null);
                        setNewDocName("");
                      } finally {
                        setDocUploading(false);
                      }
                    }}
                    className="flex flex-col gap-2 p-4 border rounded-lg"
                  >
                    <div className="text-sm font-medium text-gray-800">Upload Document</div>
                    <input
                      type="text"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="Document name (optional)"
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="file"
                      onChange={(e) => setNewDocFile(e.target.files?.[0] || null)}
                      className="border rounded px-3 py-2"
                    />
                    <button disabled={docUploading} className="self-start bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60">
                      {docUploading ? "Uploading..." : "Upload"}
                    </button>
                  </form>
                  
                  {documents.length === 0 ? (
                    <EmptyDocuments onUpload={() => document.querySelector('input[type="file"]')?.click()} />
                  ) : (
                    <div className="space-y-2">
                      {documents
                        .filter(d => !searchTerm || (d.name || d.title || "").toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((d, i) => {
                          const label = d.name || d.title || `Document ${i + 1}`;
                          const filePath = d.file || d.file_url || d.url;
                          const href = filePath
                            ? (String(filePath).startsWith("http") ? filePath : `${baseURL}/${String(filePath).replace(/^\//, "")}`)
                            : null;
                          return (
                            <div key={d.id || i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <div>
                                  <div className="font-medium text-gray-900" title={label}>{label}</div>
                                  <div className="text-sm text-gray-500">
                                    {d.size && `${Math.round(d.size / 1024)}KB`} • 
                                    {d.uploaded_at && new Date(d.uploaded_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  d.access_granted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {d.access_granted ? 'Accessible' : 'Restricted'}
                                </span>
                                {href ? (
                                  <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-1.5 rounded border text-sm hover:bg-gray-100">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Open
                                  </a>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const auth = await getAuthorizationHeader();
                                        const res = await axios.get(`${baseURL}/api/v1/deals/documents/${d.id}/download/`, {
                                          headers: auth || {},
                                          responseType: "blob",
                                        });
                                        const blob = new Blob([res.data]);
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = label.replace(/\s+/g, "_");
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        toast.success("Download started");
                                      } catch (e) {
                                        toast.error("Download failed");
                                      }
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 rounded border text-sm hover:bg-gray-100"
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </button>
                                )}
                                {!d.access_granted && (
                                  <button
                                    onClick={async () => {
                                      const justification = window.prompt("Justification for access request", "Due diligence");
                                      if (justification == null) return;
                                      await dealDocumentService.requestAccess(d.id, justification);
                                      toast.success("Access requested");
                                    }}
                                    className="px-3 py-1.5 rounded border text-sm hover:bg-gray-100"
                                  >
                                    Request Access
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      {searchTerm && documents.filter(d => (d.name || d.title || "").toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                        <EmptySearch searchTerm={searchTerm} />
                      )}
                    </div>
                  )}
                </div>
              )}
              {active === "participants" && (
                <div className="space-y-4">
                  {participants.length === 0 ? (
                    <EmptyParticipants onInvite={() => setShowParticipantModal(true)} />
                  ) : (
                    <div className="space-y-2">
                      {participants
                        .filter(p => {
                          const matchesSearch = !searchTerm || 
                            (p.name || p.username || p.email || "").toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesRole = filterRole === "all" || p.role === filterRole;
                          return matchesSearch && matchesRole;
                        })
                        .map((p, i) => (
                          <div key={p.id || i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {(p.name || p.username || p.email || "U")[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {p.name || p.username || p.email || `Participant ${i + 1}`}
                                </div>
                                <div className="text-sm text-gray-500">{p.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                p.role === 'admin' ? 'bg-red-100 text-red-800' :
                                p.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {p.role || 'viewer'}
                              </span>
                              {p.id && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Remove this participant?')) {
                                      await dealRoomService.removeParticipant(id, p.id);
                                      setParticipants((prev) => prev.filter((x) => (x.id || x) !== p.id));
                                      toast.success("Participant removed");
                                    }
                                  }}
                                  className="px-2 py-1 text-xs rounded border hover:bg-red-50 hover:text-red-600"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      {searchTerm && participants.filter(p => (p.name || p.username || p.email || "").toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                        <EmptySearch searchTerm={searchTerm} />
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowParticipantModal(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
                  >
                    <UserPlus className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <span className="text-gray-600">Invite New Participant</span>
                  </button>
                </div>
              )}
              {active === "milestones" && (
                <div className="space-y-3">
                  {milestones.length === 0 ? (
                    <EmptyMilestones onCreate={() => toast.info("Milestone creation coming soon")} />
                  ) : (
                    milestones.map((m, i) => (
                      <div key={m.id || i} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{m.title || m.name || `Milestone ${i + 1}`}</div>
                            {m.description && <div className="text-sm text-gray-600 mt-1">{m.description}</div>}
                            {typeof m.progress !== 'undefined' && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>{m.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${m.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingMilestone(m);
                                setMilestoneForm({ notes: "", progress: m.progress || 0 });
                                setShowMilestoneModal(true);
                              }}
                              className="px-3 py-1.5 rounded border text-sm hover:bg-gray-100"
                            >
                              Update
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Mark this milestone as complete?')) {
                                  await dealMilestoneService.markComplete(m.id, "Completed");
                                  const refreshed = await dealMilestoneService.getByDealRoom(id);
                                  setMilestones(refreshed?.results || refreshed?.data || refreshed || []);
                                  toast.success("Milestone completed");
                                }
                              }}
                              className="px-3 py-1.5 rounded bg-green-600 text-white text-sm hover:bg-green-700"
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {active === "activities" && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">Recent activities</div>
                    <button
                      onClick={async () => {
                        const res = await dealActivityService.getByDealRoom(id);
                        const list = res?.results || res?.data || res || [];
                        setActivities(Array.isArray(list) ? list.slice(0, actPage * pageSize) : []);
                      }}
                      className="px-3 py-1.5 rounded border text-sm"
                    >
                      Refresh
                    </button>
                  </div>
                  <ul className="list-disc pl-5 text-gray-700">
                    {activities.length === 0 && <li>No activities found.</li>}
                    {activities.map((a, i) => (
                      <li key={a.id || i}>{a.activity_type || a.type || a.description || `Activity ${i + 1}`}</li>
                    ))}
                  </ul>
                    <div className="pt-2">
                      <button
                        onClick={async () => {
                          const res = await dealActivityService.getByDealRoom(id);
                          const list = res?.results || res?.data || res || [];
                          const next = actPage + 1;
                          setActivities(Array.isArray(list) ? list.slice(0, next * pageSize) : []);
                          setActPage(next);
                        }}
                        className="px-3 py-1.5 rounded border text-sm"
                      >
                        Load more
                      </button>
                    </div>
                </div>
              )}
              {active === "valuations" && (
                <div className="space-y-4">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const payload = { deal_room: id, method: valuationMethod, notes: valuationNotes };
                      await dealValuationService.createValuation(payload);
                      const res = await makeApiRequest({
                        url: "api/v1/deals/valuations/",
                        method: "GET",
                        params: { deal_room: id },
                      });
                      setValuations(res?.results || res?.data || res || []);
                      setValuationNotes("");
                      toast.success("Valuation created");
                    }}
                    className="flex flex-col gap-2 p-4 border rounded-lg"
                  >
                    <div className="text-sm font-medium text-gray-800">Create Valuation</div>
                    <select value={valuationMethod} onChange={(e) => setValuationMethod(e.target.value)} className="border rounded px-3 py-2 w-full max-w-xs">
                      <option value="DCF">DCF</option>
                      <option value="Comparables">Comparables</option>
                      <option value="NAV">NAV</option>
                    </select>
                    <textarea
                      value={valuationNotes}
                      onChange={(e) => setValuationNotes(e.target.value)}
                      placeholder="Notes/assumptions"
                      className="border rounded px-3 py-2 w-full"
                    />
                    <button className="self-start bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create</button>
                  </form>
                  <ul className="list-disc pl-5 text-gray-700">
                    {valuations.length === 0 && <li>No valuations found.</li>}
                    {valuations.map((v, i) => (
                      <li key={v.id || i} className="flex items-center gap-2">
                        <span>{v.method || v.title || `Valuation ${i + 1}`}</span>
        {v.id && (
                          <button
                            onClick={async () => {
          await dealValuationService.runAnalysis(v.id, "standard");
          toast.success("Analysis started");
                            }}
                            className="px-2 py-1 text-xs rounded border"
                          >
                            Run Analysis
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {active === "reports" && (
                <div className="text-gray-700">Report generation and downloads coming soon.</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Milestone Update Modal */}
      <Modal
        isOpen={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        title="Update Milestone"
        size="md"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editingMilestone?.id) return;
            
            if (milestoneForm.progress !== editingMilestone.progress) {
              await dealMilestoneService.updateProgress(editingMilestone.id, { progress: milestoneForm.progress });
            }
            
            if (milestoneForm.notes) {
              await dealMilestoneService.markComplete(editingMilestone.id, milestoneForm.notes);
            }
            
            const refreshed = await dealMilestoneService.getByDealRoom(id);
            setMilestones(refreshed?.results || refreshed?.data || refreshed || []);
            setShowMilestoneModal(false);
            toast.success("Milestone updated");
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress ({milestoneForm.progress}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={milestoneForm.progress}
              onChange={(e) => setMilestoneForm(prev => ({ ...prev, progress: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Notes (optional)
            </label>
            <textarea
              value={milestoneForm.notes}
              onChange={(e) => setMilestoneForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add notes about progress or completion..."
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowMilestoneModal(false)}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update Milestone
            </button>
          </div>
        </form>
      </Modal>

      {/* Participant Invite Modal */}
      <Modal
        isOpen={showParticipantModal}
        onClose={() => setShowParticipantModal(false)}
        title="Invite Participant"
        size="md"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload = participantForm.email 
              ? { email: participantForm.email, role: participantForm.role }
              : { user_id: participantForm.userId, role: participantForm.role };
            
            await dealRoomService.addParticipant(id, payload);
            setParticipants((prev) => [...prev, { 
              id: participantForm.userId || participantForm.email, 
              email: participantForm.email,
              role: participantForm.role 
            }]);
            setParticipantForm({ userId: "", role: "viewer", email: "" });
            setShowParticipantModal(false);
            toast.success("Participant invited");
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID or Email
            </label>
            <input
              type="text"
              value={participantForm.userId || participantForm.email}
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes('@')) {
                  setParticipantForm(prev => ({ ...prev, email: value, userId: "" }));
                } else {
                  setParticipantForm(prev => ({ ...prev, userId: value, email: "" }));
                }
              }}
              placeholder="Enter user ID or email address"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={participantForm.role}
              onChange={(e) => setParticipantForm(prev => ({ ...prev, role: e.target.value }))}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="viewer">Viewer - Can view documents and activities</option>
              <option value="editor">Editor - Can upload and edit content</option>
              <option value="admin">Admin - Full access to manage participants</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowParticipantModal(false)}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
