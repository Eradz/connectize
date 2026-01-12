import React, { useState } from 'react';
import { setSession, getSession, removeSession } from '../../lib/session';
import { toast } from 'sonner';

const AdminAuth = () => {
  const [tokens, setTokens] = useState('');
  const [currentSession, setCurrentSession] = useState(null);

  const handleSetTokens = () => {
    try {
      const parsedTokens = JSON.parse(tokens);
      
      if (!parsedTokens.access || !parsedTokens.refresh) {
        toast.error('Invalid token format. Please provide both access and refresh tokens.');
        return;
      }

      const sessionData = {
        user: {
          email: 'admin@demo.com',
          id: 8,
          is_staff: true,
          is_superuser: true
        },
        tokens: parsedTokens
      };

      setSession(sessionData);
      setCurrentSession(sessionData);
      toast.success('Authentication tokens set successfully!');
      setTokens('');
    } catch (error) {
      toast.error('Invalid JSON format. Please check your token format.');
    }
  };

  const handleClearTokens = () => {
    removeSession();
    setCurrentSession(null);
    toast.success('Authentication tokens cleared!');
  };

  const handleCheckSession = () => {
    const session = getSession();
    setCurrentSession(session);
    if (session) {
      toast.success('Session found and loaded!');
    } else {
      toast.error('No session found.');
    }
  };

  React.useEffect(() => {
    handleCheckSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Authentication Setup</h1>
          
          <div className="space-y-6">
            {/* Current Session Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Current Session Status</h2>
              {currentSession ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">✅ Authenticated</p>
                  <p className="text-sm text-gray-600">User: {currentSession.email}</p>
                  <p className="text-sm text-gray-600">User ID: {currentSession.id}</p>
                  <p className="text-sm text-gray-600">Has Tokens: {currentSession.tokens ? 'Yes' : 'No'}</p>
                </div>
              ) : (
                <p className="text-sm text-red-600">❌ Not authenticated</p>
              )}
              
              <div className="mt-4 space-x-2">
                <button
                  onClick={handleCheckSession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-custom_yellow"
                >
                  Refresh Session
                </button>
                {currentSession && (
                  <button
                    onClick={handleClearTokens}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Clear Session
                  </button>
                )}
              </div>
            </div>

            {/* Token Input */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">Set Authentication Tokens</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste JWT Tokens (JSON format)
                  </label>
                  <textarea
                    value={tokens}
                    onChange={(e) => setTokens(e.target.value)}
                    placeholder='{"access": "your-access-token", "refresh": "your-refresh-token"}'
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSetTokens}
                  disabled={!tokens.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Set Authentication
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="text-lg font-medium text-blue-900 mb-3">Instructions</h2>
              <div className="text-sm text-blue-800 space-y-2">
                <p>1. Run the Django shell command to generate admin tokens</p>
                <p>2. Copy the JSON output from the terminal</p>
                <p>3. Paste it in the textarea above and click "Set Authentication"</p>
                <p>4. You can now access admin interfaces like Knowledge Hub</p>
              </div>
            </div>

            {/* Navigation */}
            {currentSession && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-3">Admin Navigation</h2>
                <div className="space-x-4">
                  <a
                    href="/admin/knowledge"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 inline-block"
                  >
                    Knowledge Hub Admin
                  </a>
                  <a
                    href="/admin/logistics"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block"
                  >
                    Logistics Admin
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
