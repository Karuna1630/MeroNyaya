import axios from 'axios';

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance for chat API
const chatAPI = axios.create({
  baseURL: `${API_BASE_URL}/chat`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add JWT token
chatAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Get all conversations for the current user
 * @returns {Promise} List of user's conversations
 */
export const getMyConversations = () =>
  chatAPI.get('/conversations/my_conversations/');

/**
 * Get conversation details for a specific case
 * @param {number} caseId - The case ID
 * @returns {Promise} Conversation with messages
 */
export const getCaseConversation = (caseId) =>
  chatAPI.get(`/conversations/case_conversation/?case_id=${caseId}`);

/**
 * Send a message to a case conversation
 * @param {number} caseId - The case ID
 * @param {string} content - Message content
 * @returns {Promise} Created message object
 */
export const sendMessage = (caseId, content) =>
  chatAPI.post('/conversations/send_message/', {
    case_id: caseId,
    content,
  });

/**
 * Mark a specific message as read
 * @param {number} messageId - The message ID
 * @returns {Promise} Updated message object
 */
export const markMessageRead = (messageId) =>
  chatAPI.post('/conversations/mark_message_read/', {
    message_id: messageId,
  });

/**
 * Get count of unread messages
 * @returns {Promise} Unread count
 */
export const getUnreadCount = () =>
  chatAPI.get('/conversations/unread_count/');

export default chatAPI;
