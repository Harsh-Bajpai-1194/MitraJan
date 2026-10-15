import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import BackgroundPicker from '../components/BackgroundPicker';
import SettingsModal from '../components/SettingsModal';
import Admin from './Admin';

/**
 * Main real-time chat room view linking headers, feeds, composer, and room modals.
 */
function ChatRoomPage({
  room,
  setRoom,
  isLoggedIn,
  username,
  email,
  picture,
  onlineUsers = [],
  joinChatRoomCallback,
  selectedBackground,
  toggleMusic,
  isMusicPlaying,
  playNextRandomSong,
  soundFiles = [],
  currentSongIndex = 0,
  toggleBackgroundPicker,
  isAdmin,
  handleOpenAdminPanel,
  handleOpenDiscoverRooms,
  handleLeaveRoom,
  showBackgroundPicker,
  backgroundOptions,
  selectBackground,
  showAdminPanel,
  setShowAdminPanel,
  socketRef,
  messagesContainerRef,
  isFetchingOlderMessages,
  messages,
  handleDeleteMessage,
  messagesEndRef,
  typingUser,
  sendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  setCurrentMessage,
  currentMessage,
  enterIsSend,
  toggleEnterIsSend,
  spamProtection,
  toggleSpamProtection,
  showSettingsModal,
  setShowSettingsModal,
  spamWarning,
  theme,
  setTheme,
  getSongTitleFromUrl
}) {
  const { roomName } = useParams();
  const decodedRoomName = roomName || '';
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (decodedRoomName && decodedRoomName !== room) {
      if (isLoggedIn && username) {
        joinChatRoomCallback(decodedRoomName, username, email, picture);
      } else {
        const savedSession = localStorage.getItem('chatSession');
        if (savedSession) {
          const { name, email: savedEmail, picture: savedPicture } = JSON.parse(savedSession);
          if (name) {
            joinChatRoomCallback(decodedRoomName, name, savedEmail, savedPicture);
            return;
          }
        }
        setRoom(decodedRoomName);
      }
    }
  }, [decodedRoomName, room, isLoggedIn, username, email, picture, joinChatRoomCallback, setRoom]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const currentSongTitle = getSongTitleFromUrl(soundFiles[currentSongIndex]);

  return (
    <div
      className={`chat-container${selectedBackground ? ' background-selected' : ''} ${theme === 'dark' ? 'dark-mode' : ''}`}
      style={{
        backgroundColor: selectedBackground || undefined,
        transition: 'background-color 0.25s ease',
      }}
    >
      <ChatHeader
        room={room}
        username={username}
        onlineUsers={onlineUsers}
        navigate={navigate}
        toggleMusic={toggleMusic}
        isMusicPlaying={isMusicPlaying}
        playNextRandomSong={playNextRandomSong}
        currentSongTitle={currentSongTitle}
        theme={theme}
        toggleTheme={toggleTheme}
        toggleBackgroundPicker={toggleBackgroundPicker}
        setShowSettingsModal={setShowSettingsModal}
        handleOpenDiscoverRooms={handleOpenDiscoverRooms}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        setSearchQuery={setSearchQuery}
        handleLeaveRoom={handleLeaveRoom}
      />

      {showSearch && (
        <div className="message-search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages or users..."
            aria-label="Search messages or users"
            autoFocus
          />
        </div>
      )}

      {showBackgroundPicker && (
        <BackgroundPicker
          backgroundOptions={backgroundOptions}
          selectedBackground={selectedBackground}
          selectBackground={selectBackground}
        />
      )}

      <SettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        enterIsSend={enterIsSend}
        toggleEnterIsSend={toggleEnterIsSend}
        spamProtection={spamProtection}
        toggleSpamProtection={toggleSpamProtection}
        isAdmin={isAdmin}
        handleOpenAdminPanel={handleOpenAdminPanel}
      />

      {isAdmin && showAdminPanel && (
        <Admin socket={socketRef.current} onClose={() => setShowAdminPanel(false)} />
      )}

      <MessageList
        messages={messages}
        room={room}
        searchQuery={searchQuery}
        username={username}
        isAdmin={isAdmin}
        handleDeleteMessage={handleDeleteMessage}
        isFetchingOlderMessages={isFetchingOlderMessages}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
      />

      {typingUser && <div className="typing-indicator">{typingUser}</div>}

      {spamWarning && (
        <div className="spam-warning-banner">
          <span>⚠️</span> {spamWarning}
        </div>
      )}

      <MessageInput
        sendMessage={sendMessage}
        currentMessage={currentMessage}
        setCurrentMessage={setCurrentMessage}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        socketRef={socketRef}
        room={room}
        username={username}
        enterIsSend={enterIsSend}
      />
    </div>
  );
}

export default ChatRoomPage;