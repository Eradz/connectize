import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare,
  Users,
  Calendar,
  TrendingUp,
  Pin,
  Lock,
  Globe,
  Hash
} from 'lucide-react';
import { knowledgeForumService } from '../../api-services/oilgas';

const KnowledgeForums = () => {
  const [forums, setForums] = useState([]);
  const [stats, setStats] = useState({ total_forums: 0, active_forums: 0, total_members: 0, total_topics: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadForums();
  }, []);

  const loadForums = async () => {
    try {
      setLoading(true);
      const response = await knowledgeForumService.getAll();
      const list = response?.results || response?.data || response || [];
      setForums(list);

      // Try aggregated stats endpoint
      const remoteStats = await knowledgeForumService.getStats();
      if (remoteStats && typeof remoteStats === 'object') {
        setStats({
          total_forums: remoteStats.total_forums ?? list.length,
          active_forums: remoteStats.active_forums ?? list.filter(f => (f.topic_count || 0) > 0).length,
          total_members: remoteStats.total_members ?? list.reduce((s, f) => s + (f.members_count || 0), 0),
          total_topics: remoteStats.total_topics ?? list.reduce((s, f) => s + (f.topic_count || 0), 0)
        });
      } else {
        // Derive locally
        setStats({
          total_forums: list.length,
          active_forums: list.filter(f => (f.topic_count || 0) > 0).length,
          total_members: list.reduce((s, f) => s + (f.members_count || 0), 0),
          total_topics: list.reduce((s, f) => s + (f.topic_count || 0), 0)
        });
      }
    } catch (error) {
      console.error('Error loading forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredForums = forums.filter(forum => {
    const matchesSearch = forum.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         forum.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || forum.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getForumIcon = (isPrivate) => {
    return isPrivate ? (
      <Lock className="h-5 w-5 text-red-500" />
    ) : (
      <Globe className="h-5 w-5 text-green-500" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discussion Forums</h1>
              <p className="mt-2 text-gray-600">Join conversations about oil & gas industry topics</p>
            </div>
            <Link
              to="/knowledge/forums/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Forum</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search forums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="general">General Discussion</option>
              <option value="technical">Technical</option>
              <option value="market">Market Analysis</option>
              <option value="sustainability">Sustainability</option>
              <option value="regulations">Regulations</option>
              <option value="careers">Careers</option>
            </select>

            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Filter className="h-5 w-5" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forums</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_forums}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Forums</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_forums}</p>
                {stats.active_forums === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No discussions yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_members}</p>
                {stats.total_members === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No members joined yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Topics</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_topics}</p>
                {stats.total_topics === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Start the first discussion</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Forums List */}
        <div className="space-y-4">
          {filteredForums.map((forum) => (
            <div key={forum.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getForumIcon(!forum.is_public)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          <Link 
                            to={`/knowledge/forums/${forum.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {forum.name}
                          </Link>
                        </h3>
                        
                        {forum.is_pinned && (
                          <Pin className="h-4 w-4 text-blue-500" />
                        )}
                        
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                           !forum.is_public 
                             ? 'bg-red-100 text-red-800' 
                             : 'bg-green-100 text-green-800'
                         }`}>
                           {!forum.is_public ? 'Private' : 'Public'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{forum.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>
                            {forum.topic_count > 0 ? `${forum.topic_count} topics` : 'No topics yet'}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>
                            {forum.members_count > 0 ? `${forum.members_count} members` : 'No members yet'}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Created {new Date(forum.created_at).toLocaleDateString()}</span>
                        </div>

                        {forum.category && (
                          <div className="flex items-center">
                            <Hash className="h-4 w-4 mr-1" />
                            <span>{forum.category}</span>
                          </div>
                        )}
                      </div>

                      {forum.moderators && forum.moderators.length > 0 && (
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">Moderators: </span>
                          {forum.moderators.slice(0, 3).map((mod, index) => (
                            <span key={index}>
                              {mod.name}
                              {index < Math.min(2, forum.moderators.length - 1) && ', '}
                            </span>
                          ))}
                          {forum.moderators.length > 3 && (
                            <span> and {forum.moderators.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Link
                      to={`/knowledge/forums/${forum.slug}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Enter Forum
                    </Link>
                    
                    {forum.latest_post && (
                      <div className="text-xs text-gray-500 text-right">
                        <div>Last post by {forum.latest_post.author}</div>
                        <div>{new Date(forum.latest_post.created_at).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Topics Preview */}
              {forum.recent_topics && forum.recent_topics.length > 0 ? (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Recent topics: </span>
                    {forum.recent_topics.slice(0, 2).map((topic, index) => (
                      <span key={index} className="text-blue-600">
                        <Link to={`/knowledge/topics/${topic.slug}`} className="hover:underline">
                          {topic.title}
                        </Link>
                        {index < Math.min(1, forum.recent_topics.length - 1) && ', '}
                      </span>
                    ))}
                  </div>
                </div>
              ) : forum.topic_count === 0 ? (
                <div className="border-t border-gray-200 bg-blue-50 px-6 py-3">
                  <div className="text-sm text-blue-700 flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Be the first to start a discussion in this forum!</span>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {filteredForums.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No forums found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create the first forum to start discussions in the community.
            </p>
            <div className="mt-6">
              <Link
                to="/knowledge/forums/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Forum
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeForums;
