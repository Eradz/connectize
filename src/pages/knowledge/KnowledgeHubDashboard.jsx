import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  MessageSquare,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  Plus,
  Search,
  Filter,
  Clock,
  Tag,
  Star,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import {
  knowledgeArticleService,
  knowledgeForumService,
  knowledgeCategoryService,
  knowledgeTagService
} from '../../api-services/oilgas';
import { toast } from 'sonner';

const KnowledgeHubDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [forums, setForums] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalForums: 0,
    activeForums: 0,
    totalTopics: 0,
    totalMembers: 0,
    totalViews: 0
  });

  // Generic response normalizer (handles {results:[]}, {data:[]}, direct array)
  const normalizeArray = useCallback((res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.results)) return res.results;
    if (Array.isArray(res.data)) return res.data;
    return [];
  }, []);

  const getCount = useCallback((res) => {
    if (!res) return 0;
    if (typeof res.count === 'number') return res.count;
    const arr = normalizeArray(res);
    return arr.length;
  }, [normalizeArray]);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        featuredRes,
        trendingRes,
        recentRes,
        allArticlesRes,
        forumsRes,
        categoriesRes,
        tagsRes
      ] = await Promise.all([
        knowledgeArticleService.getFeatured(),
        knowledgeArticleService.getTrending(),
        knowledgeArticleService.getAll({ page_size: 6, status: 'published' }),
        knowledgeArticleService.getAll({ page_size: 1, status: 'published' }), // Just to get total count
        knowledgeForumService.getAll(),
        knowledgeCategoryService.getAll(),
        knowledgeTagService.getPopular()
      ]);
      // Normalize all list-like responses consistently
      const featured = normalizeArray(featuredRes);
      const trending = normalizeArray(trendingRes);
      const recent = normalizeArray(recentRes);
      const forumsList = normalizeArray(forumsRes);
      const cats = normalizeArray(categoriesRes);
      const tags = normalizeArray(tagsRes);

      setFeaturedArticles(featured);
      setTrendingArticles(trending);
      setRecentArticles(recent);
      setForums(forumsList);
      setCategories(cats);
      setPopularTags(tags);

      // Debug logging
      console.log('Dashboard - Forums response:', forumsRes);
      console.log('Dashboard - Forums data:', forumsRes?.results || forumsRes?.data || []);

      // Calculate article & forum derived stats
      const totalViews = recent.reduce((sum, article) => sum + (article.views || 0), 0);
      const derivedTopics = forumsList.reduce((sum, forum) => sum + (forum.topic_count || 0), 0);
      const derivedActiveForums = forumsList.filter(f => (f.topic_count || 0) > 0).length;
      const derivedMembers = forumsList.reduce((sum, forum) => sum + (forum.members_count || 0), 0);

      // Attempt aggregated forum stats endpoint for authoritative counts
      let forumStats = null;
      try {
        forumStats = await knowledgeForumService.getStats();
      } catch (e) {
        console.warn('KnowledgeHubDashboard: forum stats endpoint not available', e);
      }

      // Derive active user approximation: unique authors across recent + trending
      const authorIds = new Set();
      [...recent, ...trending].forEach(a => {
        const id = a.author?.id || a.author_id;
        if (id) authorIds.add(id);
      });
      const derivedActiveUsers = authorIds.size;

      // Placeholder real-time users (remove hard-coded; show null if none)
      const derivedOnlineUsers = null; // Hook real-time service here later
      
  const totalTopics = forumStats?.total_topics ?? derivedTopics;
  const totalForums = forumStats?.total_forums ?? forumsList.length;
  const activeForums = forumStats?.active_forums ?? derivedActiveForums;
  const totalMembers = forumStats?.total_members ?? derivedMembers;

  console.log('Dashboard - Total topics calculated:', totalTopics);
      console.log('Dashboard - Total forums calculated:', (forumsRes?.results || []).length);
      
      setStats({
        totalArticles: getCount(allArticlesRes),
        totalForums,
        activeForums,
        totalTopics,
        totalMembers,
        totalViews,
        activeUsers: derivedActiveUsers || null,
        onlineUsers: derivedOnlineUsers
      });

    } catch (error) {
      console.error('Error loading knowledge hub data:', error);
      toast.error('Failed to load knowledge hub data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`${webRoutes.knowledgeSearch}?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Knowledge Hub</h1>
              <p className="text-gray-600 mt-1">Stay informed with industry insights, analysis, and discussions</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={webRoutes.knowledgeArticleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Write Article</span>
              </Link>
              <Link
                to={webRoutes.knowledgeForums}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Browse Forums</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles, discussions, and industry insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </div>
        </div>

  {/* Stats */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalArticles)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {/* Growth placeholder (hidden until comparative analytics implemented) */}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Discussion Forums</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalForums}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">{formatNumber(stats.totalTopics)} active topics</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Forums</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeForums}</p>
              </div>
              <div className="bg-teal-100 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">{stats.totalMembers} members</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalViews)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            {/* Views growth placeholder */}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers != null ? formatNumber(stats.activeUsers) : '—'}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">{stats.onlineUsers != null ? `${stats.onlineUsers} online now` : 'Realtime data pending'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Articles */}
            {featuredArticles.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Featured Articles</h2>
                    <Link to={webRoutes.knowledgeArticles} className="text-sm text-blue-600 hover:text-blue-700">
                      View All
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid gap-6">
                    {featuredArticles.slice(0, 2).map((article) => (
                      <div key={article.id} className="flex space-x-4">
                        {article.featured_image && (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600 font-medium">Featured</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm text-gray-500">{formatDate(article.published_at)}</span>
                          </div>
                          <Link
                            to={webRoutes.knowledgeArticleDetail.replace(':slug', article.slug)}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                          >
                            {article.title}
                          </Link>
                          <p className="text-gray-600 mt-2 line-clamp-2">{article.excerpt || 'No excerpt available'}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{formatNumber(article.views)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{formatNumber(article.likes)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-4 h-4" />
                              <span>{formatNumber(article.shares)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Featured Articles</h2>
                </div>
                <p className="text-sm text-gray-500">No featured articles available.</p>
              </div>
            )}

            {/* Trending Articles */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Trending This Week</h2>
                  <Link to={webRoutes.knowledgeArticles} className="text-sm text-blue-600 hover:text-blue-700">
                    View All
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {trendingArticles.length > 0 ? trendingArticles.slice(0, 5).map((article, index) => (
                  <div key={article.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <Link
                          to={webRoutes.knowledgeArticleDetail.replace(':slug', article.slug)}
                          className="text-base font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                        >
                          {article.title}
                        </Link>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>
                            By {(
                              article.author?.first_name || article.author?.last_name
                                ? `${article.author?.first_name || ''} ${article.author?.last_name || ''}`.trim()
                                : (article.author?.username || 'Unknown Author')
                            )}
                          </span>
                          <span>{formatDate(article.published_at)}</span>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{formatNumber(article.views)} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-6 text-sm text-gray-500">No trending articles yet.</div>
                )}
              </div>
            </div>

            {/* Recent Articles */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Articles</h2>
                  <Link to={webRoutes.knowledgeArticles} className="text-sm text-blue-600 hover:text-blue-700">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {recentArticles.length > 0 ? recentArticles.slice(0, 4).map((article) => (
                    <div key={article.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      {article.featured_image && (
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-32 rounded-lg object-cover mb-4"
                        />
                      )}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          {article.article_type}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(article.published_at)}</span>
                      </div>
                      <Link
                        to={webRoutes.knowledgeArticleDetail.replace(':slug', article.slug)}
                        className="text-base font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                      >
                        {article.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{article.excerpt || 'No excerpt available'}</p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{formatNumber(article.views)} views</span>
                          <span>{formatNumber(article.likes)} likes</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full text-sm text-gray-500">No recent articles found.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
              </div>
              <div className="p-6 space-y-3">
                {categories.length > 0 ? categories.slice(0, 8).map((category) => (
                  <Link
                    key={category.id}
                    to={webRoutes.knowledgeCategoryDetail.replace(':slug', category.slug)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                )) : (
                  <p className="text-sm text-gray-500">No categories available.</p>
                )}
                <Link
                  to={webRoutes.knowledgeCategories}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-4 block"
                >
                  View all categories
                </Link>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Popular Tags</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {popularTags.length > 0 ? popularTags.slice(0, 12).map((tag) => (
                    <Link
                      key={tag.id}
                      to={webRoutes.knowledgeTagDetail.replace(':slug', tag.slug)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                      <span className="ml-1 text-xs text-gray-500">({tag.usage_count})</span>
                    </Link>
                  )) : (
                    <p className="text-sm text-gray-500">No popular tags yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Active Forums */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Active Forums</h2>
                  <Link to={webRoutes.knowledgeForums} className="text-sm text-blue-600 hover:text-blue-700">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {forums.length > 0 ? forums.slice(0, 5).map((forum) => (
                  <Link
                    key={forum.id}
                    to={webRoutes.knowledgeForumDetail.replace(':slug', forum.slug)}
                    className="block p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{forum.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{forum.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{forum.topic_count} topics</div>
                        <div className="text-xs text-gray-500">{forum.post_count} posts</div>
                      </div>
                    </div>
                    {forum.latest_topic && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <MessageCircle className="w-3 h-3" />
                          <span className="truncate">Latest: {forum.latest_topic.title}</span>
                        </div>
                      </div>
                    )}
                  </Link>
                )) : (
                  <p className="text-sm text-gray-500">No forums available.</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to={webRoutes.knowledgeArticleCreate}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Write Article</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to={webRoutes.knowledgeForums}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Start Discussion</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  to={webRoutes.knowledgeSearch}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Search className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Advanced Search</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHubDashboard;
