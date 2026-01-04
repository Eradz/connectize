import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Users,
  TrendingUp,
  BookOpen,
  Globe,
  Hash,
  ChevronDown
} from 'lucide-react';
import { knowledgeForumService } from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';
import { toast } from 'sonner';

// Custom SVG Icons
const CreditCardIcon = () => (
  <svg width={34} height={34} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_496_4742)">
      <path
        d="M26.9167 1.41699H7.08333C5.20541 1.41924 3.40504 2.16624 2.07714 3.49414C0.749249 4.82203 0.00224946 6.6224 0 8.50033L0 25.5003C0.00224946 27.3783 0.749249 29.1786 2.07714 30.5065C3.40504 31.8344 5.20541 32.5814 7.08333 32.5837H26.9167C28.7946 32.5814 30.595 31.8344 31.9229 30.5065C33.2508 29.1786 33.9977 27.3783 34 25.5003V8.50033C33.9977 6.6224 33.2508 4.82203 31.9229 3.49414C30.595 2.16624 28.7946 1.41924 26.9167 1.41699ZM7.08333 4.25033H26.9167C28.0438 4.25033 29.1248 4.69809 29.9219 5.49512C30.7189 6.29215 31.1667 7.37316 31.1667 8.50033V9.91699H2.83333V8.50033C2.83333 7.37316 3.2811 6.29215 4.07813 5.49512C4.87516 4.69809 5.95616 4.25033 7.08333 4.25033ZM26.9167 29.7503H7.08333C5.95616 29.7503 4.87516 29.3026 4.07813 28.5055C3.2811 27.7085 2.83333 26.6275 2.83333 25.5003V12.7503H31.1667V25.5003C31.1667 26.6275 30.7189 27.7085 29.9219 28.5055C29.1248 29.3026 28.0438 29.7503 26.9167 29.7503ZM26.9167 18.417C26.9167 18.7927 26.7674 19.153 26.5017 19.4187C26.2361 19.6844 25.8757 19.8337 25.5 19.8337H8.5C8.12428 19.8337 7.76394 19.6844 7.49827 19.4187C7.23259 19.153 7.08333 18.7927 7.08333 18.417C7.08333 18.0413 7.23259 17.6809 7.49827 17.4153C7.76394 17.1496 8.12428 17.0003 8.5 17.0003H25.5C25.8757 17.0003 26.2361 17.1496 26.5017 17.4153C26.7674 17.6809 26.9167 18.0413 26.9167 18.417ZM21.25 24.0837C21.25 24.4594 21.1007 24.8197 20.8351 25.0854C20.5694 25.3511 20.2091 25.5003 19.8333 25.5003H8.5C8.12428 25.5003 7.76394 25.3511 7.49827 25.0854C7.23259 24.8197 7.08333 24.4594 7.08333 24.0837C7.08333 23.7079 7.23259 23.3476 7.49827 23.0819C7.76394 22.8162 8.12428 22.667 8.5 22.667H19.8333C20.2091 22.667 20.5694 22.8162 20.8351 23.0819C21.1007 23.3476 21.25 23.7079 21.25 24.0837ZM4.25 7.08366C4.25 6.80347 4.33309 6.52957 4.48875 6.2966C4.64442 6.06363 4.86567 5.88205 5.12453 5.77483C5.38339 5.6676 5.66824 5.63955 5.94304 5.69421C6.21785 5.74888 6.47028 5.8838 6.6684 6.08192C6.86653 6.28005 7.00145 6.53247 7.05611 6.80728C7.11077 7.08209 7.08272 7.36693 6.9755 7.62579C6.86827 7.88466 6.68669 8.10591 6.45372 8.26157C6.22075 8.41724 5.94686 8.50033 5.66667 8.50033C5.29094 8.50033 4.93061 8.35107 4.66493 8.08539C4.39926 7.81972 4.25 7.45938 4.25 7.08366ZM8.5 7.08366C8.5 6.80347 8.58309 6.52957 8.73875 6.2966C8.89442 6.06363 9.11567 5.88205 9.37453 5.77483C9.63339 5.6676 9.91824 5.63955 10.193 5.69421C10.4679 5.74888 10.7203 5.8838 10.9184 6.08192C11.1165 6.28005 11.2514 6.53247 11.3061 6.80728C11.3608 7.08209 11.3327 7.36693 11.2255 7.62579C11.1183 7.88466 10.9367 8.10591 10.7037 8.26157C10.4708 8.41724 10.1969 8.50033 9.91667 8.50033C9.54094 8.50033 9.18061 8.35107 8.91493 8.08539C8.64926 7.81972 8.5 7.45938 8.5 7.08366ZM12.75 7.08366C12.75 6.80347 12.8331 6.52957 12.9888 6.2966C13.1444 6.06363 13.3657 5.88205 13.6245 5.77483C13.8834 5.6676 14.1682 5.63955 14.443 5.69421C14.7179 5.74888 14.9703 5.8838 15.1684 6.08192C15.3665 6.28005 15.5014 6.53247 15.5561 6.80728C15.6108 7.08209 15.5827 7.36693 15.4755 7.62579C15.3683 7.88466 15.1867 8.10591 14.9537 8.26157C14.7208 8.41724 14.4469 8.50033 14.1667 8.50033C13.7909 8.50033 13.4306 8.35107 13.1649 8.08539C12.8993 7.81972 12.75 7.45938 12.75 7.08366Z"
        fill="#374957"
      />
    </g>
    <defs>
      <clipPath id="clip0_496_4742">
        <rect width={34} height={34} fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const CalendarIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_496_4853)">
      <path
        d="M19 2H18V1C18 0.734784 17.8946 0.48043 17.7071 0.292893C17.5196 0.105357 17.2652 0 17 0C16.7348 0 16.4804 0.105357 16.2929 0.292893C16.1054 0.48043 16 0.734784 16 1V2H8V1C8 0.734784 7.89464 0.48043 7.70711 0.292893C7.51957 0.105357 7.26522 0 7 0C6.73478 0 6.48043 0.105357 6.29289 0.292893C6.10536 0.48043 6 0.734784 6 1V2H5C3.67441 2.00159 2.40356 2.52888 1.46622 3.46622C0.528882 4.40356 0.00158786 5.67441 0 7L0 19C0.00158786 20.3256 0.528882 21.5964 1.46622 22.5338C2.40356 23.4711 3.67441 23.9984 5 24H19C20.3256 23.9984 21.5964 23.4711 22.5338 22.5338C23.4711 21.5964 23.9984 20.3256 24 19V7C23.9984 5.67441 23.4711 4.40356 22.5338 3.46622C21.5964 2.52888 20.3256 2.00159 19 2ZM2 7C2 6.20435 2.31607 5.44129 2.87868 4.87868C3.44129 4.31607 4.20435 4 5 4H19C19.7956 4 20.5587 4.31607 21.1213 4.87868C21.6839 5.44129 22 6.20435 22 7V8H2V7ZM19 22H5C4.20435 22 3.44129 21.6839 2.87868 21.1213C2.31607 20.5587 2 19.7956 2 19V10H22V19C22 19.7956 21.6839 20.5587 21.1213 21.1213C20.5587 21.6839 19.7956 22 19 22Z"
        fill="#ADB5BD"
      />
      <path
        d="M12 16.5C12.8284 16.5 13.5 15.8284 13.5 15C13.5 14.1716 12.8284 13.5 12 13.5C11.1716 13.5 10.5 14.1716 10.5 15C10.5 15.8284 11.1716 16.5 12 16.5Z"
        fill="#ADB5BD"
      />
      <path
        d="M7 16.5C7.82843 16.5 8.5 15.8284 8.5 15C8.5 14.1716 7.82843 13.5 7 13.5C6.17157 13.5 5.5 14.1716 5.5 15C5.5 15.8284 6.17157 16.5 7 16.5Z"
        fill="#ADB5BD"
      />
      <path
        d="M17 16.5C17.8284 16.5 18.5 15.8284 18.5 15C18.5 14.1716 17.8284 13.5 17 13.5C16.1716 13.5 15.5 14.1716 15.5 15C15.5 15.8284 16.1716 16.5 17 16.5Z"
        fill="#ADB5BD"
      />
    </g>
    <defs>
      <clipPath id="clip0_496_4853">
        <rect width={24} height={24} fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const KnowledgeForums = () => {
  const [forums, setForums] = useState([]);
  const [stats, setStats] = useState({ total_forums: 0, active_forums: 0, total_members: 0, total_topics: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadForums();
  }, []);

  const loadForums = async () => {
    try {
      setLoading(true);
      const response = await knowledgeForumService.getAll();
      const list = response?.results || response?.data || response || [];
      setForums(list);
       setStats({
          total_forums: list.length,
          active_forums: list.filter(f => (f.topic_count || 0) > 0).length,
          total_members: list.reduce((s, f) => s + (f.members_count || 0), 0),
          total_topics: list.reduce((s, f) => s + (f.topic_count || 0), 0)
        });

    } catch (error) {
      console.error('Error loading forums:', error);
      toast.error('Failed to load forums. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredForums = forums.filter(forum => {
    const matchesSearch = forum.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         forum.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || forum.category_name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-background">
      <div className="max-w-7xl mx-auto ">
        {/* Mobile Header */}
        <div className="lg:hidden px-4 pt-4 pb-6">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Discussion Forums</h1>
              <p className="text-sm text-gray-500">Join Conversations About Oil & Gas Industry Topics</p>
            </div>
            <Link to={webRoutes.knowledgeForumCreate} className="text-gray-900 font-medium p-2.5 rounded-lg flex items-center justify-center ml-3 flex-shrink-0 bg-pale_yellow">
              <Plus className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Discussion Forums</h1>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-gray-500">join conversations about oil & gas industry topics</p>
            </div>
            <Link to={webRoutes.knowledgeForumCreate} className="hover:bg-pale_yellow text-gray-900 font-medium px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-colors bg-pale_yellow">
              <Plus className="h-5 w-5" />
              <span>Create Forum</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Mobile: 2x2 Grid, Desktop: 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8 px-4 lg:px-4 lg:sm:px-6 lg:lg:px-8">
          <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-2 lg:mb-3 bg-pale_yellow">
                <div className="scale-75 lg:scale-100">
                  <CreditCardIcon />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stats.total_forums}</p>
              <p className="text-xs lg:text-sm text-gray-500">Total Forums</p>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-2 lg:mb-3 bg-pale_yellow">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stats.active_forums}</p>
              <p className="text-xs lg:text-sm text-gray-500">Active Forums</p>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-2 lg:mb-3 bg-pale_yellow">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stats.total_members}</p>
              <p className="text-xs lg:text-sm text-gray-500">Total Members</p>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-2 lg:mb-3 bg-pale_yellow">
                <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stats.total_topics}</p>
              <p className="text-xs lg:text-sm text-gray-500">Total Topics</p>
            </div>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:block bg-white rounded-xl border border-gray-200 p-4 mb-8 mx-4 sm:mx-6 lg:mx-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search Forums"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
            >
              <option value="">All Categories</option>
              <option value="General">General Discussion</option>
              <option value="Technical">Technical</option>
              <option value="Market">Market Analysis</option>
              <option value="Sustainability">Sustainability</option>
              <option value="Regulations">Regulations</option>
              <option value="Careers">Careers</option>
            </select>

            <button className="text-gray-900 font-medium px-6 py-2.5 rounded-lg transition-colors" style={{ backgroundColor: '#F1C644' }}>
              Search
            </button>
          </div>
        </div>

        {/* Mobile Search & Filter */}
        <div className="lg:hidden px-4 space-y-3 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search Deal Rooms"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm"
            />
            <button className="text-gray-900 font-medium px-4 py-3 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F1C644' }}>
              <Search className="h-5 w-5" />
            </button>
          </div>

          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-4 pr-10 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white appearance-none text-sm"
            >
              <option value="">All Categories</option>
              <option value="General">General Discussion</option>
              <option value="Technical">Technical</option>
              <option value="Market">Market Analysis</option>
              <option value="Sustainability">Sustainability</option>
              <option value="Regulations">Regulations</option>
              <option value="Careers">Careers</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
          </div>
        </div>

        {/* Forums List */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:px-4 lg:sm:px-6 lg:lg:px-8">
          {filteredForums.map((forum) => (
            <div key={forum.id} className="bg-white lg:rounded-xl border-b lg:border border-gray-200 px-4 py-4 lg:p-6 lg:hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-bold text-gray-900">{forum.name}</h3>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0">
                  Public
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-3">{forum.description}</p>

              {/* Mobile - Stacked */}
              <div className="lg:hidden space-y-1 text-sm text-gray-400 mb-3">
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  <span>{forum.topic_count || 0} Topics</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{forum.members_count || 0} Members</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2">
                    <CalendarIcon />
                  </div>
                  <span>{new Date(forum.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Desktop - Horizontal */}
              <div className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-1" />
                  <span>{forum.topic_count || 0} Topics</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{forum.members_count || 0} Members</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1">
                    <CalendarIcon />
                  </div>
                  <span>{new Date(forum.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <Link
                to={`/knowledge/forums/${forum.slug}`}
                className="inline-block lg:block lg:w-full text-center text-gray-900 font-medium px-6 lg:px-4 py-2 lg:py-2.5 rounded-lg transition-colors text-sm"
                style={{ backgroundColor: '#F1C644' }}
              >
                Enter Forum
              </Link>
            </div>
          ))}
        </div>

        {filteredForums.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 mx-4 lg:mx-8">
            <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No forums found</h3>
            <p className="text-gray-500 mb-6">
              Create the first forum to start discussions in the community.
            </p>
            <Link to={webRoutes.knowledgeForumCreate} className="inline-flex items-center px-6 py-3 text-gray-900 font-medium rounded-lg transition-colors" style={{ backgroundColor: '#F1C644' }}>
              <Plus className="h-5 w-5 mr-2" />
              Create Forum
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeForums;