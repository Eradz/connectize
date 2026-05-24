import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Forum Members | Knowledge Hub - Connectize",
    description: "View and manage members of this oil and gas industry forum on Connectize.",
    keywords: "forum members, discussion, oil and gas, community, Connectize",
  });

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader,
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { knowledgeForumService } from '../../api-services/oilgas';
import { toast } from 'sonner';

const KnowledgeForumMembers = () => {
  const { forumSlug } = useParams();
  const navigate = useNavigate();

  const [forum, setForum] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    if (forumSlug) {
      loadForum();
      loadMembers();
    }
  }, [forumSlug, currentPage]);

  const loadForum = async () => {
    try {
      const response = await knowledgeForumService.getById(forumSlug);
      // Find forum by slug
      if (response) {
        setForum(response);
      } else {
        toast.error('Forum not found');
      }
    } catch (error) {
      console.error('Error loading forum:', error);
      toast.error('Failed to load forum details');
    }
  };

  const loadMembers = async (pageUrl = null) => {
    try {
      setLoading(true);
        
      // Load first page using slug
       const response = await knowledgeForumService.getMembers(forumSlug);
        
      const membersData = Array.isArray(response) ? response : response.results || [];
      const filteredMembers = searchTerm.trim()
        ? membersData.filter((member) => {
            const fullName = `${member.user?.first_name || ''} ${member.user?.last_name || ''}`.toLowerCase();
            const email = member.user?.email?.toLowerCase() || '';
            const search = searchTerm.toLowerCase();
            return fullName.includes(search) || email.includes(search);
          })
        : membersData;
          console.log("filteredMembers", filteredMembers);
      setMembers(filteredMembers);
      setTotalMembers(response.meta?.total || filteredMembers.length);
      setNextPageUrl(response.meta?.next_page_url || null);
      setPrevPageUrl(response.meta?.prev_page_url || null);
      setLoading(false);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (nextPageUrl) {
      loadMembers(nextPageUrl);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (prevPageUrl) {
      loadMembers(prevPageUrl);
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  };

  const handleRemoveClick = (member) => {
    setRemovingMember(member);
    setShowRemoveModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!removingMember) return;

    try {
      setIsRemoving(true);
      await knowledgeForumService.removeMember(forumSlug, removingMember.user?.id);
      toast.success('Member removed successfully');
      setShowRemoveModal(false);
      setRemovingMember(null);
      loadMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setIsRemoving(false);
    }
  };

  if (!forum) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(webRoutes.knowledgeForumDetail?.replace(':slug', forum.slug))}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{forum.name}</h1>
          <p className="text-gray-600 mt-1">Forum Members</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            All Members ({totalMembers})
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 animate-spin text-gold mx-auto" />
              <p className="mt-2 text-gray-600">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No members found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                      {forum.is_moderator && (
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {member.user?.first_name} {member.user?.last_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {member.user?.email}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(member.created_at).toLocaleDateString()}
                        </td>
                        {forum.is_moderator && (
                          <td className="py-3 px-4 text-sm text-right">
                            <button
                              onClick={() => handleRemoveClick(member)}
                              className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition"
                            >
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {(prevPageUrl || nextPageUrl) && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <button
                    onClick={handlePrevPage}
                    disabled={!prevPageUrl}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {currentPage}
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={!nextPageUrl}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Remove Member Modal */}
      {showRemoveModal && removingMember && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Remove Member?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove{' '}
              <span className="font-medium">
                {removingMember.user?.first_name} {removingMember.user?.last_name}
              </span>{' '}
              from this forum? This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setRemovingMember(null);
                }}
                disabled={isRemoving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                disabled={isRemoving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isRemoving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove Member'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeForumMembers;
