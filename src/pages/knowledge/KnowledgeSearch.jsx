import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  BookOpen,
  MessageSquare,
  Users,
  Calendar,
  TrendingUp,
  Hash,
  Clock
} from 'lucide-react';
import { knowledgeSearchService } from '../../api-services/oilgas';

const KnowledgeSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const performSearch = async (term = searchTerm) => {
    if (!term.trim()) return;
    
    try {
      setLoading(true);
      setSearchPerformed(true);
  const response = await knowledgeSearchService.search({
        q: term,
        type: searchType,
        sort: sortBy
      });
      setSearchResults(response.results || []);
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'article':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'forum':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'topic':
        return <Hash className="h-5 w-5 text-purple-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  const getResultTypeColor = (type) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 text-blue-800';
      case 'forum':
        return 'bg-green-100 text-green-800';
      case 'topic':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultLink = (result) => {
    switch (result.type) {
      case 'article':
        return `/knowledge/articles/${result.slug}`;
      case 'forum':
        return `/knowledge/forums/${result.slug}`;
      case 'topic':
        return `/knowledge/topics/${result.slug}`;
      default:
        return '#';
    }
  };

  const highlightSearchTerm = (text, term) => {
    if (!term || !text) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    const type = result.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(result);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Search</h1>
          <p className="mt-2 text-gray-600">Search across articles, forums, and discussions</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for articles, forums, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Content</option>
                <option value="articles">Articles Only</option>
                <option value="forums">Forums Only</option>
                <option value="topics">Topics Only</option>
              </select>

              <button
                type="submit"
                disabled={loading || !searchTerm.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            {searchPerformed && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {searchResults.length > 0 ? (
                    <>Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}"</>
                  ) : (
                    <>No results found for "{searchTerm}"</>
                  )}
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    if (searchTerm.trim()) performSearch();
                  }}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="date">Sort by Date</option>
                  <option value="popularity">Sort by Popularity</option>
                </select>
              </div>
            )}
          </form>
        </div>

        {/* Search Results */}
        {searchPerformed && (
          <div className="space-y-6">
            {Object.keys(groupedResults).length > 0 ? (
              Object.entries(groupedResults).map(([type, results]) => (
                <div key={type} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                      {type}s ({results.length})
                    </h3>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {results.map((result) => (
                      <div key={result.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            {getResultIcon(result.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-medium text-gray-900">
                                <Link 
                                  to={getResultLink(result)}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {highlightSearchTerm(result.title, searchTerm)}
                                </Link>
                              </h4>
                              
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultTypeColor(result.type)}`}>
                                {result.type}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-3">
                              {highlightSearchTerm(
                                result.excerpt || result.content?.substring(0, 200) + '...' || 'No description available',
                                searchTerm
                              )}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{result.author_name || 'Anonymous'}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{new Date(result.created_at).toLocaleDateString()}</span>
                              </div>
                              
                              {result.category && (
                                <div className="flex items-center">
                                  <Hash className="h-4 w-4 mr-1" />
                                  <span>{result.category}</span>
                                </div>
                              )}
                              
                              {result.views_count && (
                                <div className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1" />
                                  <span>{result.views_count} views</span>
                                </div>
                              )}
                            </div>

                            {result.tags && result.tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1">
                                {result.tags.slice(0, 4).map((tag, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find anything matching "{searchTerm}". Try:
                </p>
                <ul className="text-sm text-gray-500 space-y-1 mb-6">
                  <li>• Checking your spelling</li>
                  <li>• Using different keywords</li>
                  <li>• Using more general terms</li>
                  <li>• Searching for a different content type</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Search Suggestions */}
        {!searchPerformed && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Search Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Market Analysis',
                'Drilling Technology',
                'Environmental Regulations',
                'Oil Prices',
                'Natural Gas',
                'Renewable Energy',
                'Pipeline Safety',
                'Exploration Techniques',
                'Refining Processes'
              ].map((topic, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(topic);
                    performSearch(topic);
                  }}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">{topic}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeSearch;
