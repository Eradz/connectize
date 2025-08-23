import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useAdminData } from './ComprehensiveAdmin';
import DataTable from '../../components/admin/DataTable';
import ResourceForm from '../../components/admin/ResourceForm';
import { confirmDialog } from '../../lib/confirm.jsx';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { ErrorIcon, AddIcon, CompanyIcon, EditIcon, DeleteIcon, ViewIcon } from "../../components/ui/ModernIcon";

// Companies Management using generic components (live API only)
const AdminCompaniesManagement = () => {
  const { hasPermission } = useAuth();
  const { makeApiRequest, addToast } = useAdminData();
  const location = useLocation();
  const navigate = useNavigate();

  const isAddRoute = location.pathname.endsWith('/companies/add') || location.pathname.endsWith('/admin/companies/add');

  // Reference data
  const [categoryOptions, setCategoryOptions] = useState([]); // organization_type
  const [sizeOptions, setSizeOptions] = useState([]); // company_size

  // Local edits
  const [editingCompany, setEditingCompany] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = () => setRefreshKey(Date.now());

  // Load select options
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [catRes, sizeRes] = await Promise.all([
          makeApiRequest('/company-categories/?page_size=100'),
          makeApiRequest('/company-sizes/?page_size=100'),
        ]);
        if (catRes.success) {
          const list = Array.isArray(catRes.data) ? catRes.data : (catRes.data.results || []);
          setCategoryOptions(list.map((c) => ({ value: c.name, label: c.name })));
        }
        if (sizeRes.success) {
          const list = Array.isArray(sizeRes.data) ? sizeRes.data : (sizeRes.data.results || []);
          setSizeOptions(list.map((s) => ({ value: s.size, label: s.size })));
        }
      } catch (e) {
        // silent fail
      }
    };
    if (hasPermission('companies.view')) loadRefs();
  }, [hasPermission, makeApiRequest]);

  // Columns
  const columns = useMemo(() => ([
    {
      header: 'Company', sortable: true, sortKey: 'company_name',
      render: (c) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">{c.company_name?.[0] || 'C'}</span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{c.company_name}</div>
            <div className="text-xs text-gray-500">{c.website || '—'}</div>
          </div>
        </div>
      )
    },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'organization_type', header: 'Type', sortable: true },
    { key: 'company_size', header: 'Size', sortable: true },
    {
      header: 'Location',
      render: (c) => ([c.city, c.country].filter(Boolean).join(', ') || '—')
    },
    {
      header: 'Verified', sortable: true, sortKey: 'verify', width: '120px',
      render: (c) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${c.verify ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {c.verify ? 'Verified' : 'Unverified'}
        </span>
      )
    },
    {
      header: 'Created', sortable: true, sortKey: 'date_created', width: '140px',
      render: (c) => c.date_created ? new Date(c.date_created).toLocaleDateString() : '—'
    },
  ]), []);

  // Server fetcher with debounced search and ordering
  const fetcher = useCallback(async ({ page, pageSize, ordering, search }) => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (pageSize) params.set('page_size', String(pageSize));
    if (ordering) params.set('ordering', ordering);
    if (search) params.set('search', search);
    const res = await makeApiRequest(`/companies/?${params.toString()}`);
    if (!res.success) throw new Error(res.error || 'Failed to load companies');
    const data = res.data;
    const items = Array.isArray(data) ? data : (data.results || []);
    // Normalize id to slug for deletion/selection consistency
    const normalized = items.map((it) => ({ ...it, id: it.slug || it.id }));
    const count = Number.isFinite(data?.count) ? data.count : normalized.length;
    return { items: normalized, count };
  }, [makeApiRequest]);

  const mapDrfErrors = (data) => {
    if (!data || typeof data !== 'object') return null;
    const out = {};
    Object.entries(data).forEach(([k, v]) => {
      if (Array.isArray(v)) out[k] = v.map(String);
      else if (typeof v === 'string') out[k] = [v];
    });
    return out;
  };

  // Create
  const handleCreate = async (values) => {
    if (!hasPermission('companies.add')) return { success: false, message: 'No permission' };
    const payload = { ...values, verify: !!values.verify };
    const res = await makeApiRequest('/companies/', { method: 'POST', body: JSON.stringify(payload) });
    if (res.success) {
      addToast('Company created successfully', 'success');
      bumpRefresh();
      navigate('/admin/companies');
      return { success: true };
    }
    const errs = mapDrfErrors(res.data) || { __all__: [res.error || 'Failed to create company'] };
    return { success: false, errors: errs };
  };

  // Edit
  const handleEditSubmit = async (values) => {
    if (!editingCompany) return { success: false, message: 'No record selected' };
    if (!hasPermission('companies.change')) return { success: false, message: 'No permission' };
    const payload = { ...values, verify: !!values.verify };
    const res = await makeApiRequest(`/companies/${editingCompany.slug || editingCompany.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    if (res.success) {
      addToast('Company updated successfully', 'success');
      setEditingCompany(null);
      bumpRefresh();
      return { success: true };
    }
    const errs = mapDrfErrors(res.data) || { __all__: [res.error || 'Failed to update company'] };
    return { success: false, errors: errs };
  };

  // Delete single
  const handleDelete = async (row) => {
    if (!hasPermission('companies.delete')) return;
    const ok = await confirmDialog({
      title: 'Delete Company',
      message: `Delete company ${row.company_name}? This cannot be undone.`,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    const res = await makeApiRequest(`/companies/${row.slug || row.id}/`, { method: 'DELETE' });
    if (res.success || res.status === 204) {
      addToast('Company deleted successfully', 'success');
      bumpRefresh();
    } else {
      addToast(res.error || 'Failed to delete company', 'error');
    }
  };

  // Bulk delete (ids are slugs due to normalization above)
  const handleBulkDelete = async (ids) => {
    if (!hasPermission('companies.delete')) return;
    if (!ids?.length) return;
    const ok = await confirmDialog({
      title: 'Bulk Delete',
      message: `Delete ${ids.length} selected compan${ids.length > 1 ? 'ies' : 'y'}? This cannot be undone.`,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    let success = 0;
    for (const slug of ids) {
      const r = await makeApiRequest(`/companies/${slug}/`, { method: 'DELETE' });
      if (r.success || r.status === 204) success += 1;
    }
    addToast(`Deleted ${success}/${ids.length} companies`, success === ids.length ? 'success' : 'warning');
    bumpRefresh();
  };

  if (!hasPermission('companies.view')) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ErrorIcon size={32} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view companies.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Modern Header */}
      <div className="glass rounded-2xl p-6 border border-white/20 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 gradient-primary rounded-xl shadow-medium">
              <CompanyIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                Companies Management
              </h1>
              <p className="text-gray-600 mt-1">Manage company registrations and verifications</p>
            </div>
          </div>
          {hasPermission('companies.add') && !isAddRoute && (
            <Button onClick={() => navigate('/admin/companies/add')} className="shadow-medium">
              <AddIcon size={16} />
              Add Company
            </Button>
          )}
        </div>
      </div>

      {/* Create Company */}
      {isAddRoute && hasPermission('companies.add') && (
        <ResourceForm
          title="Create Company"
          fields={[
            { name: 'company_name', label: 'Company Name', required: true },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'organization_type', label: 'Organization Type', type: 'select', required: true, options: categoryOptions },
            { name: 'company_size', label: 'Company Size', type: 'select', required: true, options: sizeOptions },
            { name: 'tag_line', label: 'Tagline' },
            { name: 'about', label: 'About', type: 'textarea' },
            { name: 'office_address', label: 'Office Address' },
            { name: 'country', label: 'Country' },
            { name: 'state', label: 'State' },
            { name: 'city', label: 'City' },
            { name: 'website', label: 'Website', type: 'text', placeholder: 'https://example.com' },
            { name: 'registration_number', label: 'Registration Number' },
            { name: 'annual_revenue', label: 'Annual Revenue' },
            { name: 'verify', label: 'Verified', type: 'checkbox' },
          ]}
          onSubmit={handleCreate}
          onCancel={() => navigate('/admin/companies')}
          submitLabel="Create Company"
        />
      )}

      {/* Edit Company */}
      {editingCompany && hasPermission('companies.change') && (
        <ResourceForm
          title={`Edit Company: ${editingCompany.company_name}`}
          initialValues={{
            company_name: editingCompany.company_name || '',
            email: editingCompany.email || '',
            organization_type: editingCompany.organization_type || '',
            company_size: editingCompany.company_size || '',
            about: editingCompany.about || '',
            tag_line: editingCompany.tag_line || '',
            office_address: editingCompany.office_address || '',
            country: editingCompany.country || '',
            state: editingCompany.state || '',
            city: editingCompany.city || '',
            website: editingCompany.website || '',
            verify: !!editingCompany.verify,
            registration_number: editingCompany.registration_number || '',
            annual_revenue: editingCompany.annual_revenue || '',
          }}
          fields={[
            { name: 'company_name', label: 'Company Name', required: true },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'organization_type', label: 'Organization Type', type: 'select', required: true, options: categoryOptions },
            { name: 'company_size', label: 'Company Size', type: 'select', required: true, options: sizeOptions },
            { name: 'tag_line', label: 'Tagline' },
            { name: 'about', label: 'About', type: 'textarea' },
            { name: 'office_address', label: 'Office Address' },
            { name: 'country', label: 'Country' },
            { name: 'state', label: 'State' },
            { name: 'city', label: 'City' },
            { name: 'website', label: 'Website', type: 'text', placeholder: 'https://example.com' },
            { name: 'registration_number', label: 'Registration Number' },
            { name: 'annual_revenue', label: 'Annual Revenue' },
            { name: 'verify', label: 'Verified', type: 'checkbox' },
          ]}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingCompany(null)}
          submitLabel="Save Changes"
        />
      )}

      {/* Companies Table */}
      <DataTable
        title="All Companies"
        columns={columns}
        fetcher={fetcher}
        initialOrdering="-date_created"
        selectable={hasPermission('companies.delete')}
  onRowClick={(row) => navigate(`/admin/companies/${row.slug || row.id}`)}
        renderRowActions={(row) => (
          <div className="flex gap-2">
            {hasPermission('companies.change') && (
              <Button
                variant="minimal"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setEditingCompany(row); }}
              >
                Edit
              </Button>
            )}
            {hasPermission('companies.delete') && (
              <Button
                variant="minimal"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
                className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20"
              >
                Delete
              </Button>
            )}
          </div>
        )}
        onBulkDelete={hasPermission('companies.delete') ? handleBulkDelete : undefined}
        refreshKey={refreshKey}
      />
    </div>
  );
};

export default AdminCompaniesManagement;