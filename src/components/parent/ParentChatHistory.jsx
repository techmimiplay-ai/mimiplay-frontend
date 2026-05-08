import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config';
import { showToast } from '../../utils/toast';
import { exportChatHistory } from '../../utils/exportUtils';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

const ParentChatHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [childName, setChildName] = useState('');
  const [filters, setFilters] = useState({
    date: '',
    limit: 20
  });

  const parentId = localStorage.getItem('userId') || localStorage.getItem('user_id');

  useEffect(() => {
    if (parentId) {
      fetchChatHistory();
    }
  }, [parentId, filters]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('parent_id', parentId);
      if (filters.date) params.append('date', filters.date);
      params.append('limit', filters.limit);

      const response = await axios.get(`${API_ENDPOINTS.PARENT_CHILD_CHAT_HISTORY}?${params}`);
      
      if (response.data.status === 'success') {
        setSessions(response.data.sessions || []);
        setChildName(response.data.child_name || '');
      } else {
        showToast.error(response.data.message || 'Failed to load chat history');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      if (error.response?.status === 404) {
        showToast.warning('No child linked to your account');
      } else {
        showToast.error('Error loading chat history');
      }
    } finally {
      setLoading(false);
    }
  };

  const viewSessionDetails = (session) => {
    setSelectedSession(session);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end - start;
      const diffMins = Math.round(diffMs / 60000);
      return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    } catch {
      return 'N/A';
    }
  };

  const getTopicsDiscussed = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    // Extract first few words from questions to show topics
    return messages.slice(0, 3).map(msg => {
      const question = msg.question || '';
      const words = question.split(' ').slice(0, 4).join(' ');
      return words.length > 0 ? words + (question.length > words.length ? '...' : '') : 'Question';
    });
  };

  const handleExport = async (format) => {
    try {
      let success = false;
      const filename = `${childName || 'child'}-chat-history-${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'csv':
          success = exportChatHistory.toCSV(sessions, filename);
          break;
        case 'pdf':
          success = exportChatHistory.toPDF(sessions, filename, { includeConversations: true });
          break;
        default:
          showToast.error('Invalid export format');
          return;
      }
      
      if (success) {
        showToast.success(`${childName}'s chat history exported as ${format.toUpperCase()}`);
      } else {
        showToast.error('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast.error('Export failed. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          💬 {childName ? `${childName}'s` : 'My Child\'s'} Chat History
        </h2>
        <p className="text-gray-600 mb-4">
          View your child's conversations with Alexi AI tutor
        </p>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Sessions
            </label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={10}>Last 10 sessions</option>
              <option value={20}>Last 20 sessions</option>
              <option value={50}>Last 50 sessions</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchChatHistory}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          🔍 Refresh
        </button>
        
        {/* Export Buttons */}
        {sessions.length > 0 && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              <FileSpreadsheet size={14} />
              CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              <FileText size={14} />
              PDF
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading chat sessions...</p>
        </div>
      )}

      {/* Sessions List */}
      {!loading && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-lg font-medium">No chat sessions found</p>
              <p className="text-sm">
                {childName ? `${childName} hasn't` : 'Your child hasn\'t'} had any conversations with Alexi yet
              </p>
            </div>
          ) : (
            sessions.map((session, index) => (
              <div
                key={session.session_id || index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-purple-50 to-pink-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg text-gray-800">
                        🗓️ {session.date || 'Unknown Date'}
                      </h3>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        {session.total_messages} questions asked
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">🕐 Started:</span>
                        <br />
                        <span className="text-xs">{formatDate(session.started_at)}</span>
                      </div>
                      <div>
                        <span className="font-medium">⏱️ Duration:</span>
                        <br />
                        <span className="text-xs">{formatDuration(session.started_at, session.updated_at)}</span>
                      </div>
                      <div>
                        <span className="font-medium">💭 Questions:</span>
                        <br />
                        <span className="text-xs">{session.total_messages} conversations</span>
                      </div>
                    </div>

                    {/* Topics Preview */}
                    {session.messages && session.messages.length > 0 && (
                      <div className="p-3 bg-white/70 rounded-md border border-purple-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">📚 Topics Discussed:</p>
                        <div className="flex flex-wrap gap-2">
                          {getTopicsDiscussed(session.messages).map((topic, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                            >
                              {topic}
                            </span>
                          ))}
                          {session.total_messages > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{session.total_messages - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <button 
                      onClick={() => viewSessionDetails(session)}
                      className="px-4 py-2 bg-purple-100 text-purple-800 text-sm rounded-md hover:bg-purple-200 transition-colors font-medium"
                    >
                      View Full Chat →
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Session Details Modal */}
      {showModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    💬 {childName}'s Chat with Alexi
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Session from {selectedSession.date}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">🕐 Started:</span>
                  <p className="text-xs">{formatDate(selectedSession.started_at)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">⏱️ Duration:</span>
                  <p className="text-xs">{formatDuration(selectedSession.started_at, selectedSession.updated_at)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">💭 Questions:</span>
                  <p className="text-xs">{selectedSession.total_messages} asked</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">🎯 Learning:</span>
                  <p className="text-xs">Interactive Q&A</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <h4 className="font-semibold text-gray-800 mb-4">Full Conversation:</h4>
              
              {selectedSession.messages && selectedSession.messages.length > 0 ? (
                <div className="space-y-4">
                  {selectedSession.messages.map((msg, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-200">
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                            Q{index + 1} • {msg.time || 'N/A'}
                          </span>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-300">
                          <p className="font-medium text-blue-800 text-sm mb-1">
                            👦 {childName} asked:
                          </p>
                          <p className="text-gray-800">
                            "{msg.question || 'No question recorded'}"
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-md border-l-4 border-green-300">
                        <p className="font-medium text-green-800 text-sm mb-1">
                          🤖 Alexi responded:
                        </p>
                        <p className="text-gray-800">
                          "{msg.answer || 'No answer recorded'}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No messages found in this session</p>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                💡 <strong>Tip:</strong> Regular conversations help improve your child's curiosity and learning!
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentChatHistory;