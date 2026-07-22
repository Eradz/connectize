  import { 
  FileText, 
  Users,  
  MapPin,
  Lock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { webRoutes } from '../../lib/webRoutes';
import { shareThis } from '../../lib/utils';
import { formatCompactNumber } from '../../utils/formatNumber';

    const getDealTypeIcon = (type) => {
    switch (type) {
      case 'acquisition': return <TrendingUp className="w-4 h-4" />;
      case 'joint_venture': return <Users className="w-4 h-4" />;
      case 'service_contract': return <FileText className="w-4 h-4" />;
      case 'equipment_lease': return <AlertCircle className="w-4 h-4" />;
      case 'exploration_rights': return <MapPin className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

    const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
export const DealRoomListItem = ({ deal }) => (
    <div className="bg-white border rounded-lg p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="bg-blue-100 p-2 rounded-lg">
            {getDealTypeIcon(deal.deal_type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className="font-semibold text-gray-900 text-lg">{deal.title}</h3>
              {deal.is_confidential && <Lock className="w-4 h-4 text-orange-500" />}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(deal.status)}`}>
                {deal.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-1">{deal.description}</p>
            <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
              <span className="capitalize">{deal.deal_type?.replace('_', ' ')}</span>
              <span>{deal.company_name || deal.company?.name || deal.initiator_name || 'Personal Deal Room'}</span>
              <span>{formatCompactNumber(deal.estimated_value)}</span>
              <span>Due: {new Date(deal.target_close_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {deal.participants_count || 0}
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              {deal.documents_count || 0}
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              {deal.milestones_count || 0}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
               onClick={async () => {
                          const shareUrlString =
                          window.location.href + "/" + deal?.id;
                          const shareData = {
                          title: deal?.title,
                          text: deal?.sub_title,
                          url: shareUrlString,
                          };
                          await shareThis({ shareUrlString, shareData });
                       }}
            className="p-2 hover:bg-gray-100 rounded-lg">
              <Share2 className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Download className="w-4 h-4 text-gray-400" />
            </button>
            <Link
              to={webRoutes.dealRoomDetail.replace(':id', deal.id)}
              className="bg-pale_yellow  text-white px-4 py-2 rounded-lg hover:bg-custom_yellow transition-colors text-sm font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );