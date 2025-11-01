export default function RecentDealRooms() {
  const deals = [
    {
      title: "My Test Oil Platform Acquisition",
      subtitle: "Building Deal Room Platform for a successful deal...",
      type: "Acquisition",
      value: "5,000,000",
      status: "Active",
      progress: 85,
      statusColor: "bg-green-100 text-green-800"
    },
    {
      title: "Renewable Energy Technology Joint Venture",
      subtitle: "Strategic Collab-Credit Aquisition deal-Multiple parties involved-Global Supplier Chain integration",
      type: "Joint Venture",
      value: "20,000.34",
      status: "Negotiating",
      progress: 60,
      statusColor: "bg-yellow-100 text-yellow-800"
    },
    {
      title: "Natural Gas Processing Facility Acquisition",
      subtitle: "Acquisition with significant local-frontier exposed-global tracking strategies",
      type: "Acquisition",
      value: "4,324,534",
      status: "Active",
      progress: 85,
      statusColor: "bg-green-100 text-green-800"
    },
    {
      title: "Carbon Credit Portfolio Acquisition",
      subtitle: "",
      type: "",
      value: "",
      status: "",
      progress: 85,
      statusColor: "bg-gray-100 text-gray-800"
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Deal Rooms</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Deal Title</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Type</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Value</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Progress</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                    {deal.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">{deal.subtitle}</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-700">{deal.type}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm font-medium text-gray-900">{deal.value}</span>
                </td>
                <td className="py-4 px-4">
                  {deal.status && (
                    <span className={`${deal.statusColor} px-3 py-1 rounded-full text-xs font-medium`}>
                      {deal.status}
                    </span>
                  )}
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
