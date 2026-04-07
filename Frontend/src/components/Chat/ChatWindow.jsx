import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle, Loader, Mic, Square, Play, Download, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChat } from '../../hooks/useChat';
import './ChatWindow.css';

/**
 * VoiceMessage Component
 * Custom audio player for voice messages with WhatsApp-like UI.
 */
const VoiceMessage = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  // Ensure absolute URL if relative
  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = (import.meta.env.VITE_API_URL || 'https://meronyaya.onrender.com/api').replace('/api', '');
    return `${baseUrl}${url}`;
  };

  const finalAudioUrl = getAbsoluteUrl(audioUrl);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current.duration !== Infinity) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleProgressChange = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="custom-voice-player">
      <audio
        ref={audioRef}
        src={finalAudioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />
      <button 
        className="voice-play-pause" 
        onClick={togglePlay}
        type="button"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
      </button>
      <div className="voice-controls">
        <input
          type="range"
          className="voice-seekbar"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleProgressChange}
        />
        <div className="voice-info">
          <span className="voice-time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * ChatWindow Component
 * Displays messages and allows sending text and voice messages in real-time.
 * Connects via WebSocket using userId (not caseId).
 */
const ChatWindow = ({ userId, currentUser, token, otherUser }) => {
  const { t } = useTranslation();
  const { messages, isConnected, error, isLoading, sendMessage, otherUserOnline } = useChat(userId, token);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

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

  /**
   * Start voice recording
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleSendVoiceMessage(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  /**
   * Stop voice recording
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  /**
   * Cancel recording
   */
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      audioChunksRef.current = [];
      setIsRecording(false);
      setRecordingTime(0);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  /**
   * Handle sending voice message
   */
  const handleSendVoiceMessage = async (audioBlob) => {
    if (!isConnected || isSending || !audioBlob) {
      return;
    }

    setIsSending(true);
    setRecordingTime(0);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.webm');
      formData.append('message_type', 'voice');

      // Import sendVoiceMessage from chatAPI
      const { sendVoiceMessage } = await import('../../axios/chatAPI');
      await sendVoiceMessage(userId, formData);

      // Note: The message will come back through WebSocket
    } catch (err) {
      console.error('Error sending voice message:', err);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Format recording time
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
                    {msg.message_type === 'voice' ? (
                      <VoiceMessage audioUrl={msg.audio_url} />
                    ) : (
                      <p className="message-text">{msg.content}</p>
                    )}
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
      {isRecording ? (
        <div className="message-input-area recording">
          <div className="recording-info">
            <div className="recording-dot"></div>
            <span className="recording-text">Recording... {formatTime(recordingTime)}</span>
          </div>
          <button
            className="send-button recording-stop"
            onClick={stopRecording}
            title="Stop recording"
          >
            <Send size={20} />
          </button>
          <button
            className="cancel-button recording-cancel"
            onClick={cancelRecording}
            title="Cancel recording"
          >
            <Square size={16} />
          </button>
        </div>
      ) : (
        <div className="message-input-area">
          <textarea
            className="message-input"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('messages.typeMessage')}
            disabled={!isConnected || isSending}
          />
          <button
            className="voice-button"
            onClick={startRecording}
            disabled={!isConnected || isSending}
            title="Record voice message"
          >
            <Mic size={20} />
          </button>
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
      )}
    </div>
  );
};

export default ChatWindow;
