import React, { useState, useEffect } from 'react';
import { MessageCircle, Loader, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getConversations, markConversationAsRead } from '../../axios/chatAPI';
import './ConversationList.css';

/**
 * ConversationList Component
 * Displays all conversations grouped by user (handled by backend).
 * Passes userId on selection.
 */
const ConversationList = ({ onSelectConversation, selectedUserId, refreshTrigger }) => {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch conversations on mount and when refreshTrigger changes
   */
  useEffect(() => {
    fetchConversations();
  }, [refreshTrigger]);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getConversations();
      setConversations(response.data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(t('messages.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle conversation selection and mark as read
   */
  const handleSelectConversation = async (userId) => {
    // Call parent handler
    onSelectConversation(userId);

    // Mark conversation as read
    try {
      await markConversationAsRead(userId);
      
      // Update local state to clear unread count
      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.user?.id === userId
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (err) {
      console.error('Error marking conversation as read:', err);
      // Don't block UI if this fails
    }
  };

  if (isLoading) {
    return (
      <div className="conversation-list loading">
        <Loader size={32} className="spin" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conversation-list error">
        <AlertCircle size={32} color="#e74c3c" />
        <p>{error}</p>
        <button onClick={fetchConversations}>{t('common.cancel')}</button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="conversation-list empty">
        <MessageCircle size={48} color="#bdc3c7" />
        <h3>{t('messages.noActiveConversations')}</h3>
        <p>{t('messages.chatAvailableOnce')}</p>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      <div className="conversation-header">
        <h2>{t('messages.title')}</h2>
        <span className="conversation-count">{conversations.length}</span>
      </div>

      <div className="conversations">
        {conversations.map((conversation) => (
          <div
            key={conversation.user?.id}
            className={`conversation-item ${
              selectedUserId === conversation.user?.id ? 'active' : ''
            }`}
            onClick={() => handleSelectConversation(conversation.user?.id)}
          >
            <div className="avatar-wrapper">
              {conversation.user?.profile_image ? (
                <img
                  src={conversation.user.profile_image}
                  alt={conversation.user.name}
                  className="conversation-avatar"
                />
              ) : (
                <div className="avatar-placeholder">
                  {conversation.user?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>

            <div className="conversation-content">
              <div className="conversation-top-row">
                <h4 className="conversation-name">
                  {conversation.user?.name || 'Unknown User'}
                  {conversation.case_count > 1 && (
                    <span className="case-count-tag">
                      {conversation.case_count} cases
                    </span>
                  )}
                </h4>
                <span className="conversation-time">
                  {conversation.last_message &&
                    new Date(conversation.last_message.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric'
                    })}
                </span>
              </div>

              <div className="conversation-bottom-row">
                <p className="conversation-preview">
                  {conversation.last_message
                    ? (conversation.last_message.message_type === 'voice' ? '🎤 Voice message' : conversation.last_message.content)
                    : 'No messages yet'}
                </p>
                {conversation.unread_count > 0 && (
                  <span className="unread-badge">{conversation.unread_count}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
