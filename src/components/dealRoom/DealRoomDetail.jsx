import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { webRoutes } from "../../lib/webRoutes";
import {
  dealRoomService,
  dealMilestoneService,
  dealActivityService
} from "../../api-services/oilgas";

import { baseURL, getAuthorizationHeader, makeApiRequest } from "../../lib/helpers";
import { dealDocumentService, dealValuationService } from "../../api-services/oilgas";
import axios from "axios";
import { toast as notify } from "sonner";
import ActivityTimeline from './ActivityTimeline';
import Modal from "../../components/ui/Modal";
import { SkeletonList, SkeletonCard } from "../../components/ui/Skeleton";
import { EmptyDocuments, EmptyParticipants, EmptyMilestones, EmptyValuations, EmptySearch } from "../../components/ui/EmptyStates";
import { Search, Download, Eye, UserPlus, Plus, Settings, FileText, BarChart3, PencilIcon, ArrowLeft, Upload, File, X, CloudUpload, RefreshCcw, Dot, UploadCloud, CalendarDays, LockOpen, Trash2 } from "lucide-react";
import { CloudUploadOutlined } from "@ant-design/icons";
import Scroll from "../Scroll";
import { DocumentIcon } from "../ui/ModernIcon";
import RefreshButton from "../RefreshButton";
import dealRoomAPI from "../../api-services/dealRoom";
import ValuationsPanel from "./ValuationsPanel";
import { useAuth } from "../../context/userContext";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "documents", label: "Documents" },
  { key: "participants", label: "Participants" },
  { key: "milestones", label: "Milestones" },
  { key: "activities", label: "Activities" },
  { key: "valuations", label: "Valuations" },
];

function currentSection(pathname) {
  if (pathname.includes("/documents")) return "documents";
  if (pathname.includes("/participants")) return "participants";
  if (pathname.includes("/milestones")) return "milestones";
  if (pathname.includes("/activities")) return "activities";
  if (pathname.includes("/valuations")) return "valuations";
  return "overview";
}

