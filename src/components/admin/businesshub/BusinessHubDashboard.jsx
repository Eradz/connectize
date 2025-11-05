import BusinessHubHeader from "./BusinessHubHeader";
import PlatformModules from "./PlatformModules";
import RecentActivities from "./RecentActivities";
import RecentDealRooms from "./RecentDealRooms";

export default function BusinessHubDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHubHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PlatformModules />
            <div className="mt-6">
              <RecentDealRooms />
            </div>
          </div>

          <div className="lg:col-span-1">
            <RecentActivities />
          </div>
        </div>
      </div>
    </div>
  );
}