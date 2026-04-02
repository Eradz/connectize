import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Article | Knowledge Hub - Connectize",
    description: "Read this in-depth article on oil and gas industry topics on Connectize Knowledge Hub.",
  keywords: "article, oil and gas knowledge, industry insights, Connectize",
  });

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
  BookOpen,
  User2
} from 'lucide-react';
import { toast } from 'sonner';
import { knowledgeArticleService } from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';

const KnowledgeArticleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
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
      setLiked(!!articleData.is_liked_by_user);
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
      setLoadingAction(true);
      await knowledgeArticleService.like(slug);
      setLoadingAction(false);
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
      // Call backend to track share
      const response = await knowledgeArticleService.share(slug);
      const shareData = response?.data || response;
      
      // Update local share count
      setArticle(prev => ({
        ...prev,
        shares: shareData.shares || (prev.shares || 0) + 1
      }));

      // Try native share API
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } else {
        // Fallback to copying URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Article URL copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing article:', error);
      // If backend call failed, still try to copy URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Article URL copied to clipboard');
      } catch (clipboardError) {
        toast.error('Failed to share article');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Article not found</h3>
          <p className="mt-1 text-sm text-gray-500">The article you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Link
              to={webRoutes.knowledgeArticles}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-custom_yellow"
            >
              Browse Articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="bg-white md:bg-transparent px-4 md:px-0 py-6">
        {/* Header */}
        <div className="">
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
        <article className="bg-white rounded-lg overflow-hidden">
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

          <div className="md:p-8">
            {/* Article Header */}
            <header className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <span className="capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {article.article_type}
                </span>
                <span className="capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {article.status}
                </span>
                {article.category && (
                  <Link
                    to={webRoutes.knowledgeCategoryDetail.replace(':slug', article.category.slug)}
                    className="capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
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
              <div className="flex md:flex-row flex-col gap-4 md:items-center justify-between border-b border-gray-200 pb-6">
                <div className="flex items-center space-x-4 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">
                      {formatDate(article.published_at || article.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User2 className="h-5 w-5" />
                    <span className="text-sm">
                      {article.author ? `${article.author.first_name} ${article.author.last_name}` : 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm">
                      {Math.ceil(article.content?.trim().split(/\s+/).length / 200) || 1} min read
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 text-sm transition-colors ${
                      liked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${liked ? 'fill-current' : ''}`}
                      fill={liked ? 'currentColor' : 'none'}
                    />
                    <span>{article.likes || 0}</span>
                    <p>Likes</p>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{article.shares || 0}</span>
                    <p>Shares</p>
                  </button>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span>{article.views || 0}</span>
                    <p>Views</p>
                  </div>
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
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLike}
                    disabled={loadingAction}
                    className={`inline-flex items-center px-2 md:px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                      liked
                        ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`}
                      fill={liked ? 'currentColor' : 'none'}
                    />
                    {loadingAction && "Liking..." || 
                    <span>{liked ? 'Unlike' : 'Like'}</span>} 
                  </button>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center px-2 md:px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </button>
                </div>
                <Link
                  to={webRoutes.knowledgeArticles}
                  className="inline-flex items-center px-2 md:px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
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
