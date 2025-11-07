import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Search, 
  Filter, 
  Eye, 
  MessageSquare,
  Users,
  Calendar,
  TrendingUp,
  BookOpen,
  Hash,
  ThumbsUp,
  Clock,
  Grid,
  List,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  knowledgeCategoryService,
  knowledgeArticleService,
  knowledgeForumService,
  knowledgeForumTopicService
} from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';

const KnowledgeCategoryDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [forums, setForums] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState('all'); // all, articles, forums, topics
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  useEffect(() => {
    if (slug) {
      loadCategoryData();
    }
  }, [slug]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      
      // Load category info
      const categoryResponse = await knowledgeCategoryService.getById(slug);
      const categoryData = categoryResponse?.data || categoryResponse;
      setCategory(categoryData);

      // Load content for this category
      await Promise.all([
        loadArticles(categoryData.slug),
        loadForums(categoryData.slug),
        loadTopics(categoryData.slug)
      ]);

    } catch (error) {
      console.error('Error loading category:', error);
      toast.error('Failed to load category');
      navigate(webRoutes.knowledgeCategories);
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async (categorySlug) => {
    try {
      const response = await knowledgeArticleService.getAll({ category_slug: categorySlug });
      setArticles(response?.results || response?.data || response || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const loadForums = async (categorySlug) => {
    try {
      const response = await knowledgeForumService.getAll({ category_slug: categorySlug });
      setForums(response?.results || response?.data || response || []);
    } catch (error) {
      console.error('Error loading forums:', error);
    }
  };

  const loadTopics = async (categorySlug) => {
    try {
      const response = await knowledgeForumTopicService.getAll({ category_slug: categorySlug });
      setTopics(response?.results || response?.data || response || []);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const getFilteredContent = () => {
    let content = [];
    
    if (contentType === 'all' || contentType === 'articles') {
      content = [...content, ...articles.map(item => ({ ...item, type: 'article' }))];
    }
    if (contentType === 'all' || contentType === 'forums') {
      content = [...content, ...forums.map(item => ({ ...item, type: 'forum' }))];
    }
    if (contentType === 'all' || contentType === 'topics') {
      content = [...content, ...topics.map(item => ({ ...item, type: 'topic' }))];
    }

    // Filter by search term
    if (searchTerm) {
      content = content.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return content.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'article': return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'forum': return <Users className="h-5 w-5 text-green-500" />;
      case 'topic': return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default: return <Hash className="h-5 w-5 text-gray-500" />;
    }
  };

  const getContentLink = (item) => {
    switch (item.type) {
      case 'article': return webRoutes.knowledgeArticleDetail.replace(':slug', item.slug);
      case 'forum': return webRoutes.knowledgeForumDetail.replace(':slug', item.slug);
      case 'topic': return webRoutes.knowledgeForumTopicDetail.replace(':slug', item.slug);
      default: return '#';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
          <p className="text-gray-600 mb-4">The category you're looking for doesn't exist.</p>
          <Link 
            to={webRoutes.knowledgeCategories}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  const filteredContent = getFilteredContent();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              to={webRoutes.knowledgeCategories}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Categories
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: category.color || '#3B82F6' }}
              >
                {category.icon || category.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                <p className="mt-2 text-gray-600">{category.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to={webRoutes.knowledgeArticleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Link>
              <Link
                to={webRoutes.knowledgeForumCreate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Forum
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Articles</p>
                <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Forums</p>
                <p className="text-2xl font-bold text-gray-900">{forums.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Topics</p>
                <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-gray-900">{articles.length + forums.length + topics.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Content Type Filter */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                {[
                  { key: 'all', label: 'All Content' },
                  { key: 'articles', label: 'Articles' },
                  { key: 'forums', label: 'Forums' },
                  { key: 'topics', label: 'Topics' }
                ].map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setContentType(type.key)}
                    className={`px-4 py-2 text-sm font-medium ${
                      contentType === type.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* View Mode */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                to={getContentLink(item)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getContentIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {item.title || item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.description || item.excerpt || item.content?.substring(0, 100) + '...'}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredContent.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={getContentLink(item)}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getContentIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.title || item.name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description || item.excerpt || item.content?.substring(0, 200) + '...'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                        {item.views && (
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{item.views}</span>
                          </div>
                        )}
                        {item.likes && (
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span>{item.likes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <Hash className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No content found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search term.'
                : 'This category doesn\'t have any content yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeCategoryDetail;
