import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
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
  Hash,
  ThumbsUp,
  Clock
} from 'lucide-react';
import { knowledgeForumTopicService } from '../../api-services/oilgas';

const KnowledgeTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterForum, setFilterForum] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
  const response = await knowledgeForumTopicService.getAll();
  setTopics(response?.results || response?.data || response || []);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedTopics = topics
    .filter(topic => {
      const matchesSearch = topic.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           topic.content?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesForum = filterForum === '' || topic.forum_name === filterForum;
      return matchesSearch && matchesForum;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.updated_at) - new Date(a.updated_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'most_replies':
          return (b.replies_count || 0) - (a.replies_count || 0);
        case 'most_likes':
          return (b.likes_count || 0) - (a.likes_count || 0);
        default:
          return 0;
      }
    });

  const getTopicIcon = (topic) => {
    if (topic.is_pinned) return <Pin className="h-5 w-5 text-blue-500" />;
    if (topic.is_locked) return <Lock className="h-5 w-5 text-red-500" />;
    return <MessageSquare className="h-5 w-5 text-gray-500" />;
  };

  const getTopicStatusColor = (topic) => {
    if (topic.is_pinned) return 'border-l-blue-500';
    if (topic.is_locked) return 'border-l-red-500';
    if (topic.replies_count > 10) return 'border-l-green-500';
    return 'border-l-gray-300';
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const uniqueForums = [...new Set(topics.map(t => t.forum_name).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discussion Topics</h1>
              <p className="mt-2 text-gray-600">Browse and participate in community discussions</p>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterForum}
              onChange={(e) => setFilterForum(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Forums</option>
              {uniqueForums.map(forum => (
                <option key={forum} value={forum}>{forum}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="latest">Latest Activity</option>
              <option value="oldest">Oldest First</option>
              <option value="most_replies">Most Replies</option>
              <option value="most_likes">Most Liked</option>
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
                <p className="text-sm font-medium text-gray-600">Total Topics</p>
                <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Topics</p>
                <p className="text-2xl font-bold text-gray-900">
                  {topics.filter(t => !t.is_locked).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Pin className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pinned Topics</p>
                <p className="text-2xl font-bold text-gray-900">
                  {topics.filter(t => t.is_pinned).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ThumbsUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {topics.reduce((sum, topic) => sum + (topic.likes_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Topics List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredAndSortedTopics.map((topic) => (
              <div key={topic.id} className={`p-6 border-l-4 ${getTopicStatusColor(topic)} hover:bg-gray-50 transition-colors`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getTopicIcon(topic)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          <Link 
                            to={`/knowledge/topics/${topic.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {topic.title}
                          </Link>
                        </h3>
                        
                        {topic.is_pinned && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Pinned
                          </span>
                        )}
                        
                        {topic.is_locked && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Locked
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {topic.content ? topic.content.substring(0, 200) + '...' : 'No content available'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>By {topic.author ? `${topic.author.first_name} ${topic.author.last_name}` : 'Anonymous'}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 mr-1" />
                          <Link 
                            to={`/knowledge/forums/${topic.forum_slug}`}
                            className="text-blue-600 hover:underline"
                          >
                            {topic.forum_name}
                          </Link>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                        </div>

                        {topic.tags && topic.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {topic.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2 text-sm">
                    <div className="flex items-center space-x-4 text-gray-500">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{topic.replies || 0}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span>{topic.likes_count || 0}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{topic.views || 0}</span>
                      </div>
                    </div>
                    
                    {topic.last_reply_at && (
                      <div className="text-xs text-gray-500 text-right">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Last reply {getTimeAgo(topic.last_reply_at)}</span>
                        </div>
                        <div>by {topic.last_post_author || 'Anonymous'}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredAndSortedTopics.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No topics found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterForum 
                ? 'Try adjusting your search filters.'
                : 'Start a new discussion to get the conversation going.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeTopics;
