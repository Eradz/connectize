import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../lib/session';
import { logisticsAPI } from '../../api-services/logistics';
import {
  Settings,
  Key,
  Link as LinkIcon,
  Webhook,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  AlertTriangle,
  Info,
  Truck,
  ArrowLeft,
  Save,
  TestTube2,
  Clock,
} from 'lucide-react';
import './ProviderSettings.css';
import { webRoutes } from '../../lib/webRoutes';

const PROVIDER_TYPES = [
  { value: 'custom', label: 'Custom API', description: 'Your own shipping system API' },
  { value: 'dhl', label: 'DHL Express', description: 'DHL Express API integration' },
  { value: 'fedex', label: 'FedEx', description: 'FedEx Web Services API' },
  { value: 'ups', label: 'UPS', description: 'UPS API integration (coming soon)', disabled: true },
  { value: 'maersk', label: 'Maersk', description: 'Maersk API integration (coming soon)', disabled: true },
];

const WEBHOOK_EVENTS = [
  { value: 'shipment.created', label: 'Shipment Created', description: 'When a new shipment is created' },
  { value: 'shipment.picked_up', label: 'Shipment Picked Up', description: 'When cargo is picked up' },
  { value: 'shipment.in_transit', label: 'In Transit', description: 'When shipment is in transit' },
  { value: 'shipment.delivered', label: 'Delivered', description: 'When shipment is delivered' },
  { value: 'shipment.exception', label: 'Exception', description: 'When there\'s a delivery exception' },
  { value: 'tracking.updated', label: 'Tracking Updated', description: 'Any tracking status update' },
];

const ProviderSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [showSecrets, setShowSecrets] = useState({});
  const [activeTab, setActiveTab] = useState('api');
  const [generatingSecret, setGeneratingSecret] = useState(false);
  
  const [settings, setSettings] = useState({
    api_integration_enabled: false,
    api_provider_type: 'custom',
    api_base_url: '',
    api_key: '',
    api_secret: '',
    api_account_id: '',
    api_webhook_secret: '',
    api_config: {},
    webhook_url: '',
    webhook_events: [],
  });

  useEffect(() => {
    const session = getSession();
    if (!session?.id || !session?.tokens?.access) {
      navigate('/logistics/become-provider');
      return;
    }
    fetchSettings();
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await logisticsAPI.getProviderAPISettings();
      // Ensure webhook_events is always an array
      setSettings({
        ...response,
        webhook_events: response?.webhook_events || [],
      });
    } catch (error) {
      console.error('Error fetching API settings:', error);
      if (error.response?.status === 404) {
        navigate('/logistics/become-provider');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhookLogs = async () => {
    try {
      const response = await logisticsAPI.getProviderWebhookLogs();
      setWebhookLogs(response?.logs || []);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'webhooks') {
      fetchWebhookLogs();
    }
  }, [activeTab]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await logisticsAPI.updateProviderAPISettings(settings);
      setTestResult({ success: true, message: 'Settings saved successfully!' });
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setTestResult({ success: false, message: error.response?.data?.detail || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const response = await logisticsAPI.testProviderAPIConnection();
      setTestResult(response);
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Connection test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleGenerateWebhookSecret = async () => {
    try {
      setGeneratingSecret(true);
      const response = await logisticsAPI.generateWebhookSecret();
      if (response?.success) {
        // Show the new secret (only shown once!)
        setSettings(prev => ({
          ...prev,
          api_webhook_secret: response.webhook_secret
        }));
        setShowSecrets(prev => ({ ...prev, api_webhook_secret: true }));
        setTestResult({
          success: true,
          message: 'New webhook secret generated! Make sure to copy it - it won\'t be shown again.'
        });
      }
    } catch (error) {
      console.error('Error generating webhook secret:', error);
      setTestResult({
        success: false,
        message: 'Failed to generate webhook secret'
      });
    } finally {
      setGeneratingSecret(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setTestResult({ success: true, message: `${field} copied to clipboard!` });
    setTimeout(() => setTestResult(null), 2000);
  };

  const toggleShowSecret = (field) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleWebhookEventToggle = (eventValue) => {
    setSettings(prev => {
      const currentEvents = prev.webhook_events || [];
      if (currentEvents.includes(eventValue)) {
        return { ...prev, webhook_events: currentEvents.filter(e => e !== eventValue) };
      } else {
        return { ...prev, webhook_events: [...currentEvents, eventValue] };
      }
    });
  };

  // Generate the webhook URL for this provider
  const getWebhookReceiverUrl = () => {
    const baseUrl = window.location.origin.replace(':3000', ':8000');
    return `${baseUrl}/api/v1/logistics/webhooks/${settings.id || '{provider_id}'}/`;
  };

  if (loading) {
    return (
      <div className="provider-settings-loading">
        <RefreshCw className="animate-spin" size={48} />
        <p>Loading API settings...</p>
      </div>
    );
  }

  return (
    <div className="provider-settings">
      <header className="settings-header">
        <button className="back-button" onClick={() => navigate(webRoutes.logisticsProviderDashboard)}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="header-content">
          <Settings size={32} />
          <div>
            <h1>API Integration Settings</h1>
            <p>Configure your external shipping API to sync shipments and tracking</p>
          </div>
        </div>
      </header>

      {/* Test Result Banner */}
      {testResult && (
        <div className={`result-banner ${testResult.success ? 'success' : 'error'}`}>
          {testResult.success ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          <Key size={18} />
          API Configuration
        </button>
        <button
          className={`tab ${activeTab === 'webhooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('webhooks')}
        >
          <Webhook size={18} />
          Webhooks
        </button>
        <button
          className={`tab ${activeTab === 'docs' ? 'active' : ''}`}
          onClick={() => setActiveTab('docs')}
        >
          <Info size={18} />
          Documentation
        </button>
      </div>

      <div className="settings-content">
        {/* API Configuration Tab */}
        {activeTab === 'api' && (
          <div className="api-config-tab">
            {/* Enable Toggle */}
            <div className="settings-card">
              <div className="card-header">
                <Shield size={24} />
                <div>
                  <h3>API Integration</h3>
                  <p>Enable to sync with your external shipping system</p>
                </div>
              </div>
              <div className="toggle-row">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.api_integration_enabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, api_integration_enabled: e.target.checked }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className={`status-badge ${settings.api_integration_enabled ? 'enabled' : 'disabled'}`}>
                  {settings.api_integration_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Provider Type Selection */}
            <div className="settings-card">
              <div className="card-header">
                <Truck size={24} />
                <div>
                  <h3>Provider Type</h3>
                  <p>Select your shipping API provider</p>
                </div>
              </div>
              <div className="provider-type-grid">
                {PROVIDER_TYPES.map(type => (
                  <button
                    key={type.value}
                    className={`provider-type-option ${settings.api_provider_type === type.value ? 'selected' : ''} ${type.disabled ? 'disabled' : ''}`}
                    onClick={() => !type.disabled && setSettings(prev => ({ ...prev, api_provider_type: type.value }))}
                    disabled={type.disabled}
                  >
                    <span className="type-label">{type.label}</span>
                    <span className="type-description">{type.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* API Credentials - Different fields based on provider type */}
            <div className="settings-card">
              <div className="card-header">
                <Key size={24} />
                <div>
                  <h3>
                    {settings.api_provider_type === 'custom' ? 'Your API Credentials' : 
                     settings.api_provider_type === 'dhl' ? 'DHL Express Credentials' :
                     settings.api_provider_type === 'fedex' ? 'FedEx Credentials' : 'API Credentials'}
                  </h3>
                  <p>
                    {settings.api_provider_type === 'custom' 
                      ? 'Enter the credentials for your own shipping system API'
                      : settings.api_provider_type === 'dhl'
                      ? 'Get these from your DHL Developer Portal account'
                      : settings.api_provider_type === 'fedex'
                      ? 'Get these from your FedEx Developer Portal account'
                      : 'Your API authentication credentials'}
                  </p>
                </div>
              </div>
              
              {/* Custom API - needs Base URL */}
              {settings.api_provider_type === 'custom' && (
                <div className="form-group">
                  <label>API Base URL <span className="required">*</span></label>
                  <input
                    type="url"
                    placeholder="https://api.your-system.com/v1"
                    value={settings.api_base_url || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, api_base_url: e.target.value }))}
                  />
                  <span className="help-text">The base URL of your shipping API (e.g., https://api.yourcompany.com/v1)</span>
                </div>
              )}

              {/* DHL/FedEx - show their specific portal info */}
              {(settings.api_provider_type === 'dhl' || settings.api_provider_type === 'fedex') && (
                <div className="provider-info-banner">
                  <Info size={18} />
                  <div>
                    {settings.api_provider_type === 'dhl' ? (
                      <>
                        <strong>DHL Express API</strong>
                        <p>Get your credentials from <a href="https://developer.dhl.com" target="_blank" rel="noopener noreferrer">developer.dhl.com</a></p>
                      </>
                    ) : (
                      <>
                        <strong>FedEx Web Services</strong>
                        <p>Get your credentials from <a href="https://developer.fedex.com" target="_blank" rel="noopener noreferrer">developer.fedex.com</a></p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>
                  {settings.api_provider_type === 'dhl' ? 'DHL API Key' :
                   settings.api_provider_type === 'fedex' ? 'FedEx Client ID' : 'API Key'} 
                  <span className="required">*</span>
                </label>
                <div className="input-with-actions">
                  <input
                    type={showSecrets.api_key ? 'text' : 'password'}
                    placeholder={
                      settings.api_provider_type === 'dhl' ? 'Your DHL API Key' :
                      settings.api_provider_type === 'fedex' ? 'Your FedEx Client ID' : 'Your API key'
                    }
                    value={settings.api_key || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, api_key: e.target.value }))}
                  />
                  <button type="button" onClick={() => toggleShowSecret('api_key')}>
                    {showSecrets.api_key ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {settings.api_key && (
                    <button type="button" onClick={() => copyToClipboard(settings.api_key, 'API Key')}>
                      <Copy size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>
                  {settings.api_provider_type === 'dhl' ? 'DHL API Secret' :
                   settings.api_provider_type === 'fedex' ? 'FedEx Client Secret' : 'API Secret'}
                  {(settings.api_provider_type === 'dhl' || settings.api_provider_type === 'fedex') && <span className="required">*</span>}
                </label>
                <div className="input-with-actions">
                  <input
                    type={showSecrets.api_secret ? 'text' : 'password'}
                    placeholder={
                      settings.api_provider_type === 'dhl' ? 'Your DHL API Secret' :
                      settings.api_provider_type === 'fedex' ? 'Your FedEx Client Secret' : 'Your API secret (optional)'
                    }
                    value={settings.api_secret || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, api_secret: e.target.value }))}
                  />
                  <button type="button" onClick={() => toggleShowSecret('api_secret')}>
                    {showSecrets.api_secret ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Account ID - Required for DHL/FedEx, Optional for Custom */}
              <div className="form-group">
                <label>
                  {settings.api_provider_type === 'dhl' ? 'DHL Account Number' :
                   settings.api_provider_type === 'fedex' ? 'FedEx Account Number' : 'Account ID'}
                  {(settings.api_provider_type === 'dhl' || settings.api_provider_type === 'fedex') && <span className="required">*</span>}
                  {settings.api_provider_type === 'custom' && ' (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={
                    settings.api_provider_type === 'dhl' ? 'Your 9-digit DHL account number' :
                    settings.api_provider_type === 'fedex' ? 'Your FedEx account number' : 'Your account or merchant ID'
                  }
                  value={settings.api_account_id || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, api_account_id: e.target.value }))}
                />
                <span className="help-text">
                  {settings.api_provider_type === 'dhl' ? 'Your DHL shipper account number for billing' :
                   settings.api_provider_type === 'fedex' ? 'Your FedEx account number for shipping and billing' :
                   'Optional identifier for your account'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="btn-secondary"
                onClick={handleTestConnection}
                disabled={testing || !settings.api_integration_enabled || !settings.api_key}
              >
                {testing ? <RefreshCw className="animate-spin" size={18} /> : <TestTube2 size={18} />}
                Test Connection
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div className="webhooks-tab">
            {/* Incoming Webhooks */}
            <div className="settings-card">
              <div className="card-header">
                <Webhook size={24} />
                <div>
                  <h3>Incoming Webhooks</h3>
                  <p>Configure how your external system sends updates to us</p>
                </div>
              </div>

              <div className="form-group">
                <label>Your Webhook URL</label>
                <div className="input-with-actions readonly">
                  <input
                    type="text"
                    readOnly
                    value={getWebhookReceiverUrl()}
                  />
                  <button type="button" onClick={() => copyToClipboard(getWebhookReceiverUrl(), 'Webhook URL')}>
                    <Copy size={18} />
                  </button>
                </div>
                <span className="help-text">
                  Configure your external system to send POST requests to this URL
                </span>
              </div>

              <div className="form-group">
                <label>Webhook Secret</label>
                <div className="input-with-actions">
                  <input
                    type={showSecrets.api_webhook_secret ? 'text' : 'password'}
                    readOnly
                    value={settings.api_webhook_secret || ''}
                    placeholder="Click 'Generate' to create a secret"
                  />
                  {settings.api_webhook_secret && (
                    <>
                      <button type="button" onClick={() => toggleShowSecret('api_webhook_secret')}>
                        {showSecrets.api_webhook_secret ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button type="button" onClick={() => copyToClipboard(settings.api_webhook_secret, 'Webhook Secret')}>
                        <Copy size={18} />
                      </button>
                    </>
                  )}
                </div>
                <button
                  className="btn-secondary small"
                  onClick={handleGenerateWebhookSecret}
                  disabled={generatingSecret}
                >
                  {generatingSecret ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                  Generate New Secret
                </button>
                <span className="help-text">
                  Use this secret to sign webhook requests with HMAC-SHA256
                </span>
              </div>
            </div>

            {/* Outgoing Webhooks */}
            <div className="settings-card">
              <div className="card-header">
                <LinkIcon size={24} />
                <div>
                  <h3>Outgoing Webhooks</h3>
                  <p>Configure where we send updates about your shipments</p>
                </div>
              </div>

              <div className="form-group">
                <label>Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://your-system.com/webhooks/connectize"
                  value={settings.webhook_url || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, webhook_url: e.target.value }))}
                />
                <span className="help-text">We'll send shipment updates to this URL</span>
              </div>

              <div className="form-group">
                <label>Events to Send</label>
                <div className="webhook-events-grid">
                  {WEBHOOK_EVENTS.map(event => (
                    <label key={event.value} className="event-checkbox">
                      <input
                        type="checkbox"
                        checked={(settings.webhook_events || []).includes(event.value)}
                        onChange={() => handleWebhookEventToggle(event.value)}
                      />
                      <span className="checkbox-custom"></span>
                      <div className="event-info">
                        <span className="event-label">{event.label}</span>
                        <span className="event-description">{event.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                Save Webhook Settings
              </button>
            </div>

            {/* Webhook Logs */}
            <div className="settings-card">
              <div className="card-header">
                <Clock size={24} />
                <div>
                  <h3>Recent Webhook Events</h3>
                  <p>Log of incoming and outgoing webhook calls</p>
                </div>
                <button className="btn-icon" onClick={fetchWebhookLogs}>
                  <RefreshCw size={18} />
                </button>
              </div>

              {webhookLogs.length === 0 ? (
                <div className="empty-logs">
                  <Info size={32} />
                  <p>No webhook events yet</p>
                </div>
              ) : (
                <div className="webhook-logs-list">
                  {webhookLogs.map((log, index) => (
                    <div key={index} className={`webhook-log-item ${log.success ? 'success' : 'failed'}`}>
                      <div className="log-header">
                        <span className={`direction-badge ${log.direction}`}>
                          {log.direction === 'incoming' ? '← IN' : '→ OUT'}
                        </span>
                        <span className="event-type">{log.event_type}</span>
                        <span className={`status-badge ${log.success ? 'success' : 'failed'}`}>
                          {log.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {log.response_status}
                        </span>
                      </div>
                      <div className="log-time">{new Date(log.created_at).toLocaleString()}</div>
                      {log.error_message && (
                        <div className="log-error">
                          <AlertTriangle size={14} />
                          {log.error_message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documentation Tab */}
        {activeTab === 'docs' && (
          <div className="docs-tab">
            <div className="settings-card">
              <div className="card-header">
                <Info size={24} />
                <div>
                  <h3>API Integration Guide</h3>
                  <p>How to integrate your shipping system with Connectize</p>
                </div>
              </div>

              <div className="docs-content">
                <h4>Overview</h4>
                <p>
                  The API integration allows you to connect your existing shipping management system 
                  with Connectize. This enables automatic synchronization of:
                </p>
                <ul>
                  <li>Shipment creation and tracking</li>
                  <li>Real-time status updates</li>
                  <li>Rate quotes and pricing</li>
                  <li>Delivery confirmations</li>
                </ul>

                <h4>Supported Integrations</h4>
                <p>We support the following integration types:</p>
                <ul>
                  <li><strong>Custom API:</strong> Connect any REST API that follows our specification</li>
                  <li><strong>DHL Express:</strong> Direct integration with DHL Express API</li>
                  <li><strong>FedEx:</strong> Direct integration with FedEx Web Services</li>
                  <li><strong>UPS, Maersk:</strong> Coming soon</li>
                </ul>

                <h4>Webhook Payload Format</h4>
                <p>When sending webhooks to our endpoint, use this format:</p>
                <pre className="code-block">
{`POST ${getWebhookReceiverUrl()}
Content-Type: application/json
X-Webhook-Signature: <HMAC-SHA256 signature>

{
  "event": "shipment.delivered",
  "tracking_number": "TRACK123456",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "status": "delivered",
    "location": "New York, NY",
    "signed_by": "John Doe"
  }
}`}
                </pre>

                <h4>Generating Webhook Signature</h4>
                <p>Sign your webhook payloads using HMAC-SHA256:</p>
                <pre className="code-block">
{`import hmac
import hashlib

secret = "your_webhook_secret"
payload = '{"event": "shipment.delivered", ...}'

signature = hmac.new(
    secret.encode(),
    payload.encode(),
    hashlib.sha256
).hexdigest()

# Add to headers: X-Webhook-Signature: <signature>`}
                </pre>

                <h4>Need Help?</h4>
                <p>
                  Contact our integration team at <a href="mailto:integrations@connectize.com">integrations@connectize.com</a> for 
                  assistance setting up your API integration.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderSettings;
