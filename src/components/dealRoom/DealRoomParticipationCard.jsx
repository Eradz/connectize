import { Calendar, Eye, FileText, Users } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { webRoutes } from '../../lib/webRoutes';

const DealRoomParticipationCard = ({deal}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };
  return (
  <div key={deal.id || deal.deal_room} className="bg-white hover:bg-gold/20 rounded-lg shadow-sm border border-gray-200 py-6 px-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1 md:w-[65%] lg:w-[80%]">
                    <div className="flex flex-col gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {deal.title || deal.deal_room_name }
                      </h3>
                    {deal.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {deal.description || deal.deal_room_description}
                      </p>
                    )}
                    </div>
                    
  
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className='lg:flex hidden'>Created: </span>
                        <span>{formatDate(deal.created_at || deal.deal_room_created_at)}</span>
                      </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span className='lg:flex hidden'>Participants: </span>
                          <span>{(deal?.participants_count || deal.participant_count) ? (deal.participants_count++ || deal.participant_count++) : 1}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span className='lg:flex hidden'>Documents: </span>
                          <span>{(deal.documents_count || deal.document_count) ? (deal.documents_count || deal.document_count) : 0}</span>
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
            </div>
  )
}

export default DealRoomParticipationCard