import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';

// Mock data for demonstration
const mockArticles = [
  {
    id: 1,
    slug: 'oil-market-update-5',
    title: 'Oil Market Update #5',
    content: 'Latest Developments In The Global Oil And Gas Industry',
    excerpt: 'Latest Developments In The Global Oil And Gas Industry',
    status: 'published',
    author_name: 'Anonymous',
    created_at: '2025-08-24',
    likes_count: 1,
    shares_count: 0,
    views_count: 0,
    is_featured: false,
    tags: []
  },
  {
    id: 2,
    slug: 'oil-market-update-6',
    title: 'Oil Market Update #5',
    content: 'Latest Developments In The Global Oil And Gas Industry',
    excerpt: 'Latest Developments In The Global Oil And Gas Industry',
    status: 'published',
    author_name: 'Anonymous',
    created_at: '2025-08-24',
    likes_count: 1,
    shares_count: 0,
    views_count: 0,
    is_featured: false,
    tags: []
  },
  {
    id: 3,
    slug: 'oil-market-update-7',
    title: 'Oil Market Update #5',
    content: 'Latest Developments In The Global Oil And Gas Industry',
    excerpt: 'Latest Developments In The Global Oil And Gas Industry',
    status: 'published',
    author_name: 'Anonymous',
    created_at: '2025-08-24',
    likes_count: 1,
    shares_count: 0,
    views_count: 0,
    is_featured: false,
    tags: []
  },
  {
    id: 4,
    slug: 'oil-market-update-8',
    title: 'Oil Market Update #5',
    content: 'Latest Developments In The Global Oil And Gas Industry',
    excerpt: 'Latest Developments In The Global Oil And Gas Industry',
    status: 'published',
    author_name: 'Anonymous',
    created_at: '2025-08-24',
    likes_count: 1,
    shares_count: 0,
    views_count: 0,
    is_featured: false,
    tags: []
  }
];

const KnowledgeArticles = () => {
  const [articles, setArticles] = useState(mockArticles);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const handleLike = async (articleSlug) => {
    console.log('Like article:', articleSlug);
  };

  const handleShare = async (articleSlug) => {
    console.log('Share article:', articleSlug);
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
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 lg:gap-3 mb-2">
                <button className="lg:hidden text-gray-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Knowledge Articles</h1>
              </div>
              <p className="text-sm lg:text-base text-gray-600">Browse And Manage Oil & Gas Industry Insights And Analysis</p>
            </div>
            <button className="p-2 lg:px-4 lg:py-2 rounded-lg flex items-center space-x-2 transition-colors font-medium ml-2" style={{ backgroundColor: '#FFE7A4', color: '#1f2937' }}>
              <Plus className="h-5 w-5" />
              <span className="hidden lg:inline">Create Article</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 lg:p-3 bg-yellow-50 rounded-lg mb-2 lg:mb-3">
                <FileText className="h-5 w-5 lg:h-8 lg:w-8" style={{ color: '#374957' }} />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{articles.length}</p>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Total Articles</p>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 lg:p-3 bg-yellow-50 rounded-lg mb-2 lg:mb-3">
                <TrendingUp className="h-5 w-5 lg:h-8 lg:w-8" style={{ color: '#374957' }} />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                {articles.filter(a => a.status === 'published').length}
              </p>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Published</p>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 lg:p-3 bg-yellow-50 rounded-lg mb-2 lg:mb-3">
                <Edit className="h-5 w-5 lg:h-8 lg:w-8" style={{ color: '#374957' }} />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                {articles.filter(a => a.status === 'draft').length}
              </p>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Drafts</p>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 lg:p-3 bg-yellow-50 rounded-lg mb-2 lg:mb-3">
                <Heart className="h-5 w-5 lg:h-8 lg:w-8" style={{ color: '#374957' }} />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                {articles.reduce((sum, article) => sum + (article.likes_count || 0), 0)}
              </p>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Total Likes</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* Mobile: Stacked layout, Desktop: Search bar first */}
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            <div className="flex gap-3 flex-1 lg:order-1">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search Deal Rooms"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button className="p-2 lg:hidden rounded-lg font-medium transition-colors flex items-center justify-center shrink-0" style={{ backgroundColor: '#F1C644', color: '#1f2937' }}>
                <Search className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex gap-3 lg:order-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 lg:flex-none px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                className="flex-1 lg:flex-none px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <button className="hidden lg:flex px-6 py-2 rounded-lg font-medium transition-colors items-center justify-center shrink-0 lg:order-3" style={{ backgroundColor: '#F1C644', color: '#1f2937' }}>
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Articles Grid - 2 Columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className={`inline-flex items-center px-2.5 lg:px-3 py-1 rounded text-xs font-medium ${getStatusColor(article.status)}`}>
                  {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                </span>
              </div>

              <h3 className="text-base lg:text-xl font-semibold text-gray-900 mb-2">
                {article.title}
              </h3>
              
              <p className="text-gray-600 text-xs lg:text-sm mb-3 lg:mb-4">
                {article.excerpt || article.content}
              </p>

              <div className="flex items-center justify-between text-xs lg:text-sm text-gray-500 mb-3 lg:mb-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-0">
                  <div className="flex items-center">
                    <User className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1" />
                    <span>{article.author_name || 'Anonymous'}</span>
                  </div>
                  
                  <div className="flex items-center lg:hidden">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="hidden lg:flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 lg:pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <button
                    onClick={() => handleLike(article.slug)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    <span className="text-xs lg:text-sm">{article.likes_count || 0}</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare(article.slug)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    <span className="text-xs lg:text-sm">{article.shares_count || 0}</span>
                  </button>
                  
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    <span className="text-xs lg:text-sm">{article.views_count || 0}</span>
                  </div>
                </div>
                
                <button className="px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors" style={{ backgroundColor: '#F1C644', color: '#1f2937' }}>
                  Read More
                </button>
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
              <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeArticles;