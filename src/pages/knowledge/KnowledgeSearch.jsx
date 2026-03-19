import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Search Knowledge Hub | Connectize",
    description: "Search for articles, forums, and resources in the Connectize oil and gas Knowledge Hub.",
  keywords: "search knowledge hub, find articles, oil and gas resources, Connectize",
  });

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
  Clock,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { knowledgeSearchService } from '../../api-services/oilgas';
import knowledgeHubAPI from '../../api-services/knowledgeHub';

const KnowledgeSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState("");
  const [sortBy, setSortBy] = useState('relevance');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const performSearch = async (term = searchTerm) => {
    if (!term.trim()) return;
    
    try {
      setLoading(true);
      setSearchPerformed(true);
      const response = await knowledgeHubAPI.search( term, {
        type: searchType,
        sort: sortBy
      });
      setSearchResults(response.data.results || []);
      console.log("Search results:", response.data.results);
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

  const popularTopics = [
    'Market Analysis',
    'Drilling Technology',
    'Environmental Regulations',
    'Exploration Techniques',
    'Oil Prices',
    'Natural Gas',
    'Pipeline Safety',
    'Renewable Energy',
    'Refining Processes'
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Search</h1>
          <p className="mt-2 text-gray-600">Search across articles, forums, and discussions</p>
        </div>

        {/* Search Form - Desktop View */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm p-6 mb-6">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for articles, forums, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
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

              {/* Updated Desktop Search Button */}
              <button
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                className="disabled:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                style={{ backgroundColor: '#F1C644' }}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
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
          </div>
        </div>

        {/* Mobile View - Search Form */}
        <div className="md:hidden bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4">
            {/* Mobile Search Input */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search Deal Rooms"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="pl-4 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>

              {/* Updated Mobile Search Button */}
              <button
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                className="disabled:bg-gray-300 text-gray-900 px-4 py-3 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#F1C644' }}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="relative mb-4">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg flex items-center justify-between bg-white text-left"
              >
                <span className="text-gray-700">
                  {searchType === "" ? 'All Categories' : 
                   searchType === 'articles' ? 'Articles Only' :
                   searchType === 'forums' ? 'Forums Only' : 'Topics Only'}
                </span>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType("");
                      setCategoryDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200"
                  >
                    All Categories
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType('articles');
                      setCategoryDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200"
                  >
                    Articles Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType('forums');
                      setCategoryDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200"
                  >
                    Forums Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType('topics');
                      setCategoryDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50"
                  >
                    Topics Only
                  </button>
                </div>
              )}
            </div>

            {/* Popular Topics - Mobile */}
            {!searchPerformed && (
              <div className="border-t border-gray-200 pt-4">
                {popularTopics.map((topic, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSearchTerm(topic);
                      performSearch(topic);
                    }}
                    className="w-full flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-900">{topic}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Sort By - Mobile */}
            {searchPerformed && (
              <div className="mt-4">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    if (searchTerm.trim()) performSearch();
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="date">Sort by Date</option>
                  <option value="popularity">Sort by Popularity</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Search Results - universal */}
        {searchPerformed && (
          <div className="space-y-6">
            {searchResults.length > 0 && (
              <div className="text-sm text-gray-600 px-4 md:px-0">
                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}"
              </div>
            )}

            {Object.keys(groupedResults).length > 0 ? (
              Object.entries(groupedResults).map(([type, results]) => (
                <div key={type} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                      {type}s ({results.length})
                    </h3>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {results.map((result) => (
                      <div key={result.id} className="p-4 md:p-6 hover:bg-gray-50">
                        <div className="flex items-start space-x-3 md:space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            {getResultIcon(result.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start md:items-center flex-col md:flex-row md:space-x-2 mb-2">
                              <h4 className="text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-0">
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
                            
                            <p className="text-sm md:text-base text-gray-600 mb-3">
                              {highlightSearchTerm(
                                result.excerpt || result.content?.substring(0, 200) + '...' || 'No description available',
                                searchTerm
                              )}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                              <div className="flex items-center">
                                <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                <span>{result.author_name || 'Anonymous'}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                <span>{new Date(result.created_at).toLocaleDateString()}</span>
                              </div>
                              
                              {result.category && (
                                <div className="flex items-center">
                                  <Hash className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                  <span>{result.category}</span>
                                </div>
                              )}
                              
                              {result.views_count && (
                                <div className="flex items-center">
                                  <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
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
              <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 text-center">
                <Search className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-4" />
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-sm md:text-base text-gray-600 mb-6">
                  We couldn't find anything matching "{searchTerm}". Try:
                </p>
                <ul className="text-xs md:text-sm text-gray-500 space-y-1 mb-6">
                  <li>• Checking your spelling</li>
                  <li>• Using different keywords</li>
                  <li>• Using more general terms</li>
                  <li>• Searching for a different content type</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Desktop Popular Topics */}
        {!searchPerformed && (
          <div className="hidden md:block bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Search Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularTopics.map((topic, index) => (
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

// Updated search button color to #F1C644 for both desktop and mobile
export default KnowledgeSearch;
