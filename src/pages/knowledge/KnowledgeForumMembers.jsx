import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Forum Members | Knowledge Hub - Connectize",
    description: "View forum members in the Connectize Knowledge Hub.",
    keywords: "forum members, knowledge hub, community, Connectize",
  });

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, User, UserMinus, Users } from 'lucide-react';
import { toast } from 'sonner';

import { knowledgeForumService } from '../../api-services/oilgas';
import { getUserDisplayName, getUserHandle } from '../../lib/userDisplay';
import { webRoutes } from '../../lib/webRoutes';

const memberName = (member) => {
  return getUserDisplayName(member?.user) || 'Connectize member';
};

export default function KnowledgeForumMembers() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [forum, setForum] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [removingUserId, setRemovingUserId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const [forumResponse, membersResponse] = await Promise.all([
          knowledgeForumService.getById(slug),
          knowledgeForumService.getMembers(slug),
        ]);

        if (cancelled) return;

        setForum(forumResponse?.data || forumResponse);
        const data = membersResponse?.data || membersResponse;
        setMembers(data?.results || []);
      } catch (error) {
        console.error('Error loading forum members:', error);
        toast.error('Failed to load forum members');
        navigate(webRoutes.knowledgeForums);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [navigate, slug]);

  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return members;
    }

    return members.filter((member) => {
      const user = member?.user || {};
      return [
        user.first_name,
        user.last_name,
        user.email,
        memberName(member),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [members, searchTerm]);

  const onRemoveMember = async (member) => {
    const userId = member?.user?.id;
    if (!userId) return;
    if (!window.confirm(`Remove ${memberName(member)} from this forum?`)) return;

    try {
      setRemovingUserId(userId);
      await knowledgeForumService.removeMember(slug, userId);
      setMembers((current) => current.filter((item) => item.user?.id !== userId));
      toast.success('Member removed');
    } catch (error) {
      console.error('Error removing forum member:', error);
      toast.error('Failed to remove member');
    } finally {
      setRemovingUserId(null);
    }
  };

  const backToForum = forum
    ? webRoutes.knowledgeForumDetail.replace(':slug', forum.slug)
    : webRoutes.knowledgeForums;

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
          <div className="bg-white border rounded-lg divide-y">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-64 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to={backToForum}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gold mb-5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to forum
        </Link>

        <div className="bg-white border rounded-lg shadow-sm mb-6">
          <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Users className="w-4 h-4" />
                <span>{members.length} member{members.length === 1 ? '' : 's'}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Forum Members</h1>
              <p className="text-gray-600 mt-1">{forum?.name || 'Forum'}</p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search members"
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          {filteredMembers.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h2 className="text-lg font-semibold text-gray-900">No members found</h2>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ? 'Try another search term.' : 'This forum has no members yet.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {filteredMembers.map((member) => {
                const handle = getUserHandle(member.user);

                return (
                  <li key={member.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex items-center gap-3">
                      {member.user?.avatar ? (
                        <img
                          src={member.user.avatar}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{memberName(member)}</p>
                        {handle && (
                          <p className="text-sm text-gray-500 truncate">@{handle}</p>
                        )}
                      </div>
                    </div>

                    {forum?.is_moderator && member.user?.id && (
                      <button
                        type="button"
                        onClick={() => onRemoveMember(member)}
                        disabled={removingUserId === member.user.id}
                        className="shrink-0 inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <UserMinus className="w-4 h-4" />
                        {removingUserId === member.user.id ? 'Removing...' : 'Remove'}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
