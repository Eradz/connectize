import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  EyeOff,
  Heart,
  ExternalLink
} from 'lucide-react';
import { workforceAPI } from '../../api-services/workforce';
import { webRoutes } from '../../lib/webRoutes';

const WorkforceEventCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get event ID from URL params for edit mode
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [error, setError] = useState(null);
  const [myCompanies, setMyCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companiesError, setCompaniesError] = useState(null);
  const [topicsInput, setTopicsInput] = useState(''); // Separate state for topics input
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
    external_payment_url: '',
    topics: [],
    agenda: [{ time: '', session: '' }],
    speakers: [{ name: '', title: '', company: '' }],
    is_published: true // Default to published for new events
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

  // Load existing event data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadEventData = async () => {
        setLoadingEvent(true);
        setError(null);
        try {
          const response = await workforceAPI.getEvent(id);
          const event = response.data;
          
          // Parse dates and times from the event data
          const startDateTime = new Date(event.start_date);
          const endDateTime = new Date(event.end_date);
          const regDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null;
          
          // Format dates for input fields (YYYY-MM-DD)
          const formatDate = (date) => date.toISOString().split('T')[0];
          // Format times for input fields (HH:MM)
          const formatTime = (date) => date.toISOString().split('T')[1].substring(0, 5);
          
          setFormData({
            title: event.title || '',
            description: event.description || '',
            event_type: event.event_type || 'conference',
            organizer_type: event.organizer_company ? 'company' : 'personal',
            organizer_company_id: event.organizer_company || '',
            start_date: formatDate(startDateTime),
            start_time: formatTime(startDateTime),
            end_date: formatDate(endDateTime),
            end_time: formatTime(endDateTime),
            timezone: event.timezone || 'UTC',
            is_virtual: event.is_virtual || false,
            venue_name: event.venue_name || '',
            venue_address: event.venue_address || '',
            virtual_platform: event.virtual_platform || '',
            meeting_link: event.meeting_link || '',
            max_attendees: event.max_attendees || '',
            registration_deadline: regDeadline ? formatDate(regDeadline) : '',
            requires_approval: event.requires_approval || false,
            is_free: event.is_free !== false,
            ticket_price: event.ticket_price || '',
            currency: event.currency || 'USD',
            external_payment_url: event.external_payment_url || '',
            is_published: event.is_published !== false,
            agenda: event.agenda?.length > 0 ? event.agenda : [{ time: '', session: '' }],
            speakers: event.speakers?.length > 0 ? event.speakers : [{ name: '', title: '', company: '' }]
          });
          
          // Set topics input from array
          if (event.topics && Array.isArray(event.topics)) {
            setTopicsInput(event.topics.join(', '));
          }
          
          // Set image preview if exists
          if (event.image) {
            setImagePreview(event.image);
          }
        } catch (err) {
          console.error('Error loading event:', err);
          setError('Failed to load event data. Please try again.');
        } finally {
          setLoadingEvent(false);
        }
      };
      
      loadEventData();
    }
  }, [id, isEditMode]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image file size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
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
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        start_date: `${formData.start_date}T${formData.start_time}:00Z`,
        end_date: `${formData.end_date}T${formData.end_time}:00Z`,
        timezone: formData.timezone,
        is_virtual: formData.is_virtual,
        venue_name: formData.venue_name || '',
        venue_address: formData.venue_address || '',
        virtual_platform: formData.virtual_platform || '',
        meeting_link: formData.meeting_link || '',
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        registration_deadline: formData.registration_deadline ? `${formData.registration_deadline}T23:59:59Z` : null,
        requires_approval: formData.requires_approval,
        is_free: formData.is_free,
        ticket_price: formData.is_free ? null : (formData.ticket_price ? parseFloat(formData.ticket_price) : null),
        currency: formData.currency,
        use_internal_payment: formData.is_free ? true : !formData.external_payment_url,
        external_payment_url: formData.is_free ? '' : (formData.external_payment_url || ''),
        is_published: formData.is_published,
        topics: parsedTopics,
        agenda: formData.agenda.filter(item => item.time || item.session),
        speakers: formData.speakers.filter(s => s.name || s.title || s.company),
      };

      // Only include organizer_company_id if it's a company event
      if (formData.organizer_type === 'company' && formData.organizer_company_id) {
        submissionData.organizer_company_id = formData.organizer_company_id;
      }

      // Create FormData if there's an image
      let requestData;
      if (imageFile) {
        requestData = new FormData();
        Object.keys(submissionData).forEach(key => {
          const value = submissionData[key];
          if (value !== null && value !== undefined) {
            if (Array.isArray(value) || typeof value === 'object') {
              requestData.append(key, JSON.stringify(value));
            } else {
              requestData.append(key, value);
            }
          }
        });
        requestData.append('image', imageFile);
      } else {
        requestData = submissionData;
      }

      console.log('Submitting event data:', submissionData);

      let response;
      if (isEditMode) {
        // Update existing event
        response = await workforceAPI.updateEvent(id, requestData);
        console.log('Event updated successfully:', response.data);
      } else {
        // Create new event
        response = await workforceAPI.createEvent(requestData);
        console.log('Event created successfully:', response.data);
      }
      
      if (response.data) {
        navigate(`${webRoutes.workforceEvents}/${response.data.id}`);
      } else {
        navigate(webRoutes.workforceMyEvents);
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, err);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} event. Please check your input and try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state when loading event data for edit mode
  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header with Glassmorphism */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center space-x-2 text-gray-600 hover:text-gold transition-all duration-200"
              >
                <div className="p-2 rounded-xl bg-gray-100 group-hover:bg-pale_yellow transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gold shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Event' : 'Create Event'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isEditMode ? 'Update your event details' : 'Create a new professional event'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-pale_yellow border border-gold/30">
                <Crown className="w-4 h-4 text-gold" />
                <span className="text-sm font-medium text-gray-700">{isEditMode ? 'Edit Mode' : 'New Event'}</span>
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
                <h3 className="font-semibold text-red-900">Error {isEditMode ? 'Updating' : 'Creating'} Event</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Event Essentials */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-gold">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Event Essentials</h2>
                    <p className="text-sm text-gray-500">Basic event information</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Event Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Event Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-200 placeholder:text-gray-400"
                      placeholder="Enter event title..."
                    />
                  </div>

                  {/* Event Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Event Description *</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-200 placeholder:text-gray-400 resize-none"
                      placeholder="Describe your event in detail..."
                    />
                  </div>

                  {/* Event Image Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Event Banner Image</label>
                    <div className="space-y-3">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Event preview"
                            className="w-full h-48 object-cover rounded-xl border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-pale_yellow/30 hover:border-gold transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Camera className="w-10 h-10 text-gray-400 mb-3" />
                            <p className="mb-2 text-sm text-gray-600 font-medium">
                              <span className="text-gold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Event Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Event Type *</label>
                    <div className="relative">
                      <select
                        value={formData.event_type}
                        onChange={(e) => handleInputChange('event_type', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-200 appearance-none font-medium"
                      >
                        <option value="conference">Conference</option>
                        <option value="workshop">Workshop</option>
                        <option value="seminar">Seminar</option>
                        <option value="networking">Networking Event</option>
                        <option value="training">Training Session</option>
                        <option value="panel">Panel Discussion</option>
                        <option value="expo">Expo / Exhibition</option>
                        <option value="summit">Summit</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Event Topics</label>
                    <input
                      type="text"
                      value={topicsInput}
                      onChange={(e) => handleTopicsChange(e.target.value)}
                      className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                      placeholder="e.g., AI in Energy, Sustainable Technologies, Digital Transformation"
                    />
                    <p className="text-xs text-gray-500">Separate topics with commas</p>
                  </div>

                  {/* Organizer Selection */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">Event Organizer *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                          formData.organizer_type === 'personal' 
                            ? 'border-gold bg-pale_yellow shadow-lg shadow-gold/20' 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => handleInputChange('organizer_type', 'personal')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${formData.organizer_type === 'personal' ? 'bg-gold' : 'bg-gray-100'}`}>
                            <User className={`w-5 h-5 ${formData.organizer_type === 'personal' ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Personal</div>
                            <div className="text-sm text-gray-500">As an individual</div>
                          </div>
                        </div>
                        {formData.organizer_type === 'personal' && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-5 h-5 text-gold" />
                          </div>
                        )}
                      </div>

                      <div 
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                          formData.organizer_type === 'company' 
                            ? 'border-gold bg-pale_yellow shadow-lg shadow-gold/20' 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => handleInputChange('organizer_type', 'company')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${formData.organizer_type === 'company' ? 'bg-gold' : 'bg-gray-100'}`}>
                            <Building className={`w-5 h-5 ${formData.organizer_type === 'company' ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Company</div>
                            <div className="text-sm text-gray-500">As a company</div>
                          </div>
                        </div>
                        {formData.organizer_type === 'company' && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-5 h-5 text-gold" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Company Selection */}
                    {formData.organizer_type === 'company' && (
                      <div className="space-y-2 animate-in slide-in-from-top duration-300">
                        <label className="block text-sm font-semibold text-gray-700">Select Company *</label>
                        {loadingCompanies ? (
                          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gold border-t-transparent"></div>
                              <span className="text-gray-600">Loading your companies...</span>
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
                              className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-200 appearance-none font-medium"
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
                              <Briefcase className="w-5 h-5 text-gray-400" />
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
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-gold">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Schedule & Timing</h2>
                    <p className="text-sm text-gray-500">Set the date and time</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date & Time */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-green-500" />
                      Event Start
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.start_date}
                          onChange={(e) => handleInputChange('start_date', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Time *</label>
                        <input
                          type="time"
                          required
                          value={formData.start_time}
                          onChange={(e) => handleInputChange('start_time', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-red-500" />
                      Event End
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">End Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.end_date}
                          onChange={(e) => handleInputChange('end_date', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">End Time *</label>
                        <input
                          type="time"
                          required
                          value={formData.end_time}
                          onChange={(e) => handleInputChange('end_time', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Deadline */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Registration Deadline (Optional)</label>
                    <input
                      type="date"
                      value={formData.registration_deadline}
                      onChange={(e) => handleInputChange('registration_deadline', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500">Leave empty for no deadline</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue & Format */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-gold">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Venue & Format</h2>
                    <p className="text-sm text-gray-500">Virtual or in-person</p>
                  </div>
                </div>
                
                {/* Virtual/Physical Toggle */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        !formData.is_virtual 
                          ? 'border-gold bg-pale_yellow shadow-lg shadow-gold/20' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => handleInputChange('is_virtual', false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${!formData.is_virtual ? 'bg-gold' : 'bg-gray-100'}`}>
                          <MapPin className={`w-5 h-5 ${!formData.is_virtual ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">In-Person</div>
                          <div className="text-sm text-gray-500">Physical venue</div>
                        </div>
                      </div>
                      {!formData.is_virtual && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-5 h-5 text-gold" />
                        </div>
                      )}
                    </div>

                    <div 
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.is_virtual 
                          ? 'border-gold bg-pale_yellow shadow-lg shadow-gold/20' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => handleInputChange('is_virtual', true)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${formData.is_virtual ? 'bg-gold' : 'bg-gray-100'}`}>
                          <Globe className={`w-5 h-5 ${formData.is_virtual ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Virtual</div>
                          <div className="text-sm text-gray-500">Online event</div>
                        </div>
                      </div>
                      {formData.is_virtual && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-5 h-5 text-gold" />
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Venue Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.venue_name}
                          onChange={(e) => handleInputChange('venue_name', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                          placeholder="e.g., Houston Convention Center"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Venue Address *</label>
                        <textarea
                          required
                          value={formData.venue_address}
                          onChange={(e) => handleInputChange('venue_address', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 resize-none"
                          placeholder="Enter complete venue address..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Virtual Platform</label>
                        <input
                          type="text"
                          value={formData.virtual_platform}
                          onChange={(e) => handleInputChange('virtual_platform', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                          placeholder="e.g., Zoom, Teams, WebEx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Link</label>
                        <input
                          type="url"
                          value={formData.meeting_link}
                          onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
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
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gold">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Agenda</h3>
                    </div>
                    <button
                      type="button"
                      onClick={addAgendaItem}
                      className="flex items-center px-3 py-1 text-sm bg-pale_yellow text-gray-700 rounded-lg hover:bg-yellow-200 transition-colors"
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
                          className="w-24 px-2 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/50"
                        />
                        <input
                          type="text"
                          value={item.session}
                          onChange={(e) => updateAgendaItem(index, 'session', e.target.value)}
                          className="flex-1 px-2 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/50"
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
              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gold">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Speakers</h3>
                    </div>
                    <button
                      type="button"
                      onClick={addSpeaker}
                      className="flex items-center px-3 py-1 text-sm bg-pale_yellow text-gray-700 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.speakers.map((speaker, index) => (
                      <div key={index} className="space-y-2 p-3 bg-white/50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Speaker {index + 1}</span>
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
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/50"
                          placeholder="Speaker name"
                        />
                        <input
                          type="text"
                          value={speaker.title}
                          onChange={(e) => updateSpeaker(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/50"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          value={speaker.company}
                          onChange={(e) => updateSpeaker(index, 'company', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/50"
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
            <div className="sticky top-32 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-xl bg-gold">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Event Settings</h3>
                    <p className="text-sm text-gray-500">Configure your event</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Capacity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Max Attendees
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_attendees}
                      onChange={(e) => handleInputChange('max_attendees', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., 100"
                    />
                  </div>

                  {/* Approval Required */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-gray-600" />
                        Require Approval
                      </div>
                      <div className="text-sm text-gray-500">Manual approval for registrations</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requires_approval}
                        onChange={(e) => handleInputChange('requires_approval', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                    </label>
                  </div>

                  {/* Pricing */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Event Pricing
                    </label>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            formData.is_free 
                              ? 'border-gold bg-pale_yellow' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => handleInputChange('is_free', true)}
                        >
                          <div className="text-center">
                            <Heart className={`w-5 h-5 mx-auto mb-1 ${formData.is_free ? 'text-gold' : 'text-gray-400'}`} />
                            <div className="text-sm font-semibold">Free</div>
                          </div>
                          {formData.is_free && (
                            <div className="absolute top-1 right-1">
                              <Check className="w-4 h-4 text-gold" />
                            </div>
                          )}
                        </div>

                        <div 
                          className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            !formData.is_free 
                              ? 'border-gold bg-pale_yellow' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => handleInputChange('is_free', false)}
                        >
                          <div className="text-center">
                            <DollarSign className={`w-5 h-5 mx-auto mb-1 ${!formData.is_free ? 'text-gold' : 'text-gray-400'}`} />
                            <div className="text-sm font-semibold">Paid</div>
                          </div>
                          {!formData.is_free && (
                            <div className="absolute top-1 right-1">
                              <Check className="w-4 h-4 text-gold" />
                            </div>
                          )}
                        </div>
                      </div>

                      {!formData.is_free && (
                        <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-top duration-300">
                          <select
                            value={formData.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold text-sm"
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
                            className="col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold"
                            placeholder="0.00"
                          />
                        </div>
                      )}

                      {/* External Payment Link */}
                      {!formData.is_free && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-in slide-in-from-top duration-300">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-amber-800 mb-1">
                                External Payment Link (Optional)
                              </label>
                              <p className="text-xs text-amber-600 mb-2">
                                Provide your own payment link (PayPal, Flutterwave, bank transfer page, etc.) to receive payments directly. 
                                If left empty, payments will be processed through Connectize.
                              </p>
                              <input
                                type="url"
                                value={formData.external_payment_url}
                                onChange={(e) => handleInputChange('external_payment_url', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold text-sm"
                                placeholder="https://paypal.me/yourcompany or https://flutterwave.com/pay/..."
                              />
                              {formData.external_payment_url && (
                                <p className="mt-2 text-xs text-green-600 flex items-center">
                                  <Check className="w-3 h-3 mr-1" />
                                  Attendees will be redirected to this link for payment
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="space-y-3">
                    {/* Publish Toggle - Inline with buttons */}
                    <label className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-gold transition-colors">
                      <div className="flex items-center space-x-3">
                        {formData.is_published ? (
                          <Eye className="w-5 h-5 text-green-600" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {formData.is_published ? 'Publish event (visible to everyone)' : 'Save as draft (only you can see)'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('is_published', !formData.is_published)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.is_published ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            formData.is_published ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>

                    <button
                      type="submit"
                      disabled={loading || loadingEvent}
                      className="w-full group relative px-6 py-4 bg-gold text-white font-semibold rounded-xl hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>{isEditMode ? 'Updating Event...' : 'Creating Event...'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Save className="w-5 h-5" />
                          <span>{isEditMode ? 'Update Event' : 'Create Event'}</span>
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="w-full px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200"
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