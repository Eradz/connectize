import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Star,
  Eye,
  FileText,
  Users,
  Award,
  TrendingUp,
  TrendingDown,
  Lock,
  Globe,
  Search,
  Filter,
  RefreshCw,
  Plus,
  BarChart3,
  UserCheck,
  Building,
  CreditCard,
  Fingerprint
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
// import { trustService } from '../../api-services/oilgas'; // Will be implemented when backend endpoint is ready

const TrustDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    verifications: { total: 0, data: [] },
    ratings: { total: 0, data: [] },
    analytics: {
      totalVerifications: 0,
      verificationSuccess: 0,
      averageRating: 0,
      trustedPartners: 0
    }
  });

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data since endpoints may not exist yet
      const mockVerifications = generateMockVerifications();
      const mockRatings = generateMockRatings();
      const mockAnalytics = generateMockAnalytics();

      setDashboardData({
        verifications: {
          total: mockVerifications.length,
          data: mockVerifications
        },
        ratings: {
          total: mockRatings.length,
          data: mockRatings
        },
        analytics: mockAnalytics
      });
    } catch (error) {
      console.error('Failed to load trust data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockVerifications = () => {
    const types = ['identity', 'company', 'certification', 'financial'];
    const statuses = ['verified', 'pending', 'rejected', 'expired'];
    const companies = ['PetroGlobal Inc', 'OceanDrill Ltd', 'SafetyFirst Corp', 'EnergyTech Solutions'];
    
    return Array.from({ length: 15 }, (_, index) => ({
      id: `verify_${index + 1}`,
      entity_name: index % 2 === 0 ? companies[index % companies.length] : `User ${index + 1}`,
      entity_type: index % 2 === 0 ? 'company' : 'individual',
      verification_type: types[index % types.length],
      status: statuses[index % statuses.length],
      confidence_score: Math.floor(Math.random() * 30) + 70,
      verified_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + (365 - Math.random() * 100) * 24 * 60 * 60 * 1000).toISOString(),
      documents: Math.floor(Math.random() * 5) + 1,
      verifier: ['Internal Review', 'Third Party', 'Automated', 'Manual Review'][index % 4]
    }));
  };

  const generateMockRatings = () => {
    const categories = ['Service Quality', 'Communication', 'Reliability', 'Safety Standards'];
    const companies = ['PetroGlobal Inc', 'OceanDrill Ltd', 'SafetyFirst Corp', 'EnergyTech Solutions'];
    
    return Array.from({ length: 12 }, (_, index) => ({
      id: `rating_${index + 1}`,
      entity_name: companies[index % companies.length],
      category: categories[index % categories.length],
      rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
      reviews_count: Math.floor(Math.random() * 50) + 5,
      latest_review: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      trend_value: (Math.random() * 0.5).toFixed(1)
    }));
  };

  const generateMockAnalytics = () => ({
    totalVerifications: 156,
    verificationSuccess: 89.3,
    averageRating: 4.2,
    trustedPartners: 84,
    monthlyGrowth: 12.5,
    pendingReviews: 23
  });

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getVerificationTypeIcon = (type) => {
    switch (type) {
      case 'identity': return <UserCheck className="w-5 h-5" />;
      case 'company': return <Building className="w-5 h-5" />;
      case 'certification': return <Award className="w-5 h-5" />;
      case 'financial': return <CreditCard className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const getConfidenceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInDays = Math.floor((now - time) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trust & Verification Center</h1>
              <p className="text-gray-600 mt-1">Identity verification, ratings & reputation management</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={webRoutes.trustVerificationCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Verification
              </Link>
              <button
                onClick={loadDashboardData}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Verifications</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.analytics.totalVerifications}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{dashboardData.analytics.monthlyGrowth}% this month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.analytics.verificationSuccess}%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  High confidence
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.analytics.averageRating}/5.0</p>
                <div className="flex items-center mt-1">
                  {renderStars(dashboardData.analytics.averageRating)}
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trusted Partners</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.analytics.trustedPartners}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Users className="w-4 h-4 mr-1" />
                  Verified entities
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Overview Content */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6">
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Trust & Verification Center</h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete trust and verification management system with advanced features coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustDashboard;
