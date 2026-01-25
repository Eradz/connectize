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
import BackArrowButton from '../../components/BackArrowButton';

const KnowledgeCategoryDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState(null);
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
      loadCategories();
    }
  }, [slug]);
    const loadCategories = async () => {
      try {
        setLoading(true);
    const response = await knowledgeCategoryService.getAll();
    setCategories(response?.results || response?.data || response || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

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
      <div className="min-h-screen  flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className=" flex items-center gap-3">
          {/* Back Button */}
          <BackArrowButton />
          <div >
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Link
                to={webRoutes.knowledgeCategories}
                className="hover:text-gray-900 transition-colors"
              >
                Categories
              </Link>
              <span className="mx-2">›</span>
              <span className="text-gray-900">{category.name}</span>
            </div>
            
            {/* Title and Subtitle */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{category.name}</h1>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        </div> */}

        {/* Filters */}
          
        </div>

        <div className='bg-white p-4'>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              {/* Search and Filter */}
              <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-3 ">
                <div className="relative flex w-[70%]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder={`Search ${category.name}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter Dropdown */}
                <select 
                onChange={(e)=> {
                  if (e.target.value === 'all') {
                    navigate(webRoutes.knowledgeArticles);
                  } else {
                    navigate(`/knowledge/categories/${e.target.value}`);
                  }
                }}
                className="w-[30%] px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="all">All Categories</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Search Button */}
                <button className="px-6 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors">
                  Search
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'all', label: 'All Content' },
                  { key: 'articles', label: 'Article' },
                  { key: 'forums', label: 'Forum' },
                  { key: 'topics', label: 'Topics' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setContentType(tab.key)}
                    className={`py-2 px-1  font-medium text-sm transition-colors ${
                      contentType === tab.key
                        ? 'border-b-[2px] border-gray-900 text-gray-900 bg-gray-100'
                        : 'border-b-[1px] border-gray-300 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Cards Grid */}
          {articles.length === 0 && forums.length === 0 && topics.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-lg p-12 max-w-md mx-auto">
                <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Content Yet</h3>
                <p className="text-gray-600 mb-6">
                  This category doesn't have any articles, forums, or discussion topics yet. Be the first to contribute!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to={webRoutes.knowledgeArticleCreate}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-custom_yellow transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Write Article
                  </Link>
                  <Link
                    to={webRoutes.knowledgeForumCreate}
                    className="inline-flex items-center gap-2 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Forum
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.filter((item) => 
                  item.category_name === category?.name
                ).map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={getContentLink(item)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 flex flex-col"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title || item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {category?.name || category?.title || 'Knowledge Category'}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {item.type === 'article' ? 'Article' : item.type === 'forum' ? 'Forum' : item.type === 'topic' ? 'Topic' : item.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {filteredContent.filter((item) => item.category_name === category?.name).length === 0 && (
                <div className="text-center py-12">
                  <Hash className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No content found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm 
                      ? 'Try adjusting your search term.'
                      : 'No results match your current filters.'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <div>
      </div>
    </div>
  );
};

export default KnowledgeCategoryDetail;
