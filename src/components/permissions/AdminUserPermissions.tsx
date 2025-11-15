import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../context/PermissionContext';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  company?: {
    id: string;
    company_name: string;
  };
}

interface Feature {
  feature_code: string;
  feature_name: string;
  description: string;
  feature_category: string;
  access_level: string;
  minimum_plan: string;
  is_active: boolean;
}

interface PermissionOverride {
  id: string;
  user: User;
  feature: Feature;
  permission_type: 'grant' | 'deny';
  granted_by: User;
  granted_at: string;
  reason: string;
  is_active: boolean;
}

// Admin User Permission Management
export const AdminUserPermissions: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchFeatures();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.results || data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/permissions/features/available/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Flatten features by category
        const allFeatures: Feature[] = [];
        Object.values(data.features_by_category).forEach((categoryFeatures: any) => {
          allFeatures.push(...categoryFeatures);
        });
        setFeatures(allFeatures);
      }
    } catch (err) {
      console.error('Failed to fetch features:', err);
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/permissions/admin/user-permissions/${userId}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data);
      }
    } catch (err) {
      console.error('Failed to fetch user permissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const grantPermission = async (userId: string, featureCode: string, reason: string) => {
    try {
      const response = await fetch('/api/permissions/admin/grant-user-permission/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          user_id: userId,
          feature_code: featureCode,
          reason,
        }),
      });

      if (response.ok) {
        // Refresh user permissions
        fetchUserPermissions(userId);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to grant permission:', err);
      return false;
    }
  };

  const revokePermission = async (userId: string, featureCode: string, reason: string) => {
    try {
      const response = await fetch('/api/permissions/admin/revoke-user-permission/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          user_id: userId,
          feature_code: featureCode,
          reason,
        }),
      });

      if (response.ok) {
        // Refresh user permissions
        fetchUserPermissions(userId);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to revoke permission:', err);
      return false;
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    fetchUserPermissions(user.id);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-user-permissions">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="user-list">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Users</h3>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  {user.company && (
                    <div className="text-xs text-gray-500">{user.company.company_name}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Permissions */}
        <div className="user-permissions lg:col-span-2">
          {selectedUser ? (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Permissions for {selectedUser.first_name} {selectedUser.last_name}
                </h3>
                <span className="text-sm text-gray-600">{selectedUser.email}</span>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : userPermissions ? (
                <UserPermissionEditor
                  user={selectedUser}
                  permissions={userPermissions}
                  features={features}
                  onGrantPermission={grantPermission}
                  onRevokePermission={revokePermission}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Failed to load permissions
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center py-8 text-gray-500">
                Select a user to manage their permissions
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// User Permission Editor Component
interface UserPermissionEditorProps {
  user: User;
  permissions: any;
  features: Feature[];
  onGrantPermission: (userId: string, featureCode: string, reason: string) => Promise<boolean>;
  onRevokePermission: (userId: string, featureCode: string, reason: string) => Promise<boolean>;
}

const UserPermissionEditor: React.FC<UserPermissionEditorProps> = ({
  user,
  permissions,
  features,
  onGrantPermission,
  onRevokePermission,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group features by category
  const featuresByCategory = features.reduce((acc, feature) => {
    const category = feature.feature_category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  const categories = Object.keys(featuresByCategory);

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : featuresByCategory[selectedCategory] || [];

  const handleGrantPermission = async () => {
    if (!selectedFeature || !reason.trim()) return;

    setIsSubmitting(true);
    const success = await onGrantPermission(user.id, selectedFeature.feature_code, reason);
    setIsSubmitting(false);

    if (success) {
      setShowGrantModal(false);
      setSelectedFeature(null);
      setReason('');
    }
  };

  const handleRevokePermission = async () => {
    if (!selectedFeature || !reason.trim()) return;

    setIsSubmitting(true);
    const success = await onRevokePermission(user.id, selectedFeature.feature_code, reason);
    setIsSubmitting(false);

    if (success) {
      setShowRevokeModal(false);
      setSelectedFeature(null);
      setReason('');
    }
  };

  return (
    <div className="user-permission-editor">
      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex space-x-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedCategory === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-md text-sm capitalize ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-3">
        {filteredFeatures.map((feature) => {
          const hasAccess = permissions.permissions[feature.feature_code]?.has_access || false;
          const isOverridden = permissions.overrides?.some(
            (override: any) => override.feature.feature_code === feature.feature_code && override.is_active
          );

          return (
            <div
              key={feature.feature_code}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{feature.feature_name}</h4>
                    <span className={`px-2 py-1 text-xs rounded ${
                      hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {hasAccess ? 'Granted' : 'Denied'}
                    </span>
                    {isOverridden && (
                      <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                        Override
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    Category: {feature.feature_category} • Level: {feature.access_level} • Min Plan: {feature.minimum_plan}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {!hasAccess ? (
                    <button
                      onClick={() => {
                        setSelectedFeature(feature);
                        setShowGrantModal(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Grant
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedFeature(feature);
                        setShowRevokeModal(true);
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grant Permission Modal */}
      {showGrantModal && selectedFeature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Grant Permission: {selectedFeature.feature_name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for granting permission:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter reason..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleGrantPermission}
                disabled={!reason.trim() || isSubmitting}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Granting...' : 'Grant Permission'}
              </button>
              <button
                onClick={() => {
                  setShowGrantModal(false);
                  setSelectedFeature(null);
                  setReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Permission Modal */}
      {showRevokeModal && selectedFeature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Revoke Permission: {selectedFeature.feature_name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for revoking permission:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter reason..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRevokePermission}
                disabled={!reason.trim() || isSubmitting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Revoking...' : 'Revoke Permission'}
              </button>
              <button
                onClick={() => {
                  setShowRevokeModal(false);
                  setSelectedFeature(null);
                  setReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserPermissions;
