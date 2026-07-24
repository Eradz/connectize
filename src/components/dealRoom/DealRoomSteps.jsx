import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Lock, 
  AlertCircle,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';
import CurrencyPicker from '../CurrencyPicker';

export const StepIndicator = ({currentStep}) => {
  console.log("🟢 DealRoomSteps.jsx StepIndicator loaded!", currentStep);
  
  const renderSteps = () => {
    const elements = [];
    
    for (let step = 1; step <= 4; step++) {
      // Add circle
      elements.push(
        <div 
          key={`circle-${step}`}
          className={`flex items-center justify-center rounded-full border font-medium ${
            step <= currentStep 
              ? 'bg-[#FAE9B4] border-[#FAE9B4] text-gray-900' 
              : 'border-gray-300 text-gray-900 bg-white'
          }`}
          style={{ 
            width: '48px', 
            height: '48px'
          }}
        >
          {step}
        </div>
      );
      
      // Add line (except after last step)
      if (step < 4) {
        elements.push(
          <div 
            key={`line-${step}`}
            style={{ 
              width: '64px', 
              height: '3px',
              backgroundColor: step < currentStep ? '#FAE9B4' : '#D1D5DB',
              display: 'block'
            }}
          />
        );
      }
    }
    
    return elements;
  };
  
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        {renderSteps()}
      </div>
    </div>
  );
};

export const StepContent = ({currentStep, formData, handleInputChange, dealTypes, currentTag, addTag, currentParticipant, setCurrentParticipant, participantRoles, addParticipant, removeParticipant }) => {
  switch (currentStep) {
    case 1:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="flex gap-5">
              <div className='flex flex-col gap-5 w-[40%]'>
              <div>
                <label htmlFor='DealRoomTitle' className="block text-[16px] font-medium text-gray-700 mb-2">
                  Deal Room Title *
                </label>
                <input
                  type="text"
                  name='DealRoomTitle'
                  id='DealRoomTitle'
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                  placeholder="e.g., North Sea Asset Acquisition"
                />
              </div>

                  <div>
                    <label htmlFor='DealRoomDescription' className="block text-[16px] font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id='DealRoomDescription'
                      name='DealRoomDescription'
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                      placeholder="Provide a detailed description of the deal..."
                    />
                  </div>

                  <div>
                    <label htmlFor='DealRoomLocation' className="block text-[16px] font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      name='DealRoomLocation'
                      id='DealRoomLocation'
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                      placeholder="e.g., North Sea, Gulf of Mexico, West Africa"
                    />
                  </div>
              </div>
              <div className='w-[60%]'>
                <span className="block text-[16px] font-medium text-gray-700 mb-2">
                  Deal Type *
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dealTypes.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => handleInputChange('deal_type', type.value)}
                      className={`px-2 py-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.deal_type === type.value
                          ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              

            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Value *
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => handleInputChange('estimated_value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
                <CurrencyPicker
                  value={formData.currency}
                  onChange={(code) => handleInputChange('currency', code)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Close Date *
                </label>
                <input
                  type="date"
                  value={formData.target_close_date}
                  onChange={(e) => handleInputChange('target_close_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => addTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                    placeholder="Add tags (e.g., offshore, drilling, upstream)"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-pale_yellow text-dark rounded-lg hover:bg-custom_yellow"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-pale_yellow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Access</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Confidential</span>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_confidential}
                        onChange={(e) => handleInputChange('is_confidential', e.target.checked)}
                        className="rounded border-gray-300 text-pale_yellow focus:ring-primary-500/30"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Mark as confidential to restrict access and require special permissions
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Require NDA</span>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.requires_nda}
                        onChange={(e) => handleInputChange('requires_nda', e.target.checked)}
                        className="rounded border-gray-300 text-pale_yellow focus:ring-primary-500/30"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Require participants to sign an NDA before accessing documents
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Initial Participants</h4>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={currentParticipant.email}
                      onChange={(e) => setCurrentParticipant(prev => ({ ...prev, email: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                      placeholder="participant@company.com"
                    />
                    <select
                      value={currentParticipant.role}
                      onChange={(e) => setCurrentParticipant(prev => ({ ...prev, role: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30 focus:border-transparent"
                    >
                      {participantRoles.map((role) => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addParticipant}
                      className="px-4 py-2 bg-pale_yellow text-dark rounded-lg hover:bg-custom_yellow"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {formData.participants.length > 0 && (
                    <div className="space-y-2">
                      {formData.participants.map((participant, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{participant.email}</span>
                            <span className="ml-2 text-sm text-gray-600 capitalize">({participant.role})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeParticipant(participant.email)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Create</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Title:</span>
                  <p className="text-gray-900">{formData.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Deal Type:</span>
                  <p className="text-gray-900 capitalize">{formData.deal_type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Estimated Value:</span>
                  <p className="text-gray-900">{formData.currency} {parseFloat(formData.estimated_value || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Target Close Date:</span>
                  <p className="text-gray-900">{new Date(formData.target_close_date).toLocaleDateString()}</p>
                </div>
                {formData.location && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Location:</span>
                    <p className="text-gray-900">{formData.location}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">Security:</span>
                  <div className="flex space-x-2">
                    {formData.is_confidential && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Confidential
                      </span>
                    )}
                    {formData.requires_nda && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        NDA Required
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {formData.description && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Description:</span>
                  <p className="text-gray-900">{formData.description}</p>
                </div>
              )}

              {formData.tags.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.participants.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Initial Participants:</span>
                  <div className="mt-1 space-y-1">
                    {formData.participants.map((participant, index) => (
                      <div key={index} className="text-gray-900 text-sm">
                        {participant.email} <span className="text-gray-600 capitalize">({participant.role})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-pale_yellow mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Next Steps</h4>
                  <p className="text-sm text-blue-700">
                    After creating the deal room, you can upload documents, add more participants, 
                    set up milestones, and begin collaboration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
