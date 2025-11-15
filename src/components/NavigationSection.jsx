import { LogoutOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { logOutCurrentUser } from "../api-services/users";
import { useNav } from "../context/navContext";
import { useAuth } from "../context/userContext";
import { feedNavItems, hubNavItems, adminNavItems } from "../lib/data";
import { getSession } from "../lib/session";
import {ButtonWithTooltipIcon} from './ButtonWithTooltipIcon'
import ReusableModal from "./custom/ResusableModal";
import LightParagraph from "./ParagraphText";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Brain, 
  Truck, 
  BookOpen, 
  CreditCard, 
  Shield,
  ChevronDown,
  ChevronRight,
  Building2
} from "lucide-react";

// Icon mapping for dynamic icons
const iconMap = {
  LayoutDashboard,
  FileText,
  Users,
  Brain,
  Truck,
  BookOpen,
  CreditCard,
  Shield,
  Building2
};

export function NavigationSection({ hasHeader, isSmallNavigation = false }) {
  const { pathname } = useLocation();
  const { toggleNav } = useNav();
  const { user: currentUser } = useAuth();
  const session = getSession();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set()); // Start with all sections collapsed
  const [expandedHubItems, setExpandedHubItems] = useState(new Set());

  // Auto-expand hub items only when user navigates to related pages (not on initial load)
  useEffect(() => {
    // Only auto-expand if user is specifically on a hub sub-page (not just "/" or "/feed")
    if (pathname === '/' || pathname === '/feed' || pathname.startsWith('/feed/')) {
      return; // Don't auto-expand for home/feed pages
    }

    const newExpandedItems = new Set(expandedHubItems);
    const newExpandedSections = new Set(expandedSections);
    let hasItemChanges = false;
    let hasSectionChanges = false;

    // Check if we need to expand any hub items
    hubNavItems.forEach(item => {
      if (item.subItems && item.subItems.length > 0) {
        const hasCurrentSubItem = item.subItems.some(subItem => 
          pathname.startsWith(subItem.to) && pathname !== subItem.to.replace('/:id', '')
        );
        if (hasCurrentSubItem && !newExpandedItems.has(item.name)) {
          newExpandedItems.add(item.name);
          hasItemChanges = true;
        }
      }
    });

    // Auto-expand Hub section only if user is specifically on a hub page with content
    const isOnSpecificHubPage = hubNavItems.some(item => {
      if (item.subItems) {
        return item.subItems.some(subItem => pathname.startsWith(subItem.to));
      }
      return pathname.startsWith(item.to) && pathname !== '/';
    });

    if (isOnSpecificHubPage && !newExpandedSections.has('hub')) {
      newExpandedSections.add('hub');
      hasSectionChanges = true;
    }

    // Auto-expand Admin section only if user is on admin pages
    if (pathname.startsWith('/admin') && !newExpandedSections.has('admin')) {
      newExpandedSections.add('admin');
      hasSectionChanges = true;
    }

    if (hasItemChanges) {
      setExpandedHubItems(newExpandedItems);
    }
    if (hasSectionChanges) {
      setExpandedSections(newExpandedSections);
    }
  }, [pathname]); // Remove expandedHubItems and expandedSections from dependencies to prevent loops

  const navigators = useMemo(
    () => (isSmallNavigation ? feedNavItems.slice(0, 6) : feedNavItems),
    [isSmallNavigation]
  );

  const handleLogout = async () => {
    setLoading(true);
    await logOutCurrentUser();
    setLoading(false);
  };

  const toggleSection = (sectionName) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const toggleHubItem = (itemName) => {
    const newExpanded = new Set(expandedHubItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedHubItems(newExpanded);
  };

  // Check if user is admin
  const isAdmin = currentUser?.is_staff || currentUser?.is_superuser;

  const HubNavItem = ({ item }) => {
    const IconComponent = iconMap[item.icon];
    const isActive = pathname.startsWith(item.to);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedHubItems.has(item.name);

    return (
      <li className="space-y-1">
        <div className="flex items-center">
          <Link
            to={item.to}
            onClick={() => toggleNav(false)}
            className={clsx(
              "flex-1 flex gap-2 items-center transition-all duration-300 p-2 py-2.5 rounded-md",
              {
                "bg-blue-50 text-blue-700": isActive,
                "text-gray-600 hover:bg-gray-50 hover:text-gray-900": !isActive,
              }
            )}
          >
            {IconComponent && (
              <IconComponent className="w-5 h-5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium block truncate">{item.name}</span>
              {item.description && (
                <span className="text-xs text-gray-500 block truncate">{item.description}</span>
              )}
            </div>
          </Link>
          {hasSubItems && (
            <button
              onClick={() => toggleHubItem(item.name)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        
        {hasSubItems && isExpanded && (
          <ul className="ml-6 space-y-1">
            {item.subItems.map((subItem, index) => (
              <li key={index}>
                <Link
                  to={subItem.to}
                  onClick={() => toggleNav(false)}
                  className="block p-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
                >
                  {subItem.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  if (hasHeader) {
    return (
      <ul className="flex items-center justify-between h-12 xs:text-sm">
        {navigators.map(({ to, icon, name }, index) => {
          const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={index}>
              <Link
                to={to}
                onClick={() => toggleNav(false)}
                className={clsx(
                  "flex gap-2 items-center transition-all active:scale-90 duration-300 p-2 py-2.5 xs:hover:!text-mid_grey !text-sm flex-col text-xs xs:text-[.65rem]",
                  {
                    "bg-mid_grey pointer-events-none": isActive,
                    "!text-gold rounded": isActive,
                    "!text-gray-500": !isActive,
                  }
                )}
              >
                <ButtonWithTooltipIcon
                  IconName={icon}
                  tip={name}
                  iconClassName={clsx(
                    "hover:!text-gold text-xl !size-5 lg:!size-4",
                    {
                      "!text-gold rounded": isActive,
                      "!text-gray-500": !isActive,
                      "!text-white": !isActive && isSmallNavigation,
                    }
                  )}
                />
                <span className="max-md:sr-only lg:!text-sm">{name}</span>
              </Link>
            </li>
          );
        })}
        {currentUser && session && !isSmallNavigation && (
          <li>
            <button
              className="flex gap-2 items-center transition-colors duration-300 p-2 rounded hover:!text-red-600 text-gray-600 disabled:cursor-not-allowed disabled:text-red-300 flex-col text-[.65rem]"
              onClick={() => setIsOpen(true)}
              disabled={loading}
            >
              <LogoutOutlined className="!text-lg" />
              <span>{loading ? "Logging out..." : "Logout"}</span>
            </button>
          </li>
        )}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main Navigation */}
      <div className="bg-background rounded p-2 space-y-1">
        <ul className="xs:text-sm space-y-1">
          {navigators.map(({ to, icon, name }, index) => {
            const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <li key={index}>
                <Link
                  to={to}
                  onClick={() => toggleNav(false)}
                  className={clsx(
                    "flex gap-2 items-center transition-all active:scale-90 duration-300 p-2 py-2.5 xs:hover:!text-mid_grey !text-sm rounded",
                    {
                      "bg-mid_grey pointer-events-none": isActive,
                      "!text-gold": isActive,
                      "!text-gray-500": !isActive,
                    }
                  )}
                >
                  <ButtonWithTooltipIcon
                    IconName={icon}
                    tip={name}
                    iconClassName={clsx(
                      "hover:!text-gold text-xl !size-5 lg:!size-4",
                      {
                        "!text-gold": isActive,
                        "!text-gray-500": !isActive,
                        "!text-white": !isActive && isSmallNavigation,
                      }
                    )}
                  />
                  <span className="max-md:sr-only lg:!text-sm">{name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Hub Section */}
      <div className="bg-white rounded-lg p-2 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Business Hub
          </h3>
          <button
            onClick={() => toggleSection('hub')}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expandedSections.has('hub') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {expandedSections.has('hub') && (
          <ul className="space-y-1">
            {hubNavItems.map((item, index) => (
              <HubNavItem key={index} item={item} />
            ))}
          </ul>
        )}
      </div>

      {/* Admin Section - Only show for admin users */}
      {isAdmin && (
        <div className="bg-gold/10 rounded-lg p-2 shadow-sm border border-gold/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gold flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold" />
              Admin
            </h3>
            <button
              onClick={() => toggleSection('admin')}
              className="p-1 text-gold/60 hover:text-gold transition-colors"
            >
              {expandedSections.has('admin') ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
          
          {expandedSections.has('admin') && (
            <ul className="space-y-1">
              {adminNavItems.map((item, index) => {
                const IconComponent = iconMap[item.icon];
                const isActive = pathname.startsWith(item.to);
                
                return (
                  <li key={index}>
                    <Link
                      to={item.to}
                      onClick={() => toggleNav(false)}
                      className={clsx(
                        "flex gap-2 items-center transition-all duration-300 p-2 py-2.5 rounded-md",
                        {
                          "bg-gold/20 text-gold": isActive,
                          "text-gold/70 hover:bg-gold/10 hover:text-gold": !isActive,
                        }
                      )}
                    >
                      {IconComponent && (
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">{item.name}</span>
                        {item.description && (
                          <span className="text-xs text-gold/60 block truncate">{item.description}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Logout */}
      {currentUser && session && !isSmallNavigation && (
        <>
          <ReusableModal
            onClose={() => setIsOpen(false)}
            isOpen={isOpen}
            primaryAction={handleLogout}
            title="Are you sure you want to log out?"
            secondaryText="Cancel"
            loading={loading}
          >
            <LightParagraph>
              You are about to end your current session.
            </LightParagraph>
          </ReusableModal>
          <div className="bg-background rounded p-2">
            <button
              className="flex gap-2 items-center transition-colors duration-300 p-2 rounded hover:!text-red-600 text-gray-600 disabled:cursor-not-allowed disabled:text-red-300 w-full"
              onClick={() => setIsOpen(true)}
              disabled={loading}
            >
              <LogoutOutlined className="!text-lg" />
              <span className="text-sm">
                {loading ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
