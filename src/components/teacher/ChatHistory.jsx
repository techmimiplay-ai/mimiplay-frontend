import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config';
import { showToast } from '../../utils/toast';
import { exportChatHistory } from '../../utils/exportUtils';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

const ChatHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    studentName: '',
    date: '',
    limit: 50
  });

  useEffect(() => {
    fetchChatHistory();
  }, [filters]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.studentName) params.append('student_name', filters.studentName);
      if (filters.date) params.append('date', filters.date);
      params.append('limit', filters.limit);

      const response = await axios.get(`${API_ENDPOINTS.TEACHER_CHAT_HISTORY}?${params}`);
      
      if (response.data.status === 'success') {
        setSessions(response.data.sessions || []);
      } else {
        showToast.error('Failed to load chat history');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      showToast.error('Error loading chat history');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.TEACHER_CHAT_SESSION_DETAILS}?session_id=${sessionId}`);
      
      if (response.data.status === 'success') {
        setSelectedSession(response.data.session);
        setShowModal(true);
      } else {
        showToast.error('Failed to load session details');
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      showToast.error('Error loading session details');
    }
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

  const handleExport = async (format) => {
    try {
      let success = false;
      const filename = `teacher-chat-history-${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'csv':
          success = exportChatHistory.toCSV(sessions, filename);
          break;
        case 'pdf':
          success = exportChatHistory.toPDF(sessions, filename);
          break;
        case 'detailed-pdf':
          success = exportChatHistory.toPDF(sessions, filename, { includeConversations: true });
          break;
        default:
          showToast.error('Invalid export format');
          return;
      }
      
      if (success) {
        showToast.success(`Chat history exported as ${format.toUpperCase()}`);
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">💬 Student Chat History</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Name
            </label>
            <input
              type="text"
              value={filters.studentName}
              onChange={(e) => setFilters(prev => ({ ...prev, studentName: e.target.value }))}
              placeholder="Enter student name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={20}>20 sessions</option>
              <option value={50}>50 sessions</option>
              <option value={100}>100 sessions</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchChatHistory}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          🔍 Search
        </button>
        
        {/* Export Buttons */}
        {sessions.length > 0 && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet size={16} />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FileText size={16} />
              Export PDF
            </button>
            <button
              onClick={() => handleExport('detailed-pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Download size={16} />
              Detailed PDF
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading chat sessions...</p>
        </div>
      )}

      {/* Sessions List */}
      {!loading && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">📭 No chat sessions found</p>
              <p className="text-sm">Try adjusting your search filters</p>
            </div>
          ) : (
            sessions.map((session, index) => (
              <div
                key={session.session_id || index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => fetchSessionDetails(session.session_id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        👦 {session.student_name || 'Unknown Student'}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {session.total_messages} questions
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">📅 Date:</span>
                        <br />
                        {session.date || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">🕐 Started:</span>
                        <br />
                        {formatDate(session.started_at)}
                      </div>
                      <div>
                        <span className="font-medium">⏱️ Duration:</span>
                        <br />
                        {formatDuration(session.started_at, session.updated_at)}
                      </div>
                      <div>
                        <span className="font-medium">💬 Messages:</span>
                        <br />
                        {session.total_messages} Q&As
                      </div>
                    </div>

                    {/* Preview of recent messages */}
                    {session.messages && session.messages.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-700 mb-1">Recent Questions:</p>
                        <div className="space-y-1">
                          {session.messages.slice(0, 2).map((msg, idx) => (
                            <p key={idx} className="text-sm text-gray-600 truncate">
                              • {msg.question || 'No question'}
                            </p>
                          ))}
                          {session.has_more_messages && (
                            <p className="text-xs text-blue-600">+ {session.total_messages - 2} more questions...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <button className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md hover:bg-green-200 transition-colors">
                      View Details →
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
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  💬 Chat Session: {selectedSession.student_name}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">📅 Date:</span>
                  <p>{selectedSession.date}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">🕐 Started:</span>
                  <p>{formatDate(selectedSession.started_at)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">⏱️ Duration:</span>
                  <p>{formatDuration(selectedSession.started_at, selectedSession.updated_at)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">💬 Total:</span>
                  <p>{selectedSession.total_messages} questions</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <h4 className="font-semibold text-gray-800 mb-4">Conversation History:</h4>
              
              {selectedSession.messages && selectedSession.messages.length > 0 ? (
                <div className="space-y-4">
                  {selectedSession.messages.map((msg, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-1">
                          Q{index + 1} • {msg.time || 'N/A'}
                        </span>
                        <p className="font-medium text-gray-800">
                          🙋‍♂️ <strong>Student:</strong> {msg.question || 'No question recorded'}
                        </p>
                      </div>
                      <div className="ml-4">
                        <p className="text-gray-700">
                          🤖 <strong>Alexi:</strong> {msg.answer || 'No answer recorded'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No messages found in this session</p>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
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

export default ChatHistory;