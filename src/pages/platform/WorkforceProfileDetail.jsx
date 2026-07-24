import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Professional Profile | Connectize",
    description: "View detailed professional profile, skills, and experience of an oil and gas industry expert on Connectize.",
  keywords: "professional profile, oil and gas expert, skills, experience, Connectize",
  });

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { webRoutes } from '../../lib/webRoutes';
import { workforceAPI } from '../../api-services/workforce';
import { workforceProfileService } from '../../api-services/oilgas';
import {
  MapPin, Briefcase, DollarSign, ArrowLeft, User, Edit, Calendar,
  Globe, Phone, Mail, ExternalLink, Star, Award, TrendingUp,
  CheckCircle, Clock, Users, Building, Plane, Car, Heart,
  Target, Zap, Shield, Gauge, Trophy, BookOpen, MessageCircle,
  Link as LinkIcon, Camera, MapPin as LocationIcon, Trash2
} from 'lucide-react';
import { useAuth } from '../../context/userContext';
import MoreOptions from '../../components/MoreOptions';
import { confirmDialog } from '../../lib/confirm.jsx';

const WorkforceProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = Boolean(user && profile && String(profile.user?.id ?? profile.user) === String(user.id));

  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: 'Delete profile',
      message: 'Are you sure you want to delete this profile? This action cannot be undone.',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const result = await workforceProfileService.delete(id);
      if (result === null) return; // makeApiRequest returns null on failure and already toasts the API error
      toast.success('Profile deleted');
      navigate(webRoutes.workforceProfiles);
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete profile');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper functions for formatting
  const formatAvailabilityStatus = (status) => {
    const statusMap = {
      'available': { label: 'Available', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckCircle },
      'busy': { label: 'Busy', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
      'not_available': { label: 'Not Available', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Users },
      'open_to_offers': { label: 'Open to Offers', color: 'bg-navy-50 text-navy-700 border-navy-200', icon: Star }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200', icon: CheckCircle };
  };

  const formatEmploymentTypes = (types) => {
    const typeMap = {
      'full_time': 'Full-time',
      'part_time': 'Part-time',
      'contract': 'Contract',
      'freelance': 'Freelance',
      'consulting': 'Consulting',
      'project_based': 'Project-based'
    };
    return types?.map(type => typeMap[type] || type) || [];
  };

  const formatWorkEnvironments = (environments) => {
    const envMap = {
      'office': { label: 'Office', icon: Building },
      'remote': { label: 'Remote', icon: Globe },
      'field': { label: 'Field', icon: MapPin },
      'offshore': { label: 'Offshore', icon: Plane },
      'onshore': { label: 'Onshore', icon: Car }
    };
    return environments?.map(env => envMap[env] || { label: env, icon: Building }) || [];
  };

  const getProficiencyColor = (level) => {
    const colors = {
      'beginner': 'bg-gray-50 text-gray-700 border border-gray-200',
      'intermediate': 'bg-slate-50 text-slate-700 border border-slate-200',
      'advanced': 'bg-blue-50 text-blue-700 border border-blue-200',
      'expert': 'bg-amber-50 text-amber-700 border border-amber-200'
    };
    return colors[level] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 80) return 'text-emerald-600';
    if (rate >= 60) return 'text-slate-600';
    if (rate >= 40) return 'text-amber-600';
    return 'text-gray-500';
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await workforceAPI.getProfile(id);
        if (mounted) setProfile(res.data);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.detail || 'Profile not found');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-6 animate-pulse" />
          
          {/* Hero Section Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="h-32 bg-slate-200 animate-pulse"></div>
            <div className="px-8 py-6">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse -mt-12 border-4 border-white"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-8 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                  <div className="flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link to={webRoutes.workforceProfiles} className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Professionals
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'The requested profile could not be found.'}</p>
            <Link 
              to={webRoutes.workforceProfiles}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-800 transition-colors duration-200"
            >
              Browse Professionals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to={webRoutes.workforceProfiles} 
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Professionals
            </Link>
            
            {isOwner && (
              <div className="flex items-center space-x-3">
                <Link
                  to={webRoutes.workforceProfileEdit.replace(':id', id)}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-gold/80 text-dark text-sm font-medium hover:bg-gold transition-all duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
                <Link to={webRoutes.messagesRoom.replace(":room_name", `?room_name=room_${user?.id}_${profile?.user}`)} className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact
                </Link>
                <MoreOptions className="!w-fit">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(webRoutes.workforceProfileEdit.replace(':id', id))}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-2 text-sm text-red-700 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                </MoreOptions>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-gold via-custom_yellow to-gold relative">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="absolute bottom-4 right-4">
              <div className="flex items-center space-x-2 text-gray-900/80 text-sm font-medium">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="relative -mt-12">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                    {profile.user_avatar ? (
                      <img
                        src={profile.user_avatar}
                        alt={profile.user_name || 'Professional'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-12 h-12 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {profile.user_name || 'Professional'}
                  </h1>
                  {profile.professional_title && (
                    <p className="text-xl text-gray-600 mb-3 font-medium">{profile.professional_title}</p>
                  )}

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    {profile.current_location && (
                      <div className="flex items-center bg-gray-50 px-3 py-1 rounded-md">
                        <LocationIcon className="w-4 h-4 mr-2 text-gray-500" />
                        {profile.current_location}
                      </div>
                    )}
                    {typeof profile.years_of_experience === 'number' && (
                      <div className="flex items-center bg-gray-50 px-3 py-1 rounded-md">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                        {profile.years_of_experience} years exp.
                      </div>
                    )}
                    {profile.hourly_rate && (
                      <div className="flex items-center bg-slate-50 px-3 py-1 rounded-md text-slate-700">
                        <DollarSign className="w-4 h-4 mr-2" />
                        {profile.currency || 'USD'} {profile.hourly_rate}/hr
                      </div>
                    )}
                  </div>

                  {/* Availability Status */}
                  {profile.availability_status && (
                    <div className="inline-flex items-center">
                      {(() => {
                        const status = formatAvailabilityStatus(profile.availability_status);
                        const StatusIcon = status.icon;
                        return (
                          <div className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${status.color}`}>
                            <StatusIcon className="w-4 h-4 mr-2" />
                            {status.label}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {(!user || profile.user !== user.id) && (
                <div className="flex space-x-3">
                  <Link to={webRoutes.messagesRoom.replace(":room_name", `?room_name=room_${user?.id}_${profile?.user}`)} className="inline-flex items-center px-6 py-3 rounded-lg bg-gold/90 text-dark font-medium hover:bg-gold transition-all duration-200">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Connect
                  </Link>
                  <button className="inline-flex items-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium bg-white hover:bg-gray-50 transition-all duration-200">
                    <Heart className="w-5 h-5 mr-2" />
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Professional Summary */}
            {profile.summary && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                    <BookOpen className="w-5 h-5 text-slate-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Professional Summary</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">{profile.summary}</p>
                </div>
              </div>
            )}

            {/* Skills & Expertise */}
            {Array.isArray(profile.user_skills) && profile.user_skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                      <Zap className="w-5 h-5 text-slate-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
                  </div>
                  <div className="text-sm text-gray-500">
                    {profile.user_skills.length} skills
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {profile.user_skills.map((skill) => (
                    <div key={skill.id} className={`rounded-lg p-4 transition-all duration-200 hover:shadow-sm ${getProficiencyColor(skill.proficiency_level)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm">{skill.skill_name}</h3>
                        {skill.is_certified && (
                          <Award className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize font-medium">{skill.proficiency_level}</span>
                        {skill.years_of_experience > 0 && (
                          <span className="text-gray-600">{skill.years_of_experience} yrs</span>
                        )}
                      </div>
                      {skill.last_used && (
                        <div className="text-xs text-gray-500 mt-1">
                          Last used: {new Date(skill.last_used).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {profile.achievements && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mr-4">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Key Achievements</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.achievements}</p>
                </div>
              </div>
            )}

            {/* Work Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-5 h-5 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Work Preferences</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Employment Types */}
                {profile.preferred_employment_types && profile.preferred_employment_types.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-600" />
                      Employment Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formatEmploymentTypes(profile.preferred_employment_types).map((type, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-md text-sm font-medium">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Environments */}
                {profile.preferred_work_environments && profile.preferred_work_environments.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-600" />
                      Work Environments
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formatWorkEnvironments(profile.preferred_work_environments).map((env, index) => {
                        const EnvIcon = env.icon;
                        return (
                          <div key={index} className="flex items-center px-3 py-1 bg-gray-50 text-gray-700 rounded-md text-sm">
                            <EnvIcon className="w-4 h-4 mr-1" />
                            {env.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Travel & Relocation */}
                <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                  {profile.willing_to_travel && (
                    <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                      <Plane className="w-5 h-5 text-slate-600 mr-3" />
                      <div>
                        <div className="font-medium text-slate-900">Willing to Travel</div>
                        {profile.travel_percentage && (
                          <div className="text-sm text-slate-700">Up to {profile.travel_percentage}%</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {profile.willing_to_relocate && (
                    <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                      <Car className="w-5 h-5 text-slate-600 mr-3" />
                      <div>
                        <div className="font-medium text-slate-900">Willing to Relocate</div>
                        <div className="text-sm text-slate-700">Open to new locations</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Performance Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                  <Gauge className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Performance</h3>
              </div>
              
              <div className="space-y-4">
                {typeof profile.success_rate === 'number' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className={`text-lg font-bold ${getSuccessRateColor(profile.success_rate)}`}>
                      {profile.success_rate}%
                    </span>
                  </div>
                )}
                
                {typeof profile.completed_projects === 'number' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed Projects</span>
                    <span className="text-lg font-bold text-gray-900">{profile.completed_projects}</span>
                  </div>
                )}
                
                {typeof profile.average_response_hours === 'number' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Response</span>
                    <span className="text-lg font-bold text-gray-900">{profile.average_response_hours}h</span>
                  </div>
                )}
                
                {typeof profile.hired_count === 'number' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Times Hired</span>
                    <span className="text-lg font-bold text-gray-900">{profile.hired_count}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                  <Phone className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Contact & Links</h3>
              </div>
              
              <div className="space-y-4">
                {profile.user_email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <a href={`mailto:${profile.user_email}`} className="text-slate-600 hover:text-slate-800 text-sm">
                      {profile.user_email}
                    </a>
                  </div>
                )}
                
                {profile.linkedin_url && (
                  <div className="flex items-center">
                    <ExternalLink className="w-4 h-4 text-slate-600 mr-3" />
                    <a 
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-slate-800 text-sm flex items-center"
                    >
                      LinkedIn Profile
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
                
                {profile.portfolio_url && (
                  <div className="flex items-center">
                    <LinkIcon className="w-4 h-4 text-slate-600 mr-3" />
                    <a 
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-slate-800 text-sm flex items-center"
                    >
                      Portfolio
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                  <Star className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Quick Facts</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Experience Level</span>
                  <span className="font-medium text-gray-900">
                    {profile.years_of_experience < 2 ? 'Junior' :
                     profile.years_of_experience < 5 ? 'Mid-level' :
                     profile.years_of_experience < 10 ? 'Senior' : 'Expert'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Skills Count</span>
                  <span className="font-medium text-gray-900">{profile.skills_count || 0}</span>
                </div>
                
                {profile.currency && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Currency</span>
                    <span className="font-medium text-gray-900">{profile.currency}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">
                    {new Date(profile.created_at).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Shift Preferences */}
            {profile.shift_preferences && profile.shift_preferences.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Shift Preferences</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {profile.shift_preferences.map((shift, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-md text-sm font-medium capitalize">
                      {shift.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkforceProfileDetail;
