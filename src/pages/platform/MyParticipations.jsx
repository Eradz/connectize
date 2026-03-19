import { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "My Deal Participations | Connectize",
    description: "View all the deal rooms you are participating in on Connectize.",
  keywords: "deal participations, my deals, business deals, Connectize",
  });

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { webRoutes } from '../../lib/webRoutes';
import { dealRoomService } from '../../api-services/oilgas';
import { SkeletonList } from '../../components/ui/Skeleton';
import { EmptySearch } from '../../components/ui/EmptyStates';
import { Search, Eye, Users, FileText, TrendingUp, Calendar, PlusIcon, UsersIcon, Users2Icon } from 'lucide-react';
import BackArrowButton from '../../components/BackArrowButton';

export default function MyParticipations() {
  const [loading, setLoading] = useState(true);
  const [participations, setParticipations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadParticipations();
  }, []);

  const loadParticipations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get deals where user is a participant
      const response = await dealRoomService.getAll(1, 50);
      const deals = response?.results || response?.data || response || [];
      
      // For now, show all deals as participations
      // TODO: Filter by actual participation when backend supports it
      setParticipations(deals);
    } catch (err) {
      console.error('Error loading participations:', err);
      setError('Failed to load participations');
      setParticipations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipations = participations.filter(deal =>
    deal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="md:bg-white space-y-6 py-6 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row">
        <BackArrowButton/>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Participants</h1>
          <p className="text-gray-600 mt-1">
            Deal rooms where you are a participant
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search participations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadParticipations}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <SkeletonList count={5} />
      ) : filteredParticipations.length === 0 ? (
        searchTerm ? (
          <EmptySearch 
            message="No participations found matching your search"
            onClear={() => setSearchTerm('')}
          />
        ) : (
          <div className="text-center py-12 border-dashed border-2 border-gray-200 w-[60%] mx-auto">
            <Users2Icon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No participations</h3>
            <p className="mt-1 text-sm text-gray-500">
              Invite team members to collaborate on this deal room
            </p>
            <Link
              to={webRoutes.dealRooms}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gold hover:bg-gold/20"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Invite participants
            </Link>
          </div>
        )
      ) : (
        <div className="grid grid-col-1 md:grid-cols-2 gap-4">
          {filteredParticipations.map((deal) => (
            <div key={deal.id} className="bg-white hover:bg-gold/20 rounded-lg shadow-sm border border-gray-200 py-6 px-3 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1 md:w-[65%] lg:w-[80%]">
                  <div className="flex flex-col gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {deal.title || `Deal Room #${deal.id?.slice(0, 8)}`}
                    </h3>
                  {deal.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {deal.description}
                    </p>
                  )}
                  </div>
                  

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className='lg:flex hidden'>Created: </span>
                      <span>{formatDate(deal.created_at)}</span>
                    </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className='lg:flex hidden'>Participants: </span>
                        <span>{deal?.participants_count ? deal.participants_count++ : 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span className='lg:flex hidden'>Documents: </span>
                        <span>{deal.documents_count ? deal.documents_count : 0}</span>
                      </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={webRoutes.dealRoomDetail.replace(':id', deal.id)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gold/90 bg-gold"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </div>
              </div>

              {/* Participation Role */}
              {deal.my_role && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">
                    Your role: <span className="font-medium text-gray-900">{deal.my_role}</span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load More (if needed) */}
      {filteredParticipations.length > 0 && participations.length >= 50 && (
        <div className="text-center">
          <button
            onClick={loadParticipations}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
