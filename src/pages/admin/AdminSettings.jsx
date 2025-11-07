import React, { useState } from 'react';
import Input, { Select, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DatabaseIcon,
  ServerIcon,
  KeyIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Connectize',
    siteDescription: 'Connect with Oil and Gas Industry Professionals',
    maintenanceMode: false,
    allowRegistration: true,
    emailVerificationRequired: true,
    
    // Security Settings
    passwordMinLength: 8,
    requireSpecialCharacters: true,
    sessionTimeout: 30,
    twoFactorAuth: false,
    ipWhitelist: '',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
    userRegistrationAlerts: true,
    
    // API Settings
    rateLimit: 1000,
    apiVersion: 'v1',
    enableCors: true,
    apiKeys: [],
    
    // Content Settings
    autoModeration: true,
    profanityFilter: true,
    spamDetection: true,
    contentApprovalRequired: false,
    
    // Analytics Settings
    trackingEnabled: true,
    dataRetentionDays: 365,
    anonymizeUserData: false,
    shareAnalytics: false,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'api', name: 'API', icon: ServerIcon },
    { id: 'content', name: 'Content', icon: DocumentTextIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Name
        </label>
        <Input
          value={settings.siteName}
          onChange={(e) => handleSettingChange('siteName', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Description
        </label>
        <Textarea
          value={settings.siteDescription}
          onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Maintenance Mode</h3>
            <p className="text-sm text-gray-500">Temporarily disable site for maintenance</p>
          </div>
          <button
            onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Allow Registration</h3>
            <p className="text-sm text-gray-500">Allow new users to register</p>
          </div>
          <button
            onClick={() => handleSettingChange('allowRegistration', !settings.allowRegistration)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.allowRegistration ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Email Verification Required</h3>
            <p className="text-sm text-gray-500">Require email verification for new accounts</p>
          </div>
          <button
            onClick={() => handleSettingChange('emailVerificationRequired', !settings.emailVerificationRequired)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.emailVerificationRequired ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailVerificationRequired ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Password Length
        </label>
        <Input
          type="number"
          value={settings.passwordMinLength}
          onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
          min={6}
          max={20}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session Timeout (minutes)
        </label>
        <Input
          type="number"
          value={settings.sessionTimeout}
          onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
          min={5}
          max={480}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          IP Whitelist (one per line)
        </label>
        <Textarea
          value={settings.ipWhitelist}
          onChange={(e) => handleSettingChange('ipWhitelist', e.target.value)}
          rows={4}
          placeholder={"192.168.1.1\n10.0.0.1"}
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Require Special Characters</h3>
            <p className="text-sm text-gray-500">Passwords must contain special characters</p>
          </div>
          <button
            onClick={() => handleSettingChange('requireSpecialCharacters', !settings.requireSpecialCharacters)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.requireSpecialCharacters ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.requireSpecialCharacters ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
          </div>
          <button
            onClick={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
          <p className="text-sm text-gray-500">Send notifications via email</p>
        </div>
        <button
          onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">SMS Notifications</h3>
          <p className="text-sm text-gray-500">Send notifications via SMS</p>
        </div>
        <button
          onClick={() => handleSettingChange('smsNotifications', !settings.smsNotifications)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Push Notifications</h3>
          <p className="text-sm text-gray-500">Send browser push notifications</p>
        </div>
        <button
          onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Admin Alerts</h3>
          <p className="text-sm text-gray-500">Receive system alerts and warnings</p>
        </div>
        <button
          onClick={() => handleSettingChange('adminAlerts', !settings.adminAlerts)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.adminAlerts ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.adminAlerts ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">User Registration Alerts</h3>
          <p className="text-sm text-gray-500">Get notified when new users register</p>
        </div>
        <button
          onClick={() => handleSettingChange('userRegistrationAlerts', !settings.userRegistrationAlerts)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.userRegistrationAlerts ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.userRegistrationAlerts ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderAPISettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rate Limit (requests per hour)
        </label>
        <Input
          type="number"
          value={settings.rateLimit}
          onChange={(e) => handleSettingChange('rateLimit', parseInt(e.target.value))}
          min={100}
          max={10000}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          API Version
        </label>
        <Select
          value={settings.apiVersion}
          onChange={(e) => handleSettingChange('apiVersion', e.target.value)}
        >
          <option value="v1">Version 1.0</option>
          <option value="v2">Version 2.0</option>
        </Select>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Enable CORS</h3>
          <p className="text-sm text-gray-500">Allow cross-origin requests</p>
        </div>
        <button
          onClick={() => handleSettingChange('enableCors', !settings.enableCors)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.enableCors ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.enableCors ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">API Keys</h3>
          <Button size="sm">Generate New Key</Button>
        </div>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <div>
              <code className="text-sm">ak_1234567890abcdef</code>
              <span className="ml-2 text-xs text-gray-500">Created 2 days ago</span>
            </div>
            <Button variant="danger" size="sm">Revoke</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Auto Moderation</h3>
          <p className="text-sm text-gray-500">Automatically moderate user content</p>
        </div>
        <button
          onClick={() => handleSettingChange('autoModeration', !settings.autoModeration)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.autoModeration ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.autoModeration ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Profanity Filter</h3>
          <p className="text-sm text-gray-500">Filter inappropriate language</p>
        </div>
        <button
          onClick={() => handleSettingChange('profanityFilter', !settings.profanityFilter)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.profanityFilter ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.profanityFilter ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Spam Detection</h3>
          <p className="text-sm text-gray-500">Automatically detect spam content</p>
        </div>
        <button
          onClick={() => handleSettingChange('spamDetection', !settings.spamDetection)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.spamDetection ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.spamDetection ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Content Approval Required</h3>
          <p className="text-sm text-gray-500">Require manual approval for all content</p>
        </div>
        <button
          onClick={() => handleSettingChange('contentApprovalRequired', !settings.contentApprovalRequired)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.contentApprovalRequired ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.contentApprovalRequired ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderAnalyticsSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Retention Period (days)
        </label>
        <input
          type="number"
          value={settings.dataRetentionDays}
          onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
          min="30"
          max="3650"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Enable Tracking</h3>
            <p className="text-sm text-gray-500">Track user interactions and behavior</p>
          </div>
          <button
            onClick={() => handleSettingChange('trackingEnabled', !settings.trackingEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.trackingEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.trackingEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Anonymize User Data</h3>
            <p className="text-sm text-gray-500">Remove personal identifiers from analytics</p>
          </div>
          <button
            onClick={() => handleSettingChange('anonymizeUserData', !settings.anonymizeUserData)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.anonymizeUserData ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.anonymizeUserData ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Share Analytics</h3>
            <p className="text-sm text-gray-500">Share anonymized data with third parties</p>
          </div>
          <button
            onClick={() => handleSettingChange('shareAnalytics', !settings.shareAnalytics)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.shareAnalytics ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.shareAnalytics ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'api':
        return renderAPISettings();
      case 'content':
        return renderContentSettings();
      case 'analytics':
        return renderAnalyticsSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your application settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.name} Settings
              </h2>
            </div>
            
            {renderTabContent()}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" size="md">Cancel</Button>
                <Button size="md">Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
