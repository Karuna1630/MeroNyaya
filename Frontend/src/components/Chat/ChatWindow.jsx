import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChat } from '../../hooks/useChat';
import './ChatWindow.css';

/**
 * ChatWindow Component
 * Displays messages and allows sending new messages in real-time.
 * Connects via WebSocket using userId (not caseId).
 */
const ChatWindow = ({ userId, currentUser, token, otherUser }) => {
  const { t } = useTranslation();
  const { messages, isConnected, error, isLoading, sendMessage, otherUserOnline } = useChat(userId, token);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !isConnected || isSending) {
      return;
    }

    const messageContent = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    try {
      sendMessage(messageContent);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageInput(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle Enter key to send message
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="chat-window loading">
        <div className="chat-loader">
          <Loader className="spin" size={32} color="#3498db" />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!isConnected && !isLoading) {
    return (
      <div className="chat-window error">
        <div className="chat-error">
          <AlertCircle size={32} color="#e74c3c" />
          <p>{error || t('messages.failedToLoad')}</p>
          <button onClick={() => window.location.reload()}>
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          {otherUser?.profile_image && (
            <img
              src={otherUser.profile_image}
              alt={otherUser.name}
              className="chat-avatar"
            />
          )}
          <div className="chat-user-info">
            <h3 className="chat-user-name">
              {otherUser?.name || 'User'}
            </h3>
            <p className="chat-user-role">
              {otherUser?.role === 'Lawyer' ? '⚖️ Lawyer' : '👤 Client'}
            </p>
          </div>
        </div>
        <div className={`chat-status ${otherUserOnline ? 'online' : 'offline'}`}>
          <span className="status-dot"></span>
          {otherUserOnline ? t('messages.online') : t('messages.offline')}
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>{t('messages.chooseConversation')}</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-wrapper ${
                  parseInt(msg.sender) === parseInt(currentUser?.id) ? 'sent' : 'received'
                }`}
              >
                <div className="message-bubble">
                  {parseInt(msg.sender) !== parseInt(currentUser?.id) && otherUser?.profile_image && (
                    <img
                      src={otherUser.profile_image}
                      alt="sender"
                      className="message-avatar"
                    />
                  )}
                  <div className="message-content">
                    <p className="message-text">{msg.content}</p>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="chat-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Message Input Area */}
      <div className="message-input-area">
        <textarea
          className="message-input"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('messages.typeMessage')}
          disabled={!isConnected || isSending}
          rows="2"
        />
        <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={!isConnected || isSending || !messageInput.trim()}
          title={!isConnected ? t('messages.failedToLoad') : t('messages.sendMessage')}
        >
          {isSending ? (
            <Loader size={20} className="spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
