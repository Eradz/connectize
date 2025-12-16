import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Users, DollarSign, ArrowLeft, 
  UserCheck, Share2, Bookmark, ExternalLink, Mail, Phone,
  CheckCircle, AlertCircle, XCircle, Globe, Building, Search,
  Filter, Download, Eye, User, Badge, ChevronDown, ChevronUp,
  Star, Award, TrendingUp, MessageCircle, Heart, Copy,
  Shield, Wifi, Coffee, Car, Gift, Zap, Target,
  ClockCheck,
  Users2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { workforceAPI } from '../../api-services/workforce';
import { webRoutes } from '../../lib/webRoutes';
import { useAuth } from '../../context/userContext';

const WorkforceEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Participants state
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantFilter, setParticipantFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [participantsPerPage] = useState(10);
  const [isEventCreator, setIsEventCreator] = useState(false);
  const [myRegistration, setMyRegistration] = useState(null);

  // Debug user state
  console.log('Component render - User state:', user);
  console.log('Current myRegistration state:', myRegistration);

  useEffect(() => {
    if (id) {
      loadEventDetail();
    }
  }, [id]);

  const loadEventDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await workforceAPI.getEvent(id);
      setEvent(response.data);
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is event creator and get their registration
  useEffect(() => {
    console.log('useEffect triggered - event:', event?.id, 'user:', user?.id);
    
    if (event && user) {
      // Check if user is the creator (check organizer field - created_by doesn't exist)
      const isCreator = event.organizer === user.id;
      setIsEventCreator(isCreator);
      console.log('Event creator check:', {
        userId: user.id,
        userIdType: typeof user.id,
        eventOrganizer: event.organizer,
        eventOrganizerType: typeof event.organizer,
        isCreator,
        comparison: `${event.organizer} === ${user.id}`
      });
      
      // Get user's registration for this event
      const checkMyRegistration = async () => {
        try {
          console.log('Checking registration for event:', event.id);
          const response = await workforceAPI.getMyEventRegistrations();
          console.log('My registrations API response:', response);
          
          if (response.success && response.data?.results) {
            console.log('Found registrations:', response.data.results.length);
            response.data.results.forEach((reg, index) => {
              console.log(`Registration ${index + 1}:`, {
                regId: reg.id,
                eventId: reg.event?.id,
                currentEventId: event.id,
                matches: reg.event?.id === event.id
              });
            });
            
            const myReg = response.data.results.find(reg => {
              const regEventId = reg.event?.id;
              const currentEventId = event.id;
              // Ensure both are strings for comparison
              return String(regEventId) === String(currentEventId);
            });
            console.log('Found matching registration:', myReg);
            setMyRegistration(myReg || null);
          } else {
            console.log('No registrations found or API error:', response);
            setMyRegistration(null);
          }
        } catch (error) {
          console.error('Error checking my registration:', error);
          setMyRegistration(null);
        }
      };
      
      checkMyRegistration();
    }
  }, [event, user]);

  // Debug: Log myRegistration state changes
  useEffect(() => {
    console.log('myRegistration state changed:', myRegistration);
  }, [myRegistration]);

  // When creator determination changes, attempt loading participants if panel already toggled or not yet loaded
  useEffect(() => {
    if (event && isEventCreator && participants.length === 0 && !participantsLoading) {
      console.log('Creator confirmed, attempting participants fetch');
      loadParticipants();
    }
  }, [isEventCreator]);

  const loadParticipants = async () => {
    try {
      setParticipantsLoading(true);
      
      if (isEventCreator) {
        // If user is event creator, load all participants
        const apiWrapper = await workforceAPI.getEventRegistrations(event.id);
        console.log('Participants API raw wrapper:', apiWrapper);
        const payload = apiWrapper?.data; // unwrap from axios-like wrapper
        // Possible shapes: paginated { results: [...], count, next, previous } OR direct array
        const resultArray = payload?.results || (Array.isArray(payload) ? payload : null);
        if (resultArray) {
          setParticipants(resultArray);
          console.log('Loaded participants count:', resultArray.length);
        } else {
          console.warn('Participants payload missing expected data structure', { payload });
          setParticipants([]);
        }
      } else {
        // If user is not creator, only show their own registration
        if (myRegistration) {
          setParticipants([myRegistration]);
          console.log('Loaded own registration');
        } else {
          setParticipants([]);
          console.log('No registration found for current user');
        }
      }
    } catch (error) {
      console.error('Error loading participants:', error);
      // If error (likely permission denied), fall back to showing only own registration
      if (myRegistration) {
        setParticipants([myRegistration]);
      } else {
        setParticipants([]);
      }
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      await workforceAPI.registerForEvent(id);
      // Reload event to get updated registration count
      await loadEventDetail();
    } catch (err) {
      console.error('Error registering for event:', err);
      setError('Failed to register for event');
    } finally {
      setIsRegistering(false);
    }
  };

  const getEventStatus = (event) => {
    if (!event || !event.start_date) return { status: 'upcoming', label: 'Upcoming', color: 'blue' };
    
    const now = new Date();
    const start = new Date(event.start_date);
    const end = event.end_date ? new Date(event.end_date) : null;
    
    if (start > now) {
      return { status: 'upcoming', label: 'Upcoming', color: 'blue' };
    } else if (end && now <= end) {
      return { status: 'ongoing', label: 'Ongoing', color: 'green' };
    } else {
      return { status: 'completed', label: 'Completed', color: 'gray' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Participant filtering and pagination
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.attendee_name?.toLowerCase().includes(participantSearch.toLowerCase()) ||
                         participant.email?.toLowerCase().includes(participantSearch.toLowerCase()) ||
                         participant.phone_number?.includes(participantSearch);
    
    const matchesFilter = participantFilter === 'all' || participant.status === participantFilter;
    
    return matchesSearch && matchesFilter;
  });

  const totalParticipants = filteredParticipants.length;
  const totalPages = Math.ceil(totalParticipants / participantsPerPage);
  const startIndex = (currentPage - 1) * participantsPerPage;
  const paginatedParticipants = filteredParticipants.slice(startIndex, startIndex + participantsPerPage);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'pending':
        return 'bg-indigo-100  border border-indigo-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-indigo-100  border border-indigo-200';
    }
  };

  const handleToggleParticipants = () => {
    const newShowState = !showParticipants;
    setShowParticipants(newShowState);
    if (newShowState && participants.length === 0) {
      loadParticipants();
    }
  };

  const exportParticipants = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Status', 'Registration Date', 'Payment Status'].join(','),
      ...filteredParticipants.map(p => [
        p.attendee_name || 'N/A',
        p.email || p.user?.email || 'N/A',
        p.phone_number || 'N/A',
        p.status || 'N/A',
        new Date(p.created_at).toLocaleDateString(),
        p.payment_status || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}_participants.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyEventLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // You could save this to localStorage or send to API
  };

  const getOrganizerInfo = (event) => {
    // Prioritize company organizer if available
    if (event.organizer_company && event.organizer_company_name) {
      return {
        name: event.organizer_company_name,
        type: 'Company',
        email: event.contact_email,
        phone: event.contact_phone
      };
    } else if (event.company_name) {
      return {
        name: event.company_name,
        type: 'Company',
        email: event.contact_email,
        phone: event.contact_phone
      };
    } else if (event.organizer && typeof event.organizer === 'object') {
      return {
        name: event.organizer.company_name || event.organizer.name || 'Professional Organizer',
        type: event.organizer.company_name ? 'Company' : 'Professional',
        email: event.organizer.email || event.contact_email,
        phone: event.organizer.phone || event.contact_phone
      };
    } else if (event.organizer_name) {
      return {
        name: event.organizer_name,
        type: 'Individual',
        email: event.contact_email,
        phone: event.contact_phone
      };
    } else if (event.organizer && typeof event.organizer === 'number') {
      return {
        name: event.organizer_name || 'Event Organizer',
        type: 'Professional',
        email: event.contact_email,
        phone: event.contact_phone
      };
    } else {
      return {
        name: 'Connectize Professional',
        type: 'Platform',
        email: event.contact_email,
        phone: event.contact_phone
      };
    }
  };

  const getDaysUntilEvent = (startDate) => {
    if (!startDate) return null;
    const now = new Date();
    const start = new Date(startDate);
    const diffTime = start - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return null;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const getEventFeatures = (event) => {
    const features = [];
    
    if (event.is_virtual) {
      features.push({ icon: Wifi, label: 'Virtual Event', color: 'blue' });
    } else {
      features.push({ icon: MapPin, label: 'In-Person', color: 'green' });
    }
    
    if (event.is_free) {
      features.push({ icon: Gift, label: 'Free Event', color: 'emerald' });
    }
    
    if (event.provides_certification) {
      features.push({ icon: Award, label: 'Certificate', color: 'purple' });
    }
    
    if (event.networking_opportunities) {
      features.push({ icon: Users, label: 'Networking', color: 'orange' });
    }
    
    if (event.refreshments_provided) {
      features.push({ icon: Coffee, label: 'Refreshments', color: 'amber' });
    }
    
    if (event.parking_available) {
      features.push({ icon: Car, label: 'Parking', color: 'indigo' });
    }
    
    return features;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Event Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'The event you are looking for could not be found.'}</p>
          <button
            onClick={() => navigate(webRoutes.workforceEvents)}
            className="flex items-center text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const eventStatus = getEventStatus(event);
  const StatusIcon = eventStatus.status === 'completed' ? CheckCircle : 
                    eventStatus.status === 'ongoing' ? AlertCircle : Clock;
  const organizerInfo = getOrganizerInfo(event);
  const daysUntil = getDaysUntilEvent(event.start_date);
  const eventFeatures = getEventFeatures(event);

  return (
    <div className="min-h-screen ">
      <div className=" flex py-4 lg:py-8">
          {/* Main Content */}
          <div className="bg-white space-y-8 px-4 py-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 ">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-gradient-radial from-white/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative p-6 ">
                <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
                  {/* Event Info */}
                  <div className="w-full md:w-[55%]">
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                      <span className="inline-flex items-center px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                        <StatusIcon className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                        {eventStatus.label}
                      </span>
                      
                      
                      {event.is_free && (
                        <span className="inline-flex items-center px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-semibold bg-emerald-500 text-white">
                          Free Event
                        </span>
                      )}
                      {daysUntil && (
                        <span className="inline-flex items-center px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-semibold bg-amber-500 text-white">
                          <Clock className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                          {daysUntil}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 lg:mb-6 leading-tight">{event.title}</h1>
                    <p className="text-base lg:text-xl  leading-relaxed mb-6 lg:mb-8">{event.description}</p>
                    <button className='hidden md:flex'>
                      <Link to={`/events/${event.id}/register`} className="inline-flex border border-white items-center px-20 py-2 rounded-lg bg-white text-black hover:bg-indigo-700">
                        Register Now
                      </Link>
                    </button>
                  </div>
                  
                  {/* Quick Details Card */}
                  <div className="mx-auto w-[90%] md:w-[40%] bg-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/20">
                    <h3 className="text-base lg:text-lg font-bold text-white mb-4 lg:mb-6">Event Details</h3>
                    <div className="space-y-3 lg:space-y-4">
                      <div className='flex gap-2'>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs lg:text-sm font-semibold  text-white border border-white capitalize">
                          <Globe className='w-4 h-4 mr-1'/>
                          {event.is_virtual ? 'Virtual' : 'In-Person'}
                        </span>
                        <span className="inline-flex items-center px-2 py-1  rounded-full text-xs lg:text-sm font-semibold  text-white border border-white capitalize">
                        <Globe className='w-4 h-4 mr-1'/>
                        {event.event_type}
                      </span>

                      </div>
                      <div className="flex items-start space-x-3 lg:space-x-4">
                        <Building className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        <p className="text-xs lg:text-sm font-semibold text-white">
                            {event.organizer_name || "Connectize"}
                        </p>
                      </div>
                      <div className="flex items-start space-x-3 lg:space-x-4">
                        <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                          <p className="text-xs lg:text-sm font-semibold text-white">{formatDate(event.start_date)}</p>
                      </div>
                      <div className="flex items-start space-x-3 lg:space-x-4">
                        <ClockCheck className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                         <p className="text-xs lg:text-sm font-semibold text-white">
                            {formatTime(event.start_date)}
                            {event.end_date && ` - ${formatTime(event.end_date)}`}
                          </p>
                      </div>
                      <div className="flex items-start space-x-3 lg:space-x-4">
                        <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        <div>
                          <p className="text-xs lg:text-sm font-semibold text-white">
                            {event.is_virtual ? 'Virtual Event' : (event.venue_name || 'Venue TBA')}
                          </p>
                          <p className="text-xs lg:text-sm ">
                            {event.is_virtual ? 
                              (event.virtual_platform || 'Online Platform') :
                              (event.city || 'Location details pending')
                            }
                          </p>
                        </div>
                      </div>
                      <button className='flex w-full md:hidden'>
                      <Link to={`/events/${event.id}/register`} className="inline-flex border border-white items-center px-20 py-2 rounded-lg bg-white text-black hover:bg-indigo-700">
                        Register Now
                      </Link>
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex px-4 gap-4 '>
                <div className='w-[70%] space-y-6 '>
                  {/* Organizer Spotlight */}
                  <div className="bg-white/80 rounded-lg border p-6">
                    <h2 className="text-lg font-bold mb-4">Event Organizer</h2>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {organizerInfo.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-bold ">{organizerInfo.name}</h3>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                            {organizerInfo.type}
                          </span>
                        </div>
                        {event.organizer_description && (
                          <p className=" mt-2">
                            {event.organizer_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* About This Event */}
                  {event.long_description && (
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-indigo-100 p-8 shadow-lg">
                      <h2 className="text-2xl font-bold  mb-6 flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center mr-3">
                          <MessageCircle className="w-5 h-5 " />
                        </div>
                        About This Event
                      </h2>
                      <div className="prose max-w-none  leading-relaxed">
                        <p className="text-lg">{event.long_description}</p>
                      </div>
                    </div>
                  )}

                  {/* Agenda */}
                  {event.agenda && event.agenda.length > 0 && (
                    <div className="bg-white rounded border border-gray-200 p-3">
                      <h2 className="text-sm font-medium text-gray-900 mb-2">Schedule</h2>
                      <div className="space-y-1">
                        {event.agenda.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-gray-600">{item.time}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-xs">{item.session}</h3>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Speakers */}
                  {event.speakers && event.speakers.length > 0 && (
                    <div className="bg-white rounded border border-gray-200 p-3">
                      <h2 className="text-sm font-medium text-gray-900 mb-2">Speakers</h2>
                      <div className="space-y-1">
                        {event.speakers.map((speaker, index) => {
                          // Handle both string and object formats
                          const speakerName = typeof speaker === 'string' ? speaker : speaker.name || 'Unknown Speaker';
                          const speakerTitle = typeof speaker === 'string' ? '' : speaker.title || '';
                          const speakerCompany = typeof speaker === 'string' ? '' : speaker.company || '';
                          
                          return (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-medium text-xs">
                                  {speakerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 text-xs">{speakerName}</h3>
                                {speakerTitle && <p className="text-xs text-gray-600">{speakerTitle}</p>}
                                {speakerCompany && <p className="text-xs text-gray-500">{speakerCompany}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                 

                  {/* Requirements */}
                  {event.requirements && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-xl font-semibold text-slate-900 mb-4">Requirements</h2>
                      <div className="text-slate-600">
                        <p>{event.requirements}</p>
                      </div>
                    </div>
                  )}
                </div>
                  {/* Sidebar */}
          <div className="space-y-6 w-[30%] ">
             {/* Event Participants Section - conditional visibility */}
                  <div className="">
                    <div className="overflow-hidden">
                        <div className="flex flex-col">
                          <div className="flex space-x-4">
                              <h2 className="text-xl font-bold ">Participants</h2>
                              <button
                              onClick={handleToggleParticipants}
                              className="flex items-center px-4 py-2 text-sm border rounded-lg"
                            >
                              {showParticipants ? 'Hide' : 'View'}
                              {showParticipants ? 
                                <ChevronUp className="w-4 h-4 ml-2" /> : 
                                <ChevronDown className="w-4 h-4 ml-2" />
                              }
                            </button>
                            </div>
                          <div className="flex items-center space-x-1 text-sm">
                            <Users2 className="w-4 h-4 " />
                              <p className="">Event attendees</p>
                            <span className="text-lg font-semibold px-4 py-2 rounded-xl">
                              {(event.attendees_count ?? 0) || participants.length || 0}
                            </span>
                            {/* <button
                              onClick={exportParticipants}
                              className="flex items-center px-4 py-2 text-sm  hover: hover:bg-indigo-50 rounded-xl transition-all duration-300"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </button> */}
                            
                          </div>
                        </div>
                      

                      {showParticipants && (
                        <div className="p-6">
                          {/* Search and Filter Controls */}
                          <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 " />
                              <input
                                type="text"
                                placeholder="Search participants..."
                                value={participantSearch}
                                onChange={(e) => {
                                  setParticipantSearch(e.target.value);
                                  setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/70 backdrop-blur-sm transition-all duration-300"
                              />
                            </div>
                            <div className="relative">
                              <select
                                value={participantFilter}
                                onChange={(e) => {
                                  setParticipantFilter(e.target.value);
                                  setCurrentPage(1);
                                }}
                                className="appearance-none bg-white/70 backdrop-blur-sm border border-indigo-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                              >
                                <option value="all">All Status</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5  pointer-events-none" />
                            </div>
                          </div>

                          {participantsLoading ? (
                            <div className="flex items-center justify-center py-20">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
                                <span className="text-lg  font-medium">Loading participants...</span>
                              </div>
                            </div>
                          ) : paginatedParticipants.length === 0 ? (
                            <div className="text-center py-16">
                              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 " />
                              </div>
                              <h3 className="text-xl font-bold  mb-3">
                                {participants.length === 0 
                                  ? 'No participants visible' 
                                  : 'No participants match your search'
                                }
                              </h3>
                              <p className="">
                                {participants.length === 0 
                                  ? 'Participant information is only available to event creators'
                                  : 'Try adjusting your search criteria'
                                }
                              </p>
                              {isEventCreator && (event?.attendees_count || 0) > 0 && participants.length === 0 && (
                                <div className="mt-6 space-y-3">
                                  <p className="text-sm ">You are the organizer and attendee count is {event.attendees_count}, but no list was returned. You can retry fetching:</p>
                                  <button
                                    onClick={loadParticipants}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                                  >Retry Load Participants</button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              {/* Desktop Table View */}
                              <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-indigo-200">
                                      <th className="text-left py-4 px-6 font-bold ">Participant</th>
                                      <th className="text-left py-4 px-6 font-bold ">Contact</th>
                                      <th className="text-left py-4 px-6 font-bold ">Status</th>
                                      <th className="text-left py-4 px-6 font-bold ">Registered</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-indigo-100">
                                    {paginatedParticipants.map((participant, index) => (
                                      <tr key={participant.id || index} className="hover:bg-indigo-50/50 transition-all duration-300 group">
                                        <td className="py-4 px-6">
                                          <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                              <span className="text-white font-bold">
                                                {(participant.attendee_name || 'U').charAt(0).toUpperCase()}
                                              </span>
                                            </div>
                                            <div>
                                              <p className="font-semibold ">
                                                {participant.attendee_name || 'Unknown User'}
                                              </p>
                                              {participant.registration_notes && (
                                                <p className="text-sm ">{participant.registration_notes}</p>
                                              )}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-4 px-6">
                                          <div className="space-y-1">
                                            {participant.attendee_email && (
                                              <p className="text-sm  font-medium break-all">
                                                <a href={`mailto:${participant.attendee_email}`} className="hover:underline">{participant.attendee_email}</a>
                                              </p>
                                            )}
                                            {participant.attendee_phone && (
                                              <p className="text-sm ">
                                                <a href={`tel:${participant.attendee_phone}`} className="hover:underline">{participant.attendee_phone}</a>
                                              </p>
                                            )}
                                            {!participant.attendee_email && !participant.attendee_phone && (
                                              <p className="text-sm  italic">Contact info not available</p>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-4 px-6">
                                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(participant.status)}`}>
                                            {participant.status || 'pending'}
                                          </span>
                                        </td>
                                        <td className="py-4 px-6">
                                          <p className=" font-medium">
                                            {new Date(participant.registered_at || participant.created_at).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric'
                                            })}
                                          </p>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Mobile Card View */}
                              <div className="md:hidden space-y-4">
                                {paginatedParticipants.map((participant, index) => (
                                  <div key={participant.id || index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center space-x-4">
                                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <span className="text-white font-bold">
                                          {(participant.attendee_name || 'U').charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                          <h3 className="font-bold  truncate">
                                            {participant.attendee_name || 'Unknown User'}
                                          </h3>
                                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(participant.status)}`}>
                                            {participant.status || 'pending'}
                                          </span>
                                        </div>
                                        {(participant.attendee?.email || participant.user?.email) && (
                                          <div className="space-y-0.5">
                                            {participant.attendee_email && (
                                              <p className="text-sm  font-medium break-all">
                                                <a href={`mailto:${participant.attendee_email}`} className="hover:underline">{participant.attendee_email}</a>
                                              </p>
                                            )}
                                            {participant.attendee_phone && (
                                              <p className="text-sm ">
                                                <a href={`tel:${participant.attendee_phone}`} className="hover:underline">{participant.attendee_phone}</a>
                                              </p>
                                            )}
                                            {!participant.attendee_email && !participant.attendee_phone && (
                                              <p className="text-sm  italic">Contact info not available</p>
                                            )}
                                          </div>
                                        )}
                                        <p className="text-sm  mt-1">
                                          Registered {new Date(participant.registered_at || participant.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-between border-t border-indigo-200 pt-6">
                                  <div className=" font-medium">
                                    Showing {startIndex + 1} to {Math.min(startIndex + participantsPerPage, totalParticipants)} of {totalParticipants} participants
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => setCurrentPage(currentPage - 1)}
                                      disabled={currentPage === 1}
                                      className="px-4 py-2 font-medium  hover: disabled:opacity-50 disabled:cursor-not-allowed rounded-xl hover:bg-indigo-50 transition-all duration-300"
                                    >
                                      Previous
                                    </button>
                                    <div className="flex space-x-2">
                                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                          <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-4 py-2 font-medium rounded-xl transition-all duration-300 ${
                                              currentPage === pageNum
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                : 'text-indigo-700 hover:bg-indigo-100'
                                            }`}
                                          >
                                            {pageNum}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <button
                                      onClick={() => setCurrentPage(currentPage + 1)}
                                      disabled={currentPage === totalPages}
                                      className="px-4 py-2 font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl hover:bg-indigo-50 transition-all duration-300"
                                    >
                                      Next
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
            {/* Registration Card */}
            <div className="overflow-hidden">
              <div className="">
                <div className="relative">
                  <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-3">Join This Event</h3>
                  <p className="">
                    {event.is_free ? 'Free registration available' : 'Secure your spot today'}
                  </p>
                </div>
              </div>
              
              <div className="">
                <div className="space-y-4 lg:space-y-6 mb-6 lg:mb-8">
                  <div className="flex justify-between items-center">
                    <span className="flex font-bold text-base lg:text-lg">
                      <User className="w-6 h-6 " />
                      Registered:
                      </span>
                    <div className="text-right">
                      <span className="text-xl lg:text-2xl font-bold ">{event.attendees_count || 0}</span>
                      {event.max_attendees && (
                        <span className=" text-base lg:text-lg">/{event.max_attendees}</span>
                      )}
                    </div>
                  </div>

                      {event.max_attendees && (
                        <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-[#FFC000] to-[#FF8400] h-3 rounded-full transition-all duration-500 shadow-sm"
                            style={{ 
                              width: `${Math.min((event.attendees_count || 0) / event.max_attendees * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      )}

                  <div className="flex justify-between items-center">
                    <span className=" font-bold text-base lg:text-lg">Price:</span>
                    <span className="text-2xl lg:text-3xl font-bold ">
                      {event.is_free ? 'FREE' : `$${event.ticket_price}`}
                      {!event.is_free && event.currency && event.currency !== 'USD' && (
                        <span className="text-base lg:text-lg  ml-2">{event.currency}</span>
                      )}
                    </span>
                  </div>
                  
                  
                  
                  {event.max_attendees && (
                    <div className="flex justify-between items-center">
                      <span className=" font-bold">Available spots:</span>
                      <span className="font-bold  text-lg">
                        {Math.max(event.max_attendees - (event.attendees_count || 0), 0)}
                      </span>
                    </div>
                  )}
                </div>

                {eventStatus.status === 'upcoming' && (
                  <div className="space-y-4 lg:space-y-6">
                    {myRegistration ? (
                      // User is already registered
                      <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl lg:rounded-2xl border border-emerald-200 shadow-lg">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald-100 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                          <UserCheck className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-lg lg:text-xl font-bold text-emerald-900 mb-2">You're Registered!</h3>
                        <p className="text-emerald-700 mb-2 lg:mb-3">
                          Status: <span className="font-semibold capitalize">{myRegistration.status}</span>
                        </p>
                        <p className="text-emerald-600 text-sm">
                          Registered on {new Date(myRegistration.registered_at || myRegistration.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      // User is not registered
                      <button
                        onClick={handleRegister}
                        disabled={isRegistering || (event.max_attendees && event.attendees_count >= event.max_attendees)}
                        className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white py-3 lg:py-4 px-6 lg:px-8 rounded-xl lg:rounded-2xl hover:from-indigo-700 hover:via-indigo-800 hover:to-purple-800 
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 
                                 flex items-center justify-center font-bold text-base lg:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                      >
                        {isRegistering ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 lg:h-6 lg:w-6 border-3 border-white border-t-transparent mr-2 lg:mr-3"></div>
                            Registering...
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3" />
                            Register Now
                          </>
                        )}
                      </button>
                    )}
                    
                    {event.max_attendees && event.attendees_count >= event.max_attendees && (
                      <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl lg:rounded-2xl border border-amber-200 shadow-lg">
                        <p className="text-amber-800 font-bold text-base lg:text-lg">Event is Full</p>
                        <p className="text-amber-700 mt-2">Join waitlist for updates</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                      <button
                        onClick={handleShare}
                        className="flex items-center justify-center py-3 lg:py-4 px-4 lg:px-6 border-2 border-indigo-200 rounded-xl lg:rounded-2xl  hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 font-semibold text-sm lg:text-base"
                      >
                        <Share2 className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                        Share
                      </button>
                      <button
                        onClick={handleBookmark}
                        className={`flex items-center justify-center py-3 lg:py-4 px-4 lg:px-6 border-2 rounded-xl lg:rounded-2xl transition-all duration-300 font-semibold text-sm lg:text-base ${
                          isBookmarked 
                            ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' 
                            : 'border-indigo-200  hover:bg-indigo-50 hover:border-indigo-300'
                        }`}
                      >
                        <Heart className={`w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 ${isBookmarked ? 'fill-current' : ''}`} />
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {eventStatus.status === 'ongoing' && (
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-green-800 font-medium">Event is Live!</p>
                    {event.is_virtual && event.meeting_link && (
                      <a 
                        href={event.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-3 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join Now
                      </a>
                    )}
                  </div>
                )}

                {eventStatus.status === 'completed' && (
                  <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-700 font-medium">Event Completed</p>
                    <p className="text-slate-600 text-sm mt-1">Thank you for your interest</p>
                  </div>
                )}
              </div>
            </div>

            {/* Event Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Event Insights
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-slate-700">Attendees</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{event.attendees_count || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-slate-700">Capacity</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">{event.max_attendees || '∞'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center">
                    <Badge className="w-5 h-5 text-emerald-600 mr-3" />
                    <span className="text-slate-700">Type</span>
                  </div>
                  <span className="text-emerald-600 font-semibold capitalize">{event.event_type || 'Workshop'}</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            {(event.contact_email || event.contact_phone) && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-blue-600" />
                  Get in Touch
                </h3>
                <div className="space-y-4">
                  {event.contact_email && (
                    <div className="flex items-center text-slate-700 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <Mail className="w-5 h-5 mr-3 text-blue-600" />
                      <a 
                        href={`mailto:${event.contact_email}`}
                        className="text-slate-700 hover:text-blue-600 font-medium"
                      >
                        {event.contact_email}
                      </a>
                    </div>
                  )}
                  {event.contact_phone && (
                    <div className="flex items-center text-slate-700 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <Phone className="w-5 h-5 mr-3 text-blue-600" />
                      <a 
                        href={`tel:${event.contact_phone}`}
                        className="text-slate-700 hover:text-blue-600 font-medium"
                      >
                        {event.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* More Events */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
                Explore More
              </h3>
              <Link
                to={webRoutes.workforceEvents}
                className="flex items-center justify-center w-full py-3 px-4 border-2 border-blue-200 rounded-xl 
                         text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 font-medium"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Browse All Events
              </Link>
            </div>
          </div>

        </div>
      </div>

  </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Share This Event</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                <Globe className="w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 bg-transparent text-slate-600 text-sm"
                />
                <button
                  onClick={copyEventLink}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this event: ${event.title}`)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-3 px-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Building className="w-4 h-4 mr-2" />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkforceEventDetail;
