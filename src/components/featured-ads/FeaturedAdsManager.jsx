import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/userContext';
import { useFeatureFlag } from '../../context/featureFlagContext';
import Button from '../ui/Button';
import Input, { Select, Textarea } from '../ui/Input';
import { TrendingIcon as TrendingUpIcon, MoneyIcon as CurrencyDollarIcon, ViewIcon as EyeIcon, MegaphoneIcon as MousePointerClickIcon } from '../ui/ModernIcon';
import { featuredAdsApi } from '../../api-services/ads';

const FeaturedAdsManager = () => {
  const { user } = useAuth();
  const hasFeaturedAds = useFeatureFlag('featured_ads');
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'post',
    content_id: '',
    placement: 'feed_top',
    budget: '',
    start_date: '',
    end_date: '',
    target_countries: [],
    target_industries: [],
  });

  useEffect(() => {
    if (hasFeaturedAds) {
      fetchCampaigns();
    }
  }, [hasFeaturedAds]);

  const fetchCampaigns = async () => {
    try {
      const [list, summaryRes] = await Promise.all([
        featuredAdsApi.list(),
        featuredAdsApi.summary(),
      ]);
      setCampaigns(list?.results || list || []);
      setSummary(summaryRes);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    try {
      // Backend expects datetimes; convert date-only to ISO strings ending of day
      const payload = {
        ...formData,
        // Map content_type string to Django content type by model name; backend expects ID, but we expose model label.
        // If backend expects numeric content_type, adjust API accordingly. For now, pass through and let backend map.
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };

      const created = await featuredAdsApi.create(payload);
      setCampaigns([created, ...campaigns]);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        content_type: 'post',
        content_id: '',
        placement: 'feed_top',
        budget: '',
        start_date: '',
        end_date: '',
        target_countries: [],
        target_industries: [],
      });
      
      alert('Campaign created successfully!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Please try again.');
    }
  };

  const toggleCampaignStatus = async (campaignId, currentStatus) => {
    try {
      let updated;
      if (currentStatus === 'active') {
        updated = await featuredAdsApi.pause(campaignId);
      } else {
        updated = await featuredAdsApi.resume(campaignId);
      }
      setCampaigns(campaigns.map(c => (c.id === campaignId ? updated : c)));
      const s = await featuredAdsApi.summary();
      setSummary(s);
    } catch (e) {
      console.error('Failed to toggle campaign status', e);
    }
  };

  const openAnalytics = async (campaign) => {
    setSelectedCampaign(campaign);
    setAnalyticsOpen(true);
    setAnalyticsLoading(true);
    try {
      const data = await featuredAdsApi.analytics(campaign.id);
      setAnalyticsData(data);
    } catch (e) {
      console.error('Failed to load analytics', e);
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const closeAnalytics = () => {
    setAnalyticsOpen(false);
    setSelectedCampaign(null);
    setAnalyticsData(null);
    setAnalyticsLoading(false);
  };

  if (!hasFeaturedAds) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUpIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Featured Ads Available in Standard & Premium Plans
          </h2>
          <p className="text-gray-600 mb-6">
            Promote your products and services to reach more potential customers
          </p>
          <Button onClick={() => window.location.href = '/subscriptions'}>
            Upgrade Your Plan
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Featured Ads Manager
          </h1>
          <p className="text-gray-600">
            Create and manage featured ad campaigns for your content
          </p>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)}>
          Create Campaign
        </Button>
      </div>

  {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">
        {summary?.active_campaigns ?? campaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900">
        {(summary?.impressions ?? campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0)).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <EyeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
        {(summary?.clicks ?? campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <MousePointerClickIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
        ${((summary?.spent ?? campaigns.reduce((sum, c) => sum + (c.spent_amount || 0), 0))).toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Campaigns</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(campaign.content_type_label || campaign.content_type)} • {campaign.placement}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : campaign.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      ${Number(campaign.spent_amount || 0).toFixed(2)} / ${Number(campaign.budget || 0).toFixed(2)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Number(campaign.budget) > 0 ? (Number(campaign.spent_amount || 0) / Number(campaign.budget)) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {(campaign.impressions || 0).toLocaleString()} impressions
                    </div>
                    <div>
                      {(campaign.clicks || 0)} clicks ({campaign.ctr}% CTR)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                      className={`mr-3 ${
                        campaign.status === 'active'
                          ? 'text-yellow-600 hover:text-yellow-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {campaign.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => openAnalytics(campaign)}
                      className="text-purple-600 hover:text-purple-900 mr-3"
                    >
                      View analytics
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Campaign
              </h3>
              
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Type
                  </label>
                  <Select
                    value={formData.content_type}
                    onChange={(e) => setFormData({...formData, content_type: e.target.value})}
                  >
                    <option value="post">Post</option>
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content ID
                  </label>
                  <Input
                    type="number"
                    value={formData.content_id}
                    onChange={(e) => setFormData({...formData, content_id: e.target.value})}
                    placeholder="Enter the ID of the content to promote"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placement
                  </label>
                  <Select
                    value={formData.placement}
                    onChange={(e) => setFormData({...formData, placement: e.target.value})}
                  >
                    <option value="feed_top">Feed Top</option>
                    <option value="feed_middle">Feed Middle</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="search_results">Search Results</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="minimal"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Campaign
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Drawer */}
      {analyticsOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-30" onClick={closeAnalytics}></div>
          <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl border-l border-gray-200 flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Campaign analytics</h3>
                {selectedCampaign && (
                  <p className="text-sm text-gray-500 truncate">{selectedCampaign.title}</p>
                )}
              </div>
              <button onClick={closeAnalytics} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="p-5 overflow-y-auto">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : analyticsData ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500">Impressions</p>
                      <div className="mt-1 flex items-center gap-2">
                        <EyeIcon className="h-5 w-5 text-blue-600" />
                        <p className="text-xl font-semibold">{(analyticsData.impressions || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500">Clicks</p>
                      <div className="mt-1 flex items-center gap-2">
                        <MousePointerClickIcon className="h-5 w-5 text-purple-600" />
                        <p className="text-xl font-semibold">{(analyticsData.clicks || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500">CTR</p>
                      <div className="mt-1 flex items-center gap-2">
                        <TrendingUpIcon className="h-5 w-5 text-green-600" />
                        <p className="text-xl font-semibold">{Number(analyticsData.ctr || 0).toFixed(2)}%</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500">Avg CPC</p>
                      <div className="mt-1 flex items-center gap-2">
                        <CurrencyDollarIcon className="h-5 w-5 text-yellow-600" />
                        <p className="text-xl font-semibold">${Number(analyticsData.avg_cpc || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Budget usage</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${(Number(selectedCampaign?.spent_amount || 0) / Number(selectedCampaign?.budget || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                      <span>Spent: ${Number(analyticsData.spent || 0).toFixed(2)}</span>
                      <span>Remaining: ${Number(analyticsData.remaining_budget || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>Status: {analyticsData.is_active ? 'Active' : 'Inactive'}</p>
                    {selectedCampaign && (
                      <p className="mt-1">Placement: {selectedCampaign.placement}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">No analytics available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedAdsManager;
