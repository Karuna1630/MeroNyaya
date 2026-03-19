import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Custom hook for WebSocket chat functionality
 * Handles connection, message sending/receiving, and connection status
 * 
 * @param {number} caseId - The case ID for the chat
 * @param {string} token - JWT token for authentication
 * @returns {Object} Chat state and methods
 */
export const useChat = (caseId, token) => {
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
  const reconnectDelay = 3000; // 3 seconds

  /**
   * Connect to WebSocket
   */
  useEffect(() => {
    if (!caseId || !token) {
      setIsLoading(false);
      return;
    }

    const connectWebSocket = () => {
      try {
        // Use same backend URL as API
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const wsProtocol = apiUrl.includes('https') ? 'wss:' : 'ws:';
        const wsHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/api$/, '');
        const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/${caseId}/?token=${token}`;

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
              // Load initial messages from history
              const msgs = data.messages || [];
              messageIdsRef.current.clear();
              msgs.forEach((msg) => messageIdsRef.current.add(msg.id));
              setMessages(msgs);
            } else if (data.type === 'new_message') {
              // Add new message only if we haven't seen it before
              const messageId = data.message?.id;
              if (messageId && !messageIdsRef.current.has(messageId)) {
                messageIdsRef.current.add(messageId);
                setMessages((prev) => [...prev, data.message]);
              }
            } else if (data.type === 'presence_update') {
              // Update online status of other user
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

          // Attempt to reconnect
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            console.log(
              `Reconnecting (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
            );
            // Clear any existing timeout
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

    // Cleanup on unmount
    return () => {
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [caseId, token]);

  /**
   * Send message to WebSocket
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
