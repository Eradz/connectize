import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { webRoutes } from '../../lib/webRoutes';
import { workforceAPI } from '../../api-services/workforce';
import { MapPin, Briefcase, DollarSign, ArrowLeft, User } from 'lucide-react';

const WorkforceProfileDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="bg-white border rounded-xl p-6">
            <div className="h-6 w-1/2 bg-gray-200 rounded mb-3 animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <Link to={webRoutes.workforceProfiles} className="inline-flex items-center px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Professionals
            </Link>
          </div>
          <div className="bg-white border rounded-xl p-6">
            <div className="text-red-600">{error || 'Profile not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={webRoutes.workforceProfiles} className="inline-flex items-center px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Professionals
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.user_name || 'Professional'}</h1>
              {profile.professional_title && (
                <div className="text-gray-600">{profile.professional_title}</div>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                {profile.current_location && (
                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{profile.current_location}</div>
                )}
                {typeof profile.years_of_experience === 'number' && (
                  <div className="flex items-center"><Briefcase className="w-4 h-4 mr-1" />{profile.years_of_experience} yrs</div>
                )}
                {profile.hourly_rate && (
                  <div className="flex items-center"><DollarSign className="w-4 h-4 mr-1" />{profile.currency || 'USD'} {profile.hourly_rate}</div>
                )}
              </div>
            </div>
          </div>

          {profile.summary && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.summary}</p>
            </div>
          )}

          {Array.isArray(profile.user_skills) && profile.user_skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.user_skills.map((s) => (
                  <span key={s.id} className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                    {s.skill_name} • {s.proficiency_level}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkforceProfileDetail;
