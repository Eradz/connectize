import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminData } from '../ComprehensiveAdmin';

const AdminCompanyDetail = () => {
  const { id } = useParams();
  const { fetchData, loading, errors } = useAdminData();
  const [company, setCompany] = useState(null);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Try slug first (primary lookup), then fallback to numeric id
      const first = await fetchData(`/companies/${id}/`, 'companyDetail', { useCache: false });
      if (mounted && first.success) {
        setCompany(first.data);
        setErrorText('');
        return;
      }
      // If id is numeric but slug lookup failed, try query by id -> first result
      if (/^\d+$/.test(id)) {
        const list = await fetchData(`/companies/`, 'companyDetailList', {
          useCache: false,
          params: { id }
        });
        const items = Array.isArray(list.data) ? list.data : (list.data?.results || []);
        if (mounted && items.length) {
          setCompany(items[0]);
          setErrorText('');
          return;
        }
      }
      if (mounted && (first.error || errors.companyDetail)) {
        setErrorText(first.error || errors.companyDetail || 'Failed to load company');
      }
    })();
    return () => { mounted = false; };
  }, [id, fetchData]);

  if ((loading.companyDetail || loading.companyDetailList) && !company) return <div className="p-6">Loading company...</div>;
  if (!company && (errors.companyDetail || errorText)) return <div className="p-6 text-red-600">{errorText || 'Failed to load company.'}</div>;

  const name = company?.company_name || company?.name || 'Company';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Company Detail</h1>
        <Link to="/admin/companies" className="text-blue-600 hover:text-blue-800">← Back to companies</Link>
      </div>
      {/* Overview */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="flex items-center space-x-4">
          {company?.logo && (
            <img src={company.logo} alt={name} className="w-16 h-16 rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          )}
          <div>
            <div className="text-xl font-semibold">{name}</div>
            <div className="text-sm text-gray-600">{[company?.city, company?.country].filter(Boolean).join(', ') || '—'}</div>
          </div>
          <div className="ml-auto">
            <span className={`px-2 py-1 rounded-full text-xs ${company?.verify ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{company?.verify ? 'Verified' : 'Unverified'}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>Email: <span className="text-gray-900">{company?.email || '—'}</span></div>
          <div>Website: {company?.website ? <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600">{company.website}</a> : '—'}</div>
          <div>Type: <span className="text-gray-900">{company?.organization_type || '—'}</span></div>
          <div>Size: <span className="text-gray-900">{company?.company_size || '—'}</span></div>
          <div>Address: <span className="text-gray-900">{company?.office_address || '—'}</span></div>
          <div>Registration No.: <span className="text-gray-900">{company?.registration_number || '—'}</span></div>
          <div>Annual Revenue: <span className="text-gray-900">{company?.annual_revenue || '—'}</span></div>
        </div>
        {company?.about && (
          <div className="text-sm text-gray-700"><span className="font-medium text-gray-900">About:</span> {company.about}</div>
        )}
        <div className="flex items-center space-x-6 text-sm">
          <div><span className="font-semibold">Followers:</span> {company?.followers_count ?? 0}</div>
          <div><span className="font-semibold">Following:</span> {company?.following_count ?? 0}</div>
        </div>
        {company?.user && (
          <div className="pt-2">
            <div className="text-sm text-gray-600">Owner:</div>
            <Link to={`/admin/users/${company.user.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <span className="mr-2">👤</span>
              <span>{company.user.full_name || company.user.email}</span>
            </Link>
          </div>
        )}
      </div>

      {/* Followers/Following */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Followers</h2>
          <div className="space-y-2">
            {(company?.followers || []).map((f) => (
              <div key={`f-${f.id}`} className="flex items-center justify-between text-sm">
                <div className="truncate">
                  {f.user_follower ? (
                    <Link to={`/admin/users/${f.user_follower.id}`} className="text-blue-600 hover:text-blue-800">
                      {f.user_follower.full_name || f.user_follower.email}
                    </Link>
                  ) : f.company_follower ? (
                    <Link to={`/admin/companies/${f.company_follower.slug || f.company_follower.id}`} className="text-blue-600 hover:text-blue-800">
                      {f.company_follower.company_name}
                    </Link>
                  ) : (
                    <span className="text-gray-500">Unknown</span>
                  )}
                </div>
              </div>
            ))}
            {(company?.followers || []).length === 0 && <div className="text-sm text-gray-500">No followers</div>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Following</h2>
          <div className="space-y-2">
            {(company?.following || []).map((f) => (
              <div key={`g-${f.id}`} className="flex items-center justify-between text-sm">
                <div className="truncate">
                  {f.user_following ? (
                    <Link to={`/admin/users/${f.user_following.id}`} className="text-blue-600 hover:text-blue-800">
                      {f.user_following.full_name || f.user_following.email}
                    </Link>
                  ) : f.company_following ? (
                    <Link to={`/admin/companies/${f.company_following.slug || f.company_following.id}`} className="text-blue-600 hover:text-blue-800">
                      {f.company_following.company_name}
                    </Link>
                  ) : (
                    <span className="text-gray-500">Unknown</span>
                  )}
                </div>
              </div>
            ))}
            {(company?.following || []).length === 0 && <div className="text-sm text-gray-500">Not following anyone</div>}
          </div>
        </div>
      </div>

      {/* Products and Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Products</h2>
            <Link to="/admin/products" className="text-sm text-blue-600 hover:text-blue-800">Manage</Link>
          </div>
          <div className="space-y-2">
            {(company?.products || []).map((p) => (
              <Link key={p.id} to={`/admin/products/${p.id}`} className="block text-sm text-blue-600 hover:text-blue-800 truncate">
                {p.title}
              </Link>
            ))}
            {(company?.products || []).length === 0 && <div className="text-sm text-gray-500">No products</div>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Services</h2>
            <Link to="/admin/services" className="text-sm text-blue-600 hover:text-blue-800">Manage</Link>
          </div>
          <div className="space-y-2">
            {(company?.services || []).map((s) => (
              <Link key={s.id} to={`/admin/services/${s.id}`} className="block text-sm text-blue-600 hover:text-blue-800 truncate">
                {s.title}
              </Link>
            ))}
            {(company?.services || []).length === 0 && <div className="text-sm text-gray-500">No services</div>}
          </div>
        </div>
      </div>

      {/* Documents and Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <div className="space-y-2">
            {(company?.documents || []).map((d) => (
              <div key={d.id} className="text-sm flex items-center justify-between">
                <div className="truncate">{d.type}: <span className="text-gray-900 truncate">{(d.document || '').toString().split('/').slice(-1)[0]}</span></div>
                <a href={d.document} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 ml-3 whitespace-nowrap">Open</a>
              </div>
            ))}
            {(company?.documents || []).length === 0 && <div className="text-sm text-gray-500">No documents</div>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Reviews</h2>
          <div className="space-y-3">
            {(company?.reviews || []).map((r) => (
              <div key={r.id} className="text-sm">
                <div className="text-gray-700 whitespace-pre-wrap">{r.content}</div>
                <div className="text-xs text-gray-500 mt-1">
                  By {r.user ? <Link to={`/admin/users/${r.user.id}`} className="text-blue-600 hover:text-blue-800">{r.user.first_name} {r.user.last_name}</Link> : 'Anonymous'} • {r.reviewed_at ? new Date(r.reviewed_at).toLocaleString() : ''}
                </div>
              </div>
            ))}
            {(company?.reviews || []).length === 0 && <div className="text-sm text-gray-500">No reviews</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCompanyDetail;
