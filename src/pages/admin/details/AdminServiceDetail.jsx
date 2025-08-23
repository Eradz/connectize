import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminData } from '../ComprehensiveAdmin';

const AdminServiceDetail = () => {
  const { id } = useParams();
  const { fetchData, loading, errors } = useAdminData();
  const [service, setService] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetchData(`/services/${id}/`, 'serviceDetail', { useCache: false });
      if (mounted && res.success) setService(res.data);
    })();
    return () => { mounted = false; };
  }, [id, fetchData]);

  if (loading.serviceDetail && !service) return <div className="p-6">Loading service...</div>;
  if (!service && errors.serviceDetail) return <div className="p-6 text-red-600">Failed to load service.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Service Detail</h1>
        <Link to="/admin/services" className="text-blue-600 hover:text-blue-800">← Back to services</Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="text-xl font-semibold">{service?.title}</div>
        <div className="text-sm text-gray-600">Category: {service?.category || '—'}</div>
        <div className="text-sm text-gray-600">Featured: {service?.featured ? 'Yes' : 'No'}</div>
        <div className="text-sm text-gray-600">Created: {service?.date_created ? new Date(service.date_created).toLocaleString() : '—'}</div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">{service?.description || 'No description.'}</div>
        <div className="text-sm text-gray-600">Company: {service?.company ? (
          <Link to={`/admin/companies/${service.company.slug || service.company.id}`} className="text-blue-600 hover:text-blue-800">{service.company.company_name || service.company}</Link>
        ) : '—'}</div>
        {Array.isArray(service?.images) && service.images.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Images</div>
            <div className="flex flex-wrap gap-3">
              {service.images.map((img, i) => (
                <img key={i} src={img.image || img} alt="Service" className="w-24 h-24 object-cover rounded" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServiceDetail;
