import React, { useState, useEffect } from 'react';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMessages } from '../../axios/chatAPI';
import ChatWindow from '../../components/Chat/ChatWindow';
import ConversationList from '../../components/Chat/ConversationList';
import Sidebar from './Sidebar';
import LawyerDashHeader from './LawyerDashHeader';

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
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <LawyerDashHeader />

        <div className="flex-1 p-0 overflow-hidden">
          <div className="grid grid-cols-[360px_1fr] gap-6 h-full bg-white rounded-2xl shadow-lg overflow-hidden m-6">
            {/* Conversation List */}
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 border-r border-slate-200">
              <ConversationList
                onSelectConversation={setSelectedUserId}
                selectedUserId={selectedUserId}
                refreshTrigger={refreshConversations}
              />
            </div>

            {/* Chat Window or Empty State */}
            <div className="flex flex-col bg-linear-to-br from-slate-50 to-slate-100 overflow-hidden">
              {!selectedUserId ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-10 text-slate-500">
                  <MessageSquare size={64} color="#cbd5e1" />
                  <h2 className="my-5 text-slate-900 text-2xl font-bold">Select a conversation</h2>
                  <p className="text-sm text-slate-400">Choose a conversation from the list to start chatting</p>
                </div>
              ) : chatError ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-10">
                  <AlertCircle size={48} color="#ef4444" />
                  <h3 className="my-4 text-red-500 text-lg font-bold">{chatError}</h3>
                  <p className="text-sm text-slate-400">This case may not be accepted yet</p>
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