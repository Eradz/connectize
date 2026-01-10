import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, Building, CreditCard, ArrowLeft, RefreshCw,
  TrendingUp, Wallet, Clock, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, Eye, EyeOff, Save, Edit,
  Banknote, Globe, Shield, Info, ExternalLink, Calendar
} from 'lucide-react';
import { workforceAPI } from '../../api-services/workforce';
import { webRoutes } from '../../lib/webRoutes';

const CompanyEarnings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [platformFees, setPlatformFees] = useState(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_routing_number: '',
    bank_country: '',
    bank_currency: 'USD'
  });

  useEffect(() => {
    loadCompaniesEarnings();
    loadPlatformFees();
  }, []);

  const loadCompaniesEarnings = async () => {
    try {
      setLoading(true);
      const response = await workforceAPI.getMyCompaniesEarnings();
      setCompanies(response.data || []);
      
      if (response.data?.length > 0) {
        setSelectedCompany(response.data[0]);
        await loadCompanyDetails(response.data[0].company_id);
      }
    } catch (err) {
      console.error('Error loading earnings:', err);
      setError('Failed to load company earnings');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyDetails = async (companyId) => {
    try {
      const response = await workforceAPI.getCompanyEarnings(companyId);
      setCompanyDetails(response.data);
      
      // Pre-fill bank form if details exist
      if (response.data?.bank_details) {
        setBankForm({
          bank_name: response.data.bank_details.bank_name || '',
          bank_account_name: response.data.bank_details.bank_account_name || '',
          bank_account_number: '', // Don't pre-fill for security
          bank_routing_number: response.data.bank_details.bank_routing_number || '',
          bank_country: response.data.bank_details.bank_country || '',
          bank_currency: response.data.bank_details.bank_currency || 'USD'
        });
      }
    } catch (err) {
      console.error('Error loading company details:', err);
    }
  };

  const loadPlatformFees = async () => {
    try {
      const response = await workforceAPI.getPlatformFees();
      setPlatformFees(response.data);
    } catch (err) {
      console.error('Error loading platform fees:', err);
    }
  };

  const handleSelectCompany = async (company) => {
    setSelectedCompany(company);
    await loadCompanyDetails(company.company_id);
  };

  const handleBankFormChange = (field, value) => {
    setBankForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveBankDetails = async () => {
    try {
      setSavingBank(true);
      await workforceAPI.updateCompanyBankDetails(selectedCompany.company_id, bankForm);
      await loadCompanyDetails(selectedCompany.company_id);
      await loadCompaniesEarnings();
      setShowBankForm(false);
    } catch (err) {
      console.error('Error saving bank details:', err);
      setError('Failed to save bank details');
    } finally {
      setSavingBank(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Company Earnings</h1>
                <p className="text-sm text-gray-500">Manage your event earnings and payouts</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadCompaniesEarnings}
              className="flex items-center px-4 py-2 bg-pale_yellow text-gray-900 rounded-lg hover:bg-gold transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Platform Fee Info */}
        {platformFees && (
          <div className="mb-6 p-4 bg-pale_yellow/30 border border-gold/50 rounded-xl flex items-start space-x-3">
            <Info className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800">Platform Fee Information</p>
              <p className="text-sm text-gray-600">{platformFees.description}</p>
              <p className="text-xs text-gray-500 mt-1">Payouts are processed {platformFees.payout_schedule}.</p>
            </div>
          </div>
        )}

        {companies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-pale_yellow/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Companies Found</h3>
            <p className="text-gray-500 mb-4">You don't have any companies with earnings yet.</p>
            <button
              type="button"
              onClick={() => navigate(webRoutes.workforceEventCreate)}
              className="px-4 py-2 bg-gold text-gray-900 rounded-lg hover:bg-pale_yellow transition-colors"
            >
              Create an Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company Selector */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Your Companies</h3>
                <div className="space-y-2">
                  {companies.map((company) => (
                    <button
                      type="button"
                      key={company.company_id}
                      onClick={() => handleSelectCompany(company)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedCompany?.company_id === company.company_id
                          ? 'border-gold bg-pale_yellow/30'
                          : 'border-gray-200 hover:border-gold/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{company.company_name}</span>
                        {company.bank_details_complete ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                      <div className="mt-2 text-lg font-bold text-gray-900">
                        ${parseFloat(company.available_balance).toFixed(2)}
                        <span className="text-sm font-normal text-gray-500 ml-1">available</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {selectedCompany && companyDetails && (
                <>
                  {/* Earnings Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Total Revenue</span>
                        <DollarSign className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        ${parseFloat(companyDetails.summary?.total_gross_earnings || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Platform Fees</span>
                        <TrendingUp className="w-4 h-4 text-gold" />
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        ${parseFloat(companyDetails.summary?.total_platform_fees || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Net Earnings</span>
                        <Wallet className="w-4 h-4 text-gold" />
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        ${parseFloat(companyDetails.summary?.total_net_earnings || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gold to-pale_yellow rounded-xl shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Available</span>
                        <CheckCircle className="w-4 h-4 text-gray-700" />
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        ${parseFloat(companyDetails.summary?.available_balance || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Bank Details Section */}
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pale_yellow rounded-xl flex items-center justify-center">
                          <Banknote className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Bank Details</h3>
                          <p className="text-sm text-gray-500">Configure where to receive payouts</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBankForm(!showBankForm)}
                        className="flex items-center px-4 py-2 bg-gold text-gray-900 rounded-lg hover:bg-pale_yellow transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {showBankForm ? 'Cancel' : 'Edit'}
                      </button>
                    </div>

                    {!companyDetails.bank_details?.complete && !showBankForm && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">
                            Bank details incomplete. Add your bank details to receive payouts.
                          </span>
                        </div>
                      </div>
                    )}

                    {showBankForm ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <input
                              type="text"
                              value={bankForm.bank_name}
                              onChange={(e) => handleBankFormChange('bank_name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold"
                              placeholder="e.g., Chase Bank, First Bank"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                            <input
                              type="text"
                              value={bankForm.bank_account_name}
                              onChange={(e) => handleBankFormChange('bank_account_name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold"
                              placeholder="Account holder's name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                            <div className="relative">
                              <input
                                type={showAccountNumber ? 'text' : 'password'}
                                value={bankForm.bank_account_number}
                                onChange={(e) => handleBankFormChange('bank_account_number', e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold"
                                placeholder="Your bank account number"
                              />
                              <button
                                type="button"
                                onClick={() => setShowAccountNumber(!showAccountNumber)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showAccountNumber ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number / SWIFT</label>
                            <input
                              type="text"
                              value={bankForm.bank_routing_number}
                              onChange={(e) => handleBankFormChange('bank_routing_number', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold"
                              placeholder="Routing, sort code, or SWIFT"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Country</label>
                            <input
                              type="text"
                              value={bankForm.bank_country}
                              onChange={(e) => handleBankFormChange('bank_country', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold"
                              placeholder="e.g., United States, Nigeria"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Currency</label>
                            <select
                              value={bankForm.bank_currency}
                              onChange={(e) => handleBankFormChange('bank_currency', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold"
                            >
                              <option value="USD">USD - US Dollar</option>
                              <option value="EUR">EUR - Euro</option>
                              <option value="GBP">GBP - British Pound</option>
                              <option value="NGN">NGN - Nigerian Naira</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowBankForm(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveBankDetails}
                            disabled={savingBank}
                            className="flex items-center px-4 py-2 bg-gold text-gray-900 rounded-lg hover:bg-pale_yellow transition-colors disabled:opacity-50"
                          >
                            {savingBank ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Bank Details
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : companyDetails.bank_details?.complete ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Bank Name</span>
                          <p className="font-medium text-gray-900">{companyDetails.bank_details.bank_name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Account Holder</span>
                          <p className="font-medium text-gray-900">{companyDetails.bank_details.bank_account_name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Account Number</span>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {showAccountNumber 
                                ? companyDetails.bank_details.bank_account_number_full || companyDetails.bank_details.bank_account_number_masked
                                : companyDetails.bank_details.bank_account_number_masked
                              }
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowAccountNumber(!showAccountNumber)}
                              className="text-gray-500 hover:text-gray-700"
                              title={showAccountNumber ? 'Hide account number' : 'Show account number'}
                            >
                              {showAccountNumber ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Routing/SWIFT</span>
                          <p className="font-medium text-gray-900">{companyDetails.bank_details.bank_routing_number}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Recent Payments */}
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Event Payments</h3>
                    {companyDetails.recent_payments?.length > 0 ? (
                      <div className="space-y-3">
                        {companyDetails.recent_payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-4 bg-background rounded-xl"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{payment.event_title}</p>
                              <p className="text-sm text-gray-500">{payment.attendee_name}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">+${parseFloat(payment.net_amount).toFixed(2)}</p>
                              <p className="text-xs text-gray-500">
                                ${payment.gross_amount} - ${payment.platform_fee} fee
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No payments yet</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyEarnings;
