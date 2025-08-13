import React from 'react';

// Minimal Avatar component for admin tables
// Props: user { display_name, email, avatar }, size: 'sm' | 'md' | 'lg'
export default function Avatar({ user, size = 'md', className = '' }) {
  const name = user?.display_name || user?.name || user?.username || 'User';
  const email = user?.email || '';
  const src = user?.avatar || user?.profile_picture || null;

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 overflow-hidden ${sizes[size]} ${className}`}
         title={email || name}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      ) : (
        <span className="font-medium">{initials}</span>
      )}
    </div>
  );
}
