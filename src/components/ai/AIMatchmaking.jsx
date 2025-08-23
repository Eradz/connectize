import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/userContext';
import { useFeatureFlag } from '../../context/featureFlagContext';
import Button from '../ui/Button';
import { 
  BrainIcon, 
  TargetIcon, 
  StarIcon, 
  MapPinIcon, 
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon
} from '../ui/ModernIcon';

const AIMatchmaking = () => {
  const { user } = useAuth();
  const hasAIMatchmaking = useFeatureFlag('ai_matchmaking');
  const [matches, setMatches] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches'); // matches | opportunities

  useEffect(() => {
    if (hasAIMatchmaking) {
      fetchMatches();
      fetchOpportunities();
    }
  }, [hasAIMatchmaking]);

  const fetchMatches = async () => {
    try {
      // Mock AI-generated matches
      const mockMatches = [
        {
          id: '1',
          type: 'company',
          name: 'PetroTech Solutions',
          compatibility_score: 94,
          match_reason: 'Complementary services in offshore drilling',
          industry: 'Offshore Engineering',
          location: 'Houston, TX',
          employees: '50-100',
          capabilities: ['Subsea Engineering', 'Platform Design', 'Risk Assessment'],
          projects_completed: 45,
          reliability_score: 4.8,
          last_active: '2 hours ago',
          mutual_connections: 3,
          suggested_intro: "Both companies have expertise in offshore operations and could benefit from collaboration on subsea projects.",
        },
        {
          id: '2',
          type: 'company',
          name: 'Gulf Coast Logistics',
          compatibility_score: 89,
          match_reason: 'Supply chain synergy in Gulf region',
          industry: 'Logistics & Supply Chain',
          location: 'New Orleans, LA',
          employees: '100-250',
          capabilities: ['Marine Transportation', 'Port Operations', 'Customs Clearance'],
          projects_completed: 78,
          reliability_score: 4.6,
          last_active: '1 day ago',
          mutual_connections: 5,
          suggested_intro: "Your drilling operations could benefit from their specialized marine logistics expertise.",
        },
        {
          id: '3',
          type: 'professional',
          name: 'Dr. Sarah Mitchell',
          compatibility_score: 87,
          match_reason: 'HSE expertise alignment',
          title: 'Senior HSE Manager',
          company: 'Shell',
          location: 'Aberdeen, UK',
          experience_years: 12,
          certifications: ['NEBOSH', 'IOSH', 'Lead Auditor ISO 45001'],
          specialties: ['Process Safety', 'Environmental Compliance', 'Incident Investigation'],
          last_active: '30 minutes ago',
          mutual_connections: 2,
          suggested_intro: "Her process safety expertise could enhance your drilling operations safety protocols.",
        },
      ];
      setMatches(mockMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchOpportunities = async () => {
    try {
      // Mock opportunity radar data
      const mockOpportunities = [
        {
          id: '1',
          title: 'Offshore Platform Maintenance Contract',
          organization: 'ExxonMobil',
          value: '$2.4M - $3.8M',
          location: 'Gulf of Mexico',
          deadline: '2024-02-28',
          match_score: 92,
          requirements: ['Offshore Experience', 'BOSIET Certification', 'Heavy Lifting'],
          description: 'Comprehensive maintenance services for offshore platform including mechanical, electrical, and structural work.',
          posted_date: '2024-01-15',
          category: 'Maintenance & Repair',
          status: 'Open',
        },
        {
          id: '2',
          title: 'Subsea Pipeline Inspection Services',
          organization: 'Chevron',
          value: '$800K - $1.2M',
          location: 'North Sea',
          deadline: '2024-03-15',
          match_score: 88,
          requirements: ['ROV Operations', 'Pipeline Inspection', 'NDT Certification'],
          description: 'ROV-based inspection of subsea pipelines using advanced NDT techniques.',
          posted_date: '2024-01-18',
          category: 'Inspection & Testing',
          status: 'Open',
        },
        {
          id: '3',
          title: 'Environmental Impact Assessment',
          organization: 'BP',
          value: '$450K - $650K',
          location: 'Trinidad & Tobago',
          deadline: '2024-02-20',
          match_score: 85,
          requirements: ['EIA Experience', 'Marine Biology', 'Regulatory Knowledge'],
          description: 'Comprehensive environmental impact assessment for new drilling activities.',
          posted_date: '2024-01-20',
          category: 'Environmental Services',
          status: 'Open',
        },
      ];
      setOpportunities(mockOpportunities);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (matchId, matchType) => {
    try {
      // In production, this would send a connection request
      console.log(`Connecting with ${matchType} ${matchId}`);
      alert('Connection request sent!');
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleApplyOpportunity = async (opportunityId) => {
    try {
      // In production, this would apply to the opportunity
      console.log(`Applying to opportunity ${opportunityId}`);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying to opportunity:', error);
    }
  };

  if (!hasAIMatchmaking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BrainIcon className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Matchmaking Available in Premium Plans
          </h2>
          <p className="text-gray-600 mb-6">
            Get intelligent business matching and opportunity recommendations powered by AI
          </p>
          <Button onClick={() => window.location.href = '/subscriptions'}>
            Upgrade to Premium
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">AI is analyzing matches for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BrainIcon className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AI-Powered Matchmaking
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover perfect business partners and opportunities tailored to your capabilities
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'matches', name: 'Smart Matches', count: matches.length },
              { key: 'opportunities', name: 'Opportunity Radar', count: opportunities.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{tab.name}</span>
                  <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Smart Matches Tab */}
          {activeTab === 'matches' && (
            <div className="space-y-6">
              {matches.map((match) => (
                <div key={match.id} className="border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        {match.type === 'company' ? (
                          <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                        ) : (
                          <UserGroupIcon className="h-6 w-6 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {match.name}
                        </h3>
                        {match.type === 'company' ? (
                          <p className="text-gray-600">{match.industry}</p>
                        ) : (
                          <p className="text-gray-600">{match.title} at {match.company}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <TargetIcon className="h-5 w-5 text-purple-600" />
                        <span className="text-2xl font-bold text-purple-600">
                          {match.compatibility_score}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Match Score</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 mb-4">
                    <p className="text-purple-800 font-medium mb-2">Why this match?</p>
                    <p className="text-purple-700">{match.match_reason}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">{match.location}</span>
                    </div>
                    
                    {match.type === 'company' ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-600">{match.employees} employees</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-600">{match.projects_completed} projects</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-600">{match.experience_years} years exp.</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StarIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-600">{match.certifications?.length || 0} certifications</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {match.type === 'company' ? 'Core Capabilities:' : 'Specialties:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(match.capabilities || match.specialties || []).map((item, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      {match.mutual_connections} mutual connections • Last active {match.last_active}
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button variant="minimal" size="sm">
                        View Profile
                      </Button>
                      <Button
                        onClick={() => handleConnect(match.id, match.type)}
                        size="sm"
                      >
                        Connect
                      </Button>
                    </div>
                  </div>

                  {match.suggested_intro && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Suggested intro:</strong> {match.suggested_intro}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Opportunity Radar Tab */}
          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              {opportunities.map((opportunity) => (
                <div key={opportunity.id} className="border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {opportunity.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{opportunity.organization}</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {opportunity.category}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <TargetIcon className="h-5 w-5 text-purple-600" />
                        <span className="text-2xl font-bold text-purple-600">
                          {opportunity.match_score}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Match Score</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{opportunity.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Value</p>
                      <p className="text-green-600 font-bold">{opportunity.value}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-gray-600">{opportunity.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Deadline</p>
                      <p className="text-red-600 font-medium">{opportunity.deadline}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Posted</p>
                      <p className="text-gray-600">{opportunity.posted_date}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Key Requirements:</p>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.requirements.map((req, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Status: <span className="text-green-600 font-medium">{opportunity.status}</span>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button variant="minimal" size="sm">
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleApplyOpportunity(opportunity.id)}
                        size="sm"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <BrainIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">94%</div>
            <p className="text-gray-700">Average match accuracy based on your profile</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">12</div>
            <p className="text-gray-700">New opportunities found this week</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">8</div>
            <p className="text-gray-700">Successful connections made this month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMatchmaking;
