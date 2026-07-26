import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminData } from '../ComprehensiveAdmin';
import { getUserDisplayName } from '../../../lib/userDisplay';

const AdminUserDetail = () => {
  const { id } = useParams();
  const { fetchData, loading, errors } = useAdminData();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetchData(`/users/${id}/`, 'userDetail', { useCache: false });
      if (mounted && res.success) setUser(res.data);
    })();
    return () => { mounted = false; };
  }, [id, fetchData]);

  if (loading.userDetail && !user) return <div className="p-6">Loading user...</div>;
  if (errors.userDetail && !user) return <div className="p-6 text-red-600">Failed to load user.</div>;

  const displayName = getUserDisplayName(user);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Detail</h1>
        <Link to="/admin/users" className="text-blue-600 hover:text-blue-800">← Back to users</Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="flex items-center space-x-4">
          {user?.avatar && (
            <img src={user.avatar} alt={displayName} className="w-16 h-16 rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          )}
          <div>
            <div className="text-xl font-semibold">{displayName}</div>
            <div className="text-sm text-gray-600">{[user?.city, user?.country].filter(Boolean).join(', ') || '—'}</div>
          </div>
          <div className="ml-auto">
            <span className={`px-2 py-1 rounded-full text-xs ${user?.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{user?.verified ? 'Verified' : 'Unverified'}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>Email: <span className="text-gray-900">{user?.email || '—'}</span></div>
          <div>Phone: <span className="text-gray-900">{user?.phone_number || '—'}</span></div>
          <div>Gender: <span className="text-gray-900">{user?.gender || '—'}</span></div>
          <div>Address: <span className="text-gray-900">{user?.address || '—'}</span></div>
          <div>Followers: <span className="text-gray-900">{user?.followers_count ?? 0}</span></div>
          <div>Following: <span className="text-gray-900">{user?.following_count ?? 0}</span></div>
        </div>
      </div>

      {/* Companies owned */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Companies</h2>
          <Link to="/admin/companies" className="text-sm text-blue-600 hover:text-blue-800">Manage</Link>
        </div>
        <div className="space-y-2">
          {(user?.companies || []).map((cid) => (
            <Link key={cid} to={`/admin/companies/${cid}`} className="block text-sm text-blue-600 hover:text-blue-800">Company #{cid}</Link>
          ))}
          {(user?.companies || []).length === 0 && <div className="text-sm text-gray-500">No companies</div>}
        </div>
      </div>

      {/* Followers and Following */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Followers</h2>
          <div className="text-sm text-gray-500">User IDs: {(user?.followers || []).length ? user.followers.join(', ') : 'None'}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Following</h2>
          <div className="text-sm text-gray-500">User IDs: {(user?.followings || []).length ? user.followings.join(', ') : 'None'}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
