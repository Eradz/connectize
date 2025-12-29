import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Calendar,
  Pin,
  Lock,
  Eye,
  MessageCircle,
  Plus,
  Search,
  Filter,
  ChevronRight,
  ArrowLeft,
  User
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { knowledgeForumService, knowledgeForumTopicService } from '../../api-services/oilgas';
import { toast } from 'sonner';

const KnowledgeForumDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [forum, setForum] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTopics, setTotalTopics] = useState(0);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [requests, setRequests] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  
  const pageSize = 20;

  useEffect(() => {
    if (slug) {
      loadForum();
      loadTopics();
    }
  }, [slug, currentPage, sortBy]);

  const loadForum = async () => {
    try {
      const response = await knowledgeForumService.getById(slug);
      const forumData = response?.data || response;
      setForum(forumData);
      // Load membership meta
      try {
        const membersRes = await knowledgeForumService.getMembers(slug);
        setMembers(membersRes?.results || membersRes?.data?.results || []);
      } catch {}
      if (forumData?.is_moderator) {
        try {
          const invRes = await knowledgeForumService.getInvitations(slug);
          setInvites(invRes?.results || invRes?.data?.results || []);
          const reqRes = await knowledgeForumService.getJoinRequests(slug);
          setRequests(reqRes?.results || reqRes?.data?.results || []);
        } catch {}
      }
    } catch (error) {
      console.error('Error loading forum:', error);
      toast.error('Failed to load forum');
      navigate(webRoutes.knowledgeForums);
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async () => {
    if (!slug) return;
    
    setTopicsLoading(true);
    try {
      // Use the topics endpoint for the specific forum
      const ordering = sortBy === 'latest' ? '-last_reply_at' : 
                      sortBy === 'popular' ? '-views' : 
                      sortBy === 'oldest' ? 'created_at' : '-is_pinned,-last_reply_at';
      
      const params = {
        page: currentPage,
        page_size: pageSize,
        ordering,
        ...(searchTerm && { search: searchTerm })
      };
      
      // Call the forum-specific topics endpoint
      const response = await knowledgeForumService.getTopics(slug, params);
      const data = response?.data || response;
      
      setTopics(data?.results || []);
      setTotalTopics(data?.total || 0);
    } catch (error) {
      console.error('Error loading topics:', error);
      toast.error('Failed to load topics');
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadTopics();
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const onTogglePrivacy = async () => {
    try {
      const res = await knowledgeForumService.togglePrivacy(slug);
      setForum(prev => ({ ...prev, is_public: res?.data?.is_public ?? res?.is_public ?? !prev.is_public }));
      toast.success(`Forum is now ${res?.data?.is_public ?? res?.is_public ? 'Public' : 'Private'}`);
    } catch (e) {
      toast.error('Failed to toggle privacy');
    }
  };

  const onInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      const res = await knowledgeForumService.invite(slug, { email: inviteEmail, message: inviteMessage });
      setInvites(prev => [res?.data || res, ...prev]);
      setInviteEmail(''); setInviteMessage('');
      toast.success('Invitation sent');
    } catch (e) {
      toast.error('Failed to send invite');
    }
  };

  const onRequestJoin = async () => {
    try {
      await knowledgeForumService.requestJoin(slug);
      setForum(prev => ({ ...prev, membership_status: 'pending' }));
      toast.success('Join request sent');
    } catch (e) {
      toast.error('Failed to send join request');
    }
  };

  const onLeave = async () => {
    try {
      await knowledgeForumService.leave(slug);
      setForum(prev => ({ ...prev, is_member: false, membership_status: 'none' }));
      toast.success('You left the forum');
    } catch (e) {
      toast.error('Failed to leave forum');
    }
  };

  const onApproveRequest = async (request_id) => {
    try {
      await knowledgeForumService.approveRequest(slug, request_id);
      setRequests(prev => prev.filter(r => r.id !== request_id));
      // refresh members
      const membersRes = await knowledgeForumService.getMembers(slug);
      setMembers(membersRes?.results || membersRes?.data?.results || []);
      toast.success('Request approved');
    } catch (e) {
      toast.error('Failed to approve request');
    }
  };

  const onRejectRequest = async (request_id) => {
    try {
      await knowledgeForumService.rejectRequest(slug, request_id);
      setRequests(prev => prev.filter(r => r.id !== request_id));
      toast.success('Request rejected');
    } catch (e) {
      toast.error('Failed to reject request');
    }
  };

  const onRemoveMember = async (user_id) => {
    try {
      await knowledgeForumService.removeMember(slug, user_id);
      setMembers(prev => prev.filter(m => m.user?.id !== user_id));
      toast.success('Member removed');
    } catch (e) {
      toast.error('Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-2/3 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forum Not Found</h1>
          <p className="text-gray-600 mb-4">The forum you're looking for doesn't exist.</p>
          <Link 
            to={webRoutes.knowledgeForums}
            className="inline-flex items-center text-gold hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forums
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalTopics / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link to={webRoutes.knowledgeHub} className="hover:text-gold">Knowledge Hub</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={webRoutes.knowledgeForums} className="hover:text-gold">Forums</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{forum.name}</span>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{forum.name}</h1>
              <p className="text-gray-600 mb-4">{forum.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{formatNumber(forum.topic_count)} topics</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{formatNumber(forum.post_count)} posts</span>
                </div>
                {forum.moderators && forum.moderators.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{forum.moderators.length} moderator{forum.moderators.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(forum.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {forum.is_moderator && (
                <button onClick={onTogglePrivacy} className="px-3 py-2 border rounded hover:bg-gray-50">
                  {forum.is_public ? 'Make Private' : 'Make Public'}
                </button>
              )}
              {forum.is_member ? (
                <button onClick={onLeave} className="px-3 py-2 border rounded hover:bg-gray-50">Leave Forum</button>
              ) : forum.membership_status === 'pending' ? (
                <span className="px-3 py-2 text-gray-600">Request Pending</span>
              ) : (
                <button onClick={onRequestJoin} className="px-3 py-2 border rounded hover:bg-gray-50">Request to Join</button>
              )}
              {(forum.is_public || forum.is_member) && (
                <Link
                  to={webRoutes.knowledgeForumTopicCreate?.replace(':forumSlug', forum.slug) || '#'}
                  className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Topic</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="latest">Latest Activity</option>
                <option value="popular">Most Popular</option>
                <option value="oldest">Oldest First</option>
              </select>
              <button
                onClick={handleSearch}
                className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Moderator: Invitations & Requests */}
        {forum.is_moderator && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Invite Members</h3>
              </div>
              <form onSubmit={onInvite} className="p-6 space-y-3">
                <input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="Email address" className="w-full border rounded px-3 py-2" />
                <textarea value={inviteMessage} onChange={e=>setInviteMessage(e.target.value)} placeholder="Optional message" className="w-full border rounded px-3 py-2" />
                <button type="submit" className="bg-gold text-white px-4 py-2 rounded">Send Invite</button>
              </form>
              <div className="p-6 border-t">
                <h4 className="font-medium mb-2">Pending Invites</h4>
                {invites.length === 0 ? <p className="text-sm text-gray-500">No pending invites</p> : (
                  <ul className="space-y-2">
                    {invites.map((inv) => (
                      <li key={inv.id} className="text-sm text-gray-700">{inv.email} • {inv.status}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Join Requests</h3>
              </div>
              <div className="p-6 space-y-3">
                {requests.length === 0 ? <p className="text-sm text-gray-500">No pending requests</p> : (
                  <ul className="space-y-2">
                    {requests.map((rq) => (
                      <li key={rq.id} className="flex items-center justify-between text-sm">
                        <span>{rq.user?.first_name} {rq.user?.last_name}</span>
                        <div className="space-x-2">
                          <button onClick={() => onApproveRequest(rq.id)} className="px-2 py-1 text-white bg-green-600 rounded">Approve</button>
                          <button onClick={() => onRejectRequest(rq.id)} className="px-2 py-1 text-white bg-red-600 rounded">Reject</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Members */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Members ({members.length})</h3>
          </div>
          <div className="p-6">
            {members.length === 0 ? (
              <p className="text-sm text-gray-500">No members yet</p>
            ) : (
              <ul className="divide-y">
                {members.map(m => (
                  <li key={m.id} className="py-3 flex items-center justify-between">
                    <div className="text-sm text-gray-700">{m.user?.first_name} {m.user?.last_name} ({m.user?.email})</div>
                    {forum.is_moderator && (
                      <button onClick={() => onRemoveMember(m.user?.id)} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Remove</button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Topics List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Topics ({formatNumber(totalTopics)})
            </h2>
          </div>
          
          {(!forum.is_public && !forum.is_member) ? (
            <div className="p-8 text-center">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">This forum is private</h3>
              <p className="text-gray-600 mb-4">Request to join to view topics and participate.</p>
              {forum.membership_status !== 'pending' && (
                <button onClick={onRequestJoin} className="inline-flex items-center px-4 py-2 border rounded hover:bg-gray-100">Request to Join</button>
              )}
            </div>
          ) : topicsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading topics...</p>
            </div>
          ) : topics.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No topics yet</h3>
              <p className="text-gray-600 mb-4">Be the first to start a discussion in this forum.</p>
              {(forum.is_public || forum.is_member) && (
                <Link
                  to={webRoutes.knowledgeForumTopicCreate?.replace(':forumSlug', forum.slug) || '#'}
                  className="inline-flex items-center bg-gold text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start First Topic
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {topics.map((topic) => (
                <div key={topic.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gold" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {topic.is_pinned && (
                          <Pin className="w-4 h-4 text-yellow-500" />
                        )}
                        {topic.status === 'locked' && (
                          <Lock className="w-4 h-4 text-red-500" />
                        )}
                        <Link
                          to={webRoutes.knowledgeForumTopicDetail?.replace(':slug', topic.slug) || '#'}
                          className="text-lg font-semibold text-gray-900 hover:text-gold line-clamp-2"
                        >
                          {topic.title}
                        </Link>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>By {topic.author?.first_name} {topic.author?.last_name}</span>
                        <span>{formatDate(topic.created_at)}</span>
                        {topic.last_reply_at && topic.last_reply_at !== topic.created_at && (
                          <>
                            <span>•</span>
                            <span>Last reply {formatDate(topic.last_reply_at)}</span>
                            {topic.last_post_author && (
                              <span>by {topic.last_post_author}</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{formatNumber(topic.views)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{formatNumber(topic.replies)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalTopics)} of {totalTopics} topics
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, currentPage - 2) + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 text-sm rounded ${
                            pageNum === currentPage
                              ? 'bg-gold text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeForumDetail;
