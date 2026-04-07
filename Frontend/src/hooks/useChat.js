import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Custom hook for WebSocket chat functionality
 * Connects per user-pair for unified messaging
 *
 * @param {number} userId - The other user's ID
 * @param {string} token - JWT token for authentication
 * @returns {Object} Chat state and methods
 */
export const useChat = (userId, token) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const messageIdsRef = useRef(new Set());
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  /**
   * Connect to WebSocket
   */
  useEffect(() => {
    if (!userId || !token) {
      setIsLoading(false);
      return;
    }

    const connectWebSocket = () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://meronyaya.onrender.com/api';
        const wsProtocol = apiUrl.includes('https') ? 'wss:' : 'ws:';
        const wsHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/api$/, '');
        const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/user/${userId}/?token=${token}`;

        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
          console.log('Chat WebSocket connected');
          setIsConnected(true);
          setError(null);
          setIsLoading(false);
          reconnectAttemptsRef.current = 0;
        };

        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'initial_messages') {
              const msgs = data.messages || [];
              messageIdsRef.current.clear();
              msgs.forEach((msg) => messageIdsRef.current.add(msg.id));
              setMessages(msgs);
            } else if (data.type === 'new_message') {
              const messageId = data.message?.id;
              if (messageId && !messageIdsRef.current.has(messageId)) {
                messageIdsRef.current.add(messageId);
                setMessages((prev) => [...prev, data.message]);
              }
            } else if (data.type === 'presence_update') {
              const onlineUsers = data.online_users || [];
              const currentUserId = parseInt(localStorage.getItem('user_id') || '0');
              const otherUserIsOnline = onlineUsers.some((u) => u.user_id !== currentUserId);
              setOtherUserOnline(otherUserIsOnline);
            } else if (data.error) {
              console.error('WebSocket error:', data.error);
              setError(data.error);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('Connection error. Attempting to reconnect...');
          setIsConnected(false);
        };

        websocket.onclose = () => {
          console.log('Chat WebSocket disconnected');
          setIsConnected(false);

          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            console.log(
              `Reconnecting (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
            );
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, reconnectDelay);
          } else {
            setError('Connection lost. Please refresh the page.');
          }
        };

        wsRef.current = websocket;
      } catch (err) {
        console.error('WebSocket connection error:', err);
        setError('Failed to connect to chat');
        setIsLoading(false);
      }
    };

    connectWebSocket();

    return () => {
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // If WebSocket is still active, clean it up without triggering reconnect
      if (wsRef.current) {
        /**
         * Remove the onclose handler before closing intentionally on unmount.
         * Otherwise, React 18 Strict Mode's intentional unmount will trigger
         * the reconnect logic and cause duplicate connections in development.
         */
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.onopen = null;
        
        // This line causes the browser console warning: 
        // "WebSocket is closed before the connection is established"
        // This is a native harmless browser warning when closing during CONNECTING state.
        wsRef.current.close();
      }
    };
  }, [userId, token]);

  /**
   * Send message via WebSocket
   */
  const sendMessage = useCallback((messageContent) => {
    if (!messageContent.trim()) {
      setError('Message cannot be empty');
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Connection not ready. Please wait...');
      return;
    }

    try {
      wsRef.current.send(
        JSON.stringify({
          message: messageContent.trim(),
        })
      );
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, []);

  return {
    messages,
    isConnected,
    error,
    isLoading,
    sendMessage,
    otherUserOnline,
  };
};
