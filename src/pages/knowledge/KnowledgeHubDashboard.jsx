import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Eye,
  Heart,
  Share2,
  Search,
  Calendar,
  MessageCircle,
  Globe,
  Tag,
  Menu,
  ArrowLeft,
  Plus,
  X,
  BookOpen
} from 'lucide-react';
import SEO from '../../components/SEO';
import { getSEOConfig } from '../../lib/seoConfig';

import { webRoutes } from '../../lib/webRoutes';
import {
  knowledgeArticleService,
  knowledgeForumService,
  knowledgeCategoryService,
  knowledgeTagService
} from '../../api-services/oilgas';
import { toast } from 'sonner';
import Scroll from '../../components/Scroll';
import BackArrowButton from '../../components/BackArrowButton';

// Custom SVG Icons
const WriteArticleIcon = (props) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_496_6911)">
      <path
        d="M1 6H23C23.2652 6 23.5196 5.89464 23.7071 5.7071C23.8946 5.51957 24 5.26521 24 5C24 4.73478 23.8946 4.48043 23.7071 4.29289C23.5196 4.10536 23.2652 4 23 4H1C0.734784 4 0.48043 4.10536 0.292893 4.29289C0.105357 4.48043 0 4.73478 0 5C0 5.26521 0.105357 5.51957 0.292893 5.7071C0.48043 5.89464 0.734784 6 1 6Z"
        fill="#374957"
      />
      <path
        d="M5 9C4.73478 9 4.48043 9.10536 4.29289 9.29289C4.10536 9.48043 4 9.73478 4 10C4 10.2652 4.10536 10.5196 4.29289 10.7071C4.48043 10.8946 4.73478 11 5 11H19C19.2652 11 19.5196 10.8946 19.7071 10.7071C19.8946 10.5196 20 10.2652 20 10C20 9.73478 19.8946 9.48043 19.7071 9.29289C19.5196 9.10536 19.2652 9 19 9H5Z"
        fill="#374957"
      />
      <path
        d="M19 19H5C4.73478 19 4.48043 19.1054 4.29289 19.2929C4.10536 19.4804 4 19.7348 4 20C4 20.2652 4.10536 20.5196 4.29289 20.7071C4.48043 20.8947 4.73478 21 5 21H19C19.2652 21 19.5196 20.8947 19.7071 20.7071C19.8946 20.5196 20 20.2652 20 20C20 19.7348 19.8946 19.4804 19.7071 19.2929C19.5196 19.1054 19.2652 19 19 19Z"
        fill="#374957"
      />
      <path
        d="M23 14H1C0.734784 14 0.48043 14.1054 0.292893 14.2929C0.105357 14.4804 0 14.7348 0 15C0 15.2652 0.105357 15.5196 0.292893 15.7071C0.48043 15.8947 0.734784 16 1 16H23C23.2652 16 23.5196 15.8947 23.7071 15.7071C23.8946 15.5196 24 15.2652 24 15C24 14.7348 23.8946 14.4804 23.7071 14.2929C23.5196 14.1054 23.2652 14 23 14Z"
        fill="#374957"
      />
    </g>
    <defs>
      <clipPath id="clip0_496_6911">
        <rect width={24} height={24} fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const StartDiscussionIcon = (props) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M24 15.9996V20.9996C24 21.7953 23.6839 22.5584 23.1213 23.121C22.5587 23.6836 21.7956 23.9996 21 23.9996H16C14.5971 23.9982 13.2192 23.6279 12.0047 22.9258C10.7901 22.2237 9.78145 21.2146 9.08 19.9996C9.83387 19.9943 10.5852 19.9111 11.322 19.7516C11.8832 20.4533 12.595 21.0197 13.4048 21.4088C14.2146 21.798 15.1016 21.9999 16 21.9996H21C21.2652 21.9996 21.5196 21.8943 21.7071 21.7068C21.8946 21.5192 22 21.2649 22 20.9996V15.9996C21.9998 15.1009 21.7972 14.2137 21.4074 13.4039C21.0175 12.5941 20.4504 11.8824 19.748 11.3216C19.9088 10.585 19.9933 9.83366 20 9.07965C21.215 9.7811 22.2241 10.7897 22.9262 12.0043C23.6282 13.2189 23.9986 14.5967 24 15.9996ZM17.977 9.65065C18.0705 8.36229 17.8856 7.06889 17.4348 5.85834C16.9841 4.6478 16.278 3.54847 15.3646 2.63506C14.4512 1.72166 13.3518 1.01558 12.1413 0.564802C10.9308 0.114026 9.63736 -0.0708809 8.349 0.0226448C6.06592 0.283377 3.95693 1.36982 2.41918 3.07739C0.881427 4.78496 0.0210272 6.99582 0 9.29365L0 14.3336C0 16.8656 1.507 17.9996 3 17.9996H8.7C10.9988 17.9799 13.211 17.12 14.9198 15.5822C16.6286 14.0444 17.7159 11.9347 17.977 9.65065ZM13.95 4.05065C14.6599 4.76215 15.2088 5.61784 15.5593 6.55983C15.9099 7.50182 16.054 8.50812 15.982 9.51065C15.7686 11.2943 14.9105 12.9385 13.5693 14.1336C12.2282 15.3287 10.4964 15.9924 8.7 15.9996H3C2.072 15.9996 2 14.7246 2 14.3336V9.29365C2.00834 7.49802 2.67265 5.76735 3.86792 4.42732C5.06319 3.0873 6.70699 2.23031 8.49 2.01764C8.656 2.00564 8.822 1.99964 8.988 1.99964C9.90927 1.99879 10.8217 2.17948 11.6731 2.5314C12.5245 2.88332 13.2982 3.39957 13.95 4.05065Z"
      fill="#374957"
    />
  </svg>
);
const KnowledgeHubDashboard = () => {
  const seoData = getSEOConfig("knowledgeHub");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('trending');
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [forums, setForums] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);

  const normalizeArray = useCallback((res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.results)) return res.results;
    if (Array.isArray(res.data)) return res.data;
    return [];
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        featuredRes,
        trendingRes,
        recentRes,
        forumsRes,
        categoriesRes,
        tagsRes
      ] = await Promise.all([
        knowledgeArticleService.getFeatured(),
        knowledgeArticleService.getTrending(),
        knowledgeArticleService.getAll({ page_size: 6, status: 'published' }),
        knowledgeForumService.getAll(),
        knowledgeCategoryService.getAll(),
        knowledgeTagService.getPopular()
      ]);

      setFeaturedArticles(normalizeArray(featuredRes));
      setTrendingArticles(normalizeArray(trendingRes));
      setRecentArticles(normalizeArray(recentRes));
      setForums(normalizeArray(forumsRes));
      setCategories(normalizeArray(categoriesRes));
      // Filter out tags with 0 usage_count
      const tagsWithArticles = normalizeArray(tagsRes).filter(tag => tag.usage_count > 0);
      setPopularTags(tagsWithArticles);
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

  const handleLike = async (articleSlug, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      
      // Update local state - toggle like status and update count
      const updateArticles = (articles) => 
        articles.map(article => {
          if (article.slug === articleSlug) {
            const isLiked = article.is_liked_by_user;
            return {
              ...article,
              is_liked_by_user: !isLiked,
              likes: isLiked ? Math.max((article.likes || 0) - 1, 0) : (article.likes || 0) + 1
            };
          }
          return article;
        });
        
        setFeaturedArticles(updateArticles);
        setTrendingArticles(updateArticles);
        setRecentArticles(updateArticles);
        await knowledgeArticleService.like(articleSlug);
      
      // toast.success('Article liked!');
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
      
      // Update share count in all article lists
      const updateArticles = (articles) => 
        articles.map(a => 
          a.id === article.id 
            ? { ...a, shares: shareData.shares || (a.shares || 0) + 1 }
            : a
        );
      setFeaturedArticles(updateArticles);
      setTrendingArticles(updateArticles);
      setRecentArticles(updateArticles);

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
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(dateString));
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen  p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-300 h-64 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
      />
      {/* Header - Desktop */}
      <div className="hidden md:block ">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Knowledge Hub</h1>
          <p className="text-sm text-gray-500">
            Stay Informed With Industry Insights, Analysis And Discussion
          </p>
        </div>
      </div>

      {/* Header - Mobile */}
      <div className="md:hidden bg-white px-4 py-4">
        <BackArrowButton className={"w-fit"} />
        <h1 className="text-xl font-bold text-gray-900 mb-1">Knowledge Hub</h1>
        <p className="text-sm text-gray-500">
          Stay Informed With Industry Insights, Analysis And Discussion
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-0">
        {/* Featured Articles - Desktop */}
        <div className="hidden md:block mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Featured Articles</h2>
            <Scroll>
              <div className='flex gap-2 min-w-min'>
            {recentArticles.map((article, index) => (
              <Link
                key={article.id || index}
                to={webRoutes.knowledgeArticleDetail.replace(':slug', article.slug)}
                className="relative rounded-2xl overflow-hidden h-52 group md:w-[600px]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: article.featured_image
                      ? `url(${article.featured_image})`
                      : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        index === 0
                          ? 'rgba(0, 0, 0, 0.5)'
                          : 'rgba(37, 99, 235, 0.7)'
                    }}
                  ></div>
                </div>

                <div className="relative h-full flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                      Published
                    </span>
                    <div className="flex items-center space-x-3 text-white text-xs">
                      <button
                        onClick={(e) => handleLike(article.slug, e)}
                        className={`flex items-center space-x-1 hover:scale-110 transition-transform ${
                          article.is_liked_by_user ? 'text-red-500' : 'text-white'
                        }`}
                      >
                        <Heart 
                          className="w-3.5 h-3.5" 
                          fill={article.is_liked_by_user ? "currentColor" : "none"}
                        />
                        <span>{article.likes || 0}</span>
                      </button>
                      <button
                        onClick={(e) => handleShare(article, e)}
                        className="flex items-center space-x-1 hover:scale-110 transition-transform"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{article.shares || 0}</span>
                      </button>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{article.views || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-white/90 text-xs mb-4 line-clamp-1">
                      {article.excerpt || 'Latest Developments In The Global Oil And Gas Industry'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-white/90 text-xs">
                        <div className="flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {article.author?.first_name || article.author?.last_name
                              ? `${article.author.first_name || ''} ${article.author.last_name || ''}`.trim()
                              : 'Anonymous'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                      </div>

                      <button className="bg-yellow-400 text-gray-900 px-5 py-1.5 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors">
                        Read More
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
              </div>
            </Scroll>
        </div>

        {/* Featured Article - Mobile */}
        <div className="md:hidden mb-6">
          <Scroll>
           <div className='flex gap-2 min-w-min'>
          {recentArticles.map((article, index) => (
            <Link
              key={article.id || index}
              to={webRoutes.knowledgeArticleDetail.replace(':slug', article.slug)}
              className="relative rounded-2xl overflow-hidden block w-[340px]"
              style={{ height: '280px' }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: article.featured_image
                    ? `url(${article.featured_image})`
                    : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                ></div>
              </div>

              <div className="relative h-full flex flex-col justify-between p-4">
                <div className="flex items-start justify-between">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white text-gray-700">
                    <Globe className="w-3 h-3 mr-1" />
                    Published
                  </span>
                </div>

                <div className=''>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-white/90 text-xs mb-3 line-clamp-2">
                    {article.excerpt || 'Latest Developments In The Global Oil And Gas Industry'}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 text-white/90 text-xs">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>
                          {article.author?.first_name || article.author?.last_name
                            ? `${article.author.first_name || ''} ${article.author.last_name || ''}`.trim()
                            : 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-white text-xs">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{article.likes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{article.shares || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{article.views || 0}</span>
                      </div>
                    </div>

                    <button className="bg-yellow-400 text-gray-900 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-500 transition-colors">
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
            </div> 
          </Scroll>
        </div>

        {/* Quick Action - Desktop */}
        <div className="hidden md:flex w-full flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-semibold text-[#1E1E1E]">Quick Action</h2>

          <div className="flex flex-wrap items-center gap-3">
            <Link to={webRoutes.knowledgeArticleCreate} className="h-9 px-5 flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-sm text-[#1E1E1E] hover:bg-gray-50 transition">
              <WriteArticleIcon className="w-5 h-5" />
              Write Article
            </Link>

            <Link to={webRoutes.knowledgeForumCreate} className="h-9 px-5 flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-sm text-[#1E1E1E] hover:bg-gray-50 transition">
              <StartDiscussionIcon className="w-5 h-5" />
              Start Discussion
            </Link>

            <Link to={webRoutes.knowledgeSearch} className="h-9 px-5 flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-sm text-[#1E1E1E] hover:bg-gray-50 transition">
              <Search className="w-5 h-5" />
              Advance Search
            </Link>
          </div>
        </div>

        {/* Quick Action - Mobile with Dropdown */}
        <div className="md:hidden mb-6 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#1E1E1E]">Quick Action</h2>
            <button
              onClick={() => setQuickActionOpen(!quickActionOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#F2C94C] text-gray-900 hover:bg-yellow-500 transition-colors"
            >
              {quickActionOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>

          {quickActionOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <Link to={webRoutes.knowledgeArticleCreate} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <WriteArticleIcon className="w-5 h-5" />
                Write Article
              </Link>

              <Link to={webRoutes.knowledgeForumCreate} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <StartDiscussionIcon className="w-5 h-5" />
                Start Discussion
              </Link>

              <Link to={webRoutes.knowledgeSearch} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Search className="w-5 h-5" />
                Advance Search
              </Link>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center flex-1 h-12 border border-gray-300 rounded-lg px-4 bg-white">
              <Search className="w-5 h-10 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search articles, forums, and more..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="h-12 px-8 bg-[#F2C94C] text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Categories - Mobile Only (moved here) */}
        <div className="md:hidden mb-8">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
              <Link to={webRoutes.knowledgeCategories} className="text-sm font-medium underline hover:text-gray-700">
                See All
              </Link>
            </div>
            <div className="p-6 space-y-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to={webRoutes.knowledgeCategoryDetail.replace(':slug', category.slug)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color || '#3b82f6' }}
                  ></div>
                  <span className="text-sm text-gray-900 group-hover:text-blue-600">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trending / Recent Articles */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Trending</h2>
                <Link to={webRoutes.knowledgeArticles} className="text-sm font-medium underline hover:text-gray-700">
                  See All
                </Link>
              </div>

              <div className="border-b border-gray-200">
                <div className="flex">
                  {['trending', 'recent'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-6 py-3 text-sm font-medium capitalize transition-colors relative ${
                        activeTab === tab ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {(activeTab === 'trending' ? trendingArticles : recentArticles).length > 0 ? (
                  (activeTab === 'trending' ? trendingArticles : recentArticles)
                    .slice(0, 5)
                    .map((article) => (
                      <div key={article.id} className="p-6 bg-white hover:bg-gray-50 transition-colors">
                        <div className="mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                            Published
                          </span>
                        </div>

                        <Link
                          to={webRoutes.knowledgeArticleDetail.replace(':slug', article.slug)}
                          className="block mb-3"
                        >
                          <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 line-clamp-2 mb-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {article.excerpt || 'Latest Developments In The Global Oil And Gas'}
                          </p>
                        </Link>

                        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex flex-col md:flex-row md:items-center items-start gap-1.5 md:gap-4">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              <span>
                                {article.author?.first_name || article.author?.last_name
                                  ? `${article.author.first_name || ''} ${article.author.last_name || ''}`.trim()
                                  : 'Anonymous'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(article.published_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <button
                              onClick={(e) => handleLike(article.slug, e)}
                              className={`flex items-center gap-1.5 transition-colors ${
                                article.is_liked_by_user 
                                  ? 'text-red-500' 
                                  : 'hover:text-red-500'
                              }`}
                            >
                              <Heart 
                                className="w-4 h-4" 
                                fill={article.is_liked_by_user ? "currentColor" : "none"}
                              />
                              <span>{article.likes || 1}</span>
                            </button>
                            <button
                              onClick={(e) => handleShare(article, e)}
                              className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                              <span>{article.shares || 0}</span>
                            </button>
                            <div className="flex items-center gap-1.5">
                              <Eye className="w-4 h-4" />
                              <span>{article.views || 0}</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(webRoutes.knowledgeArticleDetail.replace(':slug', article.slug));
                            }}
                            className="bg-[#F2C94C] text-gray-900 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors"
                          >
                            Read More
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No {activeTab === 'trending' ? 'Trending' : 'Recent'} Articles
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                      {activeTab === 'trending' 
                        ? "No trending articles at the moment. Check back soon for popular content!"
                        : "No recent articles yet. Be the first to write one!"}
                    </p>
                    <Link
                      to={webRoutes.knowledgeArticleCreate}
                      className="inline-flex items-center gap-2 bg-[#F2C94C] text-gray-900 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Write Article
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Active Forums */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Active Forums</h2>
                <Link to={webRoutes.knowledgeForums} className="text-sm font-medium underline hover:text-gray-700">
                  See All
                </Link>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {forums.slice(0, 4).map((forum) => (
                    <div
                      key={forum.id}
                      className="border border-gray-200 rounded-xl p-5 flex flex-col h-full bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-gray-700" />
                          <h3 className="font-semibold text-base text-gray-900">{forum.name}</h3>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md flex-shrink-0">
                          Public
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                        {forum.description || 'Join the discussion on industry trends, insights, and networking.'}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4" />
                          <span>{forum.topic_count || 0} Topics</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>{forum.members_count || 0} Members</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(forum.created_at)}</span>
                        </div>
                      </div>

                      <Link
                        to={webRoutes.knowledgeForumDetail.replace(':slug', forum.slug)}
                        className="mt-auto block w-full bg-[#F2C94C] text-gray-900 text-center py-2.5 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors"
                      >
                        Enter Forum
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block space-y-8">
            {/* Categories */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
                <Link to={webRoutes.knowledgeCategories} className="text-sm font-medium underline hover:text-gray-700">
                  See All
                </Link>
              </div>
              <div className="p-6 space-y-4">
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category.id}
                    to={webRoutes.knowledgeCategoryDetail.replace(':slug', category.slug)}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    ></div>
                    <span className="text-sm text-gray-900 group-hover:text-blue-600">
                      {category.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Popular Tags</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {popularTags.slice(0, 15).map((tag) => (
                    <Link
                      key={tag.id}
                      to={webRoutes.knowledgeTagDetail.replace(':slug', tag.slug)}
                      className="capitalize inline-flex items-center px-3 py-1.5 rounded-full text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                      <span className="ml-1 text-gray-500">({tag.usage_count || 0})</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHubDashboard;