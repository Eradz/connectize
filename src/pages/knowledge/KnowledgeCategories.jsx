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
  Calendar
} from 'lucide-react';
import { knowledgeCategoryService } from '../../api-services/oilgas';

const KnowledgeCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const getCategoryColor = (index) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-gray-100 text-gray-800 border-gray-200'
    ];
    return colors[index % colors.length];
  };

  const getCategoryIcon = (index) => {
    const icons = [BookOpen, MessageSquare, TrendingUp, Users, Hash, Eye];
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Knowledge Categories</h1>
              <p className="mt-2 text-gray-600">Explore topics organized by industry categories</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Hash className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.reduce((sum, cat) => sum + (cat.articles_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forums</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.reduce((sum, cat) => sum + (cat.forums_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(cat => cat.is_active !== false).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category, index) => (
            <div key={category.id} className={`rounded-lg border-2 p-6 hover:shadow-md transition-shadow ${getCategoryColor(index)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="mr-3">
                    {getCategoryIcon(index)}
                  </div>
                  <h3 className="text-xl font-semibold">
                    <Link 
                      to={`/knowledge/categories/${category.slug}`}
                      className="hover:underline"
                    >
                      {category.name}
                    </Link>
                  </h3>
                </div>
              </div>

              <p className="text-sm mb-6 opacity-90">
                {category.description || 'No description available'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{category.articles_count || 0}</div>
                  <div className="text-xs opacity-75">Articles</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">{category.forums_count || 0}</div>
                  <div className="text-xs opacity-75">Forums</div>
                </div>
              </div>

              {category.latest_article && (
                <div className="border-t border-current border-opacity-20 pt-4">
                  <div className="text-xs opacity-75 mb-1">Latest Article:</div>
                  <Link 
                    to={`/knowledge/articles/${category.latest_article.slug}`}
                    className="text-sm font-medium hover:underline line-clamp-2"
                  >
                    {category.latest_article.title}
                  </Link>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(category.latest_article.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}

              {category.popular_tags && category.popular_tags.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs opacity-75 mb-2">Popular Tags:</div>
                  <div className="flex flex-wrap gap-1">
                    {category.popular_tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="inline-flex items-center px-2 py-1 rounded text-xs bg-white bg-opacity-50">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs opacity-75">
                  {category.created_at && (
                    <span>Created {new Date(category.created_at).toLocaleDateString()}</span>
                  )}
                </div>
                
                <Link
                  to={`/knowledge/categories/${category.slug}`}
                  className="text-sm font-medium hover:underline"
                >
                  Explore →
                </Link>
              </div>
            </div>
          ))}
        </div>

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

        {/* Popular Topics Section */}
        {categories.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Topics</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories
                  .sort((a, b) => (b.articles_count || 0) - (a.articles_count || 0))
                  .slice(0, 8)
                  .map((category, index) => (
                    <Link
                      key={category.id}
                      to={`/knowledge/categories/${category.slug}`}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${getCategoryColor(index).split(' ')[0]} ${getCategoryColor(index).split(' ')[1]}`}>
                          {getCategoryIcon(index)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">
                            {(category.articles_count || 0) + (category.forums_count || 0)} items
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeCategories;
