import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { showToast } from '../../utils/toast';

const WhatsAppSettings = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    whatsappEnabled: true,
    activityNotifications: true,
    chatHistoryNotifications: true,
    dailyReports: false
  });


  useEffect(() => {
    fetchParents();
    fetchGlobalSettings();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/all-users`);
      
      if (Array.isArray(response.data)) {
        const parentUsers = response.data.filter(user => user.role === 'parent');
        setParents(parentUsers.map(parent => ({
          ...parent,
          whatsappEnabled: parent.whatsapp_enabled !== false, // Default to true
          activityNotifications: parent.activity_notifications !== false,
          chatHistoryNotifications: parent.chat_history_notifications !== false
        })));
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
      showToast.error('Failed to load parent list');
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/settings`);
      if (response.data?.whatsapp_settings) {
        setGlobalSettings(response.data.whatsapp_settings);
      }
    } catch (error) {
      console.error('Error fetching global settings:', error);
    }
  };

  const updateParentWhatsAppSettings = async (parentId, settings) => {
    try {
      setSaving(true);
      await axios.put(`${API_BASE_URL}/api/admin/edit-parent/${parentId}`, {
        whatsapp_enabled: settings.whatsappEnabled,
        activity_notifications: settings.activityNotifications,
        chat_history_notifications: settings.chatHistoryNotifications
      });

      setParents(prev => prev.map(parent => 
        parent._id === parentId 
          ? { ...parent, ...settings }
          : parent
      ));

      showToast.success('Parent WhatsApp settings updated');
    } catch (error) {
      console.error('Error updating parent settings:', error);
      showToast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const updateGlobalSettings = async (newSettings) => {
    try {
      setSaving(true);
      await axios.put(`${API_BASE_URL}/api/admin/settings`, {
        whatsapp_settings: newSettings
      });

      setGlobalSettings(newSettings);
      showToast.success('Global WhatsApp settings updated');
    } catch (error) {
      console.error('Error updating global settings:', error);
      showToast.error('Failed to update global settings');
    } finally {
      setSaving(false);
    }
  };

  const bulkUpdateParents = async (enabled) => {
    try {
      setSaving(true);
      const updates = parents.map(parent => 
        updateParentWhatsAppSettings(parent._id, {
          ...parent,
          whatsappEnabled: enabled
        })
      );
      
      await Promise.all(updates);
      showToast.success(`WhatsApp ${enabled ? 'enabled' : 'disabled'} for all parents`);
    } catch (error) {
      showToast.error('Failed to bulk update parents');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📱 WhatsApp Settings</h2>
        <p className="text-gray-600">
          Manage WhatsApp notifications for parents and global settings
        </p>
      </div>

      {/* Global Settings */}
      <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🌐 Global WhatsApp Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-md border">
            <div>
              <p className="font-medium text-gray-800">WhatsApp Service</p>
              <p className="text-sm text-gray-600">Enable/disable entire WhatsApp service</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globalSettings.whatsappEnabled}
                onChange={(e) => updateGlobalSettings({
                  ...globalSettings,
                  whatsappEnabled: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-md border">
            <div>
              <p className="font-medium text-gray-800">Activity Notifications</p>
              <p className="text-sm text-gray-600">Send activity completion messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globalSettings.activityNotifications}
                onChange={(e) => updateGlobalSettings({
                  ...globalSettings,
                  activityNotifications: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-md border">
            <div>
              <p className="font-medium text-gray-800">Chat History</p>
              <p className="text-sm text-gray-600">Send chat summaries on session end</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globalSettings.chatHistoryNotifications}
                onChange={(e) => updateGlobalSettings({
                  ...globalSettings,
                  chatHistoryNotifications: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-md border">
            <div>
              <p className="font-medium text-gray-800">Daily Reports</p>
              <p className="text-sm text-gray-600">Send daily attendance reports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globalSettings.dailyReports}
                onChange={(e) => updateGlobalSettings({
                  ...globalSettings,
                  dailyReports: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => bulkUpdateParents(true)}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            📢 Enable All Parents
          </button>
          
          <button
            onClick={() => bulkUpdateParents(false)}
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
          >
            🔇 Disable All Parents
          </button>
        </div>
      </div>

      {/* Parent Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">👨‍👩‍👧‍👦 Individual Parent Settings</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading parents...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {parents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">👥 No parents found</p>
                <p className="text-sm">Parents will appear here once they register</p>
              </div>
            ) : (
              parents.map((parent) => (
                <div
                  key={parent._id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {parent.name || 'Unnamed Parent'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        📧 {parent.email || 'No email'} • 📱 {parent.phone || 'No phone'}
                      </p>
                      <p className="text-sm text-gray-600">
                        👦 Child: {parent.child_name || 'Not linked'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        parent.whatsappEnabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {parent.whatsappEnabled ? '✅ Enabled' : '❌ Disabled'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm font-medium">WhatsApp</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parent.whatsappEnabled}
                          onChange={(e) => updateParentWhatsAppSettings(parent._id, {
                            ...parent,
                            whatsappEnabled: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm font-medium">Activities</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parent.activityNotifications}
                          onChange={(e) => updateParentWhatsAppSettings(parent._id, {
                            ...parent,
                            activityNotifications: e.target.checked
                          })}
                          disabled={!parent.whatsappEnabled}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600 peer-disabled:bg-gray-300"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm font-medium">Chat History</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={parent.chatHistoryNotifications}
                          onChange={(e) => updateParentWhatsAppSettings(parent._id, {
                            ...parent,
                            chatHistoryNotifications: e.target.checked
                          })}
                          disabled={!parent.whatsappEnabled}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600 peer-disabled:bg-gray-300"></div>
                      </label>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Saving settings...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppSettings;