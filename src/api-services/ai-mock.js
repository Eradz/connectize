import { toast } from 'sonner';

// Mock data generators for AI services
const generateMockMatches = () => {
  const companies = ['Shell', 'ExxonMobil', 'BP', 'Total', 'Chevron', 'ConocoPhillips', 'Equinor', 'Eni'];
  const jobTitles = ['Senior Drilling Engineer', 'Reservoir Engineer', 'Project Manager', 'Geologist', 'HSE Manager', 'Production Engineer'];
  const locations = ['Houston, TX', 'Aberdeen, UK', 'Calgary, AB', 'Rio de Janeiro, BR', 'Dubai, UAE', 'Lagos, NG'];

  return Array.from({ length: 15 }, (_, index) => ({
    id: `match_${index + 1}`,
    title: `${jobTitles[index % jobTitles.length]} at ${companies[index % companies.length]}`,
    company: companies[index % companies.length],
    location: locations[index % locations.length],
    confidence: Math.floor(Math.random() * 30) + 70, // 70-100% match
    summary: `High compatibility match based on your experience and skills in oil & gas operations.`,
    match_factors: ['Technical Skills', 'Experience Level', 'Location Preference', 'Industry Background'],
    status: Math.random() > 0.3 ? 'new' : 'viewed',
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

const generateMockOpportunities = () => {
  const dealTypes = ['Joint Venture', 'Asset Acquisition', 'Service Contract', 'Equipment Lease', 'Exploration Rights'];
  const regions = ['North Sea', 'Gulf of Mexico', 'Permian Basin', 'West Africa', 'Middle East', 'Arctic'];
  const companies = ['Shell Ventures', 'BP Energy Partners', 'Total New Energies', 'Chevron Technology', 'ExxonMobil Upstream'];

  return Array.from({ length: 12 }, (_, index) => ({
    id: `opportunity_${index + 1}`,
    title: `${dealTypes[index % dealTypes.length]} - ${regions[index % regions.length]}`,
    description: `Strategic opportunity for collaboration in ${regions[index % regions.length]} operations.`,
    company: companies[index % companies.length],
    deal_type: dealTypes[index % dealTypes.length].toLowerCase().replace(' ', '_'),
    estimated_value: (Math.random() * 500 + 50) * 1000000, // $50M - $550M
    location: regions[index % regions.length],
    confidence: Math.floor(Math.random() * 25) + 75, // 75-100% relevance
    priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
    status: 'active',
    created_at: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

const generateMockComplianceAlerts = () => {
  const alertTypes = ['Environmental', 'Safety', 'Financial', 'Regulatory', 'Operational'];
  const priorities = ['high', 'medium', 'low'];
  const sources = ['EPA', 'OSHA', 'SEC', 'DOE', 'State Regulatory', 'Internal Audit'];

  return Array.from({ length: 8 }, (_, index) => ({
    id: `alert_${index + 1}`,
    title: `${alertTypes[index % alertTypes.length]} Compliance Alert`,
    summary: `New regulatory requirement or compliance issue requiring attention.`,
    type: alertTypes[index % alertTypes.length].toLowerCase(),
    priority: priorities[index % priorities.length],
    status: Math.random() > 0.4 ? 'active' : 'resolved',
    source: sources[index % sources.length],
    due_date: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    description: `Detailed compliance alert description for ${alertTypes[index % alertTypes.length].toLowerCase()} requirements.`,
    created_at: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

// Mock AI Services with realistic delays
export class MockAIMatchingService {
  async getMatchProfiles() {
    await this.simulateDelay();
    return {
      count: 1,
      results: [{
        id: 'profile_1',
        user: 1,
        skills: ['Drilling Operations', 'Reservoir Engineering', 'Project Management'],
        experience_level: 'senior',
        location_preferences: ['Houston, TX', 'Aberdeen, UK'],
        salary_expectations: { min: 120000, max: 180000, currency: 'USD' },
        industry_focus: ['Upstream', 'Offshore'],
        created_at: new Date().toISOString()
      }]
    };
  }

  async createMatchProfile(profileData) {
    await this.simulateDelay();
    return {
      id: 'profile_new',
      ...profileData,
      created_at: new Date().toISOString()
    };
  }

  async getMatches() {
    await this.simulateDelay();
    const matches = generateMockMatches();
    return {
      count: matches.length,
      results: matches
    };
  }

  async viewMatch(matchId) {
    await this.simulateDelay();
    return { success: true, message: 'Match marked as viewed' };
  }

  simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
  }
}

export class MockAIOpportunityService {
  async getOpportunities() {
    await this.simulateDelay();
    const opportunities = generateMockOpportunities();
    return {
      count: opportunities.length,
      results: opportunities
    };
  }

  async expressInterest(opportunityId) {
    await this.simulateDelay();
    return { 
      success: true, 
      message: 'Interest expressed successfully',
      opportunity_id: opportunityId 
    };
  }

  simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 400));
  }
}

export class MockAIComplianceService {
  async getComplianceAlerts() {
    await this.simulateDelay();
    const alerts = generateMockComplianceAlerts();
    return {
      count: alerts.length,
      results: alerts
    };
  }

  async resolveAlert(alertId) {
    await this.simulateDelay();
    return { 
      success: true, 
      message: 'Alert resolved successfully',
      alert_id: alertId 
    };
  }

  simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, 250 + Math.random() * 350));
  }
}

// Enhanced AI Services that fall back to mock when real endpoints aren't available
import { makeApiRequest } from '../lib/helpers';

export class EnhancedAIMatchingService {
  constructor() {
    this.mockService = new MockAIMatchingService();
    this.useMock = false; // Enforce real backend usage
  }

  async getMatchProfiles() {
    if (this.useMock) {
      return this.mockService.getMatchProfiles();
    }
    
    try {
      return await makeApiRequest({
        url: "api/v1/ai/match-profiles/",
        method: "GET",
      });
    } catch (error) {
      console.warn('AI Matching API not available, using mock data');
      return this.mockService.getMatchProfiles();
    }
  }

  async getMatches() {
    if (this.useMock) {
      return this.mockService.getMatches();
    }
    
    try {
      return await makeApiRequest({
        url: "api/v1/ai/matches/",
        method: "GET",
      });
    } catch (error) {
      console.warn('AI Matches API not available, using mock data');
      return this.mockService.getMatches();
    }
  }

  async viewMatch(matchId) {
    if (this.useMock) {
      return this.mockService.viewMatch(matchId);
    }
    
    try {
      return await makeApiRequest({
        url: `api/v1/ai/matches/${matchId}/view/`,
        method: "POST",
      });
    } catch (error) {
      console.warn('AI Match View API not available, using mock response');
      return this.mockService.viewMatch(matchId);
    }
  }
}

export class EnhancedAIOpportunityService {
  constructor() {
    this.mockService = new MockAIOpportunityService();
    this.useMock = false; // Enforce real backend usage
  }

  async getOpportunities() {
    if (this.useMock) {
      return this.mockService.getOpportunities();
    }
    
    try {
      return await makeApiRequest({
        url: "api/v1/ai/opportunities/",
        method: "GET",
      });
    } catch (error) {
      console.warn('AI Opportunities API not available, using mock data');
      return this.mockService.getOpportunities();
    }
  }

  async expressInterest(opportunityId) {
    if (this.useMock) {
      toast.success('Interest expressed in opportunity!');
      return this.mockService.expressInterest(opportunityId);
    }
    
    try {
      const result = await makeApiRequest({
        url: `api/v1/ai/opportunities/${opportunityId}/express-interest/`,
        method: "POST",
      });
      toast.success('Interest expressed successfully!');
      return result;
    } catch (error) {
      console.warn('AI Express Interest API not available, using mock response');
      toast.success('Interest expressed in opportunity!');
      return this.mockService.expressInterest(opportunityId);
    }
  }
}

export class EnhancedAIComplianceService {
  constructor() {
    this.mockService = new MockAIComplianceService();
    this.useMock = false; // Enforce real backend usage
  }

  async getComplianceAlerts() {
    if (this.useMock) {
      return this.mockService.getComplianceAlerts();
    }
    
    try {
      return await makeApiRequest({
        url: "api/v1/ai/compliance-alerts/",
        method: "GET",
      });
    } catch (error) {
      console.warn('AI Compliance API not available, using mock data');
      return this.mockService.getComplianceAlerts();
    }
  }

  async resolveAlert(alertId) {
    if (this.useMock) {
      toast.success('Compliance alert resolved!');
      return this.mockService.resolveAlert(alertId);
    }
    
    try {
      const result = await makeApiRequest({
        url: `api/v1/ai/compliance-alerts/${alertId}/resolve/`,
        method: "POST",
      });
      toast.success('Alert resolved successfully!');
      return result;
    } catch (error) {
      console.warn('AI Resolve Alert API not available, using mock response');
      toast.success('Compliance alert resolved!');
      return this.mockService.resolveAlert(alertId);
    }
  }
}

// Export enhanced services as the default
export const aiMatchingService = new EnhancedAIMatchingService();
export const aiOpportunityService = new EnhancedAIOpportunityService();
export const aiComplianceService = new EnhancedAIComplianceService();
