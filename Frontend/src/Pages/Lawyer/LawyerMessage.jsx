import React, { useState, useEffect } from 'react';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMessages } from '../../axios/chatAPI';
import ChatWindow from '../../components/Chat/ChatWindow';
import ConversationList from '../../components/Chat/ConversationList';
import Sidebar from './Sidebar';
import LawyerDashHeader from './LawyerDashHeader';
import '../Client/ClientMessageNew.css';

const LawyerMessage = () => {
  const { t } = useTranslation();
  const [selectedUserId, setSelectedUserId] = useState(null);
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
  }, []);

  /**
   * Load conversation when a user is selected
   */
  useEffect(() => {
    if (!selectedUserId) {
      setConversation(null);
      return;
    }

    loadConversation(selectedUserId);
  }, [selectedUserId]);

  const loadConversation = async (userId) => {
    setIsLoadingChat(true);
    setChatError(null);

    try {
      const response = await getMessages(userId);
      setConversation(response.data);
    } catch (err) {
      console.error('Error loading conversation:', err);

      if (err.response?.status === 403) {
        setChatError(t('messages.messageNotAvailable'));
      } else {
        setChatError(t('messages.failedToLoad'));
      }
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <LawyerDashHeader />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="message-layout">
            {/* Conversation List */}
            <div className="conversation-list-wrapper">
              <ConversationList
                onSelectConversation={setSelectedUserId}
                selectedUserId={selectedUserId}
                refreshTrigger={refreshConversations}
              />
            </div>

            {/* Chat Window or Empty State */}
            <div className="chat-window-wrapper">
              {!selectedUserId ? (
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
                  userId={selectedUserId}
                  currentUser={currentUser}
                  token={token}
                  otherUser={conversation.user}
                />
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LawyerMessage;