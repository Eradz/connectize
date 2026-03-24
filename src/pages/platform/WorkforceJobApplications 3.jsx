/**
 * WorkforceJobApplications — Employer-facing applicant management page
 * Displays all applications for a specific job posting
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Search, Users, Eye, FileText, Download, CheckCircle,
  XCircle, Clock, Star, UserCheck, Handshake, ArrowLeft,
  Filter, MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import { workforceAPI } from '../../api-services/workforce';
import { webRoutes } from '../../lib/webRoutes';
import BackArrowButton from '../../components/BackArrowButton';

const STATUS_CONFIG = {
  submitted:           { label: 'Submitted',           bg: 'bg-amber-100',   text: 'text-amber-700',   icon: Clock },
  under_review:        { label: 'Under Review',        bg: 'bg-blue-100',    text: 'text-blue-700',    icon: Eye },
  shortlisted:         { label: 'Shortlisted',         bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Star },
  interview_scheduled: { label: 'Interview Scheduled',  bg: 'bg-indigo-100',  text: 'text-indigo-700',  icon: Users },
  offer_made:          { label: 'Offer Made',           bg: 'bg-yellow-100',  text: 'text-yellow-700',  icon: Handshake },
  hired:               { label: 'Hired',                bg: 'bg-green-100',   text: 'text-green-700',   icon: CheckCircle },
  rejected:            { label: 'Rejected',             bg: 'bg-red-100',     text: 'text-red-700',     icon: XCircle },
  withdrawn:           { label: 'Withdrawn',            bg: 'bg-gray-100',    text: 'text-gray-500',    icon: UserCheck },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.submitted;
  const IconComp = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <IconComp className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

const WorkforceJobApplications = () => {
  const { id: jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch job details and applications in parallel
      const [jobRes, appRes] = await Promise.all([
        workforceAPI.getJob(jobId).catch(() => null),
        workforceAPI.getJobApplications({ job_posting: jobId }),
      ]);

      if (jobRes) {
        setJob(jobRes.data || jobRes);
      }

      const appData = appRes?.data?.results || appRes?.data || appRes?.results || appRes || [];
      setApplications(Array.isArray(appData) ? appData : []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await workforceAPI.updateApplicationStatus(appId, newStatus);
      setApplications(prev =>
        prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
      );
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    let list = [...applications];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(a => {
        const name = a.applicant_name || `${a.applicant_data?.first_name || ''} ${a.applicant_data?.last_name || ''}`;
        const email = a.applicant_email || a.applicant_data?.email || '';
        return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
      });
    }
    if (filterStatus !== 'all') {
      list = list.filter(a => a.status === filterStatus);
    }
    return list;
  }, [applications, searchTerm, filterStatus]);

  // Summary counts
  const counts = useMemo(() => {
    const c = { total: applications.length };
    Object.keys(STATUS_CONFIG).forEach(s => {
      c[s] = applications.filter(a => a.status === s).length;
    });
    return c;
  }, [applications]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
          </div>
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BackArrowButton className="w-fit" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Applications {job?.title ? `for "${job.title}"` : ''}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {counts.total} total application{counts.total !== 1 ? 's' : ''} received
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-emerald-600">{counts.shortlisted || 0}</p>
          <p className="text-xs text-gray-500">Shortlisted</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-blue-600">{counts.under_review || 0}</p>
          <p className="text-xs text-gray-500">Under Review</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">{counts.hired || 0}</p>
          <p className="text-xs text-gray-500">Hired</p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search applicants..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gold"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {applications.length === 0 ? 'No applications received yet' : 'No matching applicants'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(app => {
            const name = app.applicant_name ||
              (app.applicant_data ? `${app.applicant_data.first_name} ${app.applicant_data.last_name}` : 'Unknown');
            const email = app.applicant_email || app.applicant_data?.email || '';
            const avatar = app.applicant_avatar || app.applicant_data?.profile_image || app.applicant_data?.avatar;
            const appliedDate = app.submitted_at || app.created_at;

            return (
              <div key={app.id} className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Applicant info */}
                  <div className="flex items-center gap-3">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{name}</p>
                      <p className="text-sm text-gray-500">{email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={app.status} />
                    <span className="text-xs text-gray-400">Applied {formatDate(appliedDate)}</span>
                  </div>
                </div>

                {/* Cover letter preview */}
                {app.cover_letter && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{app.cover_letter}</p>
                )}

                {/* Actions row */}
                <div className="mt-4 pt-3 border-t flex flex-wrap items-center gap-2">
                  {/* Resume link */}
                  {app.resume && (
                    <a
                      href={app.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <FileText className="w-3.5 h-3.5" /> Resume
                    </a>
                  )}
                  {app.portfolio_url && (
                    <a
                      href={app.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <Eye className="w-3.5 h-3.5" /> Portfolio
                    </a>
                  )}

                  {/* Status quick actions */}
                  <div className="ml-auto flex gap-1">
                    {app.status === 'submitted' && (
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'under_review')}
                        disabled={updatingId === app.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        Review
                      </button>
                    )}
                    {['submitted', 'under_review'].includes(app.status) && (
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                        disabled={updatingId === app.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        Shortlist
                      </button>
                    )}
                    {['shortlisted', 'interview_scheduled'].includes(app.status) && (
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'offer_made')}
                        disabled={updatingId === app.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 disabled:opacity-50"
                      >
                        Make Offer
                      </button>
                    )}
                    {app.status === 'offer_made' && (
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'hired')}
                        disabled={updatingId === app.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                      >
                        Hire
                      </button>
                    )}
                    {!['rejected', 'withdrawn', 'hired'].includes(app.status) && (
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'rejected')}
                        disabled={updatingId === app.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkforceJobApplications;
