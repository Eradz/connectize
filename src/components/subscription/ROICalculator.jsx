/**
 * ROI CALCULATOR COMPONENT
 * Interactive ROI calculator with business value projections and cost savings analysis
 * Part of the Enhanced Subscription Dashboard Implementation Plan
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, DollarSign, Users, Clock,
  Target, BarChart3, Zap, Award, Sparkles, ArrowRight,
  CheckCircle, AlertCircle, Info
} from 'lucide-react';

const ROICalculator = ({ plan, currentPlan, onClose }) => {
  // Calculator state
  const [teamSize, setTeamSize] = useState(5);
  const [currentTools, setCurrentTools] = useState([]);
  const [timeHours, setTimeHours] = useState(10);
  const [avgSalary, setAvgSalary] = useState(75000);
  const [currentPlanCost, setCurrentPlanCost] = useState(0);
  const [businessGrowth, setBusinessGrowth] = useState(20);

  // Results state
  const [roiResults, setRoiResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Tool options for cost comparison
  const toolOptions = [
    { name: 'CRM Software', cost: 50 },
    { name: 'Analytics Tools', cost: 30 },
    { name: 'Email Marketing', cost: 25 },
    { name: 'Social Media Tools', cost: 40 },
    { name: 'Project Management', cost: 15 },
    { name: 'Communication Tools', cost: 20 },
    { name: 'File Storage', cost: 10 },
    { name: 'AI Tools', cost: 60 }
  ];

  useEffect(() => {
    if (currentPlan) {
      setCurrentPlanCost(parseFloat(currentPlan.price) || 0);
    }
  }, [currentPlan]);

  useEffect(() => {
    calculateROI();
  }, [teamSize, timeHours, avgSalary, currentPlanCost, businessGrowth, currentTools]);

  const calculateROI = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay for UX
    setTimeout(() => {
      // Calculate costs
      const hourlyWage = avgSalary / (52 * 40); // Annual salary to hourly
      const weeklyTimeSavings = timeHours;
      const monthlyTimeSavings = weeklyTimeSavings * 4.33; // Average weeks per month
      const yearlySalarySavings = weeklyTimeSavings * 52 * hourlyWage * teamSize;
      
      // Tool consolidation savings
      const monthlyToolCosts = currentTools.reduce((total, tool) => total + tool.cost, 0);
      const yearlyToolSavings = monthlyToolCosts * 12;
      
      // Plan costs
      const planCost = parseFloat(plan.price) || 0;
      const monthlyPlanCost = plan.billing_cycle === 'yearly' ? planCost / 12 : planCost;
      const yearlyPlanCost = plan.billing_cycle === 'yearly' ? planCost : planCost * 12;
      
      // Business growth value (estimated)
      const growthValue = (businessGrowth / 100) * avgSalary * teamSize;
      
      // Total savings and investments
      const totalYearlySavings = yearlySalarySavings + yearlyToolSavings + growthValue;
      const totalYearlyInvestment = yearlyPlanCost;
      const netBenefit = totalYearlySavings - totalYearlyInvestment;
      const roiPercentage = totalYearlyInvestment > 0 ? (netBenefit / totalYearlyInvestment) * 100 : 0;
      const paybackMonths = totalYearlyInvestment > 0 ? Math.ceil((totalYearlyInvestment / totalYearlySavings) * 12) : 0;
      
      setRoiResults({
        monthly: {
          timeSavings: monthlyTimeSavings,
          salarySavings: yearlySalarySavings / 12,
          toolSavings: monthlyToolCosts,
          planCost: monthlyPlanCost,
          netBenefit: netBenefit / 12
        },
        yearly: {
          timeSavings: weeklyTimeSavings * 52,
          salarySavings: yearlySalarySavings,
          toolSavings: yearlyToolSavings,
          growthValue,
          totalSavings: totalYearlySavings,
          planCost: yearlyPlanCost,
          netBenefit
        },
        roi: {
          percentage: roiPercentage,
          paybackMonths,
          breakEvenPoint: paybackMonths <= 12 ? 'Less than 1 year' : `${Math.ceil(paybackMonths / 12)} years`
        }
      });
      
      setIsCalculating(false);
    }, 500);
  };

  const handleToolToggle = (tool) => {
    setCurrentTools(prev => {
      const exists = prev.find(t => t.name === tool.name);
      if (exists) {
        return prev.filter(t => t.name !== tool.name);
      } else {
        return [...prev, tool];
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getROIColor = (percentage) => {
    if (percentage >= 200) return 'text-green-600';
    if (percentage >= 100) return 'text-blue-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getROIIcon = (percentage) => {
    if (percentage >= 200) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (percentage >= 100) return <Target className="w-5 h-5 text-blue-500" />;
    if (percentage >= 50) return <AlertCircle className="w-5 h-5 text-orange-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="w-6 h-6 mr-3" />
              <div>
                <h2 className="text-xl font-bold">ROI Calculator</h2>
                <p className="text-blue-100">Calculate your return on investment for {plan.name}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  Team Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Size
                    </label>
                    <input
                      type="number"
                      value={teamSize}
                      onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                      min="1"
                      max="1000"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average Annual Salary ($)
                    </label>
                    <input
                      type="number"
                      value={avgSalary}
                      onChange={(e) => setAvgSalary(parseInt(e.target.value) || 0)}
                      min="0"
                      step="1000"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-500" />
                  Time Savings
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours saved per week per person
                  </label>
                  <input
                    type="number"
                    value={timeHours}
                    onChange={(e) => setTimeHours(parseInt(e.target.value) || 0)}
                    min="0"
                    max="40"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Time saved through automation, better tools, and streamlined processes
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-500" />
                  Tool Consolidation
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  Select tools you're currently paying for that this plan could replace:
                </p>
                
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {toolOptions.map((tool, index) => (
                    <label key={index} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={currentTools.some(t => t.name === tool.name)}
                        onChange={() => handleToolToggle(tool)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tool.name}</span>
                      <span className="text-xs text-gray-500">${tool.cost}/mo</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                  Business Growth
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected productivity increase (%)
                  </label>
                  <input
                    type="number"
                    value={businessGrowth}
                    onChange={(e) => setBusinessGrowth(parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated productivity boost from better tools and insights
                  </p>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {isCalculating ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Calculating your ROI...</p>
                </div>
              ) : roiResults ? (
                <>
                  {/* ROI Summary */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-blue-500" />
                      ROI Summary
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getROIColor(roiResults.roi.percentage)}`}>
                          {roiResults.roi.percentage.toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
                          {getROIIcon(roiResults.roi.percentage)}
                          <span className="ml-1">Annual ROI</span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {roiResults.roi.paybackMonths}
                        </div>
                        <div className="text-sm text-gray-600">
                          Months to Payback
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Net Annual Benefit</span>
                        <span className={`text-lg font-bold ${roiResults.yearly.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(roiResults.yearly.netBenefit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Breakdown */}
                  <div className="bg-white rounded-lg border p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Monthly Breakdown</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Time Savings Value</span>
                        <span className="font-medium text-green-600">
                          +{formatCurrency(roiResults.monthly.salarySavings)}
                        </span>
                      </div>
                      
                      {roiResults.monthly.toolSavings > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Tool Consolidation Savings</span>
                          <span className="font-medium text-green-600">
                            +{formatCurrency(roiResults.monthly.toolSavings)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Plan Cost</span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(roiResults.monthly.planCost)}
                        </span>
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Net Monthly Benefit</span>
                          <span className={`font-bold ${roiResults.monthly.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(roiResults.monthly.netBenefit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Impact */}
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Business Impact
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>{roiResults.yearly.timeSavings} hours saved annually</span>
                      </div>
                      
                      <div className="flex items-center text-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>Break even in {roiResults.roi.breakEvenPoint}</span>
                      </div>
                      
                      {roiResults.yearly.toolSavings > 0 && (
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span>Eliminate {currentTools.length} separate tools</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>Focus on core business activities</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Adjust the inputs to see your ROI calculation</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="text-sm text-gray-500">
              <Info className="w-4 h-4 inline mr-1" />
              Calculations are estimates based on industry averages
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              
              {roiResults && roiResults.roi.percentage > 0 && (
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center">
                  Choose {plan.name}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
