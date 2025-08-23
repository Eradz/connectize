import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminData } from '../ComprehensiveAdmin';

const AdminPostDetail = () => {
  const { id } = useParams();
  const { fetchData, loading, errors } = useAdminData();
  const [post, setPost] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetchData(`/posts/${id}/`, 'postDetail', { useCache: false });
      if (mounted && res.success) setPost(res.data);
    })();
    return () => { mounted = false; };
  }, [id, fetchData]);

  if (loading.postDetail && !post) return <div className="p-6">Loading post...</div>;
  if (errors.postDetail && !post) return <div className="p-6 text-red-600">Failed to load post.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Post Detail</h1>
        <Link to="/admin/content" className="text-blue-600 hover:text-blue-800">← Back to posts</Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-3">
        <div className="text-lg font-semibold">{post?.title || 'Untitled'}</div>
        <div className="text-sm text-gray-600">Status: {(post?.status || '').toString()}</div>
        <div className="text-sm text-gray-600">Created: {post?.date_created ? new Date(post.date_created).toLocaleString() : post?.created_at ? new Date(post.created_at).toLocaleString() : '—'}</div>
        <div className="text-sm text-gray-600 whitespace-pre-wrap">{post?.content || post?.body || 'No content available.'}</div>
      </div>
    </div>
  );
};

export default AdminPostDetail;
