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
 * Get all conversations (grouped by user)
 * @returns {Promise} List of conversations
 */
export const getConversations = () =>
  chatAPI.get('/conversations/');

/**
 * Get all messages with a specific user
 * @param {number} userId - The other user's ID
 * @returns {Promise} Messages and user info
 */
export const getMessages = (userId) =>
  chatAPI.get(`/conversations/${userId}/messages/`);

/**
 * Send a message to a specific user
 * @param {number} userId - The other user's ID
 * @param {string} content - Message content
 * @returns {Promise} Created message object
 */
export const sendMessage = (userId, content) =>
  chatAPI.post(`/conversations/${userId}/messages/`, { content });

/**
 * Send a voice message to a specific user
 * @param {number} userId - The other user's ID
 * @param {FormData} formData - FormData containing audio file
 * @returns {Promise} Created voice message object
 */
export const sendVoiceMessage = (userId, formData) =>
  chatAPI.post(`/conversations/${userId}/messages/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

/**
 * Mark all messages from a specific user as read
 * @param {number} userId - The other user's ID
 * @returns {Promise} Response with marked count
 */
export const markConversationAsRead = (userId) =>
  chatAPI.post(`/conversations/${userId}/mark-read/`);

export default chatAPI;
