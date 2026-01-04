import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Minus,
  Globe,
  Building,
  FileText,
  Settings,
  Save,
  X,
  ArrowLeft,
  User,
  Sparkles,
  Award,
  Zap,
  Palette,
  Target,
  Crown,
  Camera,
  Upload,
  Check,
  ChevronDown,
  Star,
  Briefcase,
  TrendingUp,
  Shield,
  Eye,
  Heart
} from 'lucide-react';
import { workforceAPI } from '../../api-services/workforce';
import { webRoutes } from '../../lib/webRoutes';

const WorkforceEventCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myCompanies, setMyCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companiesError, setCompaniesError] = useState(null);
  const [topicsInput, setTopicsInput] = useState(''); // Separate state for topics input

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'conference',
    organizer_type: 'personal', // 'personal' or 'company'
    organizer_company_id: '', // Selected company ID if organizer_type is 'company'
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    timezone: 'UTC',
    is_virtual: false,
    venue_name: '',
    venue_address: '',
    virtual_platform: '',
    meeting_link: '',
    max_attendees: '',
    registration_deadline: '',
    requires_approval: false,
    is_free: true,
    ticket_price: '',
    currency: 'USD',
    topics: [],
    agenda: [{ time: '', session: '' }],
    speakers: [{ name: '', title: '', company: '' }]
  });

  // Load user's companies when component mounts
  useEffect(() => {
    const loadMyCompanies = async () => {
      setLoadingCompanies(true);
      setCompaniesError(null);
      try {
        const response = await workforceAPI.getMyCompanies();
        
        // Handle different response formats
        let companies = [];
        if (response.data) {
          companies = response.data.results || response.data || [];
        } else if (Array.isArray(response)) {
          companies = response;
        }
        
        setMyCompanies(companies);
        
        if (companies.length === 0) {
          setCompaniesError('No companies found associated with your account.');
        }
      } catch (err) {
        console.error('Error fetching my companies:', err);
        setMyCompanies([]);
        setCompaniesError(`Failed to load companies: ${err.message || 'Unknown error'}`);
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadMyCompanies();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle topics input - store raw string, only convert to array on submit
  const handleTopicsChange = (topicsString) => {
    setTopicsInput(topicsString);
  };

  // Parse topics from input string to array
  const parseTopics = (topicsString) => {
    return topicsString
      .split(',')
      .map(topic => topic.trim())
      .filter(topic => topic.length > 0);
  };

  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, { time: '', session: '' }]
    }));
  };

  const removeAgendaItem = (index) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const updateAgendaItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addSpeaker = () => {
    setFormData(prev => ({
      ...prev,
      speakers: [...prev.speakers, { name: '', title: '', company: '' }]
    }));
  };

  const removeSpeaker = (index) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index)
    }));
  };

  const updateSpeaker = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.map((speaker, i) => 
        i === index ? { ...speaker, [field]: value } : speaker
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse topics from input string
      const parsedTopics = parseTopics(topicsInput);

      // Prepare submission data
      const submissionData = {
        ...formData,
        topics: parsedTopics, // Use parsed topics from input
        start_date: `${formData.start_date}T${formData.start_time}:00Z`,
        end_date: `${formData.end_date}T${formData.end_time}:00Z`,
        registration_deadline: formData.registration_deadline ? `${formData.registration_deadline}T23:59:59Z` : null,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        ticket_price: formData.is_free ? null : parseFloat(formData.ticket_price),
        organizer_company_id: formData.organizer_type === 'company' ? formData.organizer_company_id : null
      };

      // Remove organizer_type as it's not needed by the backend
      delete submissionData.organizer_type;
      delete submissionData.start_time;
      delete submissionData.end_time;

      console.log('Submitting event data:', submissionData);

      const response = await workforceAPI.createEvent(submissionData);
      
      if (response.data) {
        console.log('Event created successfully:', response.data);
        navigate(`${webRoutes.workforceEvents}/${response.data.id}`);
      } else {
        navigate(webRoutes.workforceMyEvents);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Premium Header with Glassmorphism */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-all duration-200"
              >
                <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-indigo-100 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Create Premium Event
                  </h1>
                  <p className="text-sm text-slate-500">Craft exceptional experiences for industry leaders</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
                <Crown className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Premium Creation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 shadow-lg shadow-red-500/10">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-red-100">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Error Creating Event</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Event Essentials */}
            <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Event Essentials</h2>
                    <p className="text-slate-500">Create the foundation of your premium event</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Event Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Event Title *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-4 text-lg font-medium bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
                        placeholder="Enter a compelling event title..."
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <Award className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Event Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Event Description *</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 placeholder:text-slate-400 resize-none"
                      placeholder="Describe your event in detail. What makes it special and valuable for attendees?"
                    />
                  </div>

                  {/* Event Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Event Type *</label>
                    <div className="relative">
                      <select
                        value={formData.event_type}
                        onChange={(e) => handleInputChange('event_type', e.target.value)}
                        className="w-full px-4 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 appearance-none font-medium"
                      >
                        <option value="conference">🎯 Professional Conference</option>
                        <option value="workshop">🛠️ Hands-on Workshop</option>
                        <option value="seminar">📚 Expert Seminar</option>
                        <option value="networking">🤝 Executive Networking</option>
                        <option value="training">🎓 Professional Training</option>
                        <option value="panel">💬 Industry Panel</option>
                        <option value="expo">🏢 Technology Expo</option>
                        <option value="summit">⛰️ Leadership Summit</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Event Topics</label>
                    <input
                      type="text"
                      value={topicsInput}
                      onChange={(e) => handleTopicsChange(e.target.value)}
                      className="w-full px-4 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
                      placeholder="e.g., AI in Energy, Sustainable Technologies, Digital Transformation"
                    />
                    <p className="text-xs text-slate-500">Separate topics with commas</p>
                  </div>

                  {/* Organizer Selection */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-700">Event Organizer *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                          formData.organizer_type === 'personal' 
                            ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/20' 
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        }`}
                        onClick={() => handleInputChange('organizer_type', 'personal')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${formData.organizer_type === 'personal' ? 'bg-indigo-500' : 'bg-slate-100'}`}>
                            <User className={`w-5 h-5 ${formData.organizer_type === 'personal' ? 'text-white' : 'text-slate-600'}`} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">Personal</div>
                            <div className="text-sm text-slate-500">As an individual</div>
                          </div>
                        </div>
                        {formData.organizer_type === 'personal' && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-5 h-5 text-indigo-500" />
                          </div>
                        )}
                      </div>

                      <div 
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                          formData.organizer_type === 'company' 
                            ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/20' 
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        }`}
                        onClick={() => handleInputChange('organizer_type', 'company')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${formData.organizer_type === 'company' ? 'bg-indigo-500' : 'bg-slate-100'}`}>
                            <Building className={`w-5 h-5 ${formData.organizer_type === 'company' ? 'text-white' : 'text-slate-600'}`} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">Company</div>
                            <div className="text-sm text-slate-500">As a company</div>
                          </div>
                        </div>
                        {formData.organizer_type === 'company' && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-5 h-5 text-indigo-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Company Selection */}
                    {formData.organizer_type === 'company' && (
                      <div className="space-y-2 animate-in slide-in-from-top duration-300">
                        <label className="block text-sm font-semibold text-slate-700">Select Company *</label>
                        {loadingCompanies ? (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center space-x-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                              <span className="text-slate-600">Loading your companies...</span>
                            </div>
                          </div>
                        ) : companiesError ? (
                          <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                            <div className="flex items-center space-x-3">
                              <X className="w-5 h-5 text-red-500" />
                              <span className="text-red-700">{companiesError}</span>
                            </div>
                          </div>
                        ) : myCompanies.length > 0 ? (
                          <div className="relative">
                            <select
                              value={formData.organizer_company_id}
                              onChange={(e) => handleInputChange('organizer_company_id', e.target.value)}
                              className="w-full px-4 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 appearance-none font-medium"
                              required
                            >
                              <option value="">Select a company...</option>
                              {myCompanies.map((company) => (
                                <option key={company.id} value={company.id}>
                                  {company.name || company.company_name} ({company.relationship === 'owner' ? 'Owner' : 'Representative'})
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                              <Briefcase className="w-5 h-5 text-slate-400" />
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                            <div className="text-center">
                              <Building className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                              <h3 className="font-semibold text-amber-900 mb-2">No Companies Found</h3>
                              <p className="text-amber-700 text-sm">You don't have any companies associated with your account yet.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time Configuration */}
            <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Schedule & Timing</h2>
                    <p className="text-slate-500">Set the perfect time for your premium event</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date & Time */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-green-500" />
                      Event Start
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Start Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.start_date}
                          onChange={(e) => handleInputChange('start_date', e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Start Time *</label>
                        <input
                          type="time"
                          required
                          value={formData.start_time}
                          onChange={(e) => handleInputChange('start_time', e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-red-500" />
                      Event End
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">End Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.end_date}
                          onChange={(e) => handleInputChange('end_date', e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">End Time *</label>
                        <input
                          type="time"
                          required
                          value={formData.end_time}
                          onChange={(e) => handleInputChange('end_time', e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Deadline */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Registration Deadline (Optional)</label>
                    <input
                      type="date"
                      value={formData.registration_deadline}
                      onChange={(e) => handleInputChange('registration_deadline', e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    />
                    <p className="text-xs text-slate-500">Leave empty for no deadline</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue & Format */}
            <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Venue & Format</h2>
                    <p className="text-slate-500">Choose between virtual or in-person experience</p>
                  </div>
                </div>
                
                {/* Virtual/Physical Toggle */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        !formData.is_virtual 
                          ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                      onClick={() => handleInputChange('is_virtual', false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${!formData.is_virtual ? 'bg-emerald-500' : 'bg-slate-100'}`}>
                          <MapPin className={`w-5 h-5 ${!formData.is_virtual ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">In-Person</div>
                          <div className="text-sm text-slate-500">Physical venue</div>
                        </div>
                      </div>
                      {!formData.is_virtual && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                    </div>

                    <div 
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.is_virtual 
                          ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                      onClick={() => handleInputChange('is_virtual', true)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${formData.is_virtual ? 'bg-emerald-500' : 'bg-slate-100'}`}>
                          <Globe className={`w-5 h-5 ${formData.is_virtual ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">Virtual</div>
                          <div className="text-sm text-slate-500">Online event</div>
                        </div>
                      </div>
                      {formData.is_virtual && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Venue Details */}
                <div className="space-y-4">
                  {!formData.is_virtual ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Venue Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.venue_name}
                          onChange={(e) => handleInputChange('venue_name', e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
                          placeholder="e.g., Houston Convention Center"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Venue Address *</label>
                        <textarea
                          required
                          value={formData.venue_address}
                          onChange={(e) => handleInputChange('venue_address', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-200 placeholder:text-slate-400 resize-none"
                          placeholder="Enter complete venue address..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Virtual Platform</label>
                        <input
                          type="text"
                          value={formData.virtual_platform}
                          onChange={(e) => handleInputChange('virtual_platform', e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
                          placeholder="e.g., Zoom, Teams, WebEx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Meeting Link</label>
                        <input
                          type="url"
                          value={formData.meeting_link}
                          onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-200 placeholder:text-slate-400"
                          placeholder="https://..."
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agenda */}
              <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 shadow-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Agenda</h3>
                    </div>
                    <button
                      type="button"
                      onClick={addAgendaItem}
                      className="flex items-center px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.agenda.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={item.time}
                          onChange={(e) => updateAgendaItem(index, 'time', e.target.value)}
                          className="w-24 px-2 py-2 text-sm bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                        />
                        <input
                          type="text"
                          value={item.session}
                          onChange={(e) => updateAgendaItem(index, 'session', e.target.value)}
                          className="flex-1 px-2 py-2 text-sm bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                          placeholder="Session"
                        />
                        <button
                          type="button"
                          onClick={() => removeAgendaItem(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Speakers */}
              <div className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Speakers</h3>
                    </div>
                    <button
                      type="button"
                      onClick={addSpeaker}
                      className="flex items-center px-3 py-1 text-sm bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.speakers.map((speaker, index) => (
                      <div key={index} className="space-y-2 p-3 bg-white/50 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">Speaker {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeSpeaker(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={speaker.name}
                          onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                          placeholder="Speaker name"
                        />
                        <input
                          type="text"
                          value={speaker.title}
                          onChange={(e) => updateSpeaker(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          value={speaker.company}
                          onChange={(e) => updateSpeaker(index, 'company', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                          placeholder="Company"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Event Settings */}
            <div className="sticky top-32 group  overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Event Settings</h3>
                    <p className="text-sm text-slate-500">Configure your event details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Capacity */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Max Attendees
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_attendees}
                      onChange={(e) => handleInputChange('max_attendees', e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., 100"
                    />
                  </div>

                  {/* Approval Required */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-slate-600" />
                        Require Approval
                      </div>
                      <div className="text-sm text-slate-500">Manual approval for registrations</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requires_approval}
                        onChange={(e) => handleInputChange('requires_approval', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* Pricing */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Event Pricing
                    </label>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            formData.is_free 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                          onClick={() => handleInputChange('is_free', true)}
                        >
                          <div className="text-center">
                            <Heart className={`w-5 h-5 mx-auto mb-1 ${formData.is_free ? 'text-green-500' : 'text-slate-400'}`} />
                            <div className="text-sm font-semibold">Free</div>
                          </div>
                          {formData.is_free && (
                            <div className="absolute top-1 right-1">
                              <Check className="w-4 h-4 text-green-500" />
                            </div>
                          )}
                        </div>

                        <div 
                          className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            !formData.is_free 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                          onClick={() => handleInputChange('is_free', false)}
                        >
                          <div className="text-center">
                            <DollarSign className={`w-5 h-5 mx-auto mb-1 ${!formData.is_free ? 'text-blue-500' : 'text-slate-400'}`} />
                            <div className="text-sm font-semibold">Paid</div>
                          </div>
                          {!formData.is_free && (
                            <div className="absolute top-1 right-1">
                              <Check className="w-4 h-4 text-blue-500" />
                            </div>
                          )}
                        </div>
                      </div>

                      {!formData.is_free && (
                        <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-top duration-300">
                          <select
                            value={formData.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="NGN">NGN</option>
                          </select>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={formData.ticket_price}
                            onChange={(e) => handleInputChange('ticket_price', e.target.value)}
                            className="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full group relative px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Creating Event...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Sparkles className="w-5 h-5" />
                          <span>Create Premium Event</span>
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="w-full px-6 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkforceEventCreate;