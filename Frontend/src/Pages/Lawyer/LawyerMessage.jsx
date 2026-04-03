import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMessages } from '../../axios/chatAPI';
import ChatWindow from '../../components/Chat/ChatWindow';
import ConversationList from '../../components/Chat/ConversationList';
import Sidebar from './Sidebar';
import LawyerDashHeader from './LawyerDashHeader';

const LawyerMessage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshConversations, setRefreshConversations] = useState(false);

  /**
   * Load current user and token on mount
   * Also check if a recipient was passed via navigation state
   */
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const accessToken = localStorage.getItem('access_token');
    setCurrentUser(userData);
    setToken(accessToken);

    // If redirected from a case detail, auto-select that user
    if (location.state?.recipientId) {
      console.log('Auto-selecting recipient:', location.state.recipientId);
      setSelectedUserId(location.state.recipientId);
    }
  }, [location.state]);

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
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <LawyerDashHeader />

        <div className="flex-1 p-0 overflow-hidden">
          <div className="grid grid-cols-[360px_1fr] h-full bg-white shadow-lg overflow-hidden">
            {/* Conversation List */}
            <div className="h-full overflow-y-auto border-r border-slate-200">
              <ConversationList
                onSelectConversation={setSelectedUserId}
                selectedUserId={selectedUserId}
                refreshTrigger={refreshConversations}
              />
            </div>

            {/* Chat Window or Empty State */}
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
              {!selectedUserId ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-white">
                  <div className="w-24 h-24 mb-8 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500 shadow-sm transition-transform hover:scale-110 duration-300">
                    <MessageSquare size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Your Messages</h2>
                  <p className="text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Select a conversation from the sidebar to start chatting with your legal assistant or client.
                  </p>
                  <div className="mt-10 px-6 py-2 bg-slate-50 rounded-full text-xs font-semibold text-slate-400 uppercase tracking-widest border border-slate-100">
                    Secure & Encrypted
                  </div>
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