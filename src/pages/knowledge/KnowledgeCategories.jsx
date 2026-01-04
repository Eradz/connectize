import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Hash,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Users,
  Calendar,
  List,
  Grid3x3,
  Filter as FilterIcon
} from 'lucide-react';
import { knowledgeCategoryService } from '../../api-services/oilgas';

const KnowledgeCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    loadCategories();
  }, []);

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

  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalCategories = categories.length;
  const totalArticles = categories.reduce((sum, cat) => sum + (cat.articles_count || 0), 0);
  const totalForums = categories.reduce((sum, cat) => sum + (cat.forums_count || 0), 0);
  const activeCategories = categories.filter(cat => cat.is_active !== false).length;

  const getCategoryIcon = (index) => {
    const icons = [BookOpen, MessageSquare, TrendingUp, Users];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Knowledge Categories</h1>
          <p className="mt-2 text-gray-600">Explore Topics Organized By Industry Categories</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Total Categories */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-amber-100 rounded-lg mb-3">
                <List className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalCategories}</p>
              <p className="text-sm text-gray-600 mt-2">Total Categories</p>
            </div>
          </div>

          {/* Total Articles */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-blue-100 rounded-lg mb-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalArticles}</p>
              <p className="text-sm text-gray-600 mt-2">Total Articles</p>
            </div>
          </div>

          {/* Total Forums */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-green-100 rounded-lg mb-3">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalForums}</p>
              <p className="text-sm text-gray-600 mt-2">Total Forums</p>
            </div>
          </div>

          {/* Active Categories */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-purple-100 rounded-lg mb-3">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{activeCategories}</p>
              <p className="text-sm text-gray-600 mt-2">Active Categories</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex gap-4 items-center mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Active Categories Header */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Categories</h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCategories.map((category, index) => (
            <div 
              key={category.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              {/* Card Content */}
              <div className="p-6">
                {/* Icon and Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    {getCategoryIcon(index)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                  {category.description || 'No description available'}
                </p>

                {/* Articles and Forums Count */}
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                  <span className="text-amber-600 font-medium">
                    {category.articles_count || 0} Articles
                  </span>
                  <span className="text-amber-600 font-medium">
                    {category.forums_count || 0} Forums
                  </span>
                </div>

                {/* Explore Button */}
                <Link
                  to={`/knowledge/categories/${category.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors duration-200"
                >
                  <span>Explore</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Hash className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms.'
                : 'Categories will appear here to help organize content.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeCategories;
