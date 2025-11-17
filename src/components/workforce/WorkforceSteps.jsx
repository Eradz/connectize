 export const StepIndicator = ({currentStep}) => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step < currentStep ? 'bg-pale_yellow border-pale_yellow' :
              step === currentStep ? 'bg-pale_yellow' :
              'border-gray-300'
            }`}>
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            {step < 4 && (
              <div className={`w-12 h-0.5 ${
                step < currentStep ? 'bg-pale_yellow' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

 export  const StepContent = ({employmentTypes, currentStep, formData, handleTextChange, loadingCompanies, userCompanies, experienceLevels, departments, currentSkill, setCurrentSkill, addSkill, removeSkill, currentQualification, setCurrentQualification, addQualification, handleCheckboxChange, currencies, currentBenefit, setCurrentBenefit, addBenefit, removeBenefit}) => {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Job Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Senior Drilling Engineer"
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company *
                    </label>
                    {loadingCompanies ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        Loading companies...
                      </div>
                    ) : userCompanies.length === 0 ? (
                      <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-600">
                        No companies found. You need to be associated with a company to post jobs.
                      </div>
                    ) : (
                      <select
                        name="company_id"
                        value={formData.company_id}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Company</option>
                        {userCompanies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.company_name}
                          </option>
                        ))}
                      </select>
                    )}
                    {userCompanies.length === 0 && !loadingCompanies && (
                      <p className="text-sm text-gray-500 mt-1">
                        Contact your administrator to be added to a company.
                      </p>
                    )}
                  </div>
  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Houston, TX or Remote"
                      />
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employment Type
                      </label>
                      <select
                        name="employment_type"
                        value={formData.employment_type}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {employmentTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleTextChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Provide a detailed description of the role, responsibilities, and requirements..."
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      name="experience_level"
                      value={formData.experience_level}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {experienceLevels.map((level) => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          );
  
        case 2:
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Qualifications</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Skills *
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Add a required skill (e.g., Drilling Operations)"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills_required.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 hover:text-green-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualifications
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={currentQualification}
                        onChange={(e) => setCurrentQualification(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Add a qualification (e.g., Bachelor's in Petroleum Engineering)"
                      />
                      <button
                        type="button"
                        onClick={addQualification}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.qualifications.map((qual) => (
                        <span
                          key={qual}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {qual}
                          <button
                            type="button"
                            onClick={() => removeQualification(qual)}
                            className="ml-2 hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remote_allowed"
                        name="remote_allowed"
                        checked={formData.remote_allowed}
                        onChange={handleCheckboxChange}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="remote_allowed" className="ml-2 text-sm font-medium text-gray-700">
                        Remote work allowed
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="travel_required"
                        name="travel_required"
                        checked={formData.travel_required}
                        onChange={handleCheckboxChange}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="travel_required" className="ml-2 text-sm font-medium text-gray-700">
                        Travel required
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="security_clearance_required"
                        name="security_clearance_required"
                        checked={formData.security_clearance_required}
                        onChange={handleCheckboxChange}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="security_clearance_required" className="ml-2 text-sm font-medium text-gray-700">
                        Security clearance required
                      </label>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compensation & Benefits</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <input
                          type="number"
                          name="salary_min"
                          value={formData.salary_min}
                          onChange={handleTextChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Minimum"
                          min="0"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="salary_max"
                          value={formData.salary_max}
                          onChange={handleTextChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Maximum"
                          min="0"
                        />
                      </div>
                      <div>
                        <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleTextChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {currencies.map((currency) => (
                            <option key={currency} value={currency}>{currency}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Benefits
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={currentBenefit}
                        onChange={(e) => setCurrentBenefit(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Add a benefit (e.g., Health Insurance, 401k)"
                      />
                      <button
                        type="button"
                        onClick={addBenefit}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.benefits.map((benefit) => (
                        <span
                          key={benefit}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {benefit}
                          <button
                            type="button"
                            onClick={() => removeBenefit(benefit)}
                            className="ml-2 hover:text-purple-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      name="application_deadline"
                      value={formData.application_deadline}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="hr@company.com"
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Instructions
                    </label>
                    <textarea
                      name="application_instructions"
                      value={formData.application_instructions}
                      onChange={handleTextChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Provide specific instructions for how candidates should apply..."
                    />
                  </div>
                </div>
              </div>
            </div>
          );
  
        case 4:
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Publish</h3>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Job Title:</span>
                      <p className="text-gray-900">{formData.title}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Company:</span>
                      <p className="text-gray-900">
                        {userCompanies.find(c => c.id === formData.company_id)?.company_name || 'Not selected'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Location:</span>
                      <p className="text-gray-900">{formData.location}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Employment Type:</span>
                      <p className="text-gray-900 capitalize">{formData.employment_type?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Department:</span>
                      <p className="text-gray-900">{formData.department}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Experience Level:</span>
                      <p className="text-gray-900 capitalize">{formData.experience_level?.replace('_', ' ')}</p>
                    </div>
                    {(formData.salary_min || formData.salary_max) && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Salary Range:</span>
                        <p className="text-gray-900">
                          {formData.currency} {formData.salary_min ? parseFloat(formData.salary_min).toLocaleString() : 'Not specified'} - {formData.salary_max ? parseFloat(formData.salary_max).toLocaleString() : 'Not specified'}
                        </p>
                      </div>
                    )}
                    {formData.application_deadline && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Application Deadline:</span>
                        <p className="text-gray-900">{new Date(formData.application_deadline).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
  
                  {formData.description && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Description:</span>
                      <p className="text-gray-900 mt-1">{formData.description}</p>
                    </div>
                  )}
  
                  {formData.skills_required.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Required Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.skills_required.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
  
                  {formData.qualifications.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Qualifications:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.qualifications.map((qual) => (
                          <span
                            key={qual}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {qual}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
  
                  {formData.benefits.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Benefits:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
  
                  <div className="flex items-center space-x-4 text-sm">
                    {formData.remote_allowed && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Remote Allowed
                      </span>
                    )}
                    {formData.travel_required && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Travel Required
                      </span>
                    )}
                    {formData.security_clearance_required && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Security Clearance Required
                      </span>
                    )}
                  </div>
                </div>
  
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900">Ready to Publish</h4>
                      <p className="text-sm text-green-700">
                        Your job posting will be published and visible to all professionals on the platform.
                        You can edit or unpublish it anytime from your job management dashboard.
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