import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from './components/DataTable';
import StatsCard from './components/StatsCard';
import Modal from './components/Modal';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { confirmDialog } from '../../lib/confirm.jsx';
import { useAdminData } from './ComprehensiveAdmin';

const AdminProductsManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, pageSize, search, sort, filterCategory, filterFeatured]);

  const fetchProducts = async () => {
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
      const res = await makeApiRequest(`/products/?${qs}`);
      const list = res?.data?.results || res?.data || [];
      setProducts(list);
      const count = Number.isFinite(res?.data?.count) ? res.data.count : list.length;
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await makeApiRequest('/product-categories/?page_size=200');
      const items = res?.data?.results || res?.data || [];
      const opts = [{ value: '', label: 'All Categories' }, ...items.map(c => ({ value: c.name || c.slug || c.id, label: c.name || c.slug || String(c.id) }))];
      setCategoryOptions(opts);
    } catch (e) {
      // keep default option
    }
  };

  // Calculate statistics
  const totalProducts = products.length;
  const featuredProducts = products.filter(p => p.featured).length;

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
      render: (product) => (
        <div className="flex items-center space-x-3">
          {/* Show first image if available */}
          {Array.isArray(product.images) && product.images[0]?.image && (
            <img
              src={product.images[0].image}
              alt={product.title}
              className="w-10 h-10 rounded-lg object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{product.title}</div>
            <div className="text-sm text-gray-500">{product.category}</div>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true,
      render: (product) => (
        <div>
          <div className="font-medium text-gray-900">
            {product.company || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">{product.sub_title || ''}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Featured',
      render: (product) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          product.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {product.featured ? 'Featured' : 'Regular'}
        </span>
      )
    },
    {
      key: 'date_created',
      label: 'Created',
      sortable: true,
      render: (product) => (
        <div className="text-sm text-gray-900">
          {new Date(product.date_created).toLocaleDateString()}
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
      // Escape quotes
      return '"' + s.replace(/"/g, '""') + '"';
    }).join(','));
    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const productFields = [
    { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter product title' },
    { name: 'sub_title', label: 'Subtitle', type: 'text', placeholder: 'Enter subtitle (optional)' },
    {
      name: 'category',
      label: 'Category (slug/name)',
      type: 'text',
      required: true,
      placeholder: 'e.g., Equipment'
    },
    {
      name: 'company',
      label: 'Company (company_name)',
      type: 'text',
      required: true,
      placeholder: 'Exact company_name as in backend'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter product description'
    },
    {
      name: 'featured',
      label: 'Featured',
      type: 'checkbox'
    },
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
    setSelectedProduct(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (product) => {
    const ok = await confirmDialog({ title: 'Delete Product', message: `Are you sure you want to delete "${product.title}"?`, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await makeApiRequest(`/products/${product.id}/`, { method: 'DELETE' });
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    const productNames = selectedItems.map(id => {
      const product = products.find(p => p.id === id);
      return product?.title || `Product ${id}`;
    });

    const ok = await confirmDialog({ title: 'Delete Selected Products', message: `Are you sure you want to delete ${selectedItems.length} products?\n\n${productNames.join('\n')}`, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await makeApiRequest('/products/bulk-delete/', { method: 'POST', body: JSON.stringify({ ids: selectedItems }) });
      setSelectedItems([]);
      await fetchProducts();
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      alert('Failed to delete products');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const payload = makePayload(formData);
      if (modalMode === 'create') {
        const res = await makeApiRequest('/products/', { method: 'POST', body: JSON.stringify(payload) });
        if (!res?.success) throw new Error(res?.error || 'Create failed');
        addToast('Product created', 'success');
      } else {
        const res = await makeApiRequest(`/products/${selectedProduct.id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
        if (!res?.success) throw new Error(res?.error || 'Update failed');
        addToast('Product updated', 'success');
      }
      setShowModal(false);
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  };

  const getActions = (product) => [
    {
      label: 'View Details',
      onClick: () => handleEdit(product),
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Edit',
      onClick: () => handleEdit(product),
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Delete',
      onClick: () => handleDelete(product),
      className: 'text-red-600 hover:text-red-900'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Products Management"
        subtitle="Manage all products and listings on the platform"
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
            <Button onClick={handleCreate}>Add New Product</Button>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Products"
          value={totalProducts}
          icon="📦"
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Featured Products"
          value={featuredProducts}
          subtitle={`${totalProducts > 0 ? Math.round((featuredProducts / totalProducts) * 100) : 0}% featured`}
          icon="⭐"
          color="yellow"
          loading={loading}
        />
      </div>

      {/* Products Table */}
      <DataTable
        data={products}
        columns={columns}
        loading={loading}
  onExport={exportCSV}
  serverSide
  currentPage={page}
  totalCount={totalCount}
  onPageChange={setPage}
  onSearchChange={setSearch}
  onSortChange={setSort}
  onRowClick={(row) => navigate(`/admin/products/${row.id}`)}
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
            confirmMessage: 'Are you sure you want to delete the selected products?'
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
      { key: 'featured', label: 'Featured', type: 'select', options: [
        { value: '', label: 'All' }, { value: 'true', label: 'Featured Only' }, { value: 'false', label: 'Regular Only' }
      ]}
        ]}
      />

      {/* Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Add New Product' : 'Edit Product'}
        size="lg"
      >
      <Modal.Form
          fields={productFields}
          data={selectedProduct || {}}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          submitLabel={modalMode === 'create' ? 'Create Product' : 'Update Product'}
        />
      </Modal>
    </div>
  );
};

export default AdminProductsManagement;
