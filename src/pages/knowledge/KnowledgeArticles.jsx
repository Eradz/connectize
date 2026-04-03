import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Articles | Knowledge Hub - Connectize",
    description: "Read expert articles about oil and gas industry trends, technologies, safety, and best practices on Connectize.",
  keywords: "oil and gas articles, industry knowledge, energy insights, technical articles",
  });

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/userContext';
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
  ChevronDown,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { knowledgeArticleService, knowledgeCategoryService } from '../../api-services/oilgas';

const KnowledgeArticles = () => {
  const { user: currentUser } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
  const [response, categoriesRes] = await Promise.all([knowledgeArticleService.getAll(), knowledgeCategoryService.getAll(),]);
      
      // Map is_liked_by_user to is_liked for consistency
      const articlesData = (response?.results || response?.data || response || []).map(article => ({
        ...article,
        is_liked: article.is_liked_by_user || false
      }));
      
  setArticles(articlesData);
  setCategories(categoriesRes?.results || categoriesRes?.data || categoriesRes || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (articleSlug, currentLikes, isLiked) => {
    // Optimistic UI update - instant feedback
    setArticles(prevArticles => 
      prevArticles.map(article => 
        article.slug === articleSlug 
          ? { 
              ...article, 
              likes: isLiked ? currentLikes - 1 : currentLikes + 1,
              is_liked: !isLiked,
              is_liked_by_user: !isLiked  // Update backend field too
            }
          : article
      )
    );

    try {
      const response = await knowledgeArticleService.like(articleSlug);
      
      // Sync with actual server state if response contains updated data
      if (response?.data) {
        setArticles(prevArticles => 
          prevArticles.map(article => 
            article.slug === articleSlug 
              ? { 
                  ...article, 
                  likes: response.data.likes || article.likes,
                  is_liked: response.data.is_liked_by_user || !isLiked,
                  is_liked_by_user: response.data.is_liked_by_user || !isLiked
                }
              : article
          )
        );
      }
      
      toast.success(isLiked ? 'Article unliked' : 'Article liked');
    } catch (error) {
      // Revert on error
      setArticles(prevArticles => 
        prevArticles.map(article => 
          article.slug === articleSlug 
            ? { 
                ...article, 
                likes: currentLikes,
                is_liked: isLiked,
                is_liked_by_user: isLiked
              }
            : article
        )
      );
      console.error('Error liking article:', error);
      toast.error('Failed to update like. Please try again.');
    }
  };

  const handleShare = async (article) => {
    const articleUrl = `${window.location.origin}/knowledge/articles/${article.slug}`;
    
    try {
      // Try native share API first (works on mobile and modern browsers)
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt || 'Check out this article',
          url: articleUrl,
        });
        
        // Call backend to increment share count
        await knowledgeArticleService.share(article.slug);
        
        // Update share count optimistically
        setArticles(prevArticles => 
          prevArticles.map(a => 
            a.slug === article.slug 
              ? { ...a, shares: (a.shares || 0) + 1 }
              : a
          )
        );
        
        toast.success('Article shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(articleUrl);
        
        // Call backend to increment share count
        await knowledgeArticleService.share(article.slug);
        
        // Update share count optimistically
        setArticles(prevArticles => 
          prevArticles.map(a => 
            a.slug === article.slug 
              ? { ...a, shares: (a.shares || 0) + 1 }
              : a
          )
        );
        
        toast.success('Article link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing article:', error);
        toast.error('Failed to share article');
      }
    }
  };

  // Open modal to confirm delete
  const openDeleteModal = (article) => {
    setArticleToDelete(article);
    setShowDeleteModal(true);
  };

  // Actually delete after confirmation
  const handleDelete = async () => {
    if (!articleToDelete) return;
    setDeletingId(articleToDelete.slug);
    try {
      await knowledgeArticleService.delete(articleToDelete.slug);
      setArticles(prevArticles => 
        prevArticles.filter(article => article.slug !== articleToDelete.slug)
      );
      toast.success('Article deleted successfully');
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setArticleToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setArticleToDelete(null);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = article.category_name === filterCategory || filterCategory === '' ;
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
                  {articles.reduce((sum, article) => sum + (article.likes || 0), 0)}
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
                  placeholder="Search Articles"
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
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
                {/*<option value="market_analysis">Market Analysis</option>
                <option value="technology">Technology</option>
                <option value="regulations">Regulations</option>
                <option value="sustainability">Sustainability</option>
                <option value="exploration">Exploration</option>
                <option value="production">Production</option> */}
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
                  {/* Header with status and action buttons */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex capitalize items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                        {article.status}
                      </span>
                      
                      {article.is_featured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    {/* Show edit/delete buttons only if current user is the author */}
                    {currentUser?.id === article.author?.id && (
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/knowledge/articles/${article.slug}/edit`}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                          title="Edit article"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(article)}
                          disabled={deletingId === article.slug}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete article"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {article.excerpt || article.content?.substring(0, 50) + '...'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{`${article.author.first_name} ${article.author.last_name} `|| 'Anonymous'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(article.slug, article.likes || 0, article.is_liked)}
                        className={`flex items-center space-x-1 transition-colors ${
                          article.is_liked 
                            ? 'text-red-500' 
                            : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${article.is_liked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{article.likes || 0}</span>
                      </button>
                      
                      <button
                        onClick={() => handleShare(article)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="text-sm">{article.shares || 0}</span>
                      </button>
                      
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">{article.views || 0}</span>
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
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gold/80 hover:bg-gold"
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
      <div className="lg:hidden bg-background  min-h-screen">
        {/* Mobile Header */}
        <div className="px-4 py-4">
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
                {articles.reduce((sum, article) => sum + (article.likes || 0), 0)}
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
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
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
                {/* Header with status and action buttons */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                    Public
                  </span>
                  
                  {/* Show edit/delete buttons only if current user is the author */}
                  {currentUser?.id === article.author?.id && (
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/knowledge/articles/${article.slug}/edit`}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                        title="Edit article"
                      >
                        <Edit className="h-3 w-3" />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(article)}
                        disabled={deletingId === article.slug}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete article"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
  
                    </div>
                  )}
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
                    <span>{`${article.author.first_name} ${article.author.last_name} `|| 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span>{new Date(article.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <button
                      onClick={() => handleLike(article.slug, article.likes || 0, article.is_liked)}
                      className={`flex items-center gap-1 transition-colors ${
                        article.is_liked 
                          ? 'text-red-500' 
                          : 'text-gray-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${article.is_liked ? 'fill-current' : ''}`} />
                      <span>{article.likes || 0}</span>
                    </button>
                    <button
                      onClick={() => handleShare(article)}
                      className="flex items-center gap-1"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>{article.shares || 0}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.views || 0}</span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/knowledge/articles/${article.slug}`}
                    className="px-3 py-1.5 bg-[#F1C644] text-gray-900 text-xs font-medium rounded"
                  >
                    Read
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Floating Delete Confirmation Modal */}
  {showDeleteModal && articleToDelete && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="relative w-full max-w-sm">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-7 animate-fadeInScale" style={{minWidth: '340px'}}>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Article</h3>
          <p className="text-gray-700 mb-4">Are you sure you want to delete <span className="font-bold">"{articleToDelete.title}"</span>? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={closeDeleteModal}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
              disabled={deletingId === articleToDelete.slug}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm disabled:opacity-50"
              disabled={deletingId === articleToDelete.slug}
            >
              {deletingId === articleToDelete.slug ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
      {/* Floating modal animation */}
      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95) translate(-50%, -48%); }
          100% { opacity: 1; transform: scale(1) translate(-50%, -50%); }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.22s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </div>
  )}
    </div>
  );
};

export default KnowledgeArticles;
