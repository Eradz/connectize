import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Find Professionals | Connectize",
    description: "Search and connect with talented oil and gas professionals. Browse engineers, technicians, and specialists on Connectize.",
  keywords: "professionals, oil and gas talent, energy workers, find engineers, recruiting",
  });

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users,
  Search,
  Filter,
  MapPin,
  Briefcase,
  Star,
  Plus,
  Eye,
  MessageCircle,
  CheckCircle,
  TrendingUp,
  User2,
  ArrowLeft,
  Target,
  User
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { formatAvailabilityLabel } from '../../lib/workforceStatus';
import { workforceAPI } from '../../api-services/workforce';
import { workforceProfileService } from '../../api-services/oilgas';
import { toast } from 'sonner';
import { useAuth } from '../../context/userContext';
import BackArrowButton from '../../components/BackArrowButton';
import { deriveNameFromEmail } from '../../lib/userDisplay';

const getProfessionalDisplayName = (professional = {}) => {
  const userName = String(professional.user_name || '').trim();
  if (userName && !userName.includes('@')) {
    return userName;
  }

  return deriveNameFromEmail(professional.user_email || userName) || 'Professional';
};

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
      <div className="min-h-screen ">
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
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ========== MOBILE HEADER - ONLY VISIBLE ON MOBILE ========== */}
      <div className="lg:hidden ">
        <div className="py-4">
          <div className="flex flex-col mb-4">
            <BackArrowButton className={"w-fit"}/>
            <div className='flex justify-between'>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900">Oil & Gas Jobs</h1>
                  <p className="text-xs text-gray-600">Find Your Next Opportunity in The Energy Sector</p>
                </div>
                <Link to={webRoutes.workforceProfileCreate} className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-black" />
                </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Professionals"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg flex items-center gap-2 flex-shrink-0"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter</span>
            </button>
          </div>

          {/* Mobile Filters Dropdown */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="City, Country"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Experience</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Availability</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                >
                  <option value="">Any Status</option>
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Available Soon">Available Soon</option>
                </select>
              </div>
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="hidden lg:block">
        <div className="">
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
                    className="bg-pale_yellow text-dark px-4 py-2 rounded-lg hover:bg-gold flex items-center"
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

      <div className=" md:bg-white md:p-6">
        {/* Search and Filters */}
        <div className="hidden lg:block">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search professionals by name, title, company, or skills..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                    value={filters.skills}
                    onChange={(e) => handleFilterChange('skills', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
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

        {/* ========== MOBILE PROFESSIONALS LIST - ONLY VISIBLE ON MOBILE ========== */}
        <div className="lg:hidden space-y-4">
          {filteredProfessionals.map((professional) => {
            const professionalName = getProfessionalDisplayName(professional);

            return (
            <div key={professional.id} className="bg-white rounded-xl border shadow-sm">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={professional.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(professionalName)}&background=F1C644&color=white`}
                      alt={professionalName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{professionalName}</h3>
                      <p
                        className="text-xs text-gray-600 line-clamp-2"
                        title={professional.professional_title || 'No title specified'}
                      >
                        {professional.professional_title || 'No title specified'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    professional.availability_status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formatAvailabilityLabel(professional.availability_status)}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Key Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(professional.user_skills && professional.user_skills.length > 0) ? (
                      <>
                        {professional.user_skills
                          .filter(skill => skill && skill.skill_name)
                          .slice(0, 4)
                          .map((skill, index) => (
                            <span key={skill.id || index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-lg">
                              {skill.skill_name}
                            </span>
                          ))}
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">No skills listed</span>
                    )}
                  </div>
                </div>

                <div className="mb-3 ">
                  <span className="text-lg font-bold text-gray-900">$ {professional.hourly_rate || '0'}/hr</span>
                </div>

                <div className="space-y-2 mb-4 pb-3 border-b">
                  <div className="flex items-start text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{professional.current_location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Briefcase className="w-3.5 h-3.5 mr-2" />
                    {professional.years_of_experience || 0} Years Experience
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`${webRoutes.workforceProfileDetail.replace(':id', professional.id)}`}
                    className="flex-1 bg-yellow-400 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center"
                  >
                    <User2 className="w-4 h-4 mr-1" />
                    View Profile
                  </Link>
                  <Link
                    // professional.id is the workforce *profile* id (see View Profile
                    // above); a DM room is keyed on user ids, so this needs .user or it
                    // opens a conversation with whoever happens to hold that user id.
                    to={`/messages/?room_name=room_${user?.id}_${professional?.user}`}
                    // onClick={() => handleConnectWithProfessional(professional.id)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Link>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        {/* ========== END MOBILE PROFESSIONALS LIST ========== */}

        {/* Professionals Grid */}
        <div className="hidden lg:flex lg:flex-wrap gap-[2%] mt-6 ">
          {/* <h1 className="text-xl font-bold text-gray-900">Jobs {filteredProfessionals.length} of {filteredProfessionals.length}</h1> */}
          {filteredProfessionals.map((professional) => {
            const professionalName = getProfessionalDisplayName(professional);

            return (
            <div key={professional.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow w-[32%] mb-2">
              {/* Percentage-height bands (20/65/15) used to divide this card, which
                  clipped nothing and simply overflowed onto the next band when a
                  professional_title ran long. Flex column instead: each band takes the
                  height it needs and the body absorbs the slack, so the action row
                  still lines up across a row of cards. */}
              <div className="px-2 py-6 h-full flex flex-col">
                {/* Header. Avatar and badges share the top row; the name and title get
                    the card's full width on the rows below. Sitting them beside the
                    badge left roughly a third of the card for text, which wrapped long
                    titles into a narrow ragged column and broke words mid-syllable. */}
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-2">
                    <img
                      src={professional.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(professionalName)}&background=F1C644&color=white`}
                      alt={professionalName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    {/* <div className='rounded-full border-2 border-black'>
                      <User fill='#6D8FAF' className="w-10 h-10 text-[#6D8FAF]" />
                    </div> */}
                    <div className="flex flex-col items-end space-y-1 shrink-0">
                      {(professional.is_verified || professional.verification_status === 'verified') && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 inline mr-1" />Verified
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        professional.availability_status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {formatAvailabilityLabel(professional.availability_status)}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-3 line-clamp-1" title={professionalName}>
                    {professionalName}
                  </h3>
                  {/* Two lines then ellipsis. Titles here are user-entered and can run to
                      several pipe-separated roles; the full text is in the tooltip and on
                      the profile page, so the card does not need to carry all of it. */}
                  <p
                    className="text-sm text-gray-600 line-clamp-2"
                    title={professional.professional_title || 'No title specified'}
                  >
                    {professional.professional_title || 'No title specified'}
                  </p>
                </div>
                <div className="flex-1">
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

                    </div>
                {/* Actions */}
                <div className="flex space-x-2 pt-3 border-t-2 border-[#00000033]/20">
                  <Link
                    to={`${webRoutes.workforceProfileDetail.replace(':id', professional.id)}`}
                    className="w-[50%] bg-custom_yellow text-dark text-center py-2 rounded-lg hover:bg-gold transition-colors flex items-center justify-center"
                  >
                    <User2 className="w-4 h-4 mr-1" />
                    View Profile
                  </Link>
                  <Link 
                    to={`/messages/?room_name=room_${user?.id}_${professional?.user}`}
                    // onClick={() => handleConnectWithProfessional(professional.id)}
                    className="w-[50%] flex items-center justify-center bg-pale_yellow text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Send connection request"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Link>
                </div>
              </div>
            </div>
            );
          })}
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
                className="bg-pale_yellow px-4 py-2 rounded-lg hover:bg-custom_yellow"
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
