import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from './components/DataTable';
import StatsCard from './components/StatsCard';
import { WrenchScrewdriverIcon, StarIcon } from '@heroicons/react/24/outline';
import Modal from './components/Modal';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { confirmDialog } from '../../lib/confirm.jsx';
import { useAdminData } from './ComprehensiveAdmin';

const AdminServicesManagement = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [selectedItems, setSelectedItems] = useState([]);
  const { makeApiRequest, addToast } = useAdminData();
  const [categoryOptions, setCategoryOptions] = useState([{ value: '', label: 'All Categories' }]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'date_created', direction: 'desc' });
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [page, pageSize, search, sort, filterCategory, filterFeatured]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const ordering = sort.key ? `${sort.direction === 'desc' ? '-' : ''}${sort.key}` : undefined;
      const qs = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        ...(search ? { search } : {}),
        ...(ordering ? { ordering } : {}),
        ...(filterCategory ? { category: filterCategory } : {}),
        ...(filterFeatured ? { featured: filterFeatured } : {}),
      }).toString();
      const res = await makeApiRequest(`/services/?${qs}`);
      const list = res?.data?.results || res?.data || [];
      setServices(list);
      const count = Number.isFinite(res?.data?.count) ? res.data.count : list.length;
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await makeApiRequest('/service-categories/?page_size=200');
      const items = res?.data?.results || res?.data || [];
      const opts = [{ value: '', label: 'All Categories' }, ...items.map(c => ({ value: c.name || c.slug || c.id, label: c.name || c.slug || String(c.id) }))];
      setCategoryOptions(opts);
    } catch (e) {
      // keep default option
    }
  };

  // Calculate statistics
  const totalServices = services.length;
  const featuredServices = services.filter(service => service.featured).length;

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (service) => (
        <div className="flex items-center space-x-3">
          {/* Show first image if available */}
          {Array.isArray(service.images) && service.images[0]?.image && (
            <img
              src={service.images[0].image}
              alt={service.title}
              className="w-10 h-10 rounded-lg object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{service.title}</div>
            <div className="text-sm text-gray-500">{service.category}</div>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true,
      render: (service) => (
        <div>
          <div className="font-medium text-gray-900">
            {service.company || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">{service.sub_title || ''}</div>
        </div>
      )
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (service) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          service.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {service.featured ? 'Featured' : 'Regular'}
        </span>
      )
    },
    {
      key: 'date_created',
      label: 'Created',
      sortable: true,
      render: (service) => (
        <div className="text-sm text-gray-900">
          {new Date(service.date_created).toLocaleDateString()}
        </div>
      )
    }
  ];

  const exportCSV = (rows) => {
    const headers = columns.map(c => c.label);
    const keys = columns.map(c => c.key);
    const csvRows = rows.map(r => keys.map(k => {
      const v = r[k];
      if (v == null) return '';
      const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return '"' + s.replace(/"/g, '""') + '"';
    }).join(','));
    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'services.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const serviceFields = [
    { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter service title' },
    { name: 'sub_title', label: 'Subtitle', type: 'text', placeholder: 'Enter subtitle (optional)' },
    { name: 'category', label: 'Category (slug/name)', type: 'text', required: true, placeholder: 'e.g., Consulting' },
    { name: 'company', label: 'Company (company_name)', type: 'text', required: true, placeholder: 'Exact company_name as in backend' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter service description' },
    { name: 'featured', label: 'Featured', type: 'checkbox' },
  ];

  const makePayload = (formData) => ({
    title: formData.title,
    sub_title: formData.sub_title || '',
    category: formData.category,
    description: formData.description || '',
    featured: !!formData.featured,
    company: formData.company,
  });

  const handleCreate = () => {
    setSelectedService(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (service) => {
    const name = service.title;
    const ok = await confirmDialog({ title: 'Delete Service', message: `Are you sure you want to delete "${name}"?`, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await makeApiRequest(`/services/${service.id}/`, { method: 'DELETE' });
      await fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    const serviceNames = selectedItems.map(id => {
      const service = services.find(s => s.id === id);
      return service?.title || `Service ${id}`;
    });

    const ok = await confirmDialog({ title: 'Delete Selected Services', message: `Are you sure you want to delete ${selectedItems.length} services?\n\n${serviceNames.join('\n')}`, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await makeApiRequest('/services/bulk-delete/', { method: 'POST', body: JSON.stringify({ ids: selectedItems }) });
      setSelectedItems([]);
      await fetchServices();
    } catch (error) {
      console.error('Error bulk deleting services:', error);
      alert('Failed to delete services');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const payload = makePayload(formData);
      if (modalMode === 'create') {
        const res = await makeApiRequest('/services/', { method: 'POST', body: JSON.stringify(payload) });
        if (!res?.success) throw new Error(res?.error || 'Create failed');
        addToast('Service created', 'success');
      } else {
        const res = await makeApiRequest(`/services/${selectedService.id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
        if (!res?.success) throw new Error(res?.error || 'Update failed');
        addToast('Service updated', 'success');
      }
      setShowModal(false);
      await fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      throw error;
    }
  };

  const getActions = (service) => [
    {
      label: 'View Details',
      onClick: () => handleEdit(service),
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Edit',
      onClick: () => handleEdit(service),
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Delete',
      onClick: () => handleDelete(service),
      className: 'text-red-600 hover:text-red-900'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Services Management"
        subtitle="Manage all services and offerings on the platform"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="w-auto"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value ?? opt.label} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
            <Select
              value={filterFeatured}
              onChange={(e) => { setFilterFeatured(e.target.value); setPage(1); }}
              className="w-auto"
            >
              <option value="">All</option>
              <option value="true">Featured</option>
              <option value="false">Regular</option>
            </Select>
            {(filterCategory || filterFeatured) && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => { setFilterCategory(''); setFilterFeatured(''); setPage(1); }}
              >
                Clear Filters
              </Button>
            )}
            <Button onClick={handleCreate}>Add New Service</Button>
          </div>
        }
      />

      {/* Statistics Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Services"
          value={totalServices}
          icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Featured Services"
          value={featuredServices}
          subtitle={`${totalServices > 0 ? Math.round((featuredServices / totalServices) * 100) : 0}% featured`}
          icon={<StarIcon className="w-6 h-6" />}
          color="yellow"
          loading={loading}
        />
      </div>

      {/* Services Table */}
      <DataTable
        data={services}
        columns={columns}
        loading={loading}
  onExport={exportCSV}
  serverSide
  currentPage={page}
  totalCount={totalCount}
  onPageChange={setPage}
  onSearchChange={setSearch}
  onSortChange={setSort}
  onRowClick={(row) => navigate(`/admin/services/${row.id}`)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getActions={getActions}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        bulkActions={[
          {
            label: 'Delete Selected',
            onClick: handleBulkDelete,
            className: 'text-red-600 hover:text-red-900',
            confirmMessage: 'Are you sure you want to delete the selected services?'
          }
        ]}
        searchFields={['title', 'sub_title', 'description', 'category', 'company']}
    filterFields={[
          {
            key: 'category',
            label: 'Category',
            type: 'select',
      options: categoryOptions
          },
          {
            key: 'featured',
            label: 'Featured',
            type: 'select',
            options: [
              { value: '', label: 'All Services' },
              { value: 'true', label: 'Featured Only' },
              { value: 'false', label: 'Regular Only' }
            ]
          }
        ]}
      />

      {/* Service Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Add New Service' : 'Edit Service'}
        size="lg"
      >
        <Modal.Form
          fields={serviceFields}
          data={selectedService || {}}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          submitLabel={modalMode === 'create' ? 'Create Service' : 'Update Service'}
        />
      </Modal>
    </div>
  );
};

export default AdminServicesManagement;
