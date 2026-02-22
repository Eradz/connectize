  import {  
  FileText, 
  User, 
  CheckSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { webRoutes } from '../../lib/webRoutes';
import { DealIcon } from '../../icon/deal';
 
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-[#00D707]';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
 const formatCompactNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  export const DealRoomCard = ({ deal }) => (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow mt-4">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col">
              <DealIcon/>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{deal.title}</h3>
              <p className="text-xs text-gray-500">
                {deal.company_name || deal.company?.name || deal.initiator_name || 'Personal Deal Room'}
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                {deal.deal_type?.replace('_', ' ')}
              </span>
            </div>
          </div>
         </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{deal.description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#212529] font-medium">Estimated Value</span>
            <span className="font-semibold text-gray-900">
              {formatCompactNumber(deal.estimated_value)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#212529] font-medium">Target Close</span>
            <span className="text-gray-700">
              {new Date(deal.target_close_date).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#212529] font-medium">Status</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(deal.status)}`}>
              {deal.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {deal.participants_count || 0}
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              {deal.documents_count || 0}
            </div>
            <div className="flex items-center">
              <CheckSquare className="w-4 h-4 mr-1" />
              {deal.milestones_count || 0}
            </div>
          </div>
          <Link
            to={webRoutes.dealRoomDetail.replace(':id', deal.id)}
            className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold transition-colors text-[12px]"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );