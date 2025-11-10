  import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Users, 
  Calendar, 
  DollarSign,
  MapPin,
  Eye,
  Lock,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Download,
  Share2
} from 'lucide-react';
  
 const formatCompactNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

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

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  export const DealRoomCard = ({ deal }) => (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              {getDealTypeIcon(deal.deal_type)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{deal.title}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                {deal.deal_type?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {deal.is_confidential && <Lock className="w-4 h-4 text-orange-500" />}
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{deal.description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Estimated Value</span>
            <span className="font-semibold text-gray-900">
              {formatCompactNumber(deal.estimated_value)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Target Close</span>
            <span className="text-gray-700">
              {new Date(deal.target_close_date).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(deal.status)}`}>
              {deal.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
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
          <Link
            to={webRoutes.dealRoomDetail.replace(':id', deal.id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>

      {deal.recent_activities && deal.recent_activities.length > 0 && (
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Last activity: {deal.recent_activities[0]?.description}
            </span>
            <span className="text-gray-400">
              {getTimeAgo(deal.recent_activities[0]?.timestamp)}
            </span>
          </div>
        </div>
      )}
    </div>
  );