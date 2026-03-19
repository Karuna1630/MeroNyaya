import React, { useState, useEffect } from 'react';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCaseConversation, markMessageRead } from '../../axios/chatAPI';
import ChatWindow from '../../components/Chat/ChatWindow';
import ConversationList from '../../components/Chat/ConversationList';
import Sidebar from './sidebar';
import DashHeader from './ClientDashHeader';
import './ClientMessageNew.css';

const ClientMessage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshConversations, setRefreshConversations] = useState(false);

  /**
   * Load current user and token on mount
   */
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const accessToken = localStorage.getItem('access_token');
    setCurrentUser(userData);
    setToken(accessToken);

    // Check if caseId was passed via navigation state
    if (location.state?.caseId) {
      setSelectedCaseId(location.state.caseId);
    }
  }, [location]);

  /**
   * Load conversation when case is selected
   */
  useEffect(() => {
    if (!selectedCaseId) {
      setConversation(null);
      return;
    }

    loadConversation(selectedCaseId);
  }, [selectedCaseId]);

  const loadConversation = async (caseId) => {
    setIsLoadingChat(true);
    setChatError(null);

    try {
      const response = await getCaseConversation(caseId);
      setConversation(response.data);
      
      // Mark all unread messages as read
      if (response.data?.messages) {
        const unreadMessages = response.data.messages.filter(msg => !msg.is_read && msg.sender !== currentUser?.id);
        for (const message of unreadMessages) {
          try {
            await markMessageRead(message.id);
          } catch (err) {
            console.error('Error marking message as read:', err);
          }
        }
        // Trigger conversation list refresh after marking messages as read
        if (unreadMessages.length > 0) {
          setRefreshConversations(prev => !prev);
        }
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      
      // Handle specific error messages
      if (err.response?.status === 403) {
        setChatError(t('messages.messageNotAvailable'));
      } else if (err.response?.status === 404) {
        setChatError(t('messages.failedToLoad'));
      } else {
        setChatError(t('messages.failedToLoad'));
      }
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div className="client-message-page">
      <Sidebar />
      <div className="client-message-content">
        <DashHeader />

        <div className="message-container">
          <div className="message-layout">
            {/* Conversation List */}
            <div className="conversation-list-wrapper">
              <ConversationList
                onSelectConversation={setSelectedCaseId}
                selectedCaseId={selectedCaseId}
                refreshTrigger={refreshConversations}
              />
            </div>

            {/* Chat Window or Empty State */}
            <div className="chat-window-wrapper">
              {!selectedCaseId ? (
                <div className="empty-chat-state">
                  <MessageSquare size={64} color="#bdc3c7" />
                  <h2>Select a conversation</h2>
                  <p>Choose a conversation from the list to start chatting</p>
                </div>
              ) : chatError ? (
                <div className="chat-error-state">
                  <AlertCircle size={48} color="#e74c3c" />
                  <h3>{chatError}</h3>
                  <p>This case may not be accepted yet</p>
                </div>
              ) : conversation && currentUser && token ? (
                <ChatWindow
                  caseId={selectedCaseId}
                  currentUser={currentUser}
                  token={token}
                  otherUser={conversation.other_user}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMessage;
