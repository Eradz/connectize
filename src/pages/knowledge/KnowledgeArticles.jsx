import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Heart,
  Share2,
  Clock,
  User,
  Tag,
  BookOpen,
  TrendingUp,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { knowledgeArticleService } from '../../api-services/oilgas';

const KnowledgeArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
  const response = await knowledgeArticleService.getAll();
  setArticles(response?.results || response?.data || response || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (articleSlug) => {
    try {
  await knowledgeArticleService.like(articleSlug);
      // Reload articles to update like count
      loadArticles();
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleShare = async (articleSlug) => {
    try {
  await knowledgeArticleService.share(articleSlug);
      // You might want to show a share dialog or copy link to clipboard
      console.log('Article shared successfully');
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || article.category === filterCategory;
    const matchesStatus = filterStatus === '' || article.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">Knowledge Articles</h1>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Active</span>
                </div>
                <p className="mt-2 text-gray-600">Browse And Manage Oil & Gas Industry Insights And Analysis</p>
              </div>
              <Link
                to="/knowledge/articles/create"
                className="bg-[#F1C644] hover:bg-[#E0B533] text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors font-medium"
              >
                <Plus className="h-5 w-5" />
                <span>Create Article</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-[#FFF1C6] rounded-lg mb-3">
                  <BookOpen className="h-6 w-6 text-gray-700" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{articles.length}</p>
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-[#FFF1C6] rounded-lg mb-3">
                  <TrendingUp className="h-6 w-6 text-gray-700" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {articles.filter(a => a.status === 'published').length}
                </p>
                <p className="text-sm font-medium text-gray-600">Published</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-[#FFF1C6] rounded-lg mb-3">
                  <Edit className="h-6 w-6 text-gray-700" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {articles.filter(a => a.status === 'draft').length}
                </p>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-[#FFF1C6] rounded-lg mb-3">
                  <Heart className="h-6 w-6 text-gray-700" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {articles.reduce((sum, article) => sum + (article.likes_count || 0), 0)}
                </p>
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-[667px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search Deal Rooms"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[196px]"
              >
                <option value="">All Categories</option>
                <option value="market_analysis">Market Analysis</option>
                <option value="technology">Technology</option>
                <option value="regulations">Regulations</option>
                <option value="sustainability">Sustainability</option>
                <option value="exploration">Exploration</option>
                <option value="production">Production</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[149px]"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              <button className="bg-[#F1C644] hover:bg-[#E0B533] text-gray-900 px-4 py-2 rounded-lg flex items-center justify-center transition-colors font-medium w-[116px]">
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex capitalize items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                      {article.status}
                    </span>
                    
                    {article.is_featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {article.excerpt || article.content?.substring(0, 150) + '...'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{article.author_name || 'Anonymous'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(article.slug)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">{article.likes_count || 0}</span>
                      </button>
                      
                      <button
                        onClick={() => handleShare(article.slug)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="text-sm">{article.shares_count || 0}</span>
                      </button>
                      
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">{article.views_count || 0}</span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/knowledge/articles/${article.slug}`}
                      className="px-4 py-2 bg-[#F1C644] hover:bg-[#E0B533] text-gray-900 text-sm font-medium rounded-lg transition-colors"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start sharing knowledge by creating your first article.
              </p>
              <div className="mt-6">
                <Link
                  to="/knowledge/articles/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Article
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

    
     {/* Mobile View */}
      <div className="lg:hidden bg-white min-h-screen">
        {/* Mobile Header */}
        <div className="bg-white px-4 py-4">
          <button onClick={() => window.history.back()} className="mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Knowledge Articles</h1>
              <p className="text-sm text-gray-600 mt-1">Browse And Manage Oil & Gas Industry Insights And Analysis</p>
            </div>
            <Link
              to="/knowledge/articles/create"
              className="w-10 h-10 bg-[#F1C644] rounded-lg flex items-center justify-center flex-shrink-0 ml-3"
            >
              <Plus className="w-5 h-5 text-gray-900" />
            </Link>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="w-12 h-12 bg-[#FFF1C6] rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-gray-900" />
              </div>
              <p className="text-2xl font-bold text-gray-900 text-center">{articles.length}</p>
              <p className="text-xs text-gray-600 mt-1 text-center">Total Articles</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="w-12 h-12 bg-[#FFF1C6] rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-gray-900" />
              </div>
              <p className="text-2xl font-bold text-gray-900 text-center">
                {articles.filter(a => a.status === 'published').length}
              </p>
              <p className="text-xs text-gray-600 mt-1 text-center">Published</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="w-12 h-12 bg-[#FFF1C6] rounded-xl flex items-center justify-center mx-auto mb-3">
                <Edit className="w-6 h-6 text-gray-900" />
              </div>
              <p className="text-2xl font-bold text-gray-900 text-center">
                {articles.filter(a => a.status === 'draft').length}
              </p>
              <p className="text-xs text-gray-600 mt-1 text-center">Drafts</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="w-12 h-12 bg-[#FFF1C6] rounded-xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-gray-900" />
              </div>
              <p className="text-2xl font-bold text-gray-900 text-center">
                {articles.reduce((sum, article) => sum + (article.likes_count || 0), 0)}
              </p>
              <p className="text-xs text-gray-600 mt-1 text-center">Total Likes</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search Deal Rooms"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400"
              />
            </div>
            <button className="w-12 h-12 bg-[#F1C644] rounded-xl flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5 text-gray-900" />
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm appearance-none pr-10"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm appearance-none pr-10"
              >
                <option value="">All Categories</option>
                <option value="market_analysis">Market Analysis</option>
                <option value="technology">Technology</option>
                <option value="regulations">Regulations</option>
                <option value="sustainability">Sustainability</option>
                <option value="exploration">Exploration</option>
                <option value="production">Production</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Mobile Articles List */}
        <div className="px-4 pb-6 space-y-3">
          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-sm text-gray-500 mb-4">
                Start sharing knowledge by creating your first article.
              </p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                    Public
                  </span>
                </div>

                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {article.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {article.excerpt || article.content?.substring(0, 100) + '...'}
                </p>

                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="h-4 w-4 mr-1.5" />
                    <span>{article.author_name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span>{new Date(article.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <button
                      onClick={() => handleLike(article.slug)}
                      className="flex items-center gap-1"
                    >
                      <Heart className="h-4 w-4" />
                      <span>{article.likes_count || 1}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span>{article.shares_count || 3}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.views_count || 0}</span>
                    </div>
                    <button
                      onClick={() => handleShare(article.slug)}
                      className="flex items-center gap-1"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>0</span>
                    </button>
                  </div>
                  
                  <Link
                    to={`/knowledge/articles/${article.slug}`}
                    className="px-4 py-2 bg-[#F1C644] text-gray-900 text-xs font-medium rounded-lg"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeArticles;
