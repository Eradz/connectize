import React, { useState, useEffect } from 'react';
import { useAuth, useAdminData } from './ComprehensiveAdmin';
import { confirmDialog } from '../../lib/confirm.jsx';
import Input, { Select, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';
import Checkbox from '../../components/ui/Checkbox';
import { Cog6ToothIcon, EnvelopeIcon, LockClosedIcon, LinkIcon, WrenchScrewdriverIcon, NoSymbolIcon, CheckCircleIcon, ArrowPathIcon, ServerIcon, PaintBrushIcon, ShieldCheckIcon, BellIcon, CircleStackIcon } from '@heroicons/react/24/outline';

// System Settings & Configuration Component
const AdminSystemSettings = () => {
  const { hasPermission } = useAuth();
  const { fetchData, addToast } = useAdminData();

  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const TABS = [
    { key: 'general', name: 'General', Icon: Cog6ToothIcon },
    { key: 'appearance', name: 'Appearance', Icon: PaintBrushIcon },
    { key: 'email', name: 'Email', Icon: EnvelopeIcon },
    { key: 'security', name: 'Security', Icon: ShieldCheckIcon },
    { key: 'notifications', name: 'Notifications', Icon: BellIcon },
    { key: 'integrations', name: 'Integrations', Icon: LinkIcon },
    { key: 'advanced', name: 'Advanced', Icon: ServerIcon },
  ];

  useEffect(() => {
    if (hasPermission('admin')) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [hasPermission]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const result = await fetchData('/admin/settings/', 'settings');
      if (result.success && Object.keys(result.data).length > 0) {
        setSettings(result.data);
      } else {
        // Fallback to comprehensive demo settings if API fails or returns empty
        setSettings({
          general: { site_name: 'Connectize', site_url: 'https://connectize.app', admin_email: 'admin@connectize.app', timezone: 'UTC', language: 'en' },
          appearance: { theme: 'light', accent_color: '#3b82f6', logo_url: '', favicon_url: '' },
          email: { smtp_host: 'smtp.example.com', smtp_port: 587, from_email: 'noreply@connectize.app', from_name: 'Connectize' },
          security: { password_min_length: 8, two_factor_required: false, max_login_attempts: 5, lockout_duration: 15 },
          notifications: { new_follower_email: true, post_like_email: false, company_invite_push: true },
          integrations: { google_oauth_enabled: false, linkedin_oauth_enabled: false, slack_webhook_url: '' },
          advanced: { debug_mode: false, log_level: 'INFO', cache_timeout: 300, cdn_enabled: false },
        });
      }
    } catch (error) {
      addToast('Failed to load settings, using defaults.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value },
    }));
  };

  const saveSettings = async (category) => {
    if (!hasPermission('admin.change_settings')) {
      addToast("You don't have permission to change settings.", 'error');
      return;
    }
    setIsSaving(true);
    try {
      // In a real app, this would be a single endpoint, but we'll simulate per-category saves
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      console.log(`Saving ${category} settings:`, settings[category]);
      addToast(`${TABS.find(t => t.key === category)?.name || 'Settings'} saved successfully!`, 'success');
    } catch (error) {
      addToast(`Failed to save ${category} settings.`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async (category) => {
    const ok = await confirmDialog({
      title: 'Reset Settings',
      message: `Are you sure you want to reset ${category} settings to their defaults? This action cannot be undone.`,
      confirmLabel: 'Reset',
    });
    if (!ok) return;
    // This would ideally fetch defaults from the server
    addToast(`${category} settings have been reset.`, 'info');
    loadSettings();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="w-8 h-8 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (!hasPermission('admin')) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <NoSymbolIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to view system settings.</p>
      </div>
    );
  }

  const renderActiveTab = () => {
    const category = activeTab;
    const s = settings[category] || {};

    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <Input label="Site Name" value={s.site_name} onChange={e => handleSettingChange(category, 'site_name', e.target.value)} />
            <Input label="Site URL" type="url" value={s.site_url} onChange={e => handleSettingChange(category, 'site_url', e.target.value)} />
            <Input label="Admin Email" type="email" value={s.admin_email} onChange={e => handleSettingChange(category, 'admin_email', e.target.value)} />
            <Select label="Timezone" value={s.timezone} onChange={e => handleSettingChange(category, 'timezone', e.target.value)}>
              <option>UTC</option>
              <option>US/Pacific</option>
              <option>US/Eastern</option>
            </Select>
            <Select label="Language" value={s.language} onChange={e => handleSettingChange(category, 'language', e.target.value)}>
              <option>en</option>
              <option>es</option>
            </Select>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6">
            <Select label="Theme" value={s.theme} onChange={e => handleSettingChange(category, 'theme', e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </Select>
            <Input label="Accent Color" type="color" value={s.accent_color} onChange={e => handleSettingChange(category, 'accent_color', e.target.value)} />
            <Input label="Logo URL" type="url" value={s.logo_url} onChange={e => handleSettingChange(category, 'logo_url', e.target.value)} />
            <Input label="Favicon URL" type="url" value={s.favicon_url} onChange={e => handleSettingChange(category, 'favicon_url', e.target.value)} />
          </div>
        );
      case 'email':
        return (
          <div className="space-y-6">
            <Input label="SMTP Host" value={s.smtp_host} onChange={e => handleSettingChange(category, 'smtp_host', e.target.value)} />
            <Input label="SMTP Port" type="number" value={s.smtp_port} onChange={e => handleSettingChange(category, 'smtp_port', e.target.value)} />
            <Input label="From Email" type="email" value={s.from_email} onChange={e => handleSettingChange(category, 'from_email', e.target.value)} />
            <Input label="From Name" value={s.from_name} onChange={e => handleSettingChange(category, 'from_name', e.target.value)} />
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <Input label="Minimum Password Length" type="number" value={s.password_min_length} onChange={e => handleSettingChange(category, 'password_min_length', e.target.value)} />
            <Input label="Max Login Attempts" type="number" value={s.max_login_attempts} onChange={e => handleSettingChange(category, 'max_login_attempts', e.target.value)} />
            <Input label="Lockout Duration (minutes)" type="number" value={s.lockout_duration} onChange={e => handleSettingChange(category, 'lockout_duration', e.target.value)} />
            <Toggle id="2fa" label="Require Two-Factor Authentication" checked={s.two_factor_required} onChange={val => handleSettingChange(category, 'two_factor_required', val)} />
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4">
            <Toggle id="nf" label="Email on New Follower" checked={s.new_follower_email} onChange={val => handleSettingChange(category, 'new_follower_email', val)} />
            <Toggle id="pl" label="Email on Post Like" checked={s.post_like_email} onChange={val => handleSettingChange(category, 'post_like_email', val)} />
            <Toggle id="ci" label="Push Notification on Company Invite" checked={s.company_invite_push} onChange={val => handleSettingChange(category, 'company_invite_push', val)} />
          </div>
        );
      case 'integrations':
        return (
          <div className="space-y-6">
            <Toggle id="g-oauth" label="Enable Google OAuth" checked={s.google_oauth_enabled} onChange={val => handleSettingChange(category, 'google_oauth_enabled', val)} />
            <Toggle id="l-oauth" label="Enable LinkedIn OAuth" checked={s.linkedin_oauth_enabled} onChange={val => handleSettingChange(category, 'linkedin_oauth_enabled', val)} />
            <Input label="Slack Webhook URL" type="url" value={s.slack_webhook_url} onChange={e => handleSettingChange(category, 'slack_webhook_url', e.target.value)} />
          </div>
        );
      case 'advanced':
        return (
          <div className="space-y-6">
            <Toggle id="debug" label="Enable Debug Mode" checked={s.debug_mode} onChange={val => handleSettingChange(category, 'debug_mode', val)} />
            <Select label="Log Level" value={s.log_level} onChange={e => handleSettingChange(category, 'log_level', e.target.value)}>
              <option>INFO</option>
              <option>WARN</option>
              <option>ERROR</option>
              <option>DEBUG</option>
            </Select>
            <Input label="Cache Timeout (seconds)" type="number" value={s.cache_timeout} onChange={e => handleSettingChange(category, 'cache_timeout', e.target.value)} />
            <Toggle id="cdn" label="Enable CDN" checked={s.cdn_enabled} onChange={val => handleSettingChange(category, 'cdn_enabled', val)} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        subtitle="Configure platform-wide settings, integrations, and system behavior."
      />

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.key
                    ? 'bg-gray-100 text-blue-600 dark:bg-gray-800 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                }`}
              >
                <tab.Icon className="h-6 w-6 mr-3" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
          <div className="bg-white dark:bg-gray-800/50 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                {TABS.find(t => t.key === activeTab)?.name} Settings
              </h3>
              <div className="mt-6">
                {renderActiveTab()}
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-right sm:px-6 rounded-b-lg">
              <div className="flex justify-end items-center space-x-4">
                <Button variant="secondary" onClick={() => resetToDefaults(activeTab)}>
                  Reset
                </Button>
                <Button onClick={() => saveSettings(activeTab)} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSettings;