export default function DealRoomDetail() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = useMemo(() => currentSection(pathname), [pathname]);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const {user} = useAuth();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setNewDocFile(e.dataTransfer.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
    setUploadSomeDocument(true);
  };

  const handleRemoveFile = () => {
    setNewDocFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Early validation - don't even render if ID is invalid
  if (!id || id === 'my-participations' || id === 'create' || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    console.warn('Invalid deal ID detected, redirecting:', id);
    setTimeout(() => navigate(webRoutes.dealRooms, { replace: true }), 0);
    return (
      <div className="min-h-screen border border-[#D9D9D9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pale_yellow mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deal, setDeal] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activities, setActivities] = useState([]);
  const [valuations, setValuations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [valuationCreate, setValuationCreate] = useState(false);
  const [uploadSomeDocument, setUploadSomeDocument] = useState(false);
  // console.log("valuation Create:", valuationCreate);
  // Track locally added items to preserve them during reloads
  const [locallyAddedParticipants, setLocallyAddedParticipants] = useState([]);
  const [locallyAddedDocuments, setLocallyAddedDocuments] = useState([]);
  // UI state for forms
  const [docUploading, setDocUploading] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("other");
  const [newDocFile, setNewDocFile] = useState(null);
  const [participantUserId, setParticipantUserId] = useState("");
  const [valuationMethod, setValuationMethod] = useState("dcf");
  const [valuationNotes, setValuationNotes] = useState("");
  const [valuationBase, setValuationBase] = useState(0);
  const [valuationAdjusted, setValuationAdjusted] = useState(0);
  const [valuationCurrency, setValuationCurrency] = useState("USD");
  const [valuationPreparedBy, setValuationPreparedBy] = useState("");
  const [actPage, setActPage] = useState(1);
  const pageSize = 10;
  
  // Modal states
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showCreateMilestoneModal, setShowCreateMilestoneModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  // Milestone modal state: progress and optional notes
  const [milestoneForm, setMilestoneForm] = useState({ progress: 0, notes: "" });
  const [createMilestoneForm, setCreateMilestoneForm] = useState({ 
    deal_room: null,
    title:"" ,
    description: "" ,
    status: "pending",
    priority: 1,
    progress: 0,
    assigned_to: null,
    created_by: null,
    due_date: null
  });
  // Participant form aligned with backend: role and permission_level choices
  const [participantForm, setParticipantForm] = useState({ userId: "", userDisplay: "", role: "observer", permission_level: "view" });
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [userSearching, setUserSearching] = useState(false);

  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Backend role and permission options
  const roleOptions = [
    { value: "owner", label: "Owner" },
    { value: "buyer", label: "Buyer" },
    { value: "seller", label: "Seller" },
    { value: "advisor", label: "Advisor" },
    { value: "legal", label: "Legal" },
    { value: "financial", label: "Financial" },
    { value: "technical", label: "Technical" },
    { value: "observer", label: "Observer" },
  ];
  const permissionOptions = [
    { value: "view", label: "View Only" },
    { value: "comment", label: "View & Comment" },
    { value: "edit", label: "View, Comment & Edit" },
    { value: "admin", label: "Admin (Full Access)" },
  ];

  // User permissions state - fetched from API
  const [userPermissions, setUserPermissions] = useState({
    permission_level: null,
    roles: [],
    can_view: false,
    can_comment: false,
    can_edit: false,
    can_admin: false,
    is_initiator: false,
  });

  // Fetch user permissions when deal room ID changes
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!id || !user) return;
      try {
        const res = await makeApiRequest({
          url: `api/v1/deals/deal-rooms/${id}/my_permissions/`,
          method: "GET",
        });
        if (res) {
          setUserPermissions(res);
        }
      } catch (error) {
        console.warn('Could not fetch permissions:', error);
        // Fallback to local calculation if API fails
      }
    };
    fetchPermissions();
  }, [id, user]);

  // Check if current user has edit privileges (initiator, admin, or edit permission)
  // Uses API permissions if available, falls back to local calculation
  const canEdit = useMemo(() => {
    // Prefer API-provided permissions
    if (userPermissions.can_edit || userPermissions.can_admin) return true;
    
    // Fallback to local calculation
    if (!user) return false;
    // Check if user is the deal initiator
    if (deal?.initiator === user.id || deal?.initiator_id === user.id) return true;
    // Check if user has admin or edit permission level in participants
    const userParticipant = participants.find(
      p => p.user === user.id || p.user_id === user.id || p.user_email === user.email
    );
    if (userParticipant) {
      return ['admin', 'edit'].includes(userParticipant.permission_level);
    }
    return false;
  }, [user, deal, participants, userPermissions]);

  // Check if user can delete (admin only)
  const canDelete = useMemo(() => {
    if (userPermissions.can_admin) return true;
    if (!user) return false;
    if (deal?.initiator === user.id || deal?.initiator_id === user.id) return true;
    const userParticipant = participants.find(
      p => p.user === user.id || p.user_id === user.id || p.user_email === user.email
    );
    return userParticipant?.permission_level === 'admin';
  }, [user, deal, participants, userPermissions]);

  // Check if user can manage participants (admin only)
  const canManageParticipants = canDelete;

  /* Validates milestone creation form */
  const validateMilestoneForm = (formData) => {
    const missingFields = [];

    // Check title
    if (!formData.title || formData.title.trim() === "") {
      missingFields.push("Title");
    }

    // Check description
    if (!formData.description || formData.description.trim() === "") {
      missingFields.push("Description");
    }

    // Check status
    if (!formData.status || formData.status.trim() === "") {
      missingFields.push("Status");
    }

    // Check due date
    if (!formData.due_date) {
      missingFields.push("Due Date");
    }

    // Check assigned_to (person to assign milestone to)
    if (!formData.assigned_to) {
      missingFields.push("Assigned To");
    }

    // Check priority
    if (formData.priority === null || formData.priority === undefined) {
      missingFields.push("Priority");
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  const refreshActivities = async ({active}) => {
    setLoading(true);
    try {
      const res = await makeApiRequest({
      url: `api/v1/deals/${active}/`,
      method: "GET",
      params: { deal_room: id, page_size: 200 },
      });
      const list = res?.results || res?.data || res || [];
      setValuations(Array.isArray(list) ? list : []);
      notify.success(`${active} refreshed`);
    } catch (error) {
      console.error(`Error refreshing ${active}:`, error);
      notify.error(`Failed to refresh ${active}`);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    // Skip loading if we're about to redirect due to invalid ID
    if (!id || id === 'my-participations' || id === 'create' || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return;
    }

    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Try to get deal details - if direct access fails, try from list
        let dealRes;
        
        // Try API calls first for all deals
        try {
          console.log('Attempting to load deal data for ID:', id);
          dealRes = await dealRoomService.getById(id);
          console.log('Direct API call successful:', dealRes);
        } catch (err) {
          console.warn('Deal access failed, trying from list:', err);
          // Fallback: get from list endpoint (authenticated)
          try {
            const listRes = await dealRoomService.getAll(1, 50);
            const deals = listRes?.results || listRes?.data || listRes || [];
            const foundDeal = deals.find(d => d.id === id);
            if (foundDeal) {
              dealRes = { data: foundDeal };
            } else {
              dealRes = { data: { id, title: `Deal Room #${id.slice(0, 8)} (unavailable)`, description: '' } };
            }
          } catch (listErr) {
            console.warn('List API also failed:', listErr);
            dealRes = { data: { id, title: `Deal Room #${id.slice(0, 8)} (unavailable)`, description: '' } };
          }
        }
        
        if (!isMounted) return;
        const dealData = dealRes?.data || dealRes;
        console.log('Final deal data being set:', dealData);
        setDeal(dealData);

        // Load tab-specific data
        if (active === "documents") {
          // Always use API results only
          try {
            const docs = await makeApiRequest({
              url: "api/v1/deals/documents/",
              method: "GET",
              params: { deal_room: id, page_size: 200 },
            });
            const apiDocs = docs?.results || docs?.data || docs || [];
            if (isMounted) setDocuments(Array.isArray(apiDocs) ? apiDocs : []);
          } catch (err) {
            console.warn('Documents API failed:', err);
            if (isMounted) setDocuments([]);
          }
        } else if (active === "milestones") {
          // Always try API first for all deals
          try {
            const res = await dealMilestoneService.getByDealRoom(id);
            const apiMilestones = res?.results || res?.data || res || [];
            if (isMounted) setMilestones(apiMilestones);
          } catch (err) {
            console.warn('Milestones API failed:', err);
            if (isMounted) setMilestones([]);
          }
        } else if (active === "activities") {
          try {
            const res = await makeApiRequest({
              url: "api/activities/",
              method: "GET",
              params: { deal_room: id, page_size: 200 },
            });
            const list = res?.results || res?.data || res || [];
            if (isMounted) {
              setActivities(Array.isArray(list) ? list : []);
              setActPage(1);
            }
          } catch (err) {
            console.warn('Activities API failed:', err);
            if (isMounted) setActivities([]);
          }
        } else if (active === "valuations") {
          const res = await makeApiRequest({
            url: "api/v1/deals/valuations/",
            method: "GET",
            params: { deal_room: id },
          });
          if (isMounted) setValuations(res?.results || res?.data || res || []);
    } else if (active === "participants") {
          // Always attempt API first to reflect real DB state
          try {
            const res = await makeApiRequest({
              url: `api/v1/deals/participants/`,
              method: "GET",
              params: { deal_room: id },
            });
            const apiParticipants = res?.results || res?.data || res || [];
            const combinedParticipants = [...apiParticipants, ...locallyAddedParticipants];
            if (isMounted) setParticipants(combinedParticipants);
          } catch (err) {
            console.warn('Participants API failed:', err);
            // Fallback to deal detail embedded participants if available
            const list = dealData?.participants;
            if (Array.isArray(list) && list.length) {
              const combinedParticipants = [...list, ...locallyAddedParticipants];
              if (isMounted) setParticipants(combinedParticipants);
            } else if (id === '28f11f78-f41c-4ded-b98c-d2aa5029bd30') {
              // As last resort, use mock for demo deal
              const mockParticipants = [
                { id: 1, user_name: 'admin@demo.com', user_email: 'admin@demo.com', email: 'admin@demo.com', role: 'buyer', permission_level: 'view' },
                { id: 2, user_name: 'exec@demo.com', user_email: 'exec@demo.com', email: 'exec@demo.com', role: 'advisor', permission_level: 'view' },
                { id: 3, user_name: 'sarahchidinma2001@gmail.com', user_email: 'sarahchidinma2001@gmail.com', email: 'sarahchidinma2001@gmail.com', role: 'observer', permission_level: 'view' }
              ];
              const combinedParticipants = [...mockParticipants, ...locallyAddedParticipants];
              if (isMounted) setParticipants(combinedParticipants);
            } else {
              if (isMounted) setParticipants([...locallyAddedParticipants]);
            }
          }
        }
      } catch (e) {
        if (!isMounted) return;
        console.error('Error loading deal room:', e);
        setDeal(null);
        setError('Failed to load deal room. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id, active]);

  // Debounced user search for participant picker
  useEffect(() => {
    let ignore = false;
    const q = userSearch.trim();
    if (!q) {
      setUserResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setUserSearching(true);
        const res = await makeApiRequest({ url: "api/users/", method: "GET", params: { search: q, ordering: "-date_joined", page_size: 10 } });
        if (!ignore) setUserResults(res?.results || res?.data || res || []);
      } catch (e) {
        if (!ignore) setUserResults([]);
      } finally {
        if (!ignore) setUserSearching(false);
      }
    }, 300);
    return () => { ignore = true; clearTimeout(t); };
  }, [userSearch]);

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
      default:
        return webRoutes.dealRoomDetail.replace(":id", id);
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Breadcrumbs */}
      <div className="">
        <div className="max-w-7xl mx-auto py-4 md:px-0 px-4">
          <div className="flex flex-col md:flex-row md:items-center">
            <Link to={webRoutes.dealRooms} className="flex items-center md:py-6">
              <button
              onClick={() => navigate(webRoutes.dealRooms)}
              className=" bg-white mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div className="flex justify-between items-end md:items-start w-full">
              <div className="flex items-start gap-4">
                <div>
                    <h1 className="text-2xl font-medium md:font-bold text-gray-900">
                      {deal?.title || `Deal Room #${id.slice(0, 8)}...`}
                    </h1>
                    <div className="flex items-center space-x-4 mt-2">
                      <p className="text-gray-600">
                        {deal?.description ? deal.description.slice(0, 100) + (deal.description.length > 100 ? '...' : '') : 'Manage documents, participants, milestones, and more.'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {deal?.company_name || deal?.company?.name || 'Unassigned company'}
                    </p>
                </div>
              {deal?.status && (
                  <div className={`flex items-center mt-4 md:mt-2 md:px-2 md:py-1 justify-center text-xs font-semibold rounded-full  md:w-fit md:h-fit  ${
                    deal.status === 'active' ? ' border border-green-500 md:bg-green-100 md:text-green-800' :
                    deal.status === 'pending' ? ' border border-yellow-500 md:bg-yellow-100 md:text-yellow-800' :
                    deal.status === 'closed' ? ' border border-gray-500 md:bg-gray-100 md:text-gray-800' :
                    deal.status === 'cancelled' ? ' border border-red-500 md:bg-red-100 md:text-red-800' :
                    ' border border-gray-500 md:bg-gray-100 md:text-gray-500'
                  }`}>
                    <div className={`md:hidden block m-[2px] w-3 h-3 rounded-full
                    ${
                    deal.status === 'active' ? ' bg-green-500' :
                    deal.status === 'pending' ? ' bg-yellow-500' :
                    deal.status === 'closed' ? ' bg-gray-500' :
                    deal.status === 'cancelled' ? ' bg-red-500' :
                    ' bg-gray-500'
                  }`
                    }></div>
                    <span className=" hidden md:flex">
                    {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
             {deal?.initiator === user?.id &&  <Link to={webRoutes.dealRoomEdit.replace(":id", id)} className="flex gap-1 text-[16px] items-center px-4 py-2 rounded-lg bg-pale_yellow text-white text-sm hover:bg-gold mb-4">
              <PencilIcon className= "w-4 h-4"/>
              <span className="hidden md:flex">
                Edit Deal Room
              </span>
              </Link>}
            </div>
          </div>
          {/* Enhanced Quick Actions and Stats */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 md:w-[80%] gap-2">
            <Link to={linkFor("documents")} onClick={() => document.querySelector('input[type="file"]')?.click()} className="flex flex-col-reverse md:flex-row bg-white items-center px-3 py-4 md:py-[10px] rounded-md border text-sm hover:border border-[#D9D9D9]">
              Upload Document
              <DocumentIcon className="h-4 w-4 ml-2" />
            </Link>
            <button onClick={() => setShowParticipantModal(true)} className="flex flex-col-reverse md:flex-row bg-white items-center px-3 py-4 md:py-[10px] rounded-md border text-sm hover:border border-[#D9D9D9]">
              Invite Participant
              <UserPlus className="h-4 w-4 ml-2" />
            </button>
            <Link to={linkFor("milestones")} className="flex flex-col-reverse md:flex-row bg-white items-center px-3 py-4 md:py-[10px] rounded-md border text-sm hover:border border-[#D9D9D9]">
              Update Milestones
              <Settings className="h-4 w-4 ml-2" />
            </Link>
            <Link to={linkFor("valuations")} className="flex flex-col-reverse md:flex-row bg-white items-center px-3 py-4 md:py-[10px] rounded-md border text-sm hover:border border-[#D9D9D9]">
              Run Valuation
              <BarChart3 className="h-4 w-4 ml-2" />
            </Link>
          </div>
          <div className="md:flex mt-6 hidden flex-wrap gap-2">
            {tabs.map((t) => (
              <Link
                key={t.key}
                to={linkFor(t.key)}
                className={`px-3 py-2 rounded-[100px] text-sm ${
                  active === t.key ? "bg-gold text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
          <div className="md:hidden ">
            <Scroll>
              <div className="flex gap-4 pt-5 min-w-min">
                {tabs.map((t) => (
                <Link
                  key={t.key}
                  to={linkFor(t.key)}
                  className={`px-3 py-2 rounded-[100px] text-sm ${
                    active === t.key ? "bg-gold text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
              </div>
            </Scroll>
          </div>
        </div>
      </div>
              
      <div className="max-w-7xl mx-auto px-4 md:px-0 md:py-8 ">
        <div className="">
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
            <div className="">
              {(active !== "overview" && active !== "activities" && active !== "valuations" && active !== "milestones") && 
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold mb-4">{active[0].toUpperCase() + active.slice(1)}</h2>
                <RefreshButton refreshActivities={refreshActivities} active={active} loading={loading}/>
              </div>
              }
              {/* Search and Filter Bar */}
              {(active === "documents" || active === "participants"  ) && (
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${active}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                    />
                  </div>
                  {active === "participants" && (
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow"
                    >
                      <option value="all">All Roles</option>
                      {roleOptions.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {active === "overview" && (
                <div className="space-y-6 bg-white px-4 pt-4 pb-12">
                  <h2 className="text-lg font-semibold mb-4">{active[0].toUpperCase() + active.slice(1)}</h2>
                  {/* Enhanced Deal Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border border-[#D9D9D9] rounded-lg p-2">
                      <h4 className="text-[20px] font-medium text-[#212529] mb-2">Deal Information</h4>
                      <div className="space-y-4 text-[12px]">
                        <div className="flex justify-between border-b border-[#D9D9D9]/30 text-[#6C757D] text-right"><span className="font-medium text-[#212529]">Title:</span> {deal?.title || `Deal #${id}`}</div>
                        <div className="flex justify-between border-b border-[#D9D9D9]/30 text-[#6C757D] text-right"><span className="font-medium text-[#212529]">Company:</span> {deal?.company_name || deal?.company?.name || 'Unassigned company'}</div>
                        <div className="flex justify-between border-b border-[#D9D9D9]/30 text-[#6C757D]"><span className="font-medium text-[#212529]">Access Code:</span> 
                          {deal?.access_code || "N/A"}
                        </div>
                         <div className="flex justify-between border-b border-[#D9D9D9]/30 text-[#6C757D]"><span className="font-medium text-[#212529]">Type:</span> 
                          <span className="ml-2 capitalize">
                            {deal?.deal_type ? deal.deal_type.replace(/_/g, ' ') : "Not specified"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-[#D9D9D9]/30 text-[#6C757D]"><span className="font-medium text-[#212529]">Status:</span> 
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            deal?.status === 'active' ? 'bg-green-100 text-green-800' :
                            deal?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            deal?.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                            deal?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {deal?.status ? deal.status.charAt(0).toUpperCase() + deal.status.slice(1) : "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-[#D9D9D9] rounded-lg p-2">
                      <h4 className="text-[20px] font-medium text-[#212529] mb-2">Financial Details</h4>
                      <div className="space-y-4 text-[12px]">
                        <div className="flex justify-between border-b border-[#D9D9D9]/30 text-[#6C757D]"><span className="font-medium text-[#212529]">Estimated Value:</span>
                        <span>
                          {deal?.estimated_value ? 
                            new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: deal?.currency || 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(parseFloat(deal.estimated_value)) :
                            "Not specified"
                          }
                        </span>
                        </div>
                        <div className="flex justify-between border-b border-[#D9D9D9]/30 text-[#6C757D]"><span className="font-medium text-[#212529]">Currency:</span> {deal?.currency || "USD"}</div>
                        <div className="flex justify-between border-b border-[#D9D9D9]/30 text-[#6C757D]"><span className="font-medium text-[#212529]">Target Close:</span> 
                          {deal?.target_close_date ? 
                            new Date(deal.target_close_date).toLocaleDateString() : 
                            "Not set"
                          }
                        </div>
                      </div>
                    </div>

                    <div className="border border-[#D9D9D9] rounded-lg p-2">
                      <h4 className="text-[20px] font-medium text-[#212529] mb-2">Activity Summary</h4>
                      <div className="space-y-4 text-[12px]">
                        <div className="flex justify-between border-b border-[#D9D9D9]/30">
                          <span className="font-medium">Participants:</span>
                          <span className="text-[#6C757D] font-semibold">{deal?.participants_count ?? 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#D9D9D9]/30">
                          <span className="font-medium">Documents:</span>
                          <span className="text-[#6C757D] font-semibold">{deal?.documents_count ?? 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#D9D9D9]/30">
                          <span className="font-medium">Milestones:</span>
                          <span className="text-[#6C757D] font-semibold">{deal?.milestones_count ?? 0}</span>
                        </div>
                        <div className=" flex justify-between border-b border-[#D9D9D9]/30"><span className="font-medium">Created:</span> 
                          {deal?.created_at ? 
                            new Date(deal.created_at).toLocaleDateString() : 
                            "Unknown"
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 md:gap-0 md:flex-row flex-col justify-between">

                  {/* Deal Description */}
                  {deal?.description && (
                    <div className="border border-[#D9D9D9] rounded-lg p-4 md:w-[48%]">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Description</h4>
                      <p className="border-b border-[#D9D9D9]/30 text-gray-700">{deal.description}</p>
                    </div>
                  )}

                  {/* Security & Confidentiality */}
                  <div className="border border-[#D9D9D9] rounded-lg p-4 md:w-[48%]">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Security & Access</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        deal?.is_confidential ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {deal?.is_confidential ? 'Confidential' : 'Public'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        deal?.requires_nda ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {deal?.requires_nda ? 'NDA Required' : 'No NDA Required'}
                      </span>
                    </div>
                  </div>
                          </div>

                  {/* Recent Activities */}
                  {deal?.recent_activities && deal.recent_activities.length > 0 && (
                    <div className="border border-[#D9D9D9] rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Recent Activity</h4>
                      <div className="space-y-2">
                        {deal.recent_activities.slice(0, 3).map((activity, index) => (
                          <div key={activity.id || index} className="flex items-start space-x-3 text-sm">
                            <div className="flex-shrink-0 w-2 h-2 bg-custom_yellow rounded-full mt-2"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900">{activity.description}</p>
                              <p className="text-gray-500 text-xs">
                                {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : "Recent"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {deal.recent_activities.length > 3 && (
                        <button 
                          onClick={() => navigate(linkFor("activities"))}
                          className="text-pale_yellow text-xs hover:text-blue-800 mt-2"
                        >
                          View all activities ({activities.length > 0 ? activities.length : deal.recent_activities.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              {active === "documents" && (
                <div className="space-y-4">
                  {documents.length === 0 ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newDocFile) {
                        notify.error("Please select a file to upload");
                        return;
                      }
                      try {
                        setDocUploading(true);
                        
                        // First, ALWAYS try the real API call to save to database
                        let apiSuccess = false;
                        let apiDocument = null;
                        
                        const fd = new FormData();
                        fd.append("title", newDocName || newDocFile.name);
                        fd.append("document_type", newDocType);
                        fd.append("file", newDocFile);
                        fd.append("deal_room", id);
                        
                        try {
                          console.log('Attempting to upload document to database...');
                          const uploadResult = await dealDocumentService.uploadDocument(fd);
                          apiDocument = uploadResult?.data || uploadResult;
                          apiSuccess = true;
                          console.log('✅ Successfully uploaded document to database:', apiDocument);
                          notify.success("Document uploaded and saved to database");
                          
                          // IMMEDIATE UI UPDATE - show document right away
                          if (apiDocument && apiDocument.id) {
                            console.log('📄 Adding document to UI immediately (first form):', apiDocument);
                            setDocuments(prev => {
                              const list = Array.isArray(prev) ? prev : [];
                              if (list.some(d => d?.id === apiDocument.id)) return list;
                              return [apiDocument, ...list];
                            });
                          }

                          // Refresh document list from database
                          try {
                            const docs = await makeApiRequest({
                              url: "api/v1/deals/documents/",
                              method: "GET",
                              params: { deal_room: id },
                            });
                            setDocuments(docs?.results || docs?.data || docs || []);
                          } catch (refreshError) {
                            console.warn('Failed to refresh document list:', refreshError);
                          }
                        } catch (apiError) {
                          console.log('❌ Database upload failed:', apiError);
                          notify.error((apiError?.status === 401 ? 'Authentication required. Please log in.' : 'Upload failed') + (apiError?.message ? `: ${apiError.message}` : ''));
                          return; // Do not create temporary documents anymore
                        }
                        
                        // Reset form regardless of success/failure
                        setNewDocFile(null);
                        setNewDocName("");
                        setNewDocType("other");
                        
                      } catch (error) {
                        console.error('Upload error:', error);
                        notify.error("Upload failed: " + (error.message || "Unknown error"));
                      } finally {
                        setDocUploading(false);
                      }
                    }}
                    className="flex flex-col gap-2 p-4 border rounded-lg bg-white"
                  >
                    <div className="text-[32px] font-medium text-gray-800">Upload Document</div>
                    <div className="flex w-full justify-between">
                      <div className="flex flex-col w-[75%]">
                    <label htmlFor="document-title" className="font-medium">Document Title</label>
                    <input
                      id="document-title"
                      type="text"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="Please enter the name of your document"
                      className="border px-3 py-2 w-full rounded-lg"
                    />
                      </div>
                      <div className="flex flex-col w-[22%]">
                      <label htmlFor="document-type" className="font-medium">Type</label>
                    <select
                      id="document-type"
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                      className="border px-3 py-2 w-full rounded-lg"
                      title="Document type"
                    >
                      <option value="financial">Financial Statement</option>
                      <option value="legal">Legal Document</option>
                      <option value="technical">Technical Report</option>
                      <option value="due_diligence">Due Diligence</option>
                      <option value="contract">Contract</option>
                      <option value="presentation">Presentation</option>
                      <option value="other">Other</option>
                    </select>
                    </div>
                    </div>
                    <div>
                    <label htmlFor="" className="font-medium">Upload Document</label>
                      <div
              className={`border-2 border-dashed rounded-lg text-center transition-colors mb-8
                ${
                dragActive 
                  ? 'border-custom_yellow bg-blue-50' 
                  : 'border-blue-400 bg-white'
              }`
              }
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Check file size (max 10MB)
                            if (file.size > 10 * 1024 * 1024) {
                              notify.error("File size must be less than 10MB");
                              e.target.value = '';
                              return;
                            }
                            setNewDocFile(file);
                            // Auto-set document name if not provided
                            if (!newDocName) {
                              setNewDocName(file.name.replace(/\.[^/.]+$/, ""));
                            }
                          } else {
                            setNewDocFile(null);
                          }
                        }}
                className="hidden"
              />

              {!newDocFile ? (
                <div className="flex items-center justify-center p-3 gap-2">
                  <CloudUpload className="w-6 h-6 text-gray-400" />
                  <button
                    onClick={handleButtonClick}
                    className="hover:text-gold font-medium text-gray-400"
                  >
                    Choose or upload from local storage
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <File className="w-8 h-8 text-pale_yellow" />
                  <span className="text-gray-700 font-medium">{newDocFile.name}</span>
                  <span className="text-gray-500 text-sm">
                    ({(newDocFile.size / 1024).toFixed(2)} KB)
                  </span>
                  <button
                    onClick={handleRemoveFile}
                    className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
                      </div>
                    </div>
                    {newDocFile && (
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{newDocFile.name}</span>
                        <span>({(newDocFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    )}
                    <button disabled={docUploading} className="self-start bg-gold text-white px-4 py-2 rounded hover:bg-gold/80 disabled:opacity-60">
                      {docUploading ? "Uploading..." : "Upload"}
                    </button>
                  </form>
                    // <EmptyDocuments onUpload={() => document.querySelector('input[type="file"]')?.click()} />
                  ) : (
                    
                      uploadSomeDocument ?
                    <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newDocFile) {
                        notify.error("Please select a file to upload");
                        return;
                      }
                      try {
                        setDocUploading(true);
                        
                        // First, ALWAYS try the real API call to save to database
                        let apiSuccess = false;
                        let apiDocument = null;
                        
                        const fd = new FormData();
                        fd.append("title", newDocName || newDocFile.name);
                        fd.append("document_type", newDocType);
                        fd.append("file", newDocFile);
                        fd.append("deal_room", id);
                        
                        try {
                          console.log('Attempting to upload document to database...');
                          const uploadResult = await dealDocumentService.uploadDocument(fd);
                          apiDocument = uploadResult?.data || uploadResult;
                          apiSuccess = true;
                          console.log('✅ Successfully uploaded document to database:', apiDocument);
                          notify.success("Document uploaded and saved to database");
                          // IMMEDIATE UI UPDATE - show document right away
                          if (apiDocument && apiDocument.id) {
                            console.log('📄 Adding document to UI immediately (second form):', apiDocument);
                            setDocuments(prev => {
                              const list = Array.isArray(prev) ? prev : [];
                              if (list.some(d => d?.id === apiDocument.id)) return list;
                              return [apiDocument, ...list];
                            });
                          }

                          // Refresh document list from database
                          try {
                            const docs = await makeApiRequest({
                              url: "api/v1/deals/documents/",
                              method: "GET",
                              params: { deal_room: id },
                            });
                            setDocuments(docs?.results || docs?.data || docs || []);
                          } catch (refreshError) {
                            console.warn('Failed to refresh document list:', refreshError);
                          }
                        } catch (apiError) {
                          console.log('❌ Database upload failed:', apiError);
                          notify.error((apiError?.status === 401 ? 'Authentication required. Please log in.' : 'Upload failed') + (apiError?.message ? `: ${apiError.message}` : ''));
                          return; // Do not create temporary documents anymore
                        }
                        
                        // Reset form and close upload panel after successful upload
                        setNewDocFile(null);
                        setNewDocName("");
                        setNewDocType("other");
                        setUploadSomeDocument(false); // Close the upload form to show document list
                        
                      } catch (error) {
                        console.error('Upload error:', error);
                        notify.error("Upload failed: " + (error.message || "Unknown error"));
                      } finally {
                        setDocUploading(false);
                      }
                    }}
                    className="flex flex-col gap-2 p-4 border rounded-lg bg-white"
                  >
                    <div className="text-[32px] font-medium text-gray-800">Upload Document</div>
                    <div className="flex w-full justify-between">
                      <div className="flex flex-col w-[75%]">
                    <label htmlFor="document-title" className="font-medium">Document Title</label>
                    <input
                      id="document-title"
                      type="text"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="Please enter the name of your document"
                      className="border px-3 py-2 w-full rounded-lg"
                    />
                      </div>
                      <div className="flex flex-col w-[22%]">
                      <label htmlFor="document-type" className="font-medium">Type</label>
                    <select
                      id="document-type"
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                      className="border px-3 py-2 w-full rounded-lg"
                      title="Document type"
                    >
                      <option value="financial">Financial Statement</option>
                      <option value="legal">Legal Document</option>
                      <option value="technical">Technical Report</option>
                      <option value="due_diligence">Due Diligence</option>
                      <option value="contract">Contract</option>
                      <option value="presentation">Presentation</option>
                      <option value="other">Other</option>
                    </select>
                    </div>
                    </div>
                    <div>
                    <label htmlFor="" className="font-medium">Upload Document</label>
                      <div
              className={`border-2 border-dashed rounded-lg text-center transition-colors mb-8
                ${
                dragActive 
                  ? 'border-custom_yellow bg-blue-50' 
                  : 'border-blue-400 bg-white'
              }`
              }
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Check file size (max 10MB)
                            if (file.size > 10 * 1024 * 1024) {
                              notify.error("File size must be less than 10MB");
                              e.target.value = '';
                              return;
                            }
                            setNewDocFile(file);
                            // Auto-set document name if not provided
                            if (!newDocName) {
                              setNewDocName(file.name.replace(/\.[^/.]+$/, ""));
                            }
                          } else {
                            setNewDocFile(null);
                          }
                        }}
                className="hidden"
                accept=".pdf"
              />

              {!newDocFile ? (
                <div className="flex items-center justify-center p-3 gap-2">
                  <CloudUpload className="w-6 h-6 text-gray-400" />
                  <button
                    onClick={handleButtonClick}
                    className="hover:text-gold font-medium text-gray-400"
                  >
                    Choose or upload from local storage
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <File className="w-8 h-8 text-pale_yellow" />
                  <span className="text-gray-700 font-medium">{newDocFile.name}</span>
                  <span className="text-gray-500 text-sm">
                    ({(newDocFile.size / 1024).toFixed(2)} KB)
                  </span>
                  <button
                    onClick={handleRemoveFile}
                    className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
                      </div>
                    </div>
                    {newDocFile && (
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{newDocFile.name}</span>
                        <span>({(newDocFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    )}
                    <div className="flex justify-between">

                    <button disabled={docUploading} className="self-start bg-gold text-white px-4 py-2 rounded hover:bg-gold/80 disabled:opacity-60">
                      {docUploading ? "Uploading..." : "Upload"}
                    </button>
                    <button disabled={docUploading} onClick={()=> setUploadSomeDocument(false)} className="self-start bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 disabled:opacity-60">
                      Cancel
                    </button>
                    </div>
                  </form>
                  :

                    <div className="space-y-2">
                      <div className="flex justify-between md:justify-start items-center gap-4">
                      <h1 className="text-xl md:text-3xl font-medium">All Documents</h1>
                    <span onClick={handleButtonClick} className="bg-pale_yellow flex px-3 py-2 rounded-lg cursor-pointer hover:animate-bounce">
                      <UploadCloud className="mr-2"/>
                      <p className="hidden md:flex">Upload New Document</p>
                    </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents
                        .filter(d => !searchTerm || (d.name || d.title || "").toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((d, i) => {
                          const label = d.name || d.title || `Document ${i + 1}`;
                          const filePath = d.file || d.file_url || d.url;
                          let href = null;
                          if (filePath) {
                            if (String(filePath).startsWith("http")) {
                              href = filePath;
                            } else {
                              href = `${baseURL}/${String(filePath).replace(/^\//, "")}`;
                            }
                          }
                          
                          const handleDocumentOpen = () => {
                            if (href) {
                              window.open(href, '_blank');
                            }
                          };
                          
                          return (
                            <div key={d.id || i} className="flex items-center justify-between p-3 border rounded-lg hover:border border-[#D9D9D9]">
                              <div className="flex w-full items-center space-x-3">
                                <div className="flex flex-col  w-full">
                                  <div className="font-medium text-gray-900" title={label}>{label}</div>
                                      <div className="flex flex-row-reverse md:mb-3 justify-between md:hidden  gap-6 items-center space-x-2">
                                          <span className={`px-2 py-1 text-xs rounded-full ${
                                            d.access_granted !== false ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {d.access_granted !== false ? 'Accessible' : 'Restricted'}
                                          </span>
                                          <div className="text-sm text-gray-500">
                                              {d.uploaded_at &&<span className="flex items-center">
                                                <CalendarDays className="h-4 w-4"/>
                                                <span className="ml-1">{new Date(d.uploaded_at).toLocaleDateString()}</span>
                                              </span> }
                                              {d._isTemporary && ' • Temporary (not saved to database)'}
                                            </div>
                                      </div>
                                      <div className="flex w-full mt-1">
                                          {href ? (
                                          <button 
                                            onClick={handleDocumentOpen}
                                            className="w-fit  inline-flex mr-1 justify-center items-center px-3 py-1.5 rounded border text-sm bg-gold hover:bg-gold/30"
                                          >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Open
                                          </button>
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
                                                notify.success("Download started");
                                              } catch (e) {
                                                notify.error("Download failed: " + (e.response?.status === 401 ? "Authentication required" : "Unknown error"));
                                              }
                                            }}
                                            className="inline-flex w-fit items-center px-3 py-1.5 rounded border text-sm hover:bg-gray-100"
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
                                              notify.success("Access requested");
                                            }}
                                            className="inline-flex w-fitpx-3 py-1.5 px-3 rounded border text-sm bg-pale_yellow hover:bg-custom_yellow"
                                          >
                                            <LockOpen className="h-4 w-4 mr-1" />
                                            Request Access
                                          </button>
                                        )}
                                      </div>
                                </div>
                              </div>  
                              <div className="hidden md:flex flex-col gap-6 items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  d.access_granted !== false ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {d.access_granted !== false ? 'Accessible' : 'Restricted'}
                                </span>
                                 <div className="text-sm text-gray-500">
                  {/* {d.file_size && `${(d.file_size / 1024 / 1024).toFixed(2)}MB`} •  */}
                                    {d.uploaded_at &&<span className="flex items-center">
                                      <CalendarDays className="h-4 w-4"/>
                                      <span className="ml-1">{new Date(d.uploaded_at).toLocaleDateString()}</span>
                                    </span> }
                                    {d._isTemporary && ' • Temporary (not saved to database)'}
                                  </div>
                                {/* Delete button - only visible for users with edit privileges */}
                                {canEdit && !d._isTemporary && d.id && (
                                  <button
                                    onClick={async () => {
                                      if (!window.confirm(`Are you sure you want to delete "${label}"? This action cannot be undone.`)) return;
                                      try {
                                        await dealDocumentService.delete(d.id);
                                        // Refresh document list
                                        const docs = await makeApiRequest({
                                          url: "api/v1/deals/documents/",
                                          method: "GET",
                                          params: { deal_room: id },
                                        });
                                        setDocuments(docs?.results || docs?.data || docs || []);
                                        notify.success("Document deleted");
                                      } catch (e) {
                                        notify.error("Failed to delete document: " + (e.message || "Unknown error"));
                                      }
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 rounded border text-sm text-red-600 border-red-200 hover:bg-red-50"
                                    title="Delete document"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
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
                            (p.user_name || p.name || p.username || p.user_email || p.email || "").toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesRole = filterRole === "all" || p.role === filterRole;
                          return matchesSearch && matchesRole;
                        })
                        .map((p, i) => (
                          <div key={p.id || i} className="flex items-center justify-between p-3 border rounded-lg hover:border border-[#D9D9D9]">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-pale_yellow">
                                  {(p.user_name || p.name || p.username || p.user_email || p.email || "U")[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {p.user_name || p.name || p.username || p.user_email || p.email || `Participant ${i + 1}`}
                                </div>
                                <div className="text-sm text-gray-500">{p.user_email || p.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {p.permission_level && (
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  p.permission_level === 'admin' ? 'bg-red-100 text-red-800' :
                                  p.permission_level === 'edit' ? 'bg-blue-100 text-blue-800' :
                                  p.permission_level === 'comment' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {p.permission_level}
                                </span>
                              )}
                              {p.role && (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
                                  {p.role}
                                </span>
                              )}
                              {p._isTemporary && (
                                <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                                  Temporary
                                </span>
                              )}
                              {p.id && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Remove this participant?')) {
                                      await dealRoomService.removeParticipant(id, p.id);
                                      setParticipants((prev) => prev.filter((x) => (x.id || x) !== p.id));
                                      await dealRoomAPI.createActivities(id, { activity_type: 'participant_removed', description: `Participant removed`, actor: user.id, target_user: p.id });
                                      notify.success("Participant removed");
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
                  
                  {/* <button
                    onClick={() => setShowParticipantModal(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
                  >
                    <UserPlus className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <span className="text-gray-600">Invite New Participant</span>
                  </button> */}
                </div>
              )}
              {active === "milestones" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                  <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
                            <div className="flex gap-4">
                            <button
                              onClick={() => refreshActivities({active})}
                              disabled={loading}
                              className="flex items-center px-3 py-2 bg-pale_yellow rounded-lg hover:bg-gold disabled:opacity-50 text-sm"
                            >
                              <RefreshCcw className="w-4 h-4 mr-1" />
                              {loading ? 'Loading...' : 'Refresh'}
                            </button>
                            <button
                              onClick={() => setShowCreateMilestoneModal(true)}
                              className="flex items-center px-3 py-2 bg-pale_yellow rounded-lg hover:bg-gold disabled:opacity-50 text-sm"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              <span className="hidden md:block">{'Add Milestone'}</span>
                            </button>

                            </div>
                          </div>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${active}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom_yellow focus:border-transparent"
                    />
                  </div>
                  </div>
                  {milestones.length === 0 ? (
                    <EmptyMilestones onCreate={() => setShowCreateMilestoneModal(true)} />
                  ) : (
                    milestones.map((m, i) => (
                      <div key={m?.id || i} className="border rounded-lg p-4 hover:border border-[#D9D9D9]">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{m?.title || m?.name || `Milestone ${i + 1}`}</div>
                            {m?.notes && (
                              <div className="mt-2 p-2 bg-gray-100 border border-gray-200 rounded text-sm">
                                <span className="font-medium text-gray-700">Notes: </span>
                                <span className="text-gray-600">{m.notes}</span>
                              </div>
                            )}
                            {/* Attachments Section */}
                            {m?.attachments && m.attachments.length > 0 && (
                              <div className="mt-2">
                                <div className="text-sm font-medium text-gray-700 mb-1">Attachments:</div>
                                <div className="flex flex-wrap gap-2">
                                  {m.attachments.map((att) => (
                                    <a
                                      key={att.id}
                                      href={att.file_url || att.file}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100"
                                    >
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                      </svg>
                                      {att.filename}
                                      <span className="ml-1 text-gray-500">({att.file_size_display})</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            {typeof m?.progress !== 'undefined' && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>{m?.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-pale_yellow h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${m.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2 ml-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setEditingMilestone(m);
                                  setMilestoneForm({ progress: Number(m.progress ?? 0), notes: m.notes || "" });
                                  setShowMilestoneModal(true);
                                }}
                                className="px-3 py-1.5 rounded border text-sm hover:bg-gray-100"
                              >
                                Update
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Mark this milestone as complete?')) {
                                    try {
                                      await dealMilestoneService.markComplete(m.id, "Completed");
                                    } catch (err) {
                                      notify.error(err.message || 'Failed to complete milestone');
                                      return;
                                    }
                                    const refreshed = await dealMilestoneService.getByDealRoom(id);
                                    setMilestones(refreshed?.results || refreshed?.data || refreshed || []);
                                    notify.success("Milestone completed");
                                  }
                                }}
                                className="px-3 py-1.5 rounded bg-green-600 text-white text-sm hover:bg-green-700"
                              >
                                Complete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {active === "activities" && (
                <ActivityTimeline 
                  activities={activities}
                  onRefresh={async () => {
                    setLoading(true);
                    try {
                      const res = await makeApiRequest({
                        url: "api/v1/deals/activities/",
                        method: "GET",
                        params: { deal_room: id, page_size: 200 },
                      });
                      const list = res?.results || res?.data || res || [];
                      setActivities(Array.isArray(list) ? list : []);
                      notify.success('Activities refreshed');
                    } catch (error) {
                      console.error('Error refreshing activities:', error);
                      notify.error('Failed to refresh activities');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  loading={loading}
                />
              )}
              {active === "valuations" && (
                <ValuationsPanel dealRoomId={id} />
              )}
            </div>
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
            try {
              if (Number(milestoneForm.progress) >= 100) {
                await dealMilestoneService.markComplete(editingMilestone.id, milestoneForm.notes || 'Completed');
              } else {
                await dealMilestoneService.updateProgress(editingMilestone.id, { progress: Number(milestoneForm.progress), note: milestoneForm.notes });
              }
              const refreshed = await dealMilestoneService.getByDealRoom(id);
              setMilestones(refreshed?.results || refreshed?.data || refreshed || []);
              setShowMilestoneModal(false);
              notify.success(Number(milestoneForm.progress) >= 100 ? "Milestone marked as complete" : "Milestone progress updated");
            } catch (err) {
              notify.error(err?.message || 'Failed to update milestone');
            }
          }}
          className="space-y-4"
        >
          {/* Milestone Title Display */}
          <div className="pb-2 border-b">
            <h3 className="font-medium text-gray-900">{editingMilestone?.title}</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Progress: {milestoneForm.progress}%</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={milestoneForm.progress}
              onChange={(e) => setMilestoneForm(prev => ({ ...prev, progress: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={milestoneForm.notes}
              onChange={(e) => setMilestoneForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add notes about progress or completion..."
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-custom_yellow"
              rows={3}
            />
          </div>
          
          {/* Attachments Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
            
            {/* Existing Attachments */}
            {editingMilestone?.attachments && editingMilestone.attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {editingMilestone.attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <a
                      href={att.file_url || att.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-600 hover:underline"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {att.filename}
                      <span className="ml-2 text-gray-500 text-xs">({att.file_size_display})</span>
                    </a>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('Delete this attachment?')) {
                          try {
                            await dealMilestoneService.deleteAttachment(att.id);
                            const refreshed = await dealMilestoneService.getByDealRoom(id);
                            const updatedMilestones = refreshed?.results || refreshed?.data || refreshed || [];
                            setMilestones(updatedMilestones);
                            // Update editingMilestone with refreshed data
                            const updated = updatedMilestones.find(m => m.id === editingMilestone.id);
                            if (updated) setEditingMilestone(updated);
                            notify.success('Attachment deleted');
                          } catch (err) {
                            notify.error('Failed to delete attachment');
                          }
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload New Attachment */}
            <label className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm text-gray-600">Click to attach a file</span>
              <input
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    await dealMilestoneService.uploadAttachment(editingMilestone.id, file);
                    const refreshed = await dealMilestoneService.getByDealRoom(id);
                    const updatedMilestones = refreshed?.results || refreshed?.data || refreshed || [];
                    setMilestones(updatedMilestones);
                    // Update editingMilestone with refreshed data
                    const updated = updatedMilestones.find(m => m.id === editingMilestone.id);
                    if (updated) setEditingMilestone(updated);
                    notify.success('File attached successfully');
                  } catch (err) {
                    notify.error(err?.message || 'Failed to attach file');
                  }
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowMilestoneModal(false)}
              className="px-4 py-2 border rounded text-gray-700 hover:border border-[#D9D9D9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pale_yellow text-white rounded hover:bg-gold"
            >
              {Number(milestoneForm.progress) >= 100 ? 'Mark Complete' : 'Save Progress'}
            </button>
          </div>
        </form>
      </Modal>
      {/* Milestone Create Modal */}
      <Modal
        isOpen={showCreateMilestoneModal}
        onClose={() => setShowCreateMilestoneModal(false)}
        title="Create Milestone"
        size="lg"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            
            // Validate form before submission
            const validation = validateMilestoneForm(createMilestoneForm);
            if (!validation.isValid) {
              const missingFieldsList = validation.missingFields.join(", ");
              notify.error(`Please fill in the following field(s): ${missingFieldsList}`);
              if (validation.missingFields.includes("Assigned To")) {
                // If assigned_to is missing, highlight the assigned_to field
                document.getElementById("assigned-to").classList.add("border-red-500");
                notify.error("Please select an assignee that is registered on Connectize");
              }
              return;
            }

            try {
              const newMilestone = await dealMilestoneService.create({ ...createMilestoneForm, created_by: user.id, deal_room: id });
              if (newMilestone) {
                setMilestones(prev => [...prev, newMilestone]);
                setShowCreateMilestoneModal(false);
                notify.success("Milestone created successfully");
              }
            } catch (err) {
              notify.error(`${Object.keys(err)[0]}: ${Object.values(err)[0]}` || 'Failed to create milestone');
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-3 gap-4">
              {/* Title */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title:</label>
                <input
                  type="text"
                  value={createMilestoneForm.title}
                  onChange={(e) => setCreateMilestoneForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-custom_yellow"
                />
              </div>
              {/* Status */}
              <div className="col-span-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
                <select value={createMilestoneForm.status} onChange={(e) => setCreateMilestoneForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-custom_yellow"
                  >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description:</label>
                <textarea
                  value={createMilestoneForm.description}
                  onChange={(e) => setCreateMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-custom_yellow"
                  rows={3}
                />
              </div>  
              {/* Completion Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Completion Notes (optional)</label>
                <textarea
                  value={milestoneForm.notes}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about completion..."
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-custom_yellow"
                  rows={3}
                />
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
          {/* Assigned to */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned to
            </label>
            <div className="relative">
              <input
                type="text"
                id="assigned-to"
                value={participantForm.userDisplay || userSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setParticipantForm(prev => ({ ...prev, userDisplay: v, userId: prev.userId && v === prev.userDisplay ? prev.userId : "" }));
                  setUserSearch(v);
                }}
                placeholder="Type a name or email..."
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-custom_yellow"
                autoComplete="off"
              />
              {userSearch && (userResults?.length > 0 || userSearching) && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
                  {userSearching && (
                    <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                  )}
                  {userResults.map((u) => (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => {
                        const label = u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
                        setParticipantForm(prev => ({ ...prev, userId: u.id, userDisplay: label }));
                        setUserSearch(label);
                        setUserResults([]);
                        setCreateMilestoneForm(prev => ({ ...prev, assigned_to: u.id }));
                      }}
                      className="w-full text-left px-3 py-2 hover:border border-[#D9D9D9]"
                    >
                      <div className="text-sm text-gray-900">{u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </button>
                  ))}
                </div>
              )}
              {!userSearching && userResults.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
              )}
            </div>
          </div>
              {/* Due date */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={createMilestoneForm.due_date}
                    onChange={(e) => setCreateMilestoneForm(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
                {/* Progress */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Progress: {createMilestoneForm.progress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={createMilestoneForm.progress}
                  onChange={(e) => setCreateMilestoneForm(prev => ({ ...prev, progress: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <input
                  type="number"
                  value={createMilestoneForm.priority}
                  onChange={(e) => setCreateMilestoneForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCreateMilestoneModal(false)}
              className="px-4 py-2 border rounded text-gray-700 hover:border border-[#D9D9D9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pale_yellow text-gray-900 rounded hover:bg-gold"
            >
              Create Milestone
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
            if (!participantForm.userId) {
              notify.error("Please select a user to invite");
              return;
            }
            
            try {
              const payload = { user: participantForm.userId, role: participantForm.role, permission_level: participantForm.permission_level,  deal_room: id };
              
              // First, ALWAYS try the real API call to save to database
              let apiSuccess = false;
              let apiParticipant = null;
              
              try {
                console.log('Attempting to save participant to database...', payload);
                const created = await dealRoomService.addParticipant(id, payload);
                apiParticipant = created?.data || created;
                if (apiParticipant && (apiParticipant.id || apiParticipant.user || apiParticipant.user_email)) {
                  apiSuccess = true;
                  console.log('✅ Successfully saved participant to database:', apiParticipant);
                  await dealRoomAPI.createActivities(id, { activity_type: 'participant_added', description: `New participant added to the deal`, actor: user.id, target_user: participantForm.userId });
                  notify.success("Participant invited and saved to database");
                } else {
                  throw new Error('Unexpected response when adding participant');
                }
              } catch (apiError) {
                console.log('❌ Database save failed:', apiError);
                console.log('Falling back to temporary storage...');
                apiSuccess = false;
              }
              
              // If API call fails, fall back to temporary storage
              if (!apiSuccess) {
                // Create mock participant for temporary display
                const mockParticipant = {
                  id: Date.now(), // Use timestamp to avoid ID conflicts
                  user: {
                    id: participantForm.userId,
                    email: participantForm.userDisplay,
                    first_name: participantForm.userDisplay.split('@')[0] || 'User',
                    last_name: ''
                  },
                  user_name: participantForm.userDisplay,
                  user_email: participantForm.userDisplay,
                  email: participantForm.userDisplay,
                  role: participantForm.role,
                  permission_level: participantForm.permission_level,
                  joined_at: new Date().toISOString(),
                  is_active: true,
                  _isTemporary: true // Flag to indicate this is temporary
                };
                
                // Add to locally added participants for persistence across tab switches
                setLocallyAddedParticipants(prev => [...prev, mockParticipant]);
                setParticipants((prev) => [...prev, mockParticipant]);
                notify.warning("Participant added temporarily (requires login to save to database)");
              } else {
                // Successfully saved to database: refresh from server to ensure counts/roles
                try {
                  const res = await makeApiRequest({
                    url: `api/v1/deals/participants/`,
                    method: "GET",
                    params: { deal_room: id },
                  });
                  const apiParticipants = res?.results || res?.data || res || [];
                  setParticipants(apiParticipants);
                } catch (refreshErr) {
                  // Fallback to appending if refresh fails
                  setParticipants((prev) => [...prev, apiParticipant]);
                }
              }
              
              // Reset form
              setParticipantForm({ userId: "", userDisplay: "", role: "observer", permission_level: "view" });
              setUserSearch("");
              setUserResults([]);
              setShowParticipantModal(false);
              
            } catch (error) {
              console.error('Participant invitation error:', error);
              notify.error((error?.status === 401 ? "Authentication required. Please log in." : "Failed to invite participant: ") + (error.message || "Unknown error"));
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search user by name or email
            </label>
            <div className="relative">
              <input
                type="text"
                value={participantForm.userDisplay || userSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setParticipantForm(prev => ({ ...prev, userDisplay: v, userId: prev.userId && v === prev.userDisplay ? prev.userId : "" }));
                  setUserSearch(v);
                }}
                placeholder="Type a name or email..."
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-custom_yellow"
                autoComplete="off"
              />
              {userSearch && (userResults?.length > 0 || userSearching) && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
                  {userSearching && (
                    <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                  )}
                  {userResults.map((u) => (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => {
                        const label = u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
                        setParticipantForm(prev => ({ ...prev, userId: u.id, userDisplay: label }));
                        setUserSearch(label);
                        setUserResults([]);
                      }}
                      className="w-full text-left px-3 py-2 hover:border border-[#D9D9D9]"
                    >
                      <div className="text-sm text-gray-900">{u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </button>
                  ))}
                  {!userSearching && userResults.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role in deal
            </label>
            <select
              value={participantForm.role}
              onChange={(e) => setParticipantForm(prev => ({ ...prev, role: e.target.value }))}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-custom_yellow capitalize"
            >
              {roleOptions.map(r => (
                <option key={r.value} value={r.value} className="capitalize">{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permission level
            </label>
            <select
              value={participantForm.permission_level}
              onChange={(e) => setParticipantForm(prev => ({ ...prev, permission_level: e.target.value }))}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-custom_yellow"
            >
              {permissionOptions.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowParticipantModal(false)}
              className="px-4 py-2 border rounded text-gray-700 hover:border border-[#D9D9D9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pale_yellow rounded hover:bg-gold"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
