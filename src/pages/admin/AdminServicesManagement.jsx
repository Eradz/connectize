import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/admin/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { Textarea } from '../../components/ui/Input';
import Checkbox from '../../components/ui/Checkbox';
import { ServiceIcon, CheckIcon, StarIcon, EditIcon, DeleteIcon, ViewIcon } from "../../components/ui/ModernIcon";
import { confirmDialog } from '../../lib/confirm.jsx';
import { useAdminData } from './ComprehensiveAdmin';

const AdminServicesManagement = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({
    title: '',
    sub_title: '',
    category: '',
    company: '',
    description: '',
    featured: false,
  });
  const { makeApiRequest, addToast } = useAdminData();
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchServices = async (params) => {
    try {
      const qs = new URLSearchParams({
        page: String(params.page),
        page_size: String(params.pageSize),
        ...(params.search ? { search: params.search } : {}),
        ...(params.ordering ? { ordering: params.ordering } : {}),
      }).toString();
      const res = await makeApiRequest(`/services/?${qs}`);
      const list = res?.data?.results || res?.data || [];
      const count = Number.isFinite(res?.data?.count) ? res.data.count : list.length;
      return { items: list, count: count };
    } catch (error) {
      console.error('Error fetching services:', error);
      return { items: [], count: 0 };
    }
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setFormData({
      title: service.title || '',
      sub_title: service.sub_title || '',
      category: service.category || '',
      company: service.company || '',
      description: service.description || '',
      featured: Boolean(service.featured),
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (service) => {
    setSelectedService(service);
    setFormData({
      title: service.title || '',
      sub_title: service.sub_title || '',
      category: service.category || '',
      company: service.company || '',
      description: service.description || '',
      featured: Boolean(service.featured),
    });
    setModalMode('view');
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedService(null);
    setFormData({
      title: '',
      sub_title: '',
      category: '',
      company: '',
      description: '',
      featured: false,
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = async (service) => {
    const confirmed = await confirmDialog({
      title: 'Delete Service',
      message: `Are you sure you want to delete "${service.title}"?`,
      confirmText: 'Delete',
      confirmVariant: 'danger'
    });

    if (confirmed) {
      try {
        await makeApiRequest(`/services/${service.id}/`, { method: 'DELETE' });
        addToast('Service deleted successfully', 'success');
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting service:', error);
        addToast('Failed to delete service', 'error');
      }
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: formData.title,
        sub_title: formData.sub_title || '',
        category: formData.category,
        description: formData.description || '',
        company: formData.company,
        featured: formData.featured,
      };

      if (modalMode === 'create') {
        await makeApiRequest('/services/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        addToast('Service created successfully', 'success');
      } else if (modalMode === 'edit') {
        await makeApiRequest(`/services/${selectedService.id}/`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        addToast('Service updated successfully', 'success');
      }

      setShowModal(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving service:', error);
      addToast(`Failed to ${modalMode === 'create' ? 'create' : 'update'} service`, 'error');
    }
  };

  const handleBulkDelete = async (selectedIds) => {
    const confirmed = await confirmDialog({
      title: 'Delete Services',
      message: `Are you sure you want to delete ${selectedIds.length} service(s)?`,
      confirmText: 'Delete',
      confirmVariant: 'danger'
    });

    if (confirmed) {
      try {
        await Promise.all(selectedIds.map(id => 
          makeApiRequest(`/services/${id}/`, { method: 'DELETE' })
        ));
        addToast(`${selectedIds.length} service(s) deleted successfully`, 'success');
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting services:', error);
        addToast('Failed to delete some services', 'error');
      }
    }
  };

  const renderRowActions = (service) => (
    <div className="flex items-center gap-2">
      <Button
        variant="minimal"
        size="sm"
        onClick={() => handleView(service)}
        className="text-blue-600 hover:text-blue-700"
      >
        <ViewIcon size={16} />
      </Button>
      <Button
        variant="minimal"
        size="sm"
        onClick={() => handleEdit(service)}
        className="text-green-600 hover:text-green-700"
      >
        <EditIcon size={16} />
      </Button>
      <Button
        variant="minimal"
        size="sm"
        onClick={() => handleDelete(service)}
        className="text-red-600 hover:text-red-700"
      >
        <DeleteIcon size={16} />
      </Button>
    </div>
  );

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

  return (
    <div className="space-y-6 animate-in">
      {/* Modern Header */}
      <div className="glass rounded-2xl p-6 border border-white/20 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 gradient-primary rounded-xl shadow-medium">
              <ServiceIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                Services Management
              </h1>
              <p className="text-gray-600 mt-1">Manage all services and offerings on the platform</p>
            </div>
          </div>
          <Button onClick={handleCreate} className="shadow-medium">
            <ServiceIcon size={16} />
            Add New Service
          </Button>
        </div>
      </div>

      {/* Modern Services Table */}
      <div className="glass rounded-2xl border border-white/20 shadow-soft overflow-hidden">
        <DataTable
          columns={columns}
          fetcher={fetchServices}
          initialOrdering="-date_created"
          canSearch={true}
          selectable={true}
          renderRowActions={renderRowActions}
          onBulkDelete={handleBulkDelete}
          refreshKey={refreshKey}
          onRowClick={(service) => handleView(service)}
        />
      </div>

      {/* Modern Service Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalMode === 'create' ? 'Add New Service' :
            modalMode === 'edit' ? 'Edit Service' : 'Service Details'
          }
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter service title"
              required
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Subtitle"
              value={formData.sub_title}
              onChange={(e) => setFormData(prev => ({ ...prev, sub_title: e.target.value }))}
              placeholder="Enter subtitle (optional)"
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Consulting"
              required
              disabled={modalMode === 'view'}
            />
            
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Company name"
              required
              disabled={modalMode === 'view'}
            />
            
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter service description"
              rows={4}
              disabled={modalMode === 'view'}
            />
            
            <Checkbox
              label="Featured Service"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              disabled={modalMode === 'view'}
            />
          </div>
          
          {modalMode !== 'view' && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.title || !formData.category || !formData.company}
              >
                {modalMode === 'create' ? 'Create Service' : 'Update Service'}
              </Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default AdminServicesManagement;
