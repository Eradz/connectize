import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './userContext';

const FeatureFlagContext = createContext();

export const FeatureFlagProvider = ({ children }) => {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFeatureFlags();
    } else {
      setFlags({});
      setLoading(false);
    }
  }, [user]);

  const fetchFeatureFlags = async () => {
    try {
      // Try same-origin relative path using cookies for auth if applicable
      const response = await fetch('/api/v1/features/enabled/', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        let data = {};
        try {
          data = await response.json();
        } catch (e) {
          console.warn('Feature flags: non-JSON response');
        }
        setFlags((data && data.features) || {});
      } else {
        // Fallback to default flags for demo
        setFlags({
          // A. Core monetization & content
          'subscriptions': true,
          'featured_ads': user?.subscription?.plan_type !== 'trial',
          'knowledge_hub': true,
          'data_licensing': user?.subscription?.plan_type === 'premium',
          
          // B. Deal flow & cross-border execution
          'virtual_deal_rooms': user?.subscription?.plan_type !== 'trial',
          'e_invoicing': user?.subscription?.plan_type !== 'trial',
          'logistics_hub': true,
          
          // C. AI-powered intelligence
          'ai_matchmaking': user?.subscription?.plan_type === 'premium',
          'opportunity_radar': user?.subscription?.plan_type !== 'trial',
          'ai_compliance': user?.subscription?.plan_type !== 'trial',
          'predictive_analytics': user?.subscription?.plan_type === 'premium',
          'ai_data_analyst': user?.subscription?.plan_type === 'premium',
          
          // D. Trust & verification
          'reputation_system': true,
          'verification_system': true,
          
          // E. Workforce & community
          'workforce_marketplace': true,
          'events_platform': user?.subscription?.plan_type !== 'trial',
          'gamification': true,
          'industry_councils': user?.subscription?.plan_type !== 'trial',
          
          // F. Specialized oil & gas tooling
          'equipment_sharing': user?.subscription?.plan_type !== 'trial',
          'hse_collaboration': user?.subscription?.plan_type !== 'trial',
          'local_content_optimizer': user?.subscription?.plan_type === 'premium',
          'supply_chain_visibility': user?.subscription?.plan_type === 'premium',
          'predictive_pipeline': user?.subscription?.plan_type === 'premium',
          
          // G. API ecosystem
          'public_apis': user?.subscription?.plan_type !== 'trial',
          'webhook_integrations': user?.subscription?.plan_type === 'premium',
        });
      }
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      setFlags({});
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = (flagName) => {
    return flags[flagName] === true;
  };

  const value = {
    flags,
    isEnabled,
    loading,
    refetch: fetchFeatureFlags,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};

// HOC for feature-gated components
export const withFeatureFlag = (flagName, fallback = null) => (Component) => {
  return function FeatureGatedComponent(props) {
    const { isEnabled } = useFeatureFlags();
    
    if (!isEnabled(flagName)) {
      return fallback;
    }
    
    return <Component {...props} />;
  };
};

// Hook for conditional rendering based on feature flags
export const useFeatureFlag = (flagName) => {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flagName);
};
