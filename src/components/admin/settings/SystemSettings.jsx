

import React, { useState } from 'react';
import { Card, Button } from '../../../components/shared';
import { Save, Database, Cloud, Shield, Bell } from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    autoApproval: false,
    emailNotifications: true,
    backupFrequency: 'daily',
    maxStudentsPerClass: 20,
    sessionTimeout: 30,
    debugMode: false
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">System Settings</h1>
        <p className="text-text/60">Configure system-wide settings</p>
      </div>

      {/* General Settings */}
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

      {/* Notifications */}
      <Card>
        <h2 className="text-xl sm:text-2xl font-bold text-text mb-4 flex items-center gap-2">
          <Bell size={24} className="text-primary-600" />
          Notifications
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

      {/* Backup */}
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

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" icon={Save} size="lg" onClick={handleSave}>
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;
