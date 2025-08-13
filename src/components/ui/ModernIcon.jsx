import React from 'react';

// Modern, minimalistic icon components with consistent styling
const ModernIcon = ({ size = 20, className = '', color = 'currentColor', strokeWidth = 1.5, ...props }) => {
  const baseProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `transition-all duration-200 ${className}`,
    ...props
  };

  return { baseProps };
};

// Dashboard & Analytics Icons
export const DashboardIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
};

export const AnalyticsIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M3 3v18h18" />
      <path d="M7 12l4-4 4 4 5-5" />
      <circle cx="7" cy="12" r="1" fill="currentColor" />
      <circle cx="11" cy="8" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="20" cy="7" r="1" fill="currentColor" />
    </svg>
  );
};

export const ChartIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 12l2-2 2 2 4-4" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="16" cy="8" r="1" fill="currentColor" />
    </svg>
  );
};

// User & People Icons
export const UsersIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
};

export const UserIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
};

// Business & Company Icons
export const CompanyIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
};

export const BuildingIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M8 6h1" />
      <path d="M8 10h1" />
      <path d="M8 14h1" />
      <path d="M12 6h1" />
      <path d="M12 10h1" />
      <path d="M12 14h1" />
      <path d="M16 6h1" />
      <path d="M16 10h1" />
      <path d="M16 14h1" />
      <path d="M8 18h8" />
    </svg>
  );
};

// Product & Service Icons
export const ProductIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84Z" />
      <path d="M22 12 12 17l-10-5" />
      <path d="M22 17 12 22l-10-5" />
    </svg>
  );
};

export const ServiceIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
};

export const CubeIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
};

// Communication Icons
export const MessageIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M8 12h.01" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
      <path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
};

export const ChatIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h.01" />
      <path d="M12 10h.01" />
      <path d="M16 10h.01" />
    </svg>
  );
};

export const NotificationIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <circle cx="18" cy="6" r="3" fill="currentColor" />
    </svg>
  );
};

// Content & Document Icons
export const DocumentIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  );
};

export const PostIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 7h10" />
      <path d="M7 11h10" />
      <path d="M7 15h6" />
    </svg>
  );
};

// Action Icons
export const PlusIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
};

export const AddIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
};

export const EditIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="M15 5l4 4" />
    </svg>
  );
};

export const DeleteIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
};

// Settings & Configuration Icons
export const SettingsIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
};

// Navigation & Interface Icons
export const MenuIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
};

export const SearchIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
};

export const FilterIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
    </svg>
  );
};

// Status & State Icons
export const CheckIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
};

export const ErrorIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
};

export const WarningIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
};

export const InfoIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
};

// Financial Icons
export const MoneyIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <path d="M12 7v5" />
      <path d="M9 9.5c0-1.7 1.3-2.5 3-2.5s3 .8 3 2.5-1.3 2.5-3 2.5-3-.8-3-2.5" />
    </svg>
  );
};

export const TrendingIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  );
};

// Theme Icons
export const SunIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2" />
      <path d="M12 21v2" />
      <path d="M4.22 4.22l1.42 1.42" />
      <path d="M18.36 18.36l1.42 1.42" />
      <path d="M1 12h2" />
      <path d="M21 12h2" />
      <path d="M4.22 19.78l1.42-1.42" />
      <path d="M18.36 5.64l1.42-1.42" />
    </svg>
  );
};

export const MoonIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
};

// Keyboard & Input Icons
export const KeyboardIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01" />
      <path d="M10 8h.01" />
      <path d="M14 8h.01" />
      <path d="M18 8h.01" />
      <path d="M8 12h.01" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
      <path d="M7 16h10" />
    </svg>
  );
};

export const CommandIcon = ({ size, className, ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </svg>
  );
};

// Navigation Icons
export const ArrowIcon = ({ size, className, direction = "right", ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  const rotations = {
    up: "-rotate-90",
    down: "rotate-90", 
    left: "rotate-180",
    right: "rotate-0"
  };
  
  return (
    <svg {...baseProps} className={`${baseProps.className} ${rotations[direction]}`}>
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
};

export const ChevronIcon = ({ size, className, direction = "right", ...props }) => {
  const { baseProps } = ModernIcon({ size, className, ...props });
  const rotations = {
    up: "-rotate-90",
    down: "rotate-90", 
    left: "rotate-180",
    right: "rotate-0"
  };
  
  return (
    <svg {...baseProps} className={`${baseProps.className} ${rotations[direction]}`}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
};

export default ModernIcon;
