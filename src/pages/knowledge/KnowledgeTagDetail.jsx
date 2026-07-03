import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Tag,
  ArrowLeft,
  Eye,
  Heart,
  Share2,
  Calendar,
  BookOpen,
  TrendingUp,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { knowledgeTagService, knowledgeArticleService } from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';
import { toast } from 'sonner';
import ArticleAuthorByline from '../../components/knowledge/ArticleAuthorByline';

const KnowledgeTagDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tag, setTag] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'popular', 'trending'

  useEffect(() => {
    loadTagAndArticles();
  }, [slug]);

  const loadTagAndArticles = async () => {
    try {
      setLoading(true);
      
      // Load tag details
      const tagResponse = await knowledgeTagService.getBySlug(slug);
      const tagData = tagResponse?.data || tagResponse;
      setTag(tagData);

      // Load articles with this tag
      const articleParams = { tags: slug, status: 'published', page_size: 100 };
      const articlesResponse = await knowledgeArticleService.getAll(undefined, undefined, articleParams);
      const articlesData = articlesResponse?.results || articlesResponse?.data || articlesResponse || [];
      setArticles(articlesData);
    } catch (error) {
      console.error('Error loading tag and articles:', error);
      toast.error('Failed to load tag details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (articleSlug, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await knowledgeArticleService.like(articleSlug);
      
      // Update local state - toggle like status and update count
      setArticles(prev => prev.map(article => {
        if (article.slug === articleSlug) {
          const isLiked = article.is_liked_by_user;
          return {
            ...article,
            is_liked_by_user: !isLiked,
            likes: isLiked ? Math.max((article.likes || 0) - 1, 0) : (article.likes || 0) + 1
          };
        }
        return article;
      }));
      
      toast.success('Article liked!');
    } catch (error) {
      console.error('Failed to like article:', error);
      toast.error('Failed to like article');
    }
  };

  const handleShare = async (article, e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${webRoutes.knowledgeArticleDetail.replace(':slug', article.slug)}`;
    
    try {
      // Call backend to track share
      const response = await knowledgeArticleService.share(article.slug);
      const shareData = response?.data || response;
      
      // Update local share count
      setArticles(prev => 
        prev.map(a => 
          a.id === article.id 
            ? { ...a, shares: shareData.shares || (a.shares || 0) + 1 }
            : a
        )
      );

      // Try native share API
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: shareUrl,
        });
        toast.success('Article shared successfully!');
      } else {
        copyToClipboard(shareUrl);
      }
    } catch (error) {
      console.error('Error sharing article:', error);
      // Fallback to copying URL even if backend fails
      if (error.name !== 'AbortError') {
        copyToClipboard(shareUrl);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch((error) => {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    });
  };

  const formatDate = (dateString) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(new Date(dateString));
    } catch {
      return 'Unknown Date';
    }
  };

  const filteredArticles = articles
    .filter(article =>
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.views || 0) - (a.views || 0);
      } else if (sortBy === 'trending') {
        return (b.likes || 0) - (a.likes || 0);
      }
      // Default: recent
      return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at);
    });

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FFC000]"></div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tag Not Found</h2>
          <p className="text-gray-600 mb-6">The tag you're looking for doesn't exist.</p>
          <Link
            to={webRoutes.knowledgeHub}
            className="inline-flex items-center px-6 py-3 bg-[#FFC000] text-gray-900 font-semibold rounded-lg hover:bg-[#FFD43B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Knowledge Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-[#FFC000] rounded-lg">
                  <Tag className="w-6 h-6 text-gray-900" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 capitalize">
                  {tag.name}
                </h1>
              </div>
              {tag.description && (
                <p className="text-gray-600 ml-14">{tag.description}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6 ml-14 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{filteredArticles.length} Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>{tag.usage_count || 0} Total Uses</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC000] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC000] focus:border-transparent bg-white"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Most Liked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'No articles are tagged with this yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                to={webRoutes.knowledgeArticleDetail.replace(':slug', article.slug)}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group"
              >
                {/* Article Image */}
                {article.featured_image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Category Badge */}
                  {article.category_name && (
                    <span className="inline-block px-3 py-1 bg-[#FFC000]/10 text-[#FFC000] text-xs font-medium rounded-full mb-3">
                      {article.category_name}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FFC000] transition-colors">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt || 'No description available'}
                  </p>

                  {/* Author & Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <ArticleAuthorByline
                      article={article}
                      iconClassName="w-3 h-3"
                      linkable={false}
                    />
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(article.published_at || article.created_at)}</span>
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <button
                        onClick={(e) => handleLike(article.slug, e)}
                        className={`flex items-center gap-1 transition-colors ${
                          article.is_liked_by_user 
                            ? 'text-red-500' 
                            : 'hover:text-red-500'
                        }`}
                      >
                        <Heart 
                          className="w-4 h-4" 
                          fill={article.is_liked_by_user ? "currentColor" : "none"}
                        />
                        <span>{article.likes || 0}</span>
                      </button>
                      <button
                        onClick={(e) => handleShare(article, e)}
                        className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{article.shares || 0}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views || 0}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.reading_time || '5'} min
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeTagDetail;
