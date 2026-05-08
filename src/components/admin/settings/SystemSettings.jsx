import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config';
import { apiRequest } from '../../../utils/api';
import { Card, Button } from '../../../components/shared';
import { Save, Database, Cloud, Shield, Bell, MessageCircle, Lock } from 'lucide-react';
import WhatsAppSettings from '../WhatsAppSettings';
import { useToast } from '../../../context/ToastContext';
import { useAppSettings } from '../../../hooks/useAppSettings';

const SystemSettings = () => {
  const toast = useToast();
  const { refetch: refetchAppSettings } = useAppSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    autoApproval: false,
    emailNotifications: true,
    backupFrequency: 'daily',
    maxStudentsPerClass: 20,
    sessionTimeout: 30,
    debugMode: false
  });
  const [featureFlags, setFeatureFlags] = useState({
    chatEnabled: true,
    activitiesEnabled: true,
    whatsappEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Shield },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'backup', label: 'Backup', icon: Database },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('get', API_ENDPOINTS.ADMIN_SETTINGS);
      if (res?.status === 'success') {
        setSettings(res.settings);
        if (res.feature_flags) setFeatureFlags(res.feature_flags);
      }
    } catch (err) {
      console.error('Settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await apiRequest('post', API_ENDPOINTS.ADMIN_SETTINGS, {
        ...settings,
        feature_flags: featureFlags,
      });
      if (res?.status === 'success') {
        refetchAppSettings(); // bust the module-level cache
        toast('Settings saved successfully!', 'success');
      } else {
        toast('Failed to save settings', 'error');
      }
    } catch (err) {
      console.error('Settings save error:', err);
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">System Settings</h1>
        <p className="text-text/60">Configure system-wide settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors
                ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <Card>
          <h2 className="text-xl sm:text-2xl font-bold text-text mb-4 flex items-center gap-2">
            <Shield size={24} className="text-primary-600" />
            General Settings
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-2xl">
              <div>
                <h4 className="font-semibold text-text">Auto-Approve Teachers</h4>
                <p className="text-sm text-text/60">Automatically approve teacher registrations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.autoApproval}
                  onChange={(e) => setSettings({ ...settings, autoApproval: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={16} className="text-red-600" />
                <h4 className="font-bold text-red-800">Feature Controls</h4>
                <span className="text-xs text-red-600 font-semibold ml-1">— disabling stops access for ALL users instantly</span>
              </div>
              {[
                { key: 'chatEnabled',       label: 'Mimi Chat',              desc: 'AI chat sessions for teachers and parents' },
                { key: 'activitiesEnabled', label: 'Learning Activities',     desc: 'All 12 activity types' },
                { key: 'whatsappEnabled',   label: 'WhatsApp Notifications',  desc: 'Activity results and chat history messages' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text text-sm">{label}</p>
                    <p className="text-xs text-text/60">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={featureFlags[key]}
                      onChange={(e) => setFeatureFlags({ ...featureFlags, [key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl">
              <label className="block text-sm font-semibold text-text mb-2">
                Maximum Students Per Class
              </label>
              <input
                type="number"
                value={settings.maxStudentsPerClass}
                onChange={(e) => setSettings({ ...settings, maxStudentsPerClass: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl">
              <label className="block text-sm font-semibold text-text mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
              />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'whatsapp' && <WhatsAppSettings />}

      {activeTab === 'notifications' && (
        <Card>
          <h2 className="text-xl sm:text-2xl font-bold text-text mb-4 flex items-center gap-2">
            <Bell size={24} className="text-primary-600" />
            Email Notifications
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-2xl">
            <div>
              <h4 className="font-semibold text-text">Email Notifications</h4>
              <p className="text-sm text-text/60">Send email notifications for important events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </Card>
      )}

      {activeTab === 'backup' && (
        <Card>
          <h2 className="text-xl sm:text-2xl font-bold text-text mb-4 flex items-center gap-2">
            <Database size={24} className="text-primary-600" />
            Backup & Storage
          </h2>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <label className="block text-sm font-semibold text-text mb-2">
              Automatic Backup Frequency
            </label>
            <select
              value={settings.backupFrequency}
              onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </Card>
      )}

      {/* Save Button - Only show for non-WhatsApp tabs */}
      {activeTab !== 'whatsapp' && (
        <div className="flex justify-end">
          <Button variant="primary" icon={Save} size="lg" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
