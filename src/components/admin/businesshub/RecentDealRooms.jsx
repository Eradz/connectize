import { Link } from "react-router-dom";
import { webRoutes } from "../../../lib/webRoutes";

export default function RecentDealRooms({dashboardData}) {
  console.log(dashboardData.dealRooms.data);
    const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Deal Rooms</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="font-bold border-b border-gray-200">
              <th className="font-medium text-left py-3 px-4 text-xs text-gray-600">Deal Title</th>
              <th className="font-medium text-left py-3 px-4 text-xs text-gray-600">Type</th>
              <th className="font-medium text-left py-3 px-4 text-xs text-gray-600">Value</th>
              <th className="font-medium text-left py-3 px-4 text-xs text-gray-600">Status</th>
              <th className="font-medium text-left py-3 px-4 text-xs text-gray-600">Progress</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.dealRooms.data.map((deal, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <Link 
                        to={webRoutes.dealRoomDetail.replace(':id', deal.id)}
                        className="font-medium text-pale_yellow hover:text-gold"
                      >
                        {deal.title}
                  </Link>
                  <p className="text-sm text-gray-500">{deal.description}</p>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-700">{deal.deal_type?.replace('_', ' ')}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm font-medium text-gray-900"> {formatCurrency(deal.estimated_value)}</span>
                </td>
                <td className="py-4 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${deal.status === 'active' ? 'bg-green-100 text-green-800' : 
                          deal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {deal.status}
                      </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${deal.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{deal.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
             {dashboardData.dealRooms.data.length === 0 && (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">
                                  No deal rooms found. <Link to={webRoutes.dealRoomCreate} className="text-pale_yellow hover:text-gold">Create your first deal room</Link>
                                </td>
                              </tr>
                            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
