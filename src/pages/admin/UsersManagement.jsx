import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  getAllUsersAdmin, 
  updateUserStatus, 
  suspendUser, 
  reactivateUser, 
  deleteUser,
  bulkUpdateUsers,
  exportUsers,
  sendUserNotification 
} from "../../api-services/adminUsers";
import { confirmDialog } from '../../lib/confirm.jsx';
import Button from "../../components/ui/Button";
import Input, { Select } from "../../components/ui/Input";

const UsersManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [userTypeFilter, setUserTypeFilter] = useState(
    searchParams.get("userType") || "all"
  );
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-users", searchTerm, statusFilter, userTypeFilter],
    queryFn: () => getAllUsersAdmin({
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      user_type: userTypeFilter !== "all" ? userTypeFilter : undefined,
    }),
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: ({ userId, reason }) => suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ userIds, action, data }) => bulkUpdateUsers(userIds, action, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setSelectedUsers([]);
      setShowBulkActions(false);
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (userTypeFilter !== "all") params.set("userType", userTypeFilter);
    setSearchParams(params);
  };

  const handleFilterChange = (filterType, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete(filterType);
    } else {
      params.set(filterType, value);
    }
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage and monitor all platform users</p>
        </div>
  <Button className="inline-flex items-center">
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users by name, email, or company..."
                  className="w-full pl-10 pr-8"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  handleFilterChange("status", e.target.value);
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </Select>
              <Select
                value={userTypeFilter}
                onChange={(e) => {
                  setUserTypeFilter(e.target.value);
                  handleFilterChange("userType", e.target.value);
                }}
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </Select>
              <Button type="submit" variant="secondary" className="flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700">
              {selectedUsers.length} user(s) selected
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => bulkActionMutation.mutate({ userIds: selectedUsers, action: 'activate' })}>Activate</Button>
              <Button size="sm" variant="danger" onClick={() => bulkActionMutation.mutate({ userIds: selectedUsers, action: 'deactivate' })}>Deactivate</Button>
              <Button size="sm" variant="secondary" onClick={() => setSelectedUsers([])}>Clear</Button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={users?.length > 0 && selectedUsers.length === users.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(user => user.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="h-4 w-4 text-gold focus:ring-primary-500/30 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="space-y-1">
                          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : users?.length ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="h-4 w-4 text-gold focus:ring-primary-500/30 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.profile_picture || "/default-avatar.png"}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.company_name || user.phone_number || "No company"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                        {user.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                        {user.is_verified && (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" title="Verified" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-1">
                        <button 
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                          title="Edit User"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                          title="Send Message"
                          onClick={() => {
                            // Add send notification logic here
                            console.log('Send notification to user:', user.id);
                          }}
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                        </button>
                        {user.is_active ? (
                          <button 
                            className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded"
                            title="Suspend User"
                            onClick={() => suspendUserMutation.mutate({ userId: user.id, reason: 'Admin action' })}
                            disabled={suspendUserMutation.isLoading}
                          >
                            <ExclamationTriangleIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <button 
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title="Reactivate User"
                            onClick={() => updateStatusMutation.mutate({ userId: user.id, status: 'active' })}
                            disabled={updateStatusMutation.isLoading}
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Delete User"
                          onClick={async () => {
                            const ok = await confirmDialog({
                              title: 'Delete User',
                              message: `Are you sure you want to delete ${user.first_name} ${user.last_name}?`,
                              confirmLabel: 'Delete'
                            });
                            if (ok) {
                              deleteUserMutation.mutate(user.id);
                            }
                          }}
                          disabled={deleteUserMutation.isLoading}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      {error ? "Error loading users" : "No users found"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow-sm border">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">10</span> of{" "}
          <span className="font-medium">{users?.length || 0}</span> results
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm">Previous</Button>
          <Button variant="secondary" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
