import React, { useState, useEffect } from 'react';
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
  UserPlus,
  Eye,
  MessageCircle,
  Award,
  CheckCircle,
  Clock,
  Building,
  Globe,
  Download,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { workforceService } from '../../api-services/oilgas';

const WorkforceProfessionals = () => {
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    experience: '',
    skills: '',
    availability: '',
    verification: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProfessionals();
  }, []);

  useEffect(() => {
    filterProfessionals();
  }, [searchTerm, filters, professionals]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      // Try to fetch from API, fallback to mock data
      let data;
      try {
        const response = await workforceService.getProfiles();
        data = response.data?.results || response.data || [];
      } catch (error) {
        console.warn('API not available, using mock data:', error);
        data = generateMockProfessionals();
      }
      
      setProfessionals(data);
      setFilteredProfessionals(data);
    } catch (error) {
      console.error('Failed to load professionals:', error);
      // Use mock data as fallback
      const mockData = generateMockProfessionals();
      setProfessionals(mockData);
      setFilteredProfessionals(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockProfessionals = () => {
    const skills = [
      ['Drilling Operations', 'Well Completion', 'Safety Management'],
      ['Pipeline Engineering', 'Flow Assurance', 'Process Safety'],
      ['Reservoir Engineering', 'Production Optimization', 'Well Testing'],
      ['Geophysics', 'Seismic Interpretation', 'Structural Geology'],
      ['HSE Management', 'Risk Assessment', 'Emergency Response'],
      ['Project Management', 'Cost Control', 'Contract Management'],
      ['Mechanical Engineering', 'Equipment Design', 'Maintenance'],
      ['Electrical Engineering', 'Automation', 'Control Systems'],
      ['Marine Operations', 'Offshore Logistics', 'Vessel Management'],
      ['Environmental Engineering', 'Impact Assessment', 'Compliance']
    ];

    const locations = [
      'Houston, TX', 'Aberdeen, UK', 'Stavanger, Norway', 'Dubai, UAE',
      'Lagos, Nigeria', 'Rio de Janeiro, Brazil', 'Perth, Australia',
      'Calgary, Canada', 'Luanda, Angola', 'Doha, Qatar'
    ];

    const companies = [
      'ExxonMobil', 'Shell', 'BP', 'Chevron', 'Total', 'ConocoPhillips',
      'Eni', 'Equinor', 'Petrobras', 'Saudi Aramco', 'Schlumberger',
      'Halliburton', 'Baker Hughes', 'Wood', 'Technip', 'Subsea 7'
    ];

    const universities = [
      'Texas A&M University', 'University of Aberdeen', 'Norwegian University of Science and Technology',
      'Colorado School of Mines', 'Imperial College London', 'University of Tulsa',
      'Penn State University', 'University of Houston', 'Heriot-Watt University'
    ];

    return Array.from({ length: 24 }, (_, index) => ({
      id: `prof_${index + 1}`,
      name: `${['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Anna'][index % 8]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore'][index % 8]}`,
      title: [
        'Senior Drilling Engineer', 'Production Engineer', 'Reservoir Engineer', 'Geophysicist',
        'HSE Manager', 'Project Manager', 'Subsea Engineer', 'Pipeline Engineer',
        'Operations Manager', 'Process Engineer', 'Well Completion Engineer', 'Marine Engineer'
      ][index % 12],
      company: companies[index % companies.length],
      location: locations[index % locations.length],
      experience_years: Math.floor(Math.random() * 20) + 5,
      skills: skills[index % skills.length],
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      reviews_count: Math.floor(Math.random() * 50) + 5,
      hourly_rate: Math.floor(Math.random() * 100) + 80,
      availability: ['Available', 'Busy', 'Available Soon'][index % 3],
      verification_status: ['verified', 'pending', 'verified'][index % 3],
      education: universities[index % universities.length],
      certifications: [
        'IWCF Well Control', 'OPITO BOSIET', 'PMP Certification', 'API Certified'
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      profile_image: `https://images.unsplash.com/photo-${1500000000000 + index * 1000000}?w=150&h=150&fit=crop&crop=face`,
      languages: ['English', 'Spanish', 'French', 'Arabic', 'Portuguese'].slice(0, Math.floor(Math.random() * 3) + 1),
      last_active: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      total_projects: Math.floor(Math.random() * 50) + 10,
      success_rate: Math.floor(Math.random() * 20) + 80,
      response_time: Math.floor(Math.random() * 24) + 1
    }));
  };

  const filterProfessionals = () => {
    let filtered = professionals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(prof => 
        prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(prof => 
        prof.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Experience filter
    if (filters.experience) {
      const expRange = filters.experience;
      filtered = filtered.filter(prof => {
        if (expRange === '0-2') return prof.experience_years <= 2;
        if (expRange === '3-5') return prof.experience_years >= 3 && prof.experience_years <= 5;
        if (expRange === '6-10') return prof.experience_years >= 6 && prof.experience_years <= 10;
        if (expRange === '10+') return prof.experience_years > 10;
        return true;
      });
    }

    // Skills filter
    if (filters.skills) {
      filtered = filtered.filter(prof => 
        prof.skills.some(skill => skill.toLowerCase().includes(filters.skills.toLowerCase()))
      );
    }

    // Availability filter
    if (filters.availability) {
      filtered = filtered.filter(prof => prof.availability === filters.availability);
    }

    // Verification filter
    if (filters.verification) {
      filtered = filtered.filter(prof => prof.verification_status === filters.verification);
    }

    setFilteredProfessionals(filtered);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Busy': return 'bg-red-100 text-red-800';
      case 'Available Soon': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Oil & Gas Professionals</h1>
              <p className="text-gray-600 mt-1">Connect with verified industry experts and contractors</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={webRoutes.workforceProfileCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.experience}
                    onChange={(e) => setFilters({...filters, experience: e.target.value})}
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
                    onChange={(e) => setFilters({...filters, skills: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.availability}
                    onChange={(e) => setFilters({...filters, availability: e.target.value})}
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
                    onChange={(e) => setFilters({...filters, verification: e.target.value})}
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
                  {filteredProfessionals.length} professionals found
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((professional) => (
            <div key={professional.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={professional.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=3b82f6&color=white`}
                      alt={professional.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{professional.name}</h3>
                      <p className="text-sm text-gray-600">{professional.title}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(professional.verification_status)}`}>
                      {professional.verification_status === 'verified' ? (
                        <><CheckCircle className="w-3 h-3 inline mr-1" />Verified</>
                      ) : (
                        <><Clock className="w-3 h-3 inline mr-1" />Pending</>
                      )}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(professional.availability)}`}>
                      {professional.availability}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-2" />
                    {professional.company}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {professional.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {professional.experience_years} years experience
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                    {professional.rating} ({professional.reviews_count} reviews)
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Key Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {professional.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {professional.skills.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{professional.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{professional.total_projects}</p>
                    <p className="text-xs text-gray-600">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{professional.success_rate}%</p>
                    <p className="text-xs text-gray-600">Success</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{professional.response_time}h</p>
                    <p className="text-xs text-gray-600">Response</p>
                  </div>
                </div>

                {/* Rate */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hourly Rate</span>
                    <span className="font-semibold text-gray-900">${professional.hourly_rate}/hr</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    to={`${webRoutes.workforceProfileDetail.replace(':id', professional.id)}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Profile
                  </Link>
                  <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <MessageCircle className="w-4 h-4" />
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
        {filteredProfessionals.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
              Load More Professionals
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkforceProfessionals;
