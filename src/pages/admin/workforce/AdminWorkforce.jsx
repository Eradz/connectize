import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BriefcaseIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import workforce from '../../../api-services/workforce';
import { webRoutes } from '../../../lib/webRoutes';

const AdminWorkforce = () => {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'profiles', 'applications'
  const [jobs, setJobs] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);

  // Fetch admin-managed lookup data
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [jtRes, elRes] = await Promise.all([
          workforce.getJobTypes(),
          workforce.getExperienceLevels()
        ]);
        const jt = Array.isArray(jtRes) ? jtRes : jtRes?.results || [];
        const el = Array.isArray(elRes) ? elRes : elRes?.results || [];
        setJobTypes(jt.map(t => ({ value: t.name, label: t.display_name })));
        setExperienceLevels(el.map(l => ({ value: l.name, label: l.display_name })));
      } catch (err) {
        console.error('Failed to fetch lookup data:', err);
        setJobTypes([
          { value: 'full_time', label: 'Full-time' },
          { value: 'part_time', label: 'Part-time' },
          { value: 'contract', label: 'Contract' },
          { value: 'temporary', label: 'Temporary' },
          { value: 'internship', label: 'Internship' },
          { value: 'consulting', label: 'Consulting' }
        ]);
        setExperienceLevels([
          { value: 'entry', label: 'Entry Level' },
          { value: 'mid', label: 'Mid Level' },
          { value: 'senior', label: 'Senior Level' },
          { value: 'executive', label: 'Executive' }
        ]);
      }
    };
    fetchLookups();
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Separate state for tab counts
  const [tabCounts, setTabCounts] = useState({
    jobs: 0,
    profiles: 0,
    applications: 0
  });
  const [countsLoading, setCountsLoading] = useState(true);

  // Modal and form states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'delete', 'view'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Pagination state
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadTabCounts(); // Load all counts on mount
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when changing tabs, search, or filter
  }, [activeTab, searchTerm, statusFilter]);

  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, statusFilter, searchTerm]);

  // Load counts for all tabs
  const loadTabCounts = async () => {
    try {
      setCountsLoading(true);
      // Load counts in parallel
      const [jobsResponse, profilesResponse, applicationsResponse] = await Promise.all([
        workforce.getJobs({ page_size: 1 }).catch(() => ({ count: 0 })),
        workforce.getWorkforceProfiles({ page_size: 1 }).catch(() => ({ count: 0 })),
        workforce.getJobApplications({ page_size: 1 }).catch(() => ({ count: 0 }))
      ]);

      setTabCounts({
        jobs: jobsResponse.count || 0,
        profiles: profilesResponse.count || 0,
        applications: applicationsResponse.count || 0
      });
    } catch (error) {
      console.error('Failed to load tab counts:', error);
      // Set sample counts for development
      setTabCounts({
        jobs: 5,
        profiles: 12,
        applications: 8
      });
    } finally {
      setCountsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'jobs') {
        const response = await workforce.getJobs({
          page: currentPage,
          page_size: itemsPerPage,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });
        setJobs(response.results || []);
        setTotalItems(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
      } else if (activeTab === 'profiles') {
        const response = await workforce.getWorkforceProfiles({
          page: currentPage,
          page_size: itemsPerPage,
          search: searchTerm,
          availability_status: statusFilter !== 'all' ? statusFilter : undefined
        });
        setProfiles(response.results || []);
        setTotalItems(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
      } else if (activeTab === 'applications') {
        const response = await workforce.getJobApplications({
          page: currentPage,
          page_size: itemsPerPage,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });
        setApplications(response.results || []);
        setTotalItems(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
      }
    } catch (error) {
      console.error('Failed to load workforce data:', error);
      // Set sample data for development
      if (activeTab === 'jobs') {
        setJobs([
          { id: 1, title: 'Senior Developer', company_name: 'Tech Corp', location: 'Remote', status: 'active', created_at: new Date().toISOString(), salary_min: 80000, salary_max: 120000, applications_count: 5, views_count: 120 }
        ]);
        setTotalItems(1);
        setTotalPages(1);
      } else if (activeTab === 'profiles') {
        setProfiles([
          { 
            id: 1, 
            user_name: 'John Doe',
            user_email: 'john@example.com',
            user_verified: true,
            professional_title: 'Full Stack Developer', 
            current_location: 'New York', 
            user_skills: [{ skill_name: 'React' }, { skill_name: 'Node.js' }], 
            years_of_experience: 5, 
            availability_status: 'available',
            created_at: new Date().toISOString()
          }
        ]);
        setTotalItems(1);
        setTotalPages(1);
      } else if (activeTab === 'applications') {
        setApplications([
          {
            id: 1,
            applicant_name: 'Jane Smith',
            applicant_email: 'jane@example.com',
            job_title: 'Senior Developer',
            job_company: 'Tech Corp',
            job_type: 'full_time',
            job_location: 'Remote',
            status: 'submitted',
            ai_match_score: 85,
            submitted_at: new Date().toISOString()
          }
        ]);
        setTotalItems(1);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      if (activeTab === 'jobs') {
        await workforce.updateJob(itemId, { status: newStatus });
      } else if (activeTab === 'applications') {
        await workforce.updateApplicationStatus(itemId, newStatus);
      }
      loadData();
      loadTabCounts(); // Refresh counts after status change
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      if (action === 'approve') {
        await Promise.all(selectedItems.map(id => 
          workforce.updateJob ? workforce.updateJob(id, { status: 'active' }) : Promise.resolve()
        ));
      } else if (action === 'reject') {
        await Promise.all(selectedItems.map(id => 
          workforce.updateJob ? workforce.updateJob(id, { status: 'rejected' }) : Promise.resolve()
        ));
      } else if (action === 'delete') {
        await Promise.all(selectedItems.map(id => 
          workforce.deleteJob ? workforce.deleteJob(id) : Promise.resolve()
        ));
      }
      setSelectedItems([]);
      loadData();
      loadTabCounts(); // Refresh counts after bulk action
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  // CRUD Handlers
  const handleCreate = () => {
    setModalType('create');
    setSelectedItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalType('edit');
    setSelectedItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleView = (item) => {
    setModalType('view');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setModalType('delete');
    setSelectedItem(item);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (activeTab === 'jobs') {
        await workforce.deleteJob(selectedItem.id);
      } else if (activeTab === 'profiles') {
        await workforce.deleteWorkforceProfile(selectedItem.id);
      } else if (activeTab === 'applications') {
        await workforce.deleteJobApplication(selectedItem.id);
      }
      setShowModal(false);
      loadData();
      loadTabCounts();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (modalType === 'create') {
        if (activeTab === 'jobs') {
          await workforce.createJob(formData);
        } else if (activeTab === 'profiles') {
          await workforce.createWorkforceProfile(formData);
        } else if (activeTab === 'applications') {
          await workforce.createJobApplication(formData);
        }
      } else if (modalType === 'edit') {
        if (activeTab === 'jobs') {
          await workforce.updateJob(selectedItem.id, formData);
        } else if (activeTab === 'profiles') {
          await workforce.updateWorkforceProfile(selectedItem.id, formData);
        } else if (activeTab === 'applications') {
          await workforce.updateJobApplication(selectedItem.id, formData);
        }
      }
      setShowModal(false);
      loadData();
      loadTabCounts();
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  // Application specific handlers
  const handleApplicationAction = async (applicationId, action) => {
    try {
      let newStatus;
      switch (action) {
        case 'shortlist':
          newStatus = 'shortlisted';
          break;
        case 'approve':
          newStatus = 'hired';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        default:
          return;
      }
      await workforce.updateApplicationStatus(applicationId, newStatus);
      loadData();
    } catch (error) {
      console.error('Failed to update application:', error);
    }
  };

  const handleVerifyProfile = async (profileId) => {
    try {
      // This would update the user verification status
      // Implementation depends on your user management system
      console.log('Verify profile:', profileId);
      loadData();
    } catch (error) {
      console.error('Failed to verify profile:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      filled: { color: 'bg-blue-100 text-blue-800', label: 'Filled' },
      closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'jobs', label: 'Job Postings', icon: BriefcaseIcon, count: tabCounts.jobs },
    { id: 'profiles', label: 'Professional Profiles', icon: UsersIcon, count: tabCounts.profiles },
    { id: 'applications', label: 'Applications', icon: ClockIcon, count: tabCounts.applications }
  ];

  const renderJobsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedItems.length === jobs.length && jobs.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(jobs.map(job => job.id));
                  } else {
                    setSelectedItems([]);
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Job Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Salary
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applications
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Posted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(job.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, job.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== job.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{job.title}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      job.job_type === 'full_time' ? 'bg-green-100 text-green-800' :
                      job.job_type === 'contract' ? 'bg-blue-100 text-blue-800' :
                      job.job_type === 'temporary' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.job_type?.replace('_', ' ') || 'Unknown'}
                    </span>
                    {job.priority === 'urgent' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Urgent
                      </span>
                    )}
                    {job.is_remote && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Remote
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{job.company_name || 'Unknown'}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center text-sm text-gray-900">
                  <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                  {job.location}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center text-sm text-gray-900">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1 text-gray-400" />
                  {job.salary_min && job.salary_max 
                    ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                    : 'Not specified'
                  }
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center text-sm text-gray-900">
                  <UsersIcon className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="font-medium">{job.applications_count || 0}</span>
                  {job.views_count && (
                    <span className="ml-2 text-gray-500">
                      ({job.views_count} views)
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(job.status)}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{formatDate(job.created_at)}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <Link
                    to={webRoutes.workforceJobDetail.replace(":id",job.id)}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Job"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleStatusChange(job.id, job.status === 'active' ? 'closed' : 'active')}
                    className="text-green-600 hover:text-green-700"
                    title={job.status === 'active' ? 'Close Job' : 'Activate Job'}
                  >
                    {job.status === 'active' ? 
                      <XCircleIcon className="w-4 h-4" /> : 
                      <CheckCircleIcon className="w-4 h-4" />
                    }
                  </button>
                  <button
                    onClick={() => handleEdit(job)}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Edit Job"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(job)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete Job"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProfilesTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedItems.length === profiles.length && profiles.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(profiles.map(profile => profile.id));
                  } else {
                    setSelectedItems([]);
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Professional
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Skills
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Experience
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Availability
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {profiles.map((profile) => (
            <tr key={profile.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(profile.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, profile.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== profile.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold mr-3">
                    {profile.user_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {profile.user_name || 'Unknown User'}
                    </div>
                    <div className="text-sm text-gray-500">{profile.professional_title || 'No title'}</div>
                    <div className="text-sm text-gray-500">{profile.current_location || 'Location not specified'}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="max-w-xs">
                  {profile.user_skills && profile.user_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.user_skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {skill.skill_name}
                        </span>
                      ))}
                      {profile.user_skills.length > 3 && (
                        <span className="text-xs text-gray-500">+{profile.user_skills.length - 3} more</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No skills listed</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {profile.years_of_experience 
                    ? `${profile.years_of_experience} years`
                    : 'Not specified'
                  }
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.availability_status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : profile.availability_status === 'open_to_offers'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profile.availability_status === 'available' ? 'Available' 
                   : profile.availability_status === 'open_to_offers' ? 'Open to Offers'
                   : profile.availability_status === 'busy' ? 'Busy' 
                   : 'Not Available'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.user_verified 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {profile.user_verified ? 'Verified' : 'Unverified'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{formatDate(profile.created_at)}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <Link
                    to={`/profiles/${profile.id}`}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Profile"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleVerifyProfile(profile.id)}
                    className="text-green-600 hover:text-green-700"
                    title="Verify Profile"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(profile)}
                    className="text-indigo-600 hover:text-indigo-700"
                    title="Edit Profile"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(profile)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete Profile"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderApplicationsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedItems.length === applications.length && applications.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(applications.map(app => app.id));
                  } else {
                    setSelectedItems([]);
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applicant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Job Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Match Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applied
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {applications.map((application) => (
            <tr key={application.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(application.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, application.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== application.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold mr-3">
                    {application.applicant_name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {application.applicant_name || 'Unknown Applicant'}
                    </div>
                    <div className="text-sm text-gray-500">{application.applicant_email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium text-gray-900">{application.job_title}</div>
                    {application.job_type && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        application.job_type === 'full_time' ? 'bg-blue-100 text-blue-800' :
                        application.job_type === 'part_time' ? 'bg-green-100 text-green-800' :
                        application.job_type === 'contract' ? 'bg-purple-100 text-purple-800' :
                        application.job_type === 'internship' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {application.job_type.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <span>{application.job_company}</span>
                    {application.job_location && (
                      <>
                        <span>•</span>
                        <span>{application.job_location}</span>
                      </>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  application.status === 'submitted' 
                    ? 'bg-blue-100 text-blue-800'
                    : application.status === 'under_review'
                    ? 'bg-yellow-100 text-yellow-800'
                    : application.status === 'shortlisted'
                    ? 'bg-purple-100 text-purple-800'
                    : application.status === 'interview_scheduled'
                    ? 'bg-indigo-100 text-indigo-800'
                    : application.status === 'offer_made'
                    ? 'bg-orange-100 text-orange-800'
                    : application.status === 'hired'
                    ? 'bg-green-100 text-green-800'
                    : application.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : application.status === 'withdrawn'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {application.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${
                        application.ai_match_score >= 80 ? 'bg-green-400' :
                        application.ai_match_score >= 60 ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}
                      style={{ width: `${application.ai_match_score || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{application.ai_match_score || 0}%</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{formatDate(application.submitted_at)}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(application)}
                    className="text-blue-600 hover:text-blue-700"
                    title="View Application"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleApplicationAction(application.id, 'shortlist')}
                    className="text-purple-600 hover:text-purple-700"
                    title="Shortlist"
                  >
                    <StarIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleApplicationAction(application.id, 'approve')}
                    className="text-green-600 hover:text-green-700"
                    title="Approve"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleApplicationAction(application.id, 'reject')}
                    className="text-red-600 hover:text-red-700"
                    title="Reject"
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Header Card */}
      <div className="glass rounded-2xl p-6 border border-white/20 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Workforce Management
            </h1>
            <p className="text-gray-600 mt-1">Manage job postings, professional profiles, and applications</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/admin/workforce/analytics'}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-medium flex items-center"
            >
              <UsersIcon className="w-4 h-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-1">
        <nav className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedItems([]);
                  setCurrentPage(1);
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-lg backdrop-blur-xl'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-xl'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100/80 text-gray-600'
                }`}>
                  {countsLoading ? (
                    <ArrowPathIcon className="w-3 h-3 animate-spin" />
                  ) : (
                    tab.count
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters and Search */}
      <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-gray-700"
            >
              <option value="all">All Status</option>
              {activeTab === 'jobs' && (
                <>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="filled">Filled</option>
                  <option value="closed">Closed</option>
                  <option value="expired">Expired</option>
                </>
              )}
              {activeTab === 'profiles' && (
                <>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="not_available">Not Available</option>
                  <option value="open_to_offers">Open to Offers</option>
                </>
              )}
              {activeTab === 'applications' && (
                <>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="offer_made">Offer Made</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </>
              )}
            </select>
            <button
              onClick={handleCreate}
              className="px-4 py-3 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-xl text-white rounded-xl hover:from-blue-700/90 hover:to-purple-700/90 transition-all duration-200 flex items-center border border-white/30 shadow-medium"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create {activeTab === 'jobs' ? 'Job' : activeTab === 'profiles' ? 'Profile' : 'Application'}
            </button>
            <button
              onClick={loadData}
              className="px-4 py-3 bg-gradient-to-r from-gray-100/80 to-gray-200/80 backdrop-blur-xl text-gray-700 rounded-xl hover:from-gray-200/80 hover:to-gray-300/80 transition-all duration-200 flex items-center border border-white/30 shadow-medium"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
            </div>
          </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="backdrop-blur-xl bg-blue-500/20 border border-blue-300/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-semibold">
              {selectedItems.length} item(s) selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-4 py-2 bg-gradient-to-r from-green-500/90 to-green-600/90 text-white rounded-xl text-sm hover:from-green-600/90 hover:to-green-700/90 transition-all duration-200 shadow-medium backdrop-blur-xl border border-white/20"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-4 py-2 bg-gradient-to-r from-red-500/90 to-red-600/90 text-white rounded-xl text-sm hover:from-red-600/90 hover:to-red-700/90 transition-all duration-200 shadow-medium backdrop-blur-xl border border-white/20"
              >
                Reject
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-4 py-2 bg-gradient-to-r from-gray-500/90 to-gray-600/90 text-white rounded-xl text-sm hover:from-gray-600/90 hover:to-gray-700/90 transition-all duration-200 shadow-medium backdrop-blur-xl border border-white/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {activeTab === 'jobs' && renderJobsTable()}
            {activeTab === 'profiles' && renderProfilesTable()}
            {activeTab === 'applications' && renderApplicationsTable()}

            {activeTab === 'jobs' && jobs.length === 0 && (
              <div className="text-center py-12">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No job postings available at the moment'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Modal for CRUD operations */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 border-b">
                  <h2 className="text-xl font-bold">
                    {modalType === 'create' && `Create New ${activeTab.slice(0, -1)}`}
                    {modalType === 'edit' && `Edit ${activeTab.slice(0, -1)}`}
                    {modalType === 'view' && `View ${activeTab.slice(0, -1)}`}
                    {modalType === 'delete' && `Delete ${activeTab.slice(0, -1)}`}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                {modalType === 'delete' ? (
                  <div>
                    <p className="mb-4">Are you sure you want to delete this {activeTab.slice(0, -1)}?</p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : modalType === 'view' ? (
                  <div>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                      {JSON.stringify(selectedItem, null, 2)}
                    </pre>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {activeTab === 'jobs' && 'Job Title'}
                          {activeTab === 'profiles' && 'Professional Title'}
                          {activeTab === 'applications' && 'Application Notes'}
                        </label>
                        <input
                          type="text"
                          value={formData.title || formData.professional_title || formData.notes || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            ...(activeTab === 'jobs' ? { title: e.target.value } :
                               activeTab === 'profiles' ? { professional_title: e.target.value } :
                               { notes: e.target.value })
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Add more form fields based on the active tab */}
                      {activeTab === 'jobs' && (
                        <>
                          {/* Basic Job Information */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                                <textarea
                                  value={formData.description || ''}
                                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="4"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                                <textarea
                                  value={formData.responsibilities || ''}
                                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3"
                                  placeholder="Key responsibilities and duties..."
                                />
                              </div>
                            </div>
                          </div>

                          {/* Job Classification */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Job Classification</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
                                <select
                                  value={formData.job_type || ''}
                                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                >
                                  <option value="">Select Job Type</option>
                                  {jobTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level *</label>
                                <select
                                  value={formData.experience_level || ''}
                                  onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                >
                                  <option value="">Select Experience Level</option>
                                  {experienceLevels.map(level => (
                                    <option key={level.value} value={level.value}>{level.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                <select
                                  value={formData.priority || 'normal'}
                                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="low">Low Priority</option>
                                  <option value="normal">Normal Priority</option>
                                  <option value="high">High Priority</option>
                                  <option value="urgent">Urgent</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Min Years Experience</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={formData.min_years_experience || ''}
                                  onChange={(e) => setFormData({ ...formData, min_years_experience: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Location & Work Arrangement */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Location & Work Arrangement</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                                <input
                                  type="text"
                                  value={formData.location || ''}
                                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Work Arrangement</label>
                                <input
                                  type="text"
                                  value={formData.work_arrangement || ''}
                                  onChange={(e) => setFormData({ ...formData, work_arrangement: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="e.g., Hybrid, Fully Remote, On-site"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="is_remote"
                                  checked={formData.is_remote || false}
                                  onChange={(e) => setFormData({ ...formData, is_remote: e.target.checked })}
                                  className="mr-2"
                                />
                                <label htmlFor="is_remote" className="text-sm font-medium text-gray-700">Remote Work Available</label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="requires_relocation"
                                  checked={formData.requires_relocation || false}
                                  onChange={(e) => setFormData({ ...formData, requires_relocation: e.target.checked })}
                                  className="mr-2"
                                />
                                <label htmlFor="requires_relocation" className="text-sm font-medium text-gray-700">Requires Relocation</label>
                              </div>
                            </div>
                          </div>

                          {/* Compensation */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Compensation</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary</label>
                                <input
                                  type="number"
                                  value={formData.salary_min || ''}
                                  onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="50000"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Salary</label>
                                <input
                                  type="number"
                                  value={formData.salary_max || ''}
                                  onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="100000"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                <select
                                  value={formData.currency || 'USD'}
                                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="USD">USD</option>
                                  <option value="EUR">EUR</option>
                                  <option value="GBP">GBP</option>
                                  <option value="CAD">CAD</option>
                                  <option value="AUD">AUD</option>
                                </select>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="flex items-center mb-4">
                                <input
                                  type="checkbox"
                                  id="salary_negotiable"
                                  checked={formData.salary_negotiable || false}
                                  onChange={(e) => setFormData({ ...formData, salary_negotiable: e.target.checked })}
                                  className="mr-2"
                                />
                                <label htmlFor="salary_negotiable" className="text-sm font-medium text-gray-700">Salary Negotiable</label>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                                <textarea
                                  value={formData.benefits || ''}
                                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3"
                                  placeholder="Health insurance, dental, vision, 401k, PTO..."
                                />
                              </div>
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bonus Structure</label>
                                <textarea
                                  value={formData.bonus_structure || ''}
                                  onChange={(e) => setFormData({ ...formData, bonus_structure: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="2"
                                  placeholder="Annual bonus, performance bonus, equity..."
                                />
                              </div>
                            </div>
                          </div>

                          {/* Requirements */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Requirements</h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Education Requirements</label>
                                <textarea
                                  value={formData.education_requirements || ''}
                                  onChange={(e) => setFormData({ ...formData, education_requirements: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="2"
                                  placeholder="Bachelor's degree in Engineering, relevant field..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Required Certifications</label>
                                <input
                                  type="text"
                                  value={formData.certifications_required?.join(', ') || ''}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    certifications_required: e.target.value.split(',').map(cert => cert.trim()).filter(cert => cert)
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="PMP, Six Sigma, PE License (comma-separated)"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Languages Required</label>
                                <input
                                  type="text"
                                  value={formData.languages_required?.join(', ') || ''}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    languages_required: e.target.value.split(',').map(lang => lang.trim()).filter(lang => lang)
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="English, Spanish, Arabic (comma-separated)"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Application Settings */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Application Settings</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                                <input
                                  type="datetime-local"
                                  value={formData.application_deadline || ''}
                                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Applications</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={formData.max_applications || ''}
                                  onChange={(e) => setFormData({ ...formData, max_applications: parseInt(e.target.value) || null })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Leave empty for unlimited"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="requires_cover_letter"
                                  checked={formData.requires_cover_letter !== false}
                                  onChange={(e) => setFormData({ ...formData, requires_cover_letter: e.target.checked })}
                                  className="mr-2"
                                />
                                <label htmlFor="requires_cover_letter" className="text-sm font-medium text-gray-700">Requires Cover Letter</label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="requires_portfolio"
                                  checked={formData.requires_portfolio || false}
                                  onChange={(e) => setFormData({ ...formData, requires_portfolio: e.target.checked })}
                                  className="mr-2"
                                />
                                <label htmlFor="requires_portfolio" className="text-sm font-medium text-gray-700">Requires Portfolio</label>
                              </div>
                            </div>
                          </div>

                          {/* Additional Information */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h4>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                              <input
                                type="text"
                                value={formData.tags?.join(', ') || ''}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="oil-and-gas, offshore, drilling, engineering (comma-separated)"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {activeTab === 'profiles' && (
                        <>
                          {/* Basic Professional Information */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Professional Information</h4>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary *</label>
                                <textarea
                                  value={formData.summary || ''}
                                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="4"
                                  placeholder="Brief professional summary highlighting key expertise and experience..."
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
                                <textarea
                                  value={formData.achievements || ''}
                                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3"
                                  placeholder="Key achievements, awards, recognitions..."
                                />
                              </div>
                            </div>
                          </div>

                          {/* Experience and Skills */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Experience & Skills</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={formData.years_of_experience || ''}
                                  onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Availability Status</label>
                                <select
                                  value={formData.availability_status || 'available'}
                                  onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="available">Available</option>
                                  <option value="busy">Busy</option>
                                  <option value="not_available">Not Available</option>
                                  <option value="open_to_offers">Open to Offers</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Compensation */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Compensation</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={formData.hourly_rate || ''}
                                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="150.00"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                <select
                                  value={formData.currency || 'USD'}
                                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="USD">USD</option>
                                  <option value="EUR">EUR</option>
                                  <option value="GBP">GBP</option>
                                  <option value="CAD">CAD</option>
                                  <option value="AUD">AUD</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Employment Preferences */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Employment Preferences</h4>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Employment Types</label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { value: 'full_time', label: 'Full-time' },
                                  { value: 'part_time', label: 'Part-time' },
                                  { value: 'contract', label: 'Contract' },
                                  { value: 'freelance', label: 'Freelance' },
                                  { value: 'consulting', label: 'Consulting' },
                                  { value: 'project_based', label: 'Project-based' }
                                ].map((type) => (
                                  <div key={type.value} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`employment_${type.value}`}
                                      checked={formData.preferred_employment_types?.includes(type.value) || false}
                                      onChange={(e) => {
                                        const types = formData.preferred_employment_types || [];
                                        if (e.target.checked) {
                                          setFormData({ 
                                            ...formData, 
                                            preferred_employment_types: [...types, type.value] 
                                          });
                                        } else {
                                          setFormData({ 
                                            ...formData, 
                                            preferred_employment_types: types.filter(t => t !== type.value) 
                                          });
                                        }
                                      }}
                                      className="mr-2"
                                    />
                                    <label htmlFor={`employment_${type.value}`} className="text-sm text-gray-700">{type.label}</label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Location & Travel Preferences */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Location & Travel Preferences</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Location *</label>
                                <input
                                  type="text"
                                  value={formData.current_location || ''}
                                  onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Houston, TX, USA"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Travel Percentage</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={formData.travel_percentage || ''}
                                  onChange={(e) => setFormData({ ...formData, travel_percentage: parseInt(e.target.value) || null })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="25"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="willing_to_relocate"
                                  checked={formData.willing_to_relocate || false}
                                  onChange={(e) => setFormData({ ...formData, willing_to_relocate: e.target.checked })}
                                  className="mr-2"
                                />
                                <label htmlFor="willing_to_relocate" className="text-sm font-medium text-gray-700">Willing to Relocate</label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="willing_to_travel"
                                  checked={formData.willing_to_travel || false}
                                  onChange={(e) => setFormData({ ...formData, willing_to_travel: e.target.checked })}
                                  className="mr-2"
                                />
                                <label htmlFor="willing_to_travel" className="text-sm font-medium text-gray-700">Willing to Travel</label>
                              </div>
                            </div>
                          </div>

                          {/* Work Environment Preferences */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Work Environment Preferences</h4>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Work Environments</label>
                              <input
                                type="text"
                                value={formData.preferred_work_environments?.join(', ') || ''}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  preferred_work_environments: e.target.value.split(',').map(env => env.trim()).filter(env => env)
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Offshore, Onshore, Office, Remote, Field (comma-separated)"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Shift Preferences</label>
                              <input
                                type="text"
                                value={formData.shift_preferences?.join(', ') || ''}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  shift_preferences: e.target.value.split(',').map(shift => shift.trim()).filter(shift => shift)
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Day shift, Night shift, Rotating, 24/7 (comma-separated)"
                              />
                            </div>
                          </div>

                          {/* Portfolio & Professional Links */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Portfolio & Professional Links</h4>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio URL</label>
                                <input
                                  type="url"
                                  value={formData.portfolio_url || ''}
                                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="https://portfolio.example.com"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                                <input
                                  type="url"
                                  value={formData.linkedin_url || ''}
                                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="https://linkedin.com/in/username"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {activeTab === 'applications' && (
                        <>
                          {/* Application Information */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Application Information</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Job Posting</label>
                                <select
                                  value={formData.job_posting || ''}
                                  onChange={(e) => setFormData({ ...formData, job_posting: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                >
                                  <option value="">Select Job Posting</option>
                                  {jobs.map((job) => (
                                    <option key={job.id} value={job.id}>
                                      {job.title} - {job.company_name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Applicant</label>
                                <select
                                  value={formData.applicant || ''}
                                  onChange={(e) => setFormData({ ...formData, applicant: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                >
                                  <option value="">Select Applicant</option>
                                  {profiles.map((profile) => (
                                    <option key={profile.user} value={profile.user}>
                                      {profile.user_name} - {profile.professional_title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter *</label>
                              <textarea
                                value={formData.cover_letter || ''}
                                onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="6"
                                placeholder="Cover letter content..."
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio URL</label>
                              <input
                                type="url"
                                value={formData.portfolio_url || ''}
                                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://portfolio.example.com"
                              />
                            </div>
                          </div>

                          {/* Application Status & Review */}
                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Application Status & Review</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Application Status</label>
                                <select
                                  value={formData.status || 'submitted'}
                                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="submitted">Submitted</option>
                                  <option value="under_review">Under Review</option>
                                  <option value="shortlisted">Shortlisted</option>
                                  <option value="interview_scheduled">Interview Scheduled</option>
                                  <option value="offer_made">Offer Made</option>
                                  <option value="hired">Hired</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="withdrawn">Withdrawn</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">AI Match Score (%)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={formData.ai_match_score || ''}
                                  onChange={(e) => setFormData({ ...formData, ai_match_score: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="85.5"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
                              <textarea
                                value={formData.review_notes || ''}
                                onChange={(e) => setFormData({ ...formData, review_notes: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="4"
                                placeholder="Internal review notes, feedback, interview notes..."
                              />
                            </div>
                          </div>

                          {/* Application Timeline */}
                          {(modalType === 'edit' || modalType === 'view') && (
                            <div className="mb-6">
                              <h4 className="text-lg font-medium text-gray-900 mb-4">Application Timeline</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Submitted At</label>
                                  <input
                                    type="text"
                                    value={formData.submitted_at ? new Date(formData.submitted_at).toLocaleString() : 'Not available'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                    readOnly
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Reviewed At</label>
                                  <input
                                    type="text"
                                    value={formData.reviewed_at ? new Date(formData.reviewed_at).toLocaleString() : 'Not reviewed yet'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                    readOnly
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <div className="flex justify-end space-x-2 sticky bottom-0 bg-white pt-4 border-t mt-6">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-custom_yellow"
                        >
                          {modalType === 'create' ? 'Create' : 'Save'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
  );
};

export default AdminWorkforce;
