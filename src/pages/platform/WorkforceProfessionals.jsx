import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users,
  Search,
  Filter,
  MapPin,
  Briefcase,
  Star,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  Plus,
  Eye,
  MessageCircle,
  Award,
  CheckCircle,
  Clock,
  Building,
  Globe,
  Download,
  BookOpen,
  TrendingUp,
  User2
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { workforceAPI } from '../../api-services/workforce';
import { workforceProfileService } from '../../api-services/oilgas';
import { toast } from 'sonner';
import { useAuth } from '../../context/userContext';

const WorkforceProfessionals = () => {
  const { user } = useAuth(); // Get authentication state
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1
  });
  const [userProfile, setUserProfile] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  // derive filtered list to avoid setState on each keypress
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    experience: '',
    skills: '',
    availability: '',
    verification: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleConnectWithProfessional = useCallback(async (professionalId) => {
    try {
      await workforceProfileService.connectWithProfile(professionalId, "I'd like to connect and discuss potential opportunities.");
      toast.success('Connection request sent successfully!');
    } catch (error) {
      console.error('Failed to connect with professional:', error);
      toast.error('Failed to send connection request. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadProfessionals();
    // Only check for user profile if the user is authenticated
    if (user) {
      checkUserProfile();
    } else {
      setCheckingProfile(false);
      setUserProfile(null);
    }
  }, [user]); // Add user as dependency

  const filteredProfessionals = useMemo(() => {
    let filtered = professionals;

    // Search filter
  if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(prof => 
        (prof.user_email || '').toLowerCase().includes(term) ||
        (prof.professional_title || '').toLowerCase().includes(term) ||
        (prof.current_location || '').toLowerCase().includes(term) ||
    (prof.user_skills || []).filter(s => s && s.skill_name).some(s => s.skill_name.toLowerCase().includes(term))
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(prof => 
        (prof.current_location || '').toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Experience filter
    if (filters.experience) {
      const expRange = filters.experience;
      filtered = filtered.filter(prof => {
        const years = prof.years_of_experience || 0;
        if (expRange === '0-2') return years <= 2;
        if (expRange === '3-5') return years >= 3 && years <= 5;
        if (expRange === '6-10') return years >= 6 && years <= 10;
        if (expRange === '10+') return years > 10;
        return true;
      });
    }

    // Skills filter
    if (filters.skills) {
      const term = filters.skills.toLowerCase();
      filtered = filtered.filter(prof => (prof.user_skills || []).some(s => (s?.skill_name || '').toLowerCase().includes(term)));
    }

    // Availability filter (map UI labels to backend enum values)
    if (filters.availability) {
      const map = {
        'Available': 'available',
        'Busy': 'busy',
        'Available Soon': 'available_soon'
      };
      const val = map[filters.availability] || filters.availability;
      filtered = filtered.filter(prof => (prof.availability_status || '').toLowerCase() === val);
    }

    // Verification filter (best-effort; only applies if data has these fields)
    if (filters.verification) {
      const val = filters.verification.toLowerCase();
      filtered = filtered.filter(prof => {
        const status = (prof.verification_status || '').toLowerCase();
        const isVerified = !!prof.is_verified;
        if (val === 'verified') return isVerified || status === 'verified';
        if (val === 'pending') return status === 'pending';
        return true;
      });
    }

    return filtered;
  }, [professionals, searchTerm, filters]);

  const loadProfessionals = async (page = 1) => {
    try {
      setLoading(true);
      const response = await workforceAPI.getProfiles({ page, page_size: 12 });
      const data = response.data;
      
      // Handle paginated response
      if (data.results) {
        setProfessionals(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
          currentPage: page,
          totalPages: Math.ceil(data.count / 12)
        });
      } else {
        // Fallback for non-paginated response
        setProfessionals(data || []);
        setPagination({
          count: Array.isArray(data) ? data.length : 0,
          next: null,
          previous: null,
          currentPage: 1,
          totalPages: 1
        });
      }
    } catch (error) {
      console.error('Failed to load professionals:', error);
      setProfessionals([]);
      setPagination({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1,
        totalPages: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserProfile = async () => {
    try {
      setCheckingProfile(true);
      const response = await workforceAPI.getMyProfile();
      setUserProfile(response.data);
    } catch (error) {
      // User doesn't have a profile yet or not authenticated, that's okay
      console.log('User profile check:', error?.response?.status === 404 ? 'No profile found' : 'Not authenticated');
      setUserProfile(null);
    } finally {
      setCheckingProfile(false);
    }
  };

  // removed imperative filter function; using useMemo above

  const handleLoadMore = async () => {
    if (pagination.next && !loading) {
      try {
        setLoading(true);
        const nextPage = pagination.currentPage + 1;
        const response = await workforceAPI.getProfiles({ page: nextPage, page_size: 12 });
        const data = response.data;
        
        // Append new professionals to existing list
        setProfessionals(prev => [...prev, ...(data.results || [])]);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
          currentPage: nextPage,
          totalPages: Math.ceil(data.count / 12)
        });
      } catch (error) {
        console.error('Failed to load more professionals:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      experience: '',
      skills: '',
      availability: '',
      verification: ''
    });
    setSearchTerm('');
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border">
                  <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Oil & Gas Professionals</h1>
              <p className="text-gray-600 mt-1">Connect with verified industry experts and contractors</p>
            </div>
            <div className="flex space-x-3">
              {user && !checkingProfile && (
                userProfile ? (
                  <Link
                    to={webRoutes.workforceProfileDetail.replace(':id', userProfile.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    My Profile
                  </Link>
                ) : (
                  <Link
                    to={webRoutes.workforceProfileCreate}
                    className="bg-pale_yellow text-white px-4 py-2 rounded-lg hover:bg-gold flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Profile
                  </Link>
                )
              )}
              {!user && (
                <Link
                  to="/login"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Login to Create Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search professionals by name, title, company, or skills..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                  >
                    <option value="">Any Level</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  <input
                    type="text"
                    placeholder="Enter skill"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.skills}
                    onChange={(e) => handleFilterChange('skills', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                  >
                    <option value="">Any Status</option>
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Available Soon">Available Soon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.verification}
                    onChange={(e) => handleFilterChange('verification', e.target.value)}
                  >
                    <option value="">Any Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={clearFilters}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Clear Filters
                </button>
                <span className="text-sm text-gray-500 py-2">
                  {filteredProfessionals.length} of {pagination.count} professionals shown
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((professional) => (
            <div key={professional.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow ">
              <div className="p-6 h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 h-[20%]">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(professional.user_name || professional.user_email || 'User')}&background=3b82f6&color=white`}
                      alt={professional.user_name || professional.user_email || 'Professional'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{professional.user_name || professional.user_email || 'Professional'}</h3>
                      <p className="text-sm text-gray-600">{professional.professional_title || 'No title specified'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {(professional.is_verified || professional.verification_status === 'verified') && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 inline mr-1" />Verified
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      professional.availability_status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {professional.availability_status || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="h-[65%]">
                 {/* Skills */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Key Skills</p>
                  <div className="flex flex-wrap gap-1">
          {(professional.user_skills && professional.user_skills.length > 0) ? (
                      <>
            {professional.user_skills
              .filter(skill => skill && skill.skill_name) // Filter out null/undefined skills
              .slice(0, 3)
              .map((skill, index) => (
                          <span key={skill.id || index} className="rounded-full bg-[#F8F9FA] text-[#495057] text-xs px-2 py-1">
              {skill.skill_name}
                          </span>
                        ))}
                        {professional.user_skills.filter(skill => skill && skill.skill_name).length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{professional.user_skills.filter(skill => skill && skill.skill_name).length - 3} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-500 px-2 py-1">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* Rate */}
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-gray-600">
                      ${professional.hourly_rate || '0'}/hr
                    </span>
                  </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {professional.current_location || 'Location not specified'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {professional.years_of_experience || 0} years experience
                  </div>
                  {professional.total_applications > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                      {professional.total_applications} applications • {professional.success_rate}% success rate
                    </div>
                  )}
                </div>

               

                {/* Stats */}
                                {/* Stats */}
                {/* <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{professional.completed_projects || 0}</p>
                    <p className="text-xs text-gray-600">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{professional.success_rate || 0}%</p>
                    <p className="text-xs text-gray-600">Success</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{professional.average_response_hours || 24}h</p>
                    <p className="text-xs text-gray-600">Response</p>
                  </div>
                </div> */}

                    </div>



                {/* Actions */}
                <div className="flex space-x-2 pt-3 border-t-2 border-[#00000033]/20 h-[15%]">
                  <Link
                    to={`${webRoutes.workforceProfileDetail.replace(':id', professional.id)}`}
                    className="w-[50%] bg-custom_yellow text-white text-center py-2 rounded-lg hover:bg-gold transition-colors flex items-center justify-center"
                  >
                    <User2 className="w-4 h-4 mr-1" />
                    View Profile
                  </Link>
                  <button 
                    onClick={() => handleConnectWithProfessional(professional.id)}
                    className="w-[50%] flex items-center justify-center bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Send connection request"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProfessionals.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No professionals found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters
            </p>
            <div className="mt-6">
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Load More */}
        {filteredProfessionals.length > 0 && pagination.next && (
          <div className="text-center mt-8">
            <button 
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : `Load More Professionals (${pagination.count - filteredProfessionals.length} remaining)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkforceProfessionals;
