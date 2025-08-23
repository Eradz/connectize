import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminData } from '../ComprehensiveAdmin';

const AdminProductDetail = () => {
  const { id } = useParams();
  const { fetchData, loading, errors } = useAdminData();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetchData(`/products/${id}/`, 'productDetail', { useCache: false });
      if (mounted && res.success) setProduct(res.data);
    })();
    return () => { mounted = false; };
  }, [id, fetchData]);

  if (loading.productDetail && !product) return <div className="p-6">Loading product...</div>;
  if (!product && errors.productDetail) return <div className="p-6 text-red-600">Failed to load product.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product Detail</h1>
        <Link to="/admin/products" className="text-blue-600 hover:text-blue-800">← Back to products</Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="text-xl font-semibold">{product?.title}</div>
        <div className="text-sm text-gray-600">Category: {product?.category || '—'}</div>
        <div className="text-sm text-gray-600">Featured: {product?.featured ? 'Yes' : 'No'}</div>
        <div className="text-sm text-gray-600">Created: {product?.date_created ? new Date(product.date_created).toLocaleString() : '—'}</div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">{product?.description || 'No description.'}</div>
        <div className="text-sm text-gray-600">Company: {product?.company ? (
          <Link to={`/admin/companies/${product.company.slug || product.company.id}`} className="text-blue-600 hover:text-blue-800">{product.company.company_name || product.company}</Link>
        ) : '—'}</div>
        {Array.isArray(product?.images) && product.images.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Images</div>
            <div className="flex flex-wrap gap-3">
              {product.images.map((img, i) => (
                <img key={i} src={img.image || img} alt="Product" className="w-24 h-24 object-cover rounded" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductDetail;
