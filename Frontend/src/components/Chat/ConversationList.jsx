import React, { useState, useEffect } from 'react';
import { MessageCircle, Loader, AlertCircle, Archive } from 'lucide-react';
import { getMyConversations, getUnreadCount } from '../../axios/chatAPI';
import './ConversationList.css';

/**
 * ConversationList Component
 * Displays all conversations and allows selecting one to open the chat
 */
const ConversationList = ({ onSelectConversation, selectedCaseId }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  /**
   * Fetch conversations on component mount
   */
  useEffect(() => {
    fetchConversations();
  }, []);

  /**
   * Fetch unread count periodically
   */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getMyConversations();
      console.log('Conversations response:', response);
      console.log('Conversations data:', response.data);
      setConversations(response.data || []);
      await fetchUnreadCount();
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      // You can update state with global unread count if needed
      console.log('Total unread:', response.data.unread_count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="conversation-list loading">
        <Loader size={32} className="spin" />
        <p>Loading conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conversation-list error">
        <AlertCircle size={32} color="#e74c3c" />
        <p>{error}</p>
        <button onClick={fetchConversations}>Retry</button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="conversation-list empty">
        <MessageCircle size={48} color="#bdc3c7" />
        <h3>No active conversations</h3>
        <p>Chat will be available once a case is accepted</p>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      <div className="conversation-header">
        <h2>Messages</h2>
        <span className="conversation-count">{conversations.length}</span>
      </div>

      <div className="conversations">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`conversation-item ${
              selectedCaseId === conversation.case_id ? 'active' : ''
            }`}
            onClick={() => onSelectConversation(conversation.case_id)}
          >
            {conversation.other_user?.profile_image && (
              <img
                src={conversation.other_user.profile_image}
                alt={conversation.other_user.name}
                className="conversation-avatar"
              />
            )}

            <div className="conversation-info">
              <div className="conversation-header-row">
                <h4 className="conversation-name">
                  {conversation.other_user?.name || 'Unknown User'}
                </h4>
                <span className="conversation-time">
                  {conversation.last_message &&
                    new Date(conversation.last_message.timestamp).toLocaleDateString()}
                </span>
              </div>

              <p className="conversation-preview">
                {conversation.last_message
                  ? conversation.last_message.content.substring(0, 40) +
                    (conversation.last_message.content.length > 40 ? '...' : '')
                  : 'No messages yet'}
              </p>

              {conversation.last_message?.sender_id !== conversation.other_user?.id && (
                <div className="unread-indicator"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
