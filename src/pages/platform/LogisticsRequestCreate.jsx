import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import EnhancedShipmentRequestFlow from '../../components/logistics/EnhancedShipmentRequestFlow';
import BackArrowButton from '../../components/BackArrowButton';

const LogisticsRequestCreate = () => {
  const navigate = useNavigate();

  const handleRequestCreated = (requestData) => {
    console.log('Request created:', requestData);
    // The flow handles navigation to provider selection internally
  };

  const handleShipmentAssigned = (assignmentData) => {
    console.log('Shipment assigned:', assignmentData);
    // Navigate to the request detail page to show the assigned shipment
    if (assignmentData.request?.id) {
      navigate(webRoutes.logisticsRequestDetail.replace(':id', assignmentData.request.id));
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BackArrowButton className={"w-fit"}/>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create Shipment Request</h1>
                <p className="text-sm text-gray-600">Create a detailed shipment request and compare providers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Request Flow */}
      <div className="py-8">
        <EnhancedShipmentRequestFlow
          onRequestCreated={handleRequestCreated}
          onShipmentAssigned={handleShipmentAssigned}
        />
      </div>
    </div>
  );
};

export default LogisticsRequestCreate;
