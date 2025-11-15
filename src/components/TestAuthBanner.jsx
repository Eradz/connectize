import React from 'react';
import { User, LogOut, Crown, UserCheck } from 'lucide-react';
import { useTestAuth } from '../context/TestAuthContext';

const TestAuthBanner = () => {
  const { user, isAuthenticated, loginAsTestUser, logout, testUsers } = useTestAuth();

  if (isAuthenticated) {
    return (
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Test Mode: Logged in as <strong>{user.name}</strong> ({user.role})
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Test Mode: Choose a user to test event management features
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loginAsTestUser('organizer1')}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              <Crown className="w-3 h-3" />
              Login as Organizer
            </button>
            <button
              onClick={() => loginAsTestUser('attendee1')}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <UserCheck className="w-3 h-3" />
              Login as Attendee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuthBanner;
