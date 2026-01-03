import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  FileText,
  Users,
  Brain,
  Truck,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Home,
  BarChart3,
  Briefcase,
  Target,
  AlertTriangle,
  Package,
  BookOpen,
  CreditCard
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import Logo from '../logo';
import { useAuth } from '../../context/userContext';
import { NotificationPopOver } from '../notifications';
import FeedSearch from '../custom/FeedSearch';
import { JoinedUserCompanyImages } from '../ResponsiveNav';
import { Avatar } from '@chakra-ui/react';
import { VerifiedIcon } from '../../icon';
import { capitalizeFirst } from '../../lib/utils';
import clsx from 'clsx';
import { avatarStyle } from '../ResponsiveNav';
import Headroom from 'react-headroom';

// Utility function for conditional class names
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SidebarContent = React.memo(({ navigation, secondaryNavigation }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Auto-expand parent menu items when their children are current
  useEffect(() => {
    const newExpanded = new Set(expandedItems);
    let hasChanges = false;

    [...navigation, ...secondaryNavigation].forEach(item => {
      if (item.children) {
        const hasCurrentChild = item.children.some(child => child.current);
        if (hasCurrentChild && !newExpanded.has(item.name)) {
          newExpanded.add(item.name);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setExpandedItems(newExpanded);
    }
  }, [navigation, secondaryNavigation, expandedItems]);

  const toggleExpanded = (itemName) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Platform Logo */}
      <div className="flex items-center mb-6">
        <div className="bg-gold p-2 rounded-lg mr-3">
          <Home className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">Oil & Gas Platform</span>
      </div>
      
      {/* Main Navigation */}
      <div className="bg-background rounded p-2 space-y-1 mb-4">
        <ul className="xs:text-sm space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <div className="group flex items-center justify-between">
                <Link
                  to={item.href}
                  className={classNames(
                    'flex-1 flex items-center gap-2 transition-all active:scale-90 duration-300 p-2 py-2.5 xs:hover:!text-mid_grey !text-sm rounded',
                    {
                      'bg-mid_grey pointer-events-none !text-gold': item.current,
                      '!text-gray-500': !item.current,
                    }
                  )}
                >
                  <item.icon
                    className={classNames(
                      'hover:!text-gold text-xl !size-5 lg:!size-4',
                      {
                        '!text-gold': item.current,
                        '!text-gray-500': !item.current,
                      }
                    )}
                  />
                  <span className="max-md:sr-only lg:!text-sm">{item.name}</span>
                </Link>
                
                {item.children && (
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <ChevronDown 
                      className={classNames(
                        'h-4 w-4 transition-transform',
                        expandedItems.has(item.name) ? 'transform rotate-180' : ''
                      )}
                    />
                  </button>
                )}
              </div>
              
              {/* Submenu */}
              {item.children && expandedItems.has(item.name) && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      to={child.href}
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Secondary Navigation */}
      <div className="bg-background rounded p-2 space-y-1">
        <ul className="xs:text-sm space-y-1">
          {secondaryNavigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className="flex items-center gap-2 transition-all active:scale-90 duration-300 p-2 py-2.5 xs:hover:!text-mid_grey !text-sm rounded text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="hover:!text-gold text-xl !size-5 lg:!size-4 !text-gray-500" />
                <span className="max-md:sr-only lg:!text-sm">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

const PlatformNavigation = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user: currentUser } = useAuth();

  const navigation = useMemo(() => ([
    {
      name: 'Dashboard',
      href: webRoutes.platformDashboard,
      icon: LayoutDashboard,
      current: location.pathname === webRoutes.platformDashboard
    },
    {
      name: 'Deal Rooms',
      href: webRoutes.dealRooms,
      icon: FileText,
      current: location.pathname.startsWith('/deals'),
      children: [
        { name: 'All Deal Rooms', href: webRoutes.dealRooms },
        { name: 'Create Deal Room', href: webRoutes.dealRoomCreate },
        { name: 'My Participations', href: webRoutes.myParticipations },
        { name: 'Deal Analytics', href: '/deals/analytics' }
      ]
    },
    {
      name: 'Workforce',
      href: webRoutes.workforceJobs,
      icon: Users,
      current: location.pathname.startsWith('/jobs') || 
               location.pathname.startsWith('/professionals') || 
               location.pathname.startsWith('/events') || 
               location.pathname.startsWith('/applications'),
      children: [
        { name: 'Job Marketplace', href: webRoutes.workforceJobs },
        { name: 'Saved Jobs', href: webRoutes.workforceSavedJobs },
        { name: 'My Posted Jobs', href: webRoutes.workforceMyPostedJobs },
        { name: 'My Applications', href: webRoutes.workforceApplications },
        { name: 'Professionals', href: webRoutes.workforceProfiles },
        { name: 'Industry Events', href: webRoutes.workforceEvents },
        { name: 'My Registered Events', href: webRoutes.workforceMyRegistrations },
        { name: 'My Created Events', href: webRoutes.workforceMyEvents }
      ]
    },
    {
      name: 'AI Services',
      href: webRoutes.aiDashboard,
      icon: Brain,
      current: location.pathname.startsWith('/ai'),
      children: [
        { name: 'AI Dashboard', href: webRoutes.aiDashboard },
        { name: 'Smart Matching', href: webRoutes.aiMatching },
        { name: 'Opportunities', href: webRoutes.aiOpportunities },
        { name: 'Compliance Monitor', href: webRoutes.aiCompliance }
      ]
    },
    {
      name: 'Inventory',
      href: webRoutes.inventoryDashboard,
      icon: Package,
      current: location.pathname.startsWith('/inventory'),
      children: [
        { name: 'Dashboard', href: webRoutes.inventoryDashboard },
        { name: 'Warehouses', href: webRoutes.inventoryWarehouses },
        { name: 'Items', href: webRoutes.inventoryItems },
        { name: 'Transactions', href: webRoutes.inventoryTransactions },
        { name: 'Reports', href: webRoutes.inventoryReports },
        { name: 'Alerts', href: webRoutes.inventoryAlerts }
      ]
    },
    {
      name: 'Knowledge Hub',
      href: webRoutes.knowledgeHub,
      icon: BookOpen,
      current: location.pathname.startsWith('/knowledge'),
      children: [
        { name: 'Dashboard', href: webRoutes.knowledgeHub },
        { name: 'Articles', href: webRoutes.knowledgeArticles },
        { name: 'Forums', href: webRoutes.knowledgeForums },
        { name: 'Topics', href: webRoutes.knowledgeTopics },
        { name: 'Categories', href: webRoutes.knowledgeCategories },
        { name: 'Search', href: webRoutes.knowledgeSearch }
      ]
    },
    {
      name: 'Featured Ads',
      href: webRoutes.featuredAds,
      icon: Target,
      current: location.pathname.startsWith('/ads'),
      children: [
        { name: 'Manage Campaigns', href: webRoutes.featuredAds }
      ]
    },
    {
      name: 'Logistics Hub',
      href: webRoutes.logisticsDashboard,
      icon: Truck,
      current: location.pathname.startsWith('/logistics'),
      children: [
        { name: 'Logistics Overview', href: webRoutes.logisticsDashboard },
        { name: 'Shipment Requests', href: webRoutes.logisticsRequests },
        { name: 'Inventory', href: webRoutes.logisticsInventory },
        { name: 'Shipments', href: webRoutes.logisticsShipments }
      ]
    }
  ]), [location.pathname]);

  const secondaryNavigation = useMemo(() => ([
    { name: 'Analytics', href: webRoutes.platformAnalytics, icon: BarChart3 },
    { name: 'Reports', href: webRoutes.platformReports, icon: FileText },
    { name: 'Settings', href: webRoutes.userSettings, icon: Settings },
    { name: 'Subscription', href: webRoutes.subscriptions, icon: CreditCard }
  ]), []);

  return (
    <main className="bg-background w-full h-screen flex flex-col">
      {/* Navbar - matching main Connectize design */}
      <Headroom>
        <nav className="w-full h-16 flex items-center bg-white z-[99999]">
          <section
            id="header-mobile-popover-container"
            className="sm:container max-xs:px-2 max-sm:px-4 w-full py-2 flex items-center justify-between !gap-2 lg:!gap-10 xl:!gap-14 shadow-sm"
            style={{ overflowX: "hidden" }}
          >
            <div className="flex w-full gap-4 md:!gap-6 items-center">
              <Logo size="50px" />
              <FeedSearch />
            </div>

            <div className="flex items-center gap-3 xs:gap-5 md:gap-7 shrink-0">
              <NotificationPopOver />
              <JoinedUserCompanyImages />
            </div>
          </section>
        </nav>
      </Headroom>

      <section className="flex flex-col items-start md:flex-row gap-4 xl:!gap-5 md:p-4 md:container flex-1 h-[calc(100%_-_64px)]">
        {/* Sidebar - matching main Connectize design */}
        <nav className="max-md:hidden bg-white rounded-md py-4 px-2 shrink-0 max-w-[300px] sm:w-[280px] lg:w-[300px] 2xl:w-[350px] max-h-[97vh] scrollbar-hidden max-md:!py-6 max-md:shadow md:sticky md:top-2 overflow-y-auto space-y-4 h-[97vh]">
          {/* User Profile */}
          {currentUser && (
            <div className="flex items-center gap-2">
              <Link to={`/co/${currentUser?.id}`}>
                <Avatar
                  name={
                    currentUser?.first_name
                      ? `${currentUser?.first_name} ${currentUser?.last_name}`
                      : currentUser?.email
                  }
                  src={currentUser?.avatar || ""}
                  className={clsx(avatarStyle)}
                  size="md"
                />
              </Link>
              <div>
                <div className="flex items-center">
                  <Link
                    to={`/co/${currentUser?.id}`}
                    className="font-semibold text-sm line-clamp-1 break-all"
                  >
                    {currentUser?.first_name
                      ? `${currentUser?.first_name} ${currentUser?.last_name}`
                      : currentUser?.email.split("@")[0]}
                  </Link>
                  <VerifiedIcon color="black" />
                </div>
                <span className="text-[.75rem] text-gray-400 !-mt-0.5 block">
                  {currentUser?.role
                    ? capitalizeFirst(currentUser?.role || "")
                    : currentUser?.email}
                </span>
              </div>
            </div>
          )}

          {/* Platform Navigation */}
          <SidebarContent navigation={navigation} secondaryNavigation={secondaryNavigation} />
        </nav>

        {/* Main content area */}
        <section className="md:px-0 gap-2 w-full max-md:mb-16 h-full grid grid-cols-1">
          {children}
        </section>
      </section>

      {/* Mobile sidebar overlay */}
      <div className={classNames(
        sidebarOpen ? 'block' : 'hidden',
        'fixed inset-0 flex z-40 md:hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} secondaryNavigation={secondaryNavigation} />
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>
    </main>
  );
};

export default React.memo(PlatformNavigation);
