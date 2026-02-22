import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { logisticsAPI } from '../../api-services/logistics';
import EnhancedShipmentRequestFlow from '../../components/logistics/EnhancedShipmentRequestFlow';
import { toast } from 'sonner';
import { useAuth } from '../../context/userContext';
import { getSession } from '../../lib/session';

const LogisticsRequestEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const session = getSession();
  const userId = user?.id ?? session?.user?.id;
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load existing request data
  useEffect(() => {
    if (id) {
      loadRequestData();
    }
  }, [id]);

  const loadRequestData = async () => {
    try {
      setLoading(true);
      const response = await logisticsAPI.getRequest(id);
      if (response) {
        const request = response;
        // Ownership check
        const requestedBy = request.requested_by?.id || request.requested_by;
        if (userId && requestedBy && String(requestedBy) !== String(userId)) {
          toast.error('You do not have permission to edit this request.');
          navigate(webRoutes.logisticsRequests);
          return;
        }
        setRequestData(request);
      }
    } catch (error) {
      console.error('Failed to load request:', error);
      toast.error('Failed to load request details');
      navigate(webRoutes.logisticsRequests);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCreated = (updatedRequestData) => {
    console.log('Request updated:', updatedRequestData);
    toast.success('Request updated successfully');
  };

  const handleShipmentAssigned = (assignmentData) => {
    console.log('Shipment assigned:', assignmentData);
    // Navigate back to the request list or detail
    navigate(webRoutes.logisticsRequests);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(webRoutes.logisticsRequests)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit Shipment Request</h1>
                <p className="text-sm text-gray-600">Update shipment request details and compare providers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Request Flow - In Edit Mode */}
      <div className="py-8">
        <EnhancedShipmentRequestFlow
          isEditing={true}
          initialData={requestData}
          requestId={id}
          onRequestCreated={handleRequestCreated}
          onShipmentAssigned={handleShipmentAssigned}
        />
      </div>
    </div>
  );
};

export default LogisticsRequestEdit;
   