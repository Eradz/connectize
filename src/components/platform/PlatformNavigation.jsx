import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  FileText,
  Users,
  Brain,
  Truck,
  Shield,
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
  Wrench
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';

// Helper to combine class names across components
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const PlatformNavigation = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
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
        { name: 'My Participations', href: '/deals/my-participations' },
        { name: 'Deal Analytics', href: '/deals/analytics' }
      ]
    },
    {
      name: 'Workforce',
      href: webRoutes.workforceJobs,
      icon: Users,
      current: location.pathname.startsWith('/jobs') || location.pathname.startsWith('/professionals'),
      children: [
        { name: 'Job Marketplace', href: webRoutes.workforceJobs },
        { name: 'Professionals', href: webRoutes.workforceProfiles },
        { name: 'Industry Events', href: webRoutes.workforceEvents },
        { name: 'My Applications', href: webRoutes.workforceApplications }
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
      name: 'Logistics Hub',
      href: webRoutes.logisticsDashboard,
      icon: Truck,
      current: location.pathname.startsWith('/logistics'),
      children: [
        { name: 'Logistics Overview', href: webRoutes.logisticsDashboard },
        { name: 'Shipments', href: webRoutes.logisticsShipments },
        { name: 'Inventory', href: webRoutes.logisticsInventory },
        { name: 'Suppliers', href: webRoutes.logisticsSuppliers }
      ]
    },
    {
      name: 'Trust & Verification',
      href: webRoutes.trustDashboard,
      icon: Shield,
      current: location.pathname.startsWith('/trust'),
      children: [
        { name: 'Trust Dashboard', href: webRoutes.trustDashboard },
        { name: 'Verification', href: webRoutes.trustVerification },
        { name: 'Reputation', href: webRoutes.trustReputation },
        { name: 'Reviews & Ratings', href: webRoutes.trustReviews }
      ]
    },
    {
      name: 'Specialized Tools',
      href: webRoutes.toolsDashboard,
      icon: Wrench,
      current: location.pathname.startsWith('/tools'),
      children: [
        { name: 'Tools Overview', href: webRoutes.toolsDashboard },
        { name: 'Equipment Rental', href: webRoutes.toolsEquipment },
        { name: 'HSE Management', href: webRoutes.toolsHSE },
        { name: 'Regulatory Compliance', href: webRoutes.toolsRegulatory }
      ]
    }
  ];

  const secondaryNavigation = [
    { name: 'Analytics', href: webRoutes.platformAnalytics, icon: BarChart3 },
    { name: 'Reports', href: webRoutes.platformReports, icon: FileText },
    { name: 'Settings', href: webRoutes.userSettings, icon: Settings }
  ];

  const quickActions = [
    { name: 'Create Deal Room', href: webRoutes.dealRoomCreate, icon: FileText, color: 'bg-blue-500' },
    { name: 'Post Job', href: webRoutes.workforceJobCreate, icon: Briefcase, color: 'bg-green-500' },
    { name: 'Create Profile', href: webRoutes.workforceProfileCreate, icon: User, color: 'bg-purple-500' },
    { name: 'Get Verified', href: webRoutes.trustVerification, icon: Shield, color: 'bg-indigo-500' }
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar for mobile */}
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

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} secondaryNavigation={secondaryNavigation} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Search */}
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <form className="w-full flex md:ml-0" action="#" method="GET">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Search deals, jobs, professionals..."
                    type="search"
                  />
                </div>
              </form>
            </div>
            
            {/* Right side */}
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Bell className="h-6 w-6" />
              </button>

              {/* Quick Actions Dropdown */}
              <div className="ml-3 relative">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Quick Actions:</span>
                  {quickActions.slice(0, 2).map((action) => (
                    <Link
                      key={action.name}
                      to={action.href}
                      className={`${action.color} text-white p-2 rounded-lg hover:opacity-90 transition-opacity`}
                      title={action.name}
                    >
                      <action.icon className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <img
                      className="h-8 w-8 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
                  </button>
                </div>
                
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                    <Link to={webRoutes.userProfile} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Your Profile
                    </Link>
                    <Link to={webRoutes.userSettings} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </Link>
                    <Link to={webRoutes.userSubscription} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Subscription
                    </Link>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, secondaryNavigation }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

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
    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Link to={webRoutes.platformDashboard} className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Oil & Gas Platform</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              <div className="group flex items-center justify-between">
                <Link
                  to={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex-1 flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-5 w-5'
                    )}
                  />
                  {item.name}
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
            </div>
          ))}
          
          {/* Secondary Navigation */}
          <div className="pt-6 mt-6 border-t border-gray-200">
            {secondaryNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <item.icon className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default PlatformNavigation;
