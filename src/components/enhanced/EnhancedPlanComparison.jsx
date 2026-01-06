import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  TrendingUp, 
  Crown, 
  Zap, 
  Shield,
  BarChart3,
  Users,
  Settings,
  ArrowRight,
  Sparkles,
  Star,
  Target,
  DollarSign
} from 'lucide-react';

const EnhancedPlanComparison = () => {
  const [comparison, setComparison] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const fetchComparisonData = async () => {
    try {
      const response = await fetch('/api/admin_permissions/api/v2/plans/comparison/');
      
      // Check if response is ok and contains JSON
      if (!response.ok) {
        console.warn(`Comparison API returned ${response.status}: ${response.statusText}`);
        setComparison(null);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Comparison API returned non-JSON response:', contentType);
        setComparison(null);
        return;
      }
      
      const data = await response.json();
      setComparison(data);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Core Social': Users,
      'Deal Management': BarChart3,
      'AI Services': Sparkles,
      'Enterprise Tools': Shield,
      'Logistics': TrendingUp,
      'Admin & Support': Settings
    };
    return iconMap[category] || CheckCircle;
  };

  const getPlanColor = (planType) => {
    const colorMap = {
      'trial': 'border-gray-300 bg-gray-50',
      'starter': 'border-blue-300 bg-blue-50',
      'professional': 'border-purple-300 bg-purple-50',
      'enterprise': 'border-orange-300 bg-orange-50',
      'custom': 'border-red-300 bg-red-50'
    };
    return colorMap[planType] || 'border-gray-300 bg-gray-50';
  };

  const getPlanBadgeColor = (planType) => {
    const colorMap = {
      'trial': 'bg-gray-100 text-gray-800',
      'starter': 'bg-blue-100 text-blue-800',
      'professional': 'bg-purple-100 text-purple-800',
      'enterprise': 'bg-orange-100 text-orange-800',
      'custom': 'bg-red-100 text-red-800'
    };
    return colorMap[planType] || 'bg-gray-100 text-gray-800';
  };

  const getFeatureAvailabilityIcon = (available, importance) => {
    if (available) {
      if (importance === 'high') {
        return <Crown className="h-4 w-4 text-yellow-600" />;
      }
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-gray-400" />;
  };

  const FeatureDetailModal = ({ feature, onClose }) => {
    if (!feature) return null;

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {feature.importance === 'high' && <Crown className="h-5 w-5 text-yellow-600" />}
            {feature.feature_name}
            <Badge variant="secondary">
              {feature.importance} priority
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Description */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600">{feature.description}</p>
          </div>

          {/* Availability across plans */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Available in Plans</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(feature.availability).map(([planType, available]) => (
                <div key={planType} className={`p-3 rounded-lg border ${getPlanColor(planType)}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{planType}</span>
                    {getFeatureAvailabilityIcon(available, feature.importance)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Impact */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Business Impact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Efficiency Gain</span>
                </div>
                <p className="text-sm text-blue-700">
                  {feature.importance === 'high' ? 'High impact on business operations' :
                   feature.importance === 'medium' ? 'Moderate improvement in workflow' :
                   'Nice-to-have enhancement'}
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">ROI Potential</span>
                </div>
                <p className="text-sm text-green-700">
                  {feature.importance === 'high' ? 'Significant ROI expected' :
                   feature.importance === 'medium' ? 'Positive ROI over time' :
                   'Indirect value benefits'}
                </p>
              </div>
            </div>
          </div>

          {/* When to use */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">When You Need This</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                {feature.feature_name.includes('AI') && 
                  "When you need automated insights and intelligent decision support for your business operations."
                }
                {feature.feature_name.includes('Deal') && 
                  "When managing complex business transactions, partnerships, or negotiations that require secure collaboration."
                }
                {feature.feature_name.includes('Unlimited') && 
                  "When your business has high-volume content needs and standard limits are constraining your growth."
                }
                {feature.feature_name.includes('Support') && 
                  "When your business requires guaranteed response times and dedicated assistance for critical operations."
                }
                {!feature.feature_name.includes('AI') && !feature.feature_name.includes('Deal') && 
                 !feature.feature_name.includes('Unlimited') && !feature.feature_name.includes('Support') &&
                  `Essential for businesses that need ${feature.feature_name.toLowerCase()} capabilities to operate effectively.`
                }
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Failed to load plan comparison data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Choose Your Perfect Plan
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Compare features across all plans and find the perfect fit for your business needs. 
          Each plan is designed to scale with your growth.
        </p>
      </div>

      {/* Plans Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {comparison.plans.map((plan) => (
          <Card key={plan.id} className={`${getPlanColor(plan.plan_type)} border-2`}>
            <CardContent className="p-4 text-center">
              <Badge className={`mb-2 ${getPlanBadgeColor(plan.plan_type)}`}>
                {plan.plan_type}
              </Badge>
              <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                ${plan.price}
                <span className="text-sm font-normal">/{plan.billing_cycle}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {plan.value_proposition?.headline}
              </p>
              <div className="text-xs text-gray-500">
                {plan.feature_summary?.feature_density}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detailed Feature Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(comparison.feature_categories).map(([category, features]) => {
              const IconComponent = getCategoryIcon(category);
              
              return (
                <div key={category} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                    <Badge variant="outline" className="ml-auto">
                      {features.length} features
                    </Badge>
                  </div>

                  {/* Features Grid */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium text-gray-900">
                            Feature
                          </th>
                          {comparison.plans.map((plan) => (
                            <th key={plan.id} className="text-center py-2 px-2 font-medium">
                              <Badge className={getPlanBadgeColor(plan.plan_type)}>
                                {plan.plan_type}
                              </Badge>
                            </th>
                          ))}
                          <th className="text-center py-2 pl-4 font-medium text-gray-900">
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {features.map((feature) => (
                          <tr key={feature.feature_code} className="border-b last:border-b-0">
                            <td className="py-3 pr-4">
                              <div>
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                  {feature.feature_name}
                                  {feature.importance === 'high' && (
                                    <Star className="h-3 w-3 text-yellow-500" />
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {feature.description}
                                </div>
                              </div>
                            </td>
                            {comparison.plans.map((plan) => (
                              <td key={plan.id} className="text-center py-3 px-2">
                                {getFeatureAvailabilityIcon(
                                  feature.availability[plan.plan_type], 
                                  feature.importance
                                )}
                              </td>
                            ))}
                            <td className="text-center py-3 pl-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedFeature(feature)}
                                  >
                                    <Info className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <FeatureDetailModal 
                                  feature={selectedFeature} 
                                  onClose={() => setSelectedFeature(null)}
                                />
                              </Dialog>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {comparison.plans.map((plan) => (
          <Card key={plan.id} className="relative">
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">Recommended</Badge>
              </div>
            )}
            
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${plan.price}
                  <span className="text-base font-normal text-gray-600">
                    /{plan.billing_cycle}
                  </span>
                </div>
              </div>

              {/* Ideal for */}
              {plan.value_proposition?.ideal_for && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Ideal for:</p>
                  <p className="text-sm text-blue-700">
                    {plan.value_proposition.ideal_for}
                  </p>
                </div>
              )}

              {/* Top features */}
              {plan.value_proposition?.key_benefits && (
                <div className="mb-6">
                  <p className="font-medium text-gray-900 mb-2">Key Benefits:</p>
                  <ul className="space-y-1">
                    {plan.value_proposition.key_benefits.slice(0, 3).map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button className="w-full bg-blue-600 hover:bg-custom_yellow">
                Choose {plan.name}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Summary Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(comparison.feature_categories).reduce((acc, features) => acc + features.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Features</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(comparison.feature_categories).length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {comparison.plans.length}
              </div>
              <div className="text-sm text-gray-600">Plan Options</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(comparison.feature_categories)
                  .flat()
                  .filter(f => f.importance === 'high').length}
              </div>
              <div className="text-sm text-gray-600">Premium Features</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPlanComparison;
