import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config';
import { showToast } from '../../utils/toast';
import { Download, MessageSquare, Settings, BarChart3, Edit, Trash2 } from 'lucide-react';

const WhatsAppManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [deliveryStats, setDeliveryStats] = useState({
    totalSent: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    successRate: 0
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [messageTemplates, setMessageTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'delivery', label: 'Delivery Status', icon: MessageSquare },
    { id: 'templates', label: 'Message Templates', icon: Edit },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    fetchWhatsAppData();
  }, []);

  const fetchWhatsAppData = async () => {
    try {
      setLoading(true);
      
      // Fetch delivery statistics
      const statsResponse = await axios.get(API_ENDPOINTS.WHATSAPP_DELIVERY_STATS);
      if (statsResponse.data.status === 'success') {
        setDeliveryStats(statsResponse.data.stats);
      }

      const messagesResponse = await axios.get(API_ENDPOINTS.WHATSAPP_RECENT_MESSAGES);
      if (messagesResponse.data.status === 'success') {
        setRecentMessages(messagesResponse.data.messages);
      }

      const templatesResponse = await axios.get(API_ENDPOINTS.WHATSAPP_TEMPLATES);
      if (templatesResponse.data.status === 'success') {
        setMessageTemplates(templatesResponse.data.templates);
      }

    } catch (error) {
      console.error('Error fetching WhatsApp data:', error);
      showToast.error('Failed to load WhatsApp data');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (template) => {
    try {
      const response = await axios.post(API_ENDPOINTS.WHATSAPP_TEMPLATES, template);
      if (response.data.status === 'success') {
        showToast.success('Template saved successfully');
        setEditingTemplate(null);
        fetchWhatsAppData();
      }
    } catch (error) {
      showToast.error('Failed to save template');
    }
  };

  const deleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await axios.delete(API_ENDPOINTS.WHATSAPP_DELETE_TEMPLATE(templateId));
      showToast.success('Template deleted successfully');
      fetchWhatsAppData();
    } catch (error) {
      showToast.error('Failed to delete template');
    }
  };

  const exportDeliveryReport = async (format) => {
    try {
      const response = await axios.get(API_ENDPOINTS.WHATSAPP_EXPORT_REPORT(format), {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `whatsapp-delivery-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast.success(`Delivery report exported as ${format.toUpperCase()}`);
    } catch (error) {
      showToast.error('Failed to export delivery report');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading WhatsApp management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📱 WhatsApp Management</h2>
        <p className="text-gray-600">
          Comprehensive WhatsApp management, delivery tracking, and templates
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
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
                    ? 'bg-green-100 text-green-700 border-b-2 border-green-600'
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Sent</p>
                  <p className="text-2xl font-bold text-blue-800">{deliveryStats.totalSent}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-800">{deliveryStats.delivered}</p>
                </div>
                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Failed</p>
                  <p className="text-2xl font-bold text-red-800">{deliveryStats.failed}</p>
                </div>
                <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✗</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-800">{deliveryStats.successRate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => exportDeliveryReport('csv')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download size={16} />
                Export CSV Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Status Tab */}
      {activeTab === 'delivery' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Recent Message Delivery Status</h3>
            <button
              onClick={fetchWhatsAppData}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentMessages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No recent messages found
                    </td>
                  </tr>
                ) : (
                  recentMessages.map((message, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{message.recipient_name}</p>
                          <p className="text-sm text-gray-600">{message.phone_number}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {message.message_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(message.status)}`}>
                          {message.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(message.sent_at)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {message.message_preview}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Message Templates</h3>
            <button
              onClick={() => setEditingTemplate({ id: null, name: '', type: 'activity', content: '', variables: [] })}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              + Add Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {messageTemplates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{template.name}</h4>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {template.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="text-gray-700">{template.content}</p>
                </div>
                
                {template.variables && template.variables.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable, idx) => (
                        <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Template Editor Modal */}
          {editingTemplate && (
            <TemplateEditor
              template={editingTemplate}
              onSave={saveTemplate}
              onCancel={() => setEditingTemplate(null)}
            />
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ WhatsApp Configuration</h3>
            <p className="text-yellow-700 text-sm mb-3">
              Configure your Twilio WhatsApp credentials and settings here.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twilio Account SID
                </label>
                <input
                  type="text"
                  placeholder="AC..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twilio Auth Token
                </label>
                <input
                  type="password"
                  placeholder="Enter auth token..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Phone Number
                </label>
                <input
                  type="text"
                  placeholder="whatsapp:+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Template Editor Component
const TemplateEditor = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState(template);

  const handleSave = () => {
    if (!formData.name || !formData.content) {
      showToast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {template.id ? 'Edit Template' : 'Create Template'}
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Activity Completion"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="activity">Activity Completion</option>
              <option value="chat_history">Chat History</option>
              <option value="daily_report">Daily Report</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your message template here. Use variables like {student_name}, {activity_name}, {stars}, etc."
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800 font-medium mb-1">Available Variables:</p>
            <p className="text-xs text-blue-700">
              {'{student_name}, {activity_name}, {stars}, {score}, {date}, {time}, {total_questions}, {session_duration}'}
            </p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppManagement;