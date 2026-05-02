import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Event Details | Connectize",
    description: "View details, speakers, and registration information for this oil and gas industry event.",
  keywords: "event details, oil and gas conference, industry event, register, Connectize",
  });

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Users, DollarSign, ArrowLeft, 
  UserCheck, Share2, Bookmark, ExternalLink, Mail, Phone,
  CheckCircle, AlertCircle, XCircle, Globe, Building, Search,
  Filter, Download, Eye, User, Badge, ChevronDown, ChevronUp,
  Star, Award, TrendingUp, MessageCircle, Heart, Copy, Check,
  Shield, Wifi, Coffee, Car, Gift, Zap, Target,
  ClockCheck,
  Users2,
  User2,
  Plus,
  CreditCard,
  Loader2,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { workforceAPI } from '../../api-services/workforce';
import { webRoutes } from '../../lib/webRoutes';
import { useAuth } from '../../context/userContext';
import BackArrowButton from '../../components/BackArrowButton';
const WorkforceEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
  const [showStartModal, setShowStartModal] = useState(false);
  const [isStartingEvent, setIsStartingEvent] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [updatingRegistrationId, setUpdatingRegistrationId] = useState(null);

  // Ref to track if registration has been checked for this event
  const registrationCheckedRef = useRef(null);

  // Handle payment return from Stripe Checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success' && id) {
      // Payment was successful, verify with backend and update status
      setError(null);
      setPaymentError(null);
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
      
      // Verify payment with Stripe and update registration
      const verifyPayment = async () => {
        try {
          const response = await workforceAPI.verifyEventPayment(id);
          const data = response.data || response;
          
          if (data.status === 'confirmed' && data.registration) {
            // Update registration state immediately
            setMyRegistration(data.registration);
          }
          
          // Reset the registration check ref and reload
          registrationCheckedRef.current = null;
          await loadEventDetail();
        } catch (err) {
          console.error('Error verifying payment:', err);
          // Still reload to check status
          registrationCheckedRef.current = null;
          await loadEventDetail();
        }
      };
      
      verifyPayment();
    } else if (paymentStatus === 'cancelled') {
      // Payment was cancelled
      setPaymentError('Payment was cancelled. Your registration is still pending.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [id]);

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
      // Set bookmark state from event data
      setIsBookmarked(response.data?.is_bookmarked || false);
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is event creator and get their registration
  useEffect(() => {
    if (event && user) {
      // Skip if we've already checked for this event+user combination
      const checkKey = `${event.id}-${user.id}`;
      if (registrationCheckedRef.current === checkKey) {
        return;
      }
      // Mark as checked for this combination
      registrationCheckedRef.current = checkKey;
      
      // Use backend-supplied is_organizer flag when available; fall back to id comparison
      const isCreator = event.is_organizer === true || event.organizer === user.id;
      setIsEventCreator(isCreator);

      // Get user's registration for this event
      const checkMyRegistration = async () => {
        try {
          const response = await workforceAPI.getMyEventRegistrations();

          if (response.data?.results) {
            const myReg = response.data.results.find(reg => {
              const regEventId = reg.event?.id;
              const currentEventId = event.id;
              return String(regEventId) === String(currentEventId);
            });
            setMyRegistration(myReg || null);
          } else {
            setMyRegistration(null);
          }
        } catch (error) {
          console.error('Error checking my registration:', error);
          setMyRegistration(null);
        }
      };

      checkMyRegistration();
    }
  }, [event?.id, user?.id]);

  // When creator determination changes, attempt loading participants if panel already toggled or not yet loaded
  useEffect(() => {
    if (event && isEventCreator && participants.length === 0 && !participantsLoading) {
      loadParticipants();
    }
  }, [isEventCreator]);

  // Live countdown timer for upcoming events
  useEffect(() => {
    if (!event?.start_date) return;
    const status = getEventStatus(event);
    if (status.status !== 'upcoming') return;

    const tick = () => {
      const now = new Date();
      const start = new Date(event.start_date);
      const diff = start - now;
      if (diff <= 0) { setCountdown(null); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown({ days, hours, minutes, seconds, isStartingSoon: diff <= 30 * 60 * 1000 });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [event?.start_date, event?.event_status]);

  const loadParticipants = async () => {
    try {
      setParticipantsLoading(true);

      if (isEventCreator) {
        // If user is event creator, load all participants
        const apiWrapper = await workforceAPI.getEventRegistrations(event.id);
        const payload = apiWrapper?.data; // unwrap from axios-like wrapper
        // Possible shapes: paginated { results: [...], count, next, previous } OR direct array
        const resultArray = payload?.results || (Array.isArray(payload) ? payload : null);
        if (resultArray) {
          setParticipants(resultArray);
        } else {
          setParticipants([]);
        }
      } else {
        // If user is not creator, only show their own registration
        if (myRegistration) {
          setParticipants([myRegistration]);
        } else {
          setParticipants([]);
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
      const response = await workforceAPI.registerForEvent(id);
      const data = response.data || response;
      
      // Check if this is a paid event with external payment
      if (data.external_payment_url || data.requires_external_payment) {
        // Set the registration from response so UI updates immediately
        if (data.registration) {
          setMyRegistration(data.registration);
        }
        // Open the external payment URL in a new tab
        window.open(data.external_payment_url, '_blank');
        // Reload event to get updated attendee count
        await loadEventDetail();
        return;
      }
      
      // For internal payment, set registration from response
      if (data.requires_payment && data.registration) {
        setMyRegistration(data.registration);
        await loadEventDetail();
        return;
      }
      
      // For free events, set registration from response
      if (data.id || data.registration) {
        setMyRegistration(data.registration || data);
      }
      
      // Reload event to get updated attendee count
      await loadEventDetail();
    } catch (err) {
      console.error('Error registering for event:', err);
      
      // Check if this is a pending payment error with payment URL
      const errorData = err.response?.data;
      if (errorData?.requires_payment && event?.external_payment_url) {
        // User has pending payment, redirect to payment URL
        window.open(event.external_payment_url, '_blank');
        return;
      }
      
      setError(errorData?.error || 'Failed to register for event');
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle internal payment via Stripe Checkout
  const handleInternalPayment = async () => {
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);
      
      // Create a Stripe Checkout Session and redirect to it
      const response = await workforceAPI.createEventCheckoutSession(id);
      const data = response.data || response;
      
      if (data.checkout_url) {
        // Redirect to Stripe Checkout page
        window.location.href = data.checkout_url;
      } else {
        setPaymentError('Failed to create payment session. Please try again.');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      const errorData = err.response?.data;
      setPaymentError(errorData?.error || 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Helper to get registration button text based on event and registration status
  const getRegisterButtonText = () => {
    if (myRegistration) {
      if (myRegistration.status === 'pending_payment') {
        return 'Complete Payment';
      }
      return 'Registered';
    }
    if (!event?.is_free && event?.ticket_price) {
      return `Register - $${event.ticket_price}`;
    }
    return 'Register Now';
  };

  // Check if user can still register (not already confirmed)
  const canRegister = () => {
    if (!myRegistration) return true;
    if (myRegistration.status === 'pending_payment') return true; // Can click to complete payment
    return false; // Already confirmed
  };

  const getEventStatus = (event) => {
    const s = event?.event_status;
    if (s === 'cancelled') return { status: 'cancelled', label: 'Cancelled', color: 'red' };
    if (event?.end_date) {
      const endDate = new Date(event.end_date);
      const now = new Date();
      console.debug('[EventStatus] end_date:', event.end_date, '| parsed:', endDate, '| now:', now, '| isPast:', endDate < now, '| event_status:', s);
      if (endDate < now) {
        return { status: 'completed', label: 'Completed', color: 'gray' };
      }
    }
    if (s === 'ongoing') return { status: 'ongoing', label: 'Live', color: 'green' };
    if (s === 'past') return { status: 'completed', label: 'Completed', color: 'gray' };
    return { status: 'upcoming', label: 'Upcoming', color: 'gold' };
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
        return <CheckCircle className="w-4 h-4 text-gold" />;
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
        return 'bg-pale_yellow text-yellow-800 border border-gold/30';
      case 'pending':
        return 'bg-pale_yellow text-yellow-800 border border-gold/30';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-pale_yellow text-yellow-800 border border-gold/30';
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
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleBookmark = async () => {
    // Optimistically update UI first
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    
    try {
      const response = await workforceAPI.bookmarkEvent(id);
      // Verify with server response if available
      if (response?.data?.bookmarked !== undefined) {
        setIsBookmarked(response.data.bookmarked);
      }
    } catch (error) {
      // Revert on error
      setIsBookmarked(!newBookmarkState);
      console.error('Failed to bookmark event:', error);
    }
  };

  const handleStartEvent = async () => {
    try {
      setIsStartingEvent(true);
      await workforceAPI.startEvent(id);
      setShowStartModal(false);
      await loadEventDetail();
    } catch (err) {
      console.error('Error starting event:', err);
    } finally {
      setIsStartingEvent(false);
    }
  };

  const handleUpdateRegistration = async (registrationId, status) => {
    try {
      setUpdatingRegistrationId(registrationId);
      await workforceAPI.updateEventRegistration(id, registrationId, { status });
      await loadParticipants();
    } catch (err) {
      console.error('Error updating registration:', err);
    } finally {
      setUpdatingRegistrationId(null);
    }
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
      features.push({ icon: Wifi, label: 'Virtual Event', color: 'gold' });
    } else {
      features.push({ icon: MapPin, label: 'In-Person', color: 'gold' });
    }

    if (event.is_free) {
      features.push({ icon: Gift, label: 'Free Event', color: 'gold' });
    }

    if (event.provides_certification) {
      features.push({ icon: Award, label: 'Certificate', color: 'gold' });
    }

    if (event.networking_opportunities) {
      features.push({ icon: Users, label: 'Networking', color: 'gold' });
    }

    if (event.refreshments_provided) {
      features.push({ icon: Coffee, label: 'Refreshments', color: 'gold' });
    }

    if (event.parking_available) {
      features.push({ icon: Car, label: 'Parking', color: 'gold' });
    }

    return features;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The event you are looking for could not be found.'}</p>
          <button
            type="button"
            onClick={() => navigate(webRoutes.workforceEvents)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
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
    <div className="min-h-screen bg-background">
      <div className=" flex flex-col py-4">
        {/* Header */}
        <div className='flex justify-between items-end md:items-start px-4 pb-4'>
                    <div className='flex flex-col md:flex-row md:w-[70%]'>
                        <BackArrowButton  />
                      <div className='flex flex-col'>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Industry Events</h1>
                        <p className="mt-2 text-lg text-gray-600">
                          Professional Development, Networking & training opportunity
                        </p>
                      </div>
                    </div>
                    <div className="flex h-[90%]">
                       <Link
                       to={webRoutes.workforceEventCreate}
                       className="bg-pale_yellow px-4 py-2 rounded-lg hover:bg-gold flex items-center"
                       >
                        <Plus className="w-5 h-5 md:mr-2 " />
                        <p className='hidden md:flex'>
                        Create Event
                        </p>
                       </Link>
                       </div>
                  </div>
          {/* Main Content */}
          <div className="md:bg-white space-y-8 px-4 py-6">
            {/* Hero Section */}
            <div className="rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              {/* Event Flier — displayed as a proper image, never behind text */}
              {event.image && (
                <div className="w-full bg-gray-100" style={{ aspectRatio: '16/7', maxHeight: '380px' }}>
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Event Info — always on a clean background */}
              <div className={`p-5 lg:p-8 ${!event.image ? 'bg-gradient-to-br from-gold via-yellow-500 to-yellow-600' : 'bg-white'}`}>
                <div className="flex flex-col md:flex-row md:gap-6 lg:gap-8 items-start">
                  {/* Title + Badges */}
                  <div className="w-full md:w-[58%]">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        event.image
                          ? 'bg-pale_yellow text-yellow-800 border-gold/30'
                          : 'bg-white/20 text-white border-white/30 backdrop-blur-sm'
                      }`}>
                        <StatusIcon className="w-3 h-3 mr-1.5" />
                        {eventStatus.label}
                      </span>
                      {event.is_free && (
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                          event.image ? 'bg-green-100 text-green-800' : 'bg-white text-yellow-800'
                        }`}>
                          Free Event
                        </span>
                      )}
                      {!event.is_free && event.ticket_price && (
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                          event.image ? 'bg-gray-100 text-gray-700' : 'bg-white text-yellow-800'
                        }`}>
                          <DollarSign className="w-3 h-3 mr-1" />
                          ${event.ticket_price} {event.currency !== 'USD' && event.currency}
                        </span>
                      )}
                      {daysUntil && (
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          event.image
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-white/20 text-white border-white/30 backdrop-blur-sm'
                        }`}>
                          <Clock className="w-3 h-3 mr-1.5" />
                          {daysUntil}
                        </span>
                      )}
                    </div>
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight ${event.image ? 'text-gray-900' : 'text-white'}`}>
                      {event.title}
                    </h1>
                    <p className={`text-sm lg:text-base leading-relaxed ${event.image ? 'text-gray-600' : 'text-white'}`}>
                      {event.description}
                    </p>
                  </div>

                  {/* Quick Details Card */}
                  <div className={`mt-4 md:mt-0 mx-auto w-full md:w-[38%] rounded-xl lg:rounded-2xl p-4 lg:p-5 border ${
                    event.image
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white/10 backdrop-blur-md border-white/20'
                  }`}>
                    <h3 className={`text-sm font-bold mb-3 ${event.image ? 'text-gray-900' : 'text-white'}`}>Event Details</h3>
                    <div className="space-y-2.5">
                      <div className="flex gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold capitalize border ${
                          event.image ? 'text-gray-700 border-gray-300 bg-white' : 'text-white border-white'
                        }`}>
                          <Globe className="w-3 h-3 mr-1" />
                          {event.is_virtual ? 'Virtual' : 'In-Person'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold capitalize border ${
                          event.image ? 'text-gray-700 border-gray-300 bg-white' : 'text-white border-white'
                        }`}>
                          {event.event_type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className={`w-4 h-4 flex-shrink-0 ${event.image ? 'text-gray-500' : 'text-white'}`} />
                        <p className={`text-xs font-semibold truncate ${event.image ? 'text-gray-700' : 'text-white'}`}>
                          {event.organizer_name || 'Connectize'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className={`w-4 h-4 flex-shrink-0 ${event.image ? 'text-gray-500' : 'text-white'}`} />
                        <p className={`text-xs font-semibold ${event.image ? 'text-gray-700' : 'text-white'}`}>
                          {formatDate(event.start_date)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockCheck className={`w-4 h-4 flex-shrink-0 ${event.image ? 'text-gray-500' : 'text-white'}`} />
                        <p className={`text-xs font-semibold ${event.image ? 'text-gray-700' : 'text-white'}`}>
                          {formatTime(event.start_date)}
                          {event.end_date && ` - ${formatTime(event.end_date)}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className={`w-4 h-4 flex-shrink-0 ${event.image ? 'text-gray-500' : 'text-white'}`} />
                        <p className={`text-xs font-semibold ${event.image ? 'text-gray-700' : 'text-white'}`}>
                          {event.is_virtual ? 'Virtual Event' : (event.venue_name || 'Venue TBA')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown Timer — upcoming events only */}
            {countdown && (
              <div className={`rounded-xl border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                countdown.isStartingSoon
                  ? 'bg-red-50 border-red-200'
                  : 'bg-pale_yellow/60 border-gold/30'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${countdown.isStartingSoon ? 'text-red-600' : 'text-gold'}`} />
                  <span className={`font-semibold text-sm ${countdown.isStartingSoon ? 'text-red-700' : 'text-yellow-800'}`}>
                    {countdown.isStartingSoon ? 'Starting Soon!' : 'Event starts in'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {countdown.days > 0 && (
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${countdown.isStartingSoon ? 'text-red-700' : 'text-yellow-900'}`}>{String(countdown.days).padStart(2, '0')}</p>
                      <p className="text-xs text-gray-500">days</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${countdown.isStartingSoon ? 'text-red-700' : 'text-yellow-900'}`}>{String(countdown.hours).padStart(2, '0')}</p>
                    <p className="text-xs text-gray-500">hrs</p>
                  </div>
                  <span className={`text-2xl font-bold ${countdown.isStartingSoon ? 'text-red-500' : 'text-gold'}`}>:</span>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${countdown.isStartingSoon ? 'text-red-700' : 'text-yellow-900'}`}>{String(countdown.minutes).padStart(2, '0')}</p>
                    <p className="text-xs text-gray-500">min</p>
                  </div>
                  <span className={`text-2xl font-bold ${countdown.isStartingSoon ? 'text-red-500' : 'text-gold'}`}>:</span>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${countdown.isStartingSoon ? 'text-red-700' : 'text-yellow-900'}`}>{String(countdown.seconds).padStart(2, '0')}</p>
                    <p className="text-xs text-gray-500">sec</p>
                  </div>
                </div>
              </div>
            )}

            <div className='flex flex-col md:flex-row md:pl-4 gap-6 md:gap-4 '>
                <div className='md:w-[65%] space-y-6 '>
                  {/* Organizer Spotlight */}
                  <div className="bg-white rounded-lg border p-4 md:p-6">
                    <h2 className="text-lg font-bold mb-4">Event Organizer</h2>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {organizerInfo.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-bold ">{organizerInfo.name}</h3>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-pale_yellow text-yellow-800">
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
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gold/20 p-8 shadow-lg">
                      <h2 className="text-2xl font-bold  mb-6 flex items-center">
                        <div className="w-8 h-8 bg-pale_yellow rounded-xl flex items-center justify-center mr-3">
                          <MessageCircle className="w-5 h-5 " />
                        </div>
                        About This Event
                      </h2>
                      <div className="prose max-w-none  leading-relaxed">
                        <p className="text-lg">{event.long_description}</p>
                      </div>
                    </div>
                  )}

                  {/* Schedule/Agenda */}
                  {event.agenda && event.agenda.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-pale_yellow rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-gold" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
                      </div>
                      <div className="space-y-3">
                        {event.agenda.map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-pale_yellow/30 transition-colors">
                            <div className="px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-md flex-shrink-0">
                              <span className="text-sm font-semibold text-yellow-800">{item.time}</span>
                            </div>
                            <div className="flex-1 pt-0.5">
                              <h3 className="font-medium text-gray-900 text-sm">{item.session}</h3>
                              {item.description && (
                                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Speakers */}
                  {event.speakers && event.speakers.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-pale_yellow rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-gold" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Speakers</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {event.speakers.map((speaker, index) => {
                          // Handle both string and object formats
                          const speakerName = typeof speaker === 'string' ? speaker : speaker.name || 'Unknown Speaker';
                          const speakerTitle = typeof speaker === 'string' ? '' : speaker.title || '';
                          const speakerCompany = typeof speaker === 'string' ? '' : speaker.company || '';
                          const speakerImage = typeof speaker === 'string' ? null : speaker.image || speaker.photo || null;

                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-pale_yellow/30 transition-colors">
                              {speakerImage ? (
                                <img 
                                  src={speakerImage} 
                                  alt={speakerName}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-gold/20"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-semibold text-sm">
                                    {speakerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm truncate">{speakerName}</h3>
                                {speakerTitle && <p className="text-xs text-gray-600 truncate">{speakerTitle}</p>}
                                {speakerCompany && <p className="text-xs text-gold truncate">{speakerCompany}</p>}
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
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                      <div className="text-gray-600">
                        <p>{event.requirements}</p>
                      </div>
                    </div>
                  )}
                </div>
                  {/* Sidebar */}
          <div className="space-y-6 md:w-[35%] ">
             {/* Event Participants Section - organizer only */}
                  {isEventCreator && <div className="">
                    <div className="overflow-hidden">
                        <div className="flex flex-col">
                          <div className="flex justify-between">
                              <h2 className="text-xl font-medium ">Participants</h2>
                              <button
                              type="button"
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
                          <div className="flex items-center space-x-2 text-base text-gray-600 font-medium">
                            <Users2 className="w-4 h-4 " />
                              <p className="">Event attendees:</p>
                            <span className="text-xl ">
                              {(event.attendees_count ?? 0) || participants.length || 0}
                            </span>
                            {/* <button
                              onClick={exportParticipants}
                              className="flex items-center px-4 py-2 text-sm  hover: hover:bg-pale_yellow/50 rounded-xl transition-all duration-300"
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
                                className="w-full pl-10 pr-4 py-3 border border-gold/30 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold bg-white/70 backdrop-blur-sm transition-all duration-300"
                              />
                            </div>
                            <div className="relative">
                              <select
                                value={participantFilter}
                                onChange={(e) => {
                                  setParticipantFilter(e.target.value);
                                  setCurrentPage(1);
                                }}
                                className="appearance-none bg-white/70 backdrop-blur-sm border border-gold/30 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-gold focus:border-gold transition-all duration-300"
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
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gold/30 border-t-gold mx-auto mb-4"></div>
                                <span className="text-lg  font-medium">Loading participants...</span>
                              </div>
                            </div>
                          ) : paginatedParticipants.length === 0 ? (
                            <div className="text-center py-16">
                              <div className="w-20 h-20 bg-pale_yellow rounded-2xl flex items-center justify-center mx-auto mb-6">
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
                                    type="button"
                                    onClick={loadParticipants}
                                    className="px-4 py-2 bg-gold hover:bg-yellow-600 text-white rounded-md text-sm"
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
                                    <tr className="border-b border-gold/30">
                                      <th className="text-left py-4 px-6 font-bold ">Participant</th>
                                      <th className="text-left py-4 px-6 font-bold ">Contact</th>
                                      <th className="text-left py-4 px-6 font-bold ">Status</th>
                                      <th className="text-left py-4 px-6 font-bold ">Registered</th>
                                      {isEventCreator && <th className="text-left py-4 px-6 font-bold ">Actions</th>}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gold/20">
                                    {paginatedParticipants.map((participant, index) => (
                                      <tr key={participant.id || index} className="hover:bg-pale_yellow/50/50 transition-all duration-300 group">
                                        <td className="py-4 px-6">
                                          <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                                        {isEventCreator && (
                                          <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5">
                                              {participant.status !== 'confirmed' && (
                                                <button
                                                  type="button"
                                                  disabled={updatingRegistrationId === participant.id}
                                                  onClick={() => handleUpdateRegistration(participant.id, 'confirmed')}
                                                  className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 border border-green-200 rounded-md hover:bg-green-200 disabled:opacity-50 transition-colors"
                                                >
                                                  {updatingRegistrationId === participant.id ? '...' : 'Confirm'}
                                                </button>
                                              )}
                                              {participant.status !== 'waitlisted' && (
                                                <button
                                                  type="button"
                                                  disabled={updatingRegistrationId === participant.id}
                                                  onClick={() => handleUpdateRegistration(participant.id, 'waitlisted')}
                                                  className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-md hover:bg-yellow-200 disabled:opacity-50 transition-colors"
                                                >
                                                  Waitlist
                                                </button>
                                              )}
                                              {participant.status !== 'cancelled' && (
                                                <button
                                                  type="button"
                                                  disabled={updatingRegistrationId === participant.id}
                                                  onClick={() => handleUpdateRegistration(participant.id, 'cancelled')}
                                                  className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 border border-red-200 rounded-md hover:bg-red-200 disabled:opacity-50 transition-colors"
                                                >
                                                  Decline
                                                </button>
                                              )}
                                            </div>
                                          </td>
                                        )}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Mobile Card View */}
                              <div className="md:hidden space-y-4">
                                {paginatedParticipants.map((participant, index) => (
                                  <div key={participant.id || index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gold/20 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center space-x-4">
                                      <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
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
                                    {isEventCreator && (
                                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gold/20">
                                        {participant.status !== 'confirmed' && (
                                          <button
                                            type="button"
                                            disabled={updatingRegistrationId === participant.id}
                                            onClick={() => handleUpdateRegistration(participant.id, 'confirmed')}
                                            className="flex-1 py-1.5 text-xs font-semibold bg-green-100 text-green-800 border border-green-200 rounded-md hover:bg-green-200 disabled:opacity-50 transition-colors"
                                          >
                                            {updatingRegistrationId === participant.id ? '...' : 'Confirm'}
                                          </button>
                                        )}
                                        {participant.status !== 'waitlisted' && (
                                          <button
                                            type="button"
                                            disabled={updatingRegistrationId === participant.id}
                                            onClick={() => handleUpdateRegistration(participant.id, 'waitlisted')}
                                            className="flex-1 py-1.5 text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-md hover:bg-yellow-200 disabled:opacity-50 transition-colors"
                                          >
                                            Waitlist
                                          </button>
                                        )}
                                        {participant.status !== 'cancelled' && (
                                          <button
                                            type="button"
                                            disabled={updatingRegistrationId === participant.id}
                                            onClick={() => handleUpdateRegistration(participant.id, 'cancelled')}
                                            className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-800 border border-red-200 rounded-md hover:bg-red-200 disabled:opacity-50 transition-colors"
                                          >
                                            Decline
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-between border-t border-gold/30 pt-6">
                                  <div className=" font-medium">
                                    Showing {startIndex + 1} to {Math.min(startIndex + participantsPerPage, totalParticipants)} of {totalParticipants} participants
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <button
                                      type="button"
                                      onClick={() => setCurrentPage(currentPage - 1)}
                                      disabled={currentPage === 1}
                                      className="px-4 py-2 font-medium  hover: disabled:opacity-50 disabled:cursor-not-allowed rounded-xl hover:bg-pale_yellow/50 transition-all duration-300"
                                    >
                                      Previous
                                    </button>
                                    <div className="flex space-x-2">
                                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                          <button
                                            type="button"
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-4 py-2 font-medium rounded-xl transition-all duration-300 ${
                                              currentPage === pageNum
                                                ? 'bg-gradient-to-r from-gold to-yellow-600 text-white shadow-lg'
                                                : 'text-yellow-700 hover:bg-pale_yellow'
                                            }`}
                                          >
                                            {pageNum}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setCurrentPage(currentPage + 1)}
                                      disabled={currentPage === totalPages}
                                      className="px-4 py-2 font-medium text-gold hover:text-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl hover:bg-pale_yellow/50 transition-all duration-300"
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
                  </div>}
            {/* Organizer Start Event Section */}
            {isEventCreator && eventStatus.status === 'upcoming' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Play className="w-4 h-4 text-green-700" />
                  </div>
                  <h3 className="font-semibold text-green-900">Organizer Controls</h3>
                </div>
                <p className="text-sm text-green-700">
                  Start the event early to open the meeting link for confirmed participants right now.
                </p>
                <button
                  type="button"
                  onClick={() => setShowStartModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                >
                  <Play className="w-4 h-4" />
                  Start Event Now
                </button>
              </div>
            )}

            {/* Organizer Live Controls */}
            {isEventCreator && eventStatus.status === 'ongoing' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  <h3 className="font-semibold text-green-900">Event is Live</h3>
                </div>
                {event.is_virtual && event.meeting_link ? (
                  <a
                    href={event.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Join as Host
                  </a>
                ) : event.is_virtual ? (
                  <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                    No meeting link set. Edit the event to add one.
                  </p>
                ) : (
                  <p className="text-sm text-green-700">In-person event — see venue details above.</p>
                )}
              </div>
            )}

            {/* Registration Card */}
            <div className="space-y-2 md:border border-gray-200 md:px-2 py-0 md:py-6">
                <div className="mb-4">
                  <h3 className="text-xl lg:text-2xl font-semibold">Join This Event</h3>
                  <p className="font-medium text-gray-600">

                    {event.is_free ? 'Free registration available' : 'Secure your spot today'}
                  </p>
                </div>


              <div className="">
                <div className="space-y-4 mb-6 lg:mb-8">
                  {isEventCreator && event.attendees_count != null && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 font-medium text-gray-600">
                          <User2 className="w-6 h-6 " />
                          Registrants:
                        </span>
                        <div className="text-right text-gray-600">
                          <span className="text-xl font-medium ">{event.attendees_count}</span>
                          {event.max_attendees && (
                            <span className=" text-base lg:text-lg">/{event.max_attendees}</span>
                          )}
                        </div>
                      </div>

                      {event.max_attendees && (
                        <div className="w-full bg-gray-100 rounded-full h-[7px] shadow-inner">
                          <div
                            className="bg-gradient-to-r from-[#FFC000] to-[#FF8400] h-[7px] rounded-full transition-all duration-500 shadow-sm"
                            style={{
                              width: `${Math.min(event.attendees_count / event.max_attendees * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      )}

                      {event.max_attendees && (
                        <div className="flex justify-between items-center">
                          <span className=" font-medium text-gray-600">Available spots:</span>
                          <span className="font-bold  text-lg">
                            {Math.max(event.max_attendees - event.attendees_count, 0)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Event Type:</span>
                    <span className="font-semibold capitalize bg-gray-100 text-gray-600 rounded-full px-2 py-1">{event.event_type || 'Workshop'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Price:</span>
                    <span className="text-2xl font-bold ">
                      {event.is_free ? 'FREE' : `$${event.ticket_price}`}
                      {!event.is_free && event.currency && event.currency !== 'USD' && (
                        <span className="text-base lg:text-lg  ml-2">{event.currency}</span>
                      )}
                    </span>
                  </div>
                </div>

                {!isEventCreator && eventStatus.status === 'upcoming' && (
                  <div className="space-y-3">
                    
                    {myRegistration && myRegistration.status === 'pending_payment' ? (
                      // User has pending payment - show payment prompt
                      <div className="p-4 lg:p-6 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-xl lg:rounded-2xl border border-orange-300 shadow-lg">
                        <div className="text-center">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-orange-200/50 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                            <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600" />
                          </div>
                          <h3 className="text-lg lg:text-xl font-bold text-orange-900 mb-2">Complete Your Payment</h3>
                          <p className="text-orange-700 mb-3 text-sm">
                            Your registration is reserved. Complete payment to confirm your spot.
                          </p>
                          <div className="bg-white/60 rounded-lg p-3 mb-4">
                            <p className="text-2xl font-bold text-orange-800">
                              ${event.ticket_price} <span className="text-sm font-normal">{event.currency}</span>
                            </p>
                          </div>
                          
                          {/* Show error if payment failed */}
                          {paymentError && (
                            <div className="bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg p-3 mb-4">
                              {paymentError}
                            </div>
                          )}
                          
                          {/* Internal payment (Stripe) */}
                          {event.use_internal_payment ? (
                            <>
                              <button
                                type="button"
                                onClick={handleInternalPayment}
                                disabled={isProcessingPayment}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isProcessingPayment ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="w-4 h-4" />
                                    Pay Now
                                  </>
                                )}
                              </button>
                              <p className="text-orange-600 text-xs mt-3">
                                Secure payment via Stripe
                              </p>
                            </>
                          ) : (
                            /* External payment URL */
                            <>
                              <button
                                type="button"
                                onClick={() => window.open(event.external_payment_url, '_blank')}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Pay Now
                              </button>
                              <p className="text-orange-600 text-xs mt-3">
                                You'll be redirected to complete payment
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    ) : myRegistration ? (
                      // User is fully registered (confirmed)
                      <div className="p-4 lg:p-6 bg-gradient-to-br from-pale_yellow to-yellow-50 rounded-xl lg:rounded-2xl border border-gold/30 shadow-lg space-y-4">
                        <div className="text-center">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/50 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                            <UserCheck className="w-6 h-6 lg:w-8 lg:h-8 text-gold" />
                          </div>
                          <h3 className="text-lg lg:text-xl font-bold text-yellow-900 mb-2">You're Registered!</h3>
                          <p className="text-yellow-800 mb-2 lg:mb-3">
                            Status: <span className="font-semibold capitalize">{myRegistration.status.replace('_', ' ')}</span>
                          </p>
                          <p className="text-yellow-700 text-sm mb-4">
                            Registered on {new Date(myRegistration.registered_at || myRegistration.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {/* Meeting link — backend returns this 30 min before start or when manually started */}
                        {event.is_virtual && event.meeting_link && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                            <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                              <span>🔗</span> {event.virtual_platform || 'Virtual Meeting'} Link Ready
                            </p>
                            <a
                              href={event.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Join Now
                            </a>
                            <p className="text-xs text-green-700 break-all">{event.meeting_link}</p>
                          </div>
                        )}
                        {/* Share and Bookmark buttons */}
                        <div className="flex gap-2 pt-3 border-t border-gold/20">
                          <button
                            type="button"
                            onClick={handleShare}
                            className="flex flex-1 items-center justify-center gap-2 bg-white/60 border border-gold/20 rounded-lg hover:bg-white transition-colors duration-200 font-medium text-sm py-2.5 text-yellow-800"
                          >
                            <Share2 className="w-4 h-4" />
                            Share Event
                          </button>
                          <button
                            type="button"
                            onClick={handleBookmark}
                            className={`flex items-center justify-center rounded-lg transition-colors duration-200 px-4 py-2.5 ${
                              isBookmarked
                                ? 'bg-gold/30 border border-gold/40'
                                : 'bg-white/60 hover:bg-white border border-gold/20'
                            }`}
                          >
                            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-gold text-gold' : 'text-yellow-700'}`} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // User is not registered
                        <div className='flex gap-2'>

                            <button
                              type="button"
                              onClick={handleRegister}
                              disabled={isRegistering || (event.max_attendees && event.attendees_count != null && event.attendees_count >= event.max_attendees)}
                              className="w-[50%] bg-gradient-to-r from-[#FFC000] to-[#FF8400] text-white rounded-lg hover:from-[#FF8400] hover:to-[#FFC000] 
                                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 p-2 
                                      flex items-center justify-center text-sm shadow-md"
                            >
                              {isRegistering ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 lg:h-6 lg:w-6 border-2 border-white border-t-transparent mr-2 lg:mr-3"></div>
                                  Registering...
                                </>
                              ) : (
                                <>
                                  <User2 className="w-5 h-5 mr-2" />
                                  Register Now
                                </>
                              )}
                            </button>
                            <div className="flex w-[50%] gap-2">
                              <button
                                type="button"
                                onClick={handleShare}
                                className="flex w-[60%] items-center justify-center bg-gray-100 border border-gray-200 rounded-lg hover:bg-pale_yellow/50 hover:border-gold/40 transition-colors duration-200 font-semibold text-sm py-2"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </button>
                              <button
                                type="button"
                                onClick={handleBookmark}
                                className={`flex w-[40%] items-center justify-center rounded-lg transition-colors duration-200 font-semibold text-sm lg:text-base py-2 ${
                                  isBookmarked 
                                    ? 'bg-gold/20 text-gold border border-gold/30' 
                                    : 'bg-pale_yellow hover:bg-gold/20 border border-gold/20'
                                }`}
                              >
                                <Bookmark className={`w-4 h-4 lg:w-5 lg:h-5 ${isBookmarked ? 'fill-gold text-gold' : 'text-gray-600'}`} />
                              </button>
                            </div>
                        </div>
                    )}

                    {isEventCreator && event.max_attendees && event.attendees_count != null && event.attendees_count >= event.max_attendees && (
                      <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl lg:rounded-2xl border border-amber-200 shadow-lg">
                        <p className="text-amber-800 font-bold text-base lg:text-lg">Event is Full</p>
                        <p className="text-amber-700 mt-2">Join waitlist for updates</p>
                      </div>
                    )}
                  </div>
                )}
                {!isEventCreator && eventStatus.status === 'ongoing' && (
                  <div className="space-y-3">
                    {/* Check if registration is still open */}
                    {(!event.registration_deadline || new Date(event.registration_deadline) > new Date()) ? (
                      <>
                        {myRegistration && myRegistration.status === 'pending_payment' ? (
                          // User has pending payment - show payment prompt
                          <div className="p-4 lg:p-6 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-xl lg:rounded-2xl border border-orange-300 shadow-lg">
                            <div className="text-center">
                              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-orange-200/50 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                                <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600" />
                              </div>
                              <h3 className="text-lg lg:text-xl font-bold text-orange-900 mb-2">Complete Your Payment</h3>
                              <p className="text-orange-700 mb-3 text-sm">
                                Event is live! Complete payment to join now.
                              </p>
                              <div className="bg-white/60 rounded-lg p-3 mb-4">
                                <p className="text-2xl font-bold text-orange-800">
                                  ${event.ticket_price} <span className="text-sm font-normal">{event.currency}</span>
                                </p>
                              </div>
                              
                              {paymentError && (
                                <div className="bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg p-3 mb-4">
                                  {paymentError}
                                </div>
                              )}
                              
                              {event.use_internal_payment ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={handleInternalPayment}
                                    disabled={isProcessingPayment}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isProcessingPayment ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <CreditCard className="w-4 h-4" />
                                        Pay & Join Now
                                      </>
                                    )}
                                  </button>
                                  <p className="text-orange-600 text-xs mt-3">
                                    Secure payment via Stripe
                                  </p>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => window.open(event.external_payment_url, '_blank')}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Pay & Join Now
                                  </button>
                                  <p className="text-orange-600 text-xs mt-3">
                                    You'll be redirected to complete payment
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        ) : myRegistration ? (
                          // User is registered
                          <div className={`p-4 lg:p-6 rounded-xl lg:rounded-2xl border shadow-lg bg-gradient-to-br ${
                            myRegistration.status === 'confirmed' || myRegistration.status === 'attended'
                              ? 'from-green-100 to-emerald-50 border-green-300'
                              : 'from-yellow-50 to-amber-50 border-yellow-300'
                          }`}>
                            <div className="text-center">
                              <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4 ${
                                myRegistration.status === 'confirmed' || myRegistration.status === 'attended'
                                  ? 'bg-green-200/50'
                                  : 'bg-yellow-200/50'
                              }`}>
                                <UserCheck className={`w-6 h-6 lg:w-8 lg:h-8 ${
                                  myRegistration.status === 'confirmed' || myRegistration.status === 'attended'
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
                                }`} />
                              </div>
                              {myRegistration.status === 'confirmed' || myRegistration.status === 'attended' ? (
                                <>
                                  <h3 className="text-lg lg:text-xl font-bold text-green-900 mb-2">Event is Happening Now</h3>
                                  <p className="text-green-700 mb-4 text-sm">You're registered. Join the event now!</p>
                                  {event.is_virtual && event.meeting_link ? (
                                    <>
                                      <a
                                        href={event.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 gap-2 shadow-md"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                        Join Now
                                      </a>
                                      <p className="text-xs text-green-700 mt-2 break-all">{event.meeting_link}</p>
                                    </>
                                  ) : event.is_virtual ? (
                                    <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                                      No meeting link has been set by the organizer yet.
                                    </p>
                                  ) : (
                                    <p className="text-sm text-green-700">
                                      In-person event — see the venue details above.
                                    </p>
                                  )}
                                </>
                              ) : myRegistration.status === 'waitlisted' ? (
                                <>
                                  <h3 className="text-lg font-bold text-yellow-900 mb-2">You're on the Waitlist</h3>
                                  <p className="text-yellow-700 text-sm">You'll be notified if a spot opens up.</p>
                                </>
                              ) : (
                                <>
                                  <h3 className="text-lg font-bold text-yellow-900 mb-2">Registration Pending Approval</h3>
                                  <p className="text-yellow-700 text-sm">The organizer will review your registration. You'll get access once confirmed.</p>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          // User is not registered - show register button
                          <div className="p-4 lg:p-6 bg-gradient-to-br from-pale_yellow to-yellow-50 rounded-xl lg:rounded-2xl border border-gold/30 shadow-lg">
                            <div className="text-center">
                              <p className="text-yellow-800 font-bold mb-2">🔴 Event is Happening Now</p>
                              <p className="text-yellow-700 text-sm mb-4">Registration still open - join now!</p>
                              
                              {!event.is_free && event.ticket_price && (
                                <div className="bg-white/60 rounded-lg p-3 mb-4">
                                  <p className="text-xl font-bold text-yellow-800">
                                    ${event.ticket_price} <span className="text-sm font-normal">{event.currency}</span>
                                  </p>
                                </div>
                              )}
                              
                              <button
                                type="button"
                                onClick={handleRegister}
                                disabled={isRegistering || (event.max_attendees && event.attendees_count != null && event.attendees_count >= event.max_attendees)}
                                className="w-full bg-gradient-to-r from-[#FFC000] to-[#FF8400] text-white font-semibold py-3 px-6 rounded-lg hover:from-[#FF8400] hover:to-[#FFC000] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                              >
                                {isRegistering ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Registering...
                                  </>
                                ) : (
                                  <>
                                    <User2 className="w-4 h-4" />
                                    {event.is_free ? 'Register & Join' : 'Register Now'}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      // Registration closed
                      <div className="text-center p-4 bg-gray-100 rounded-xl border border-gray-200">
                        <p className="text-gray-700 font-medium">Registration Closed</p>
                        <p className="text-gray-600 text-sm mt-1">Event is ongoing but registration has ended</p>
                      </div>
                    )}
                  </div>
                )}
                {!isEventCreator && eventStatus.status === 'completed' && (
                  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-700 font-medium">Event Completed</p>
                    <p className="text-gray-600 text-sm mt-1">Thank you for your interest</p>
                  </div>
                )}
              </div>
            </div>
            {/* Contact Info */}
            {(event.contact_email || event.contact_phone) && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-blue-600" />
                  Get in Touch
                </h3>
                <div className="space-y-1">
                  {event.contact_email && (
                    <div className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Mail className="w-5 h-5 mr-3 text-blue-600" />
                      <a 
                        href={`mailto:${event.contact_email}`}
                        className="text-gray-700 hover:text-blue-600 font-medium"
                      >
                        {event.contact_email}
                      </a>
                    </div>
                  )}
                  {event.contact_phone && (
                    <div className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Phone className="w-5 h-5 mr-3 text-blue-600" />
                      <a 
                        href={`tel:${event.contact_phone}`}
                        className="text-gray-700 hover:text-blue-600 font-medium"
                      >
                        {event.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

  </div>

      {/* Start Event Confirmation Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <Play className="w-8 h-8 text-green-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Start Event Now?</h3>
                <p className="text-gray-600 text-sm">
                  This will mark the event as live and immediately make the meeting link available to all confirmed participants.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartEvent}
                  disabled={isStartingEvent}
                  className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStartingEvent ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</>
                  ) : (
                    <><Play className="w-4 h-4" /> Start Now</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Share This Event</h3>
              <button
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  setLinkCopied(false);
                }}
                className="p-2 hover:bg-pale_yellow rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <Globe className="w-5 h-5 text-gold" />
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 bg-transparent text-gray-600 text-sm overflow-hidden"
                />
                <button
                  type="button"
                  onClick={copyEventLink}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center ${
                    linkCopied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gold text-gray-900 hover:bg-pale_yellow'
                  }`}
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Check out this event: ${event.title}`)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-3 px-4 bg-black rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  {/* X (Twitter) Icon */}
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="text-white">Share on X</span>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-3 px-4 bg-[#0A66C2] rounded-lg hover:bg-[#004182] transition-colors font-medium"
                >
                  {/* LinkedIn Icon */}
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="white">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-white">Share on LinkedIn</span>
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