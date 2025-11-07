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

  return baseProps;
};

// Dashboard & Analytics Icons
export const DashboardIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
};

// Business & Company Icons
export const CompanyIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84Z" />
      <path d="M22 12 12 17l-10-5" />
      <path d="M22 17 12 22l-10-5" />
    </svg>
  );
};

export const ServiceIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
};

export const CubeIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
};

export const AddIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
};

export const EditIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="M15 5l4 4" />
    </svg>
  );
};

export const DeleteIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
};

// Security (Shield)
export const SecurityIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M12 2l7 3v6c0 6-7 10-7 10s-7-4-7-10V5l7-3z" />
      <path d="M9.5 12.5l1.8 1.8L15 10.5" />
    </svg>
  );
};

// Tools (Wrench + Screwdriver)
export const SystemIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <circle cx="6.5" cy="6.5" r="1.5" />
      <circle cx="17.5" cy="6.5" r="1.5" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
};

export const ToolIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M21 3l-6 6" />
      <path d="M8 22l6-6" />
      <path d="M16 2a4 4 0 0 0 4 4l-3 3a4 4 0 1 1-5.66-5.66L16 2z" />
      <path d="M7 13l-4 4 4 4 4-4-4-4z" />
    </svg>
  );
};

// Navigation & Interface Icons
export const MenuIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
};

export const SearchIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
};

export const FilterIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
    </svg>
  );
};

// Status & State Icons
export const CheckIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
};

export const ErrorIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
};

export const WarningIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
};

export const InfoIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
};

export const AlertIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
};

export const VerifiedIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M9 12l2 2 4-4" />
      <path d="M21 12c.5 0 .9-.4.9-.9V8.2c0-.5-.4-.9-.9-.9h-1.3l-.4-1.2c-.2-.4-.6-.7-1.1-.7H16.4l-.9-.9c-.4-.4-.9-.4-1.3 0l-.9.9H11.4c-.5 0-.9.3-1.1.7L9.9 7.3H8.6c-.5 0-.9.4-.9.9v2.9c0 .5.4.9.9.9h1.3l.4 1.2c.2.4.6.7 1.1.7h1.8l.9.9c.4.4.9.4 1.3 0l.9-.9h1.8c.5 0 .9-.3 1.1-.7l.4-1.2H21z" />
    </svg>
  );
};

export const CloseIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
};

export const RefreshIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
};

export const DownloadIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
};

export const ExportIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
      <path d="M16 11l2-2-2-2" />
    </svg>
  );
};

export const ViewIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};

export const HideIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
};

export const CalendarIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
};

export const EmailIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
};

export const LockIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
};

export const UnlockIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
};

export const LinkIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
};

export const StarIcon = ({ size, className, filled = false, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps} fill={filled ? 'currentColor' : 'none'}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
};

export const HeartIcon = ({ size, className, filled = false, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps} fill={filled ? 'currentColor' : 'none'}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
};

export const BookmarkIcon = ({ size, className, filled = false, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps} fill={filled ? 'currentColor' : 'none'}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
};

export const ShareIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
};

export const LoadingIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps} className={`${baseProps.className} animate-spin`}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

export const SortIcon = ({ size, className, direction = "none", ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  
  if (direction === "asc") {
    return (
      <svg {...baseProps}>
        <path d="M3 16.5L12 8l9 8.5" />
      </svg>
    );
  }
  
  if (direction === "desc") {
    return (
      <svg {...baseProps}>
        <path d="M3 7.5L12 16l9-8.5" />
      </svg>
    );
  }
  
  return (
    <svg {...baseProps}>
      <path d="M3 14.5L12 6l9 8.5" />
      <path d="M3 9.5L12 18l9-8.5" />
    </svg>
  );
};

export const DotsIcon = ({ size, className, vertical = false, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  
  if (vertical) {
    return (
      <svg {...baseProps}>
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    );
  }
  
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
};

export const PaperclipIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" />
    </svg>
  );
};

export const MapIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 .553-.894L9 2l6 3 5.447-2.724A1 1 0 0 1 21 3.382v10.764a1 1 0 0 1-.553.894L15 18l-6-3z" />
      <polyline points="9,2 9,20" />
      <polyline points="15,5 15,18" />
    </svg>
  );
};

export const GlobeIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
};

export const ShieldIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
};

export const DatabaseIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
};

export const ServerIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="2" y="3" width="20" height="4" rx="1" />
      <rect x="2" y="9" width="20" height="4" rx="1" />
      <rect x="2" y="15" width="20" height="4" rx="1" />
      <line x1="6" y1="5" x2="6.01" y2="5" />
      <line x1="6" y1="11" x2="6.01" y2="11" />
      <line x1="6" y1="17" x2="6.01" y2="17" />
    </svg>
  );
};

export const CloudIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  );
};

export const CpuIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3" />
      <path d="M15 1v3" />
      <path d="M9 20v3" />
      <path d="M15 20v3" />
      <path d="M20 9h3" />
      <path d="M20 14h3" />
      <path d="M1 9h3" />
      <path d="M1 14h3" />
    </svg>
  );
};

export const ActivityIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
  );
};

export const PulseIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
};

export const ZapIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
    </svg>
  );
};

export const FlameIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
};

export const ThumbsUpIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
};

export const MegaphoneIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M3 11v3a1 1 0 0 0 1 1h1l4 4v-5.5" />
      <path d="M21 6 9 18" />
      <path d="M21 6v12" />
      <path d="M9 18h8" />
    </svg>
  );
};

export const ListIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
};

export const GridIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
};

// Keyboard & Input Icons
export const MoneyIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  );
};

// Theme Icons
export const SunIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
};

// Keyboard & Input Icons
export const KeyboardIcon = ({ size, className, ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
  return (
    <svg {...baseProps}>
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </svg>
  );
};

// Navigation Icons
export const ArrowIcon = ({ size, className, direction = "right", ...props }) => {
  const baseProps = ModernIcon({ size, className, ...props });
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
  const baseProps = ModernIcon({ size, className, ...props });
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
