import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Globe, Mail, Phone } from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsSupplierService } from '../../api-services/oilgas';
import { toast } from 'sonner';

export default function LogisticsSupplierDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await logisticsSupplierService.getById(id);
        setSupplier(data);
      } catch (e) {
        toast.error('Failed to load supplier');
      }
    })();
  }, [id]);

  if (!supplier) return null;

  return (
    <div className="min-h-screen ">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(webRoutes.logisticsSuppliers)} className="p-2 rounded-lg hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{supplier.company_name || supplier.name}</h1>
                <p className="text-gray-600 mt-1">{supplier.coverage_type ? supplier.coverage_type.toUpperCase() : ''} Provider</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {supplier.website && (
                <button onClick={() => window.open(`https://${supplier.website}`, '_blank')} className="p-2 text-gray-600 hover:text-gray-900"><Globe className="w-5 h-5"/></button>
              )}
              {supplier.contact_email && (
                <button onClick={() => window.open(`mailto:${supplier.contact_email}`, '_blank')} className="p-2 text-gray-600 hover:text-gray-900"><Mail className="w-5 h-5"/></button>
              )}
              {supplier.contact_phone && (
                <button onClick={() => window.open(`tel:${supplier.contact_phone}`, '_blank')} className="p-2 text-gray-600 hover:text-gray-900"><Phone className="w-5 h-5"/></button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <Building2 className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Provider Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">License</div>
              <div className="font-medium">{supplier.license_number || '-'}</div>
            </div>
            <div>
              <div className="text-gray-600">Fleet Size</div>
              <div className="font-medium">{supplier.fleet_size ?? '-'}</div>
            </div>
            <div>
              <div className="text-gray-600">Service Types</div>
              <div className="font-medium">{Array.isArray(supplier.service_types) ? supplier.service_types.join(', ') : '-'}</div>
            </div>
            <div>
              <div className="text-gray-600">Regions</div>
              <div className="font-medium">{Array.isArray(supplier.service_regions) ? supplier.service_regions.join(', ') : '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
