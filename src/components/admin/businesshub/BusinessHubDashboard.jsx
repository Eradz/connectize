import BusinessHubHeader from "./BusinessHubHeader";
import PlatformModules from "./PlatformModules";
import RecentActivities from "./RecentActivities";
import RecentDealRooms from "./RecentDealRooms";

export default function BusinessHubDashboard() {
  return (
    <div className="overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <BusinessHubHeader />

      <div className="py-2">
        <div className="flex flex-col gap-6">
          <div className="flex gap-6 h-[610px]">
            <PlatformModules />
            <div className="w-[30%]">
            <RecentActivities />
            </div>
          </div>

          <div className="lg:col-span-1">
              <RecentDealRooms />
          </div>
        </div>
      </div>
    </div>
  );
}