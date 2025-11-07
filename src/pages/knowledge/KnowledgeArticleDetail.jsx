import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Eye,
  Heart,
  Share2,
  User,
  Tag,
  Clock,
  Edit,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { knowledgeArticleService } from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';

const KnowledgeArticleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await knowledgeArticleService.getById(slug);
      const articleData = response?.data || response;
      setArticle(articleData);
      setLiked(articleData.is_liked || false);
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error('Article not found');
      navigate(webRoutes.knowledgeArticles);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await knowledgeArticleService.like(slug);
      setLiked(!liked);
      // Update likes count
      setArticle(prev => ({
        ...prev,
        likes: liked ? prev.likes - 1 : prev.likes + 1
      }));
      toast.success(liked ? 'Article unliked' : 'Article liked');
    } catch (error) {
      console.error('Error liking article:', error);
      toast.error('Failed to like article');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Article URL copied to clipboard');
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Article not found</h3>
          <p className="mt-1 text-sm text-gray-500">The article you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Link
              to={webRoutes.knowledgeArticles}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </button>
          </div>
        </div>

        {/* Article Content */}
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Featured Image */}
          {article.featured_image && (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Article Header */}
            <header className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {article.article_type}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {article.status}
                </span>
                {article.category && (
                  <Link
                    to={webRoutes.knowledgeCategoryDetail.replace(':slug', article.category.slug)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    {article.category.name}
                  </Link>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>

              <p className="text-xl text-gray-600 mb-6">
                {article.excerpt}
              </p>

              {/* Author and Meta */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {article.author ? `${article.author.first_name} ${article.author.last_name}` : 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {formatDate(article.published_at || article.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {Math.ceil(article.content?.length / 1000) || 1} min read
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span>{article.views || 0}</span>
                  </div>
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 text-sm transition-colors ${
                      liked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                    <span>{article.likes || 0}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{article.shares || 0}</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: article.content || 'No content available' }} />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Link
                        key={index}
                        to={webRoutes.knowledgeTagDetail?.replace(':slug', tag.slug) || '#'}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {tag.name || tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                      liked
                        ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                    {liked ? 'Unlike' : 'Like'} Article
                  </button>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </button>
                </div>
                <Link
                  to={webRoutes.knowledgeArticles}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  More Articles
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-center">Related articles will be shown here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeArticleDetail;
