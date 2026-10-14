import React from 'react';
import { FaDoorOpen, FaSearch } from 'react-icons/fa';
import MusicPlayer from './MusicPlayer';
import { getUserColor } from '../utils/getUserColor.js';

/**
 * Top header of the chat room displaying room name, presence pill, and tool buttons.
 */
function ChatHeader({
  room,
  username,
  onlineUsers = [],
  navigate,
  toggleMusic,
  isMusicPlaying,
  playNextRandomSong,
  currentSongTitle,
  theme,
  toggleTheme,
  toggleBackgroundPicker,
  setShowSettingsModal,
  handleOpenDiscoverRooms,
  showSearch,
  setShowSearch,
  setSearchQuery,
  handleLeaveRoom
}) {
  return (
    <header className="chat-header">
      <div className="chat-header-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1>Room: {room}</h1>
          <span className="online-presence-pill" title={`${onlineUsers.length} user(s) currently online`}>
            <span className="online-status-dot" />
            {onlineUsers.length} online
          </span>
        </div>
        <p>Welcome, <span style={{ color: getUserColor(username), fontWeight: 600 }}>{username}</span></p>
      </div>

      <div className="chat-header-actions">
        <button
          onClick={() => navigate(`/participants/${encodeURIComponent(room)}`)}
          className="participants-icon-btn"
          title="View Participants"
          aria-label="View Participants"
        >
          <img src={`${process.env.PUBLIC_URL}/participants.png`} alt="Participants" style={{ width: '22px', height: '22px', display: 'block' }} />
        </button>

        <MusicPlayer
          isMusicPlaying={isMusicPlaying}
          toggleMusic={toggleMusic}
          playNextRandomSong={playNextRandomSong}
          currentSongTitle={currentSongTitle}
        />

        <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button className="change-bg-btn" onClick={toggleBackgroundPicker} title="Change Background" aria-label="Change Background">
          <img src={`${process.env.PUBLIC_URL}/change_bg.png`} alt="Change Background" style={{ width: '22px', height: '22px', display: 'block' }} />
        </button>

        <button className="settings-icon-btn" onClick={() => setShowSettingsModal(true)} title="Settings" aria-label="Settings">
          <img src={`${process.env.PUBLIC_URL}/settings.png`} alt="Settings" style={{ width: '22px', height: '22px', display: 'block' }} />
        </button>

        <button className="discover-rooms-icon-btn" onClick={handleOpenDiscoverRooms} title="Discover Rooms" aria-label="Discover Rooms">
          <FaDoorOpen style={{ fontSize: '1.25rem', color: '#334155', display: 'block' }} />
        </button>

        <button
          className="search-toggle-btn"
          onClick={() => {
            if (showSearch) setSearchQuery('');
            setShowSearch(!showSearch);
          }}
          title="Search messages"
          aria-label="Search messages"
        >
          <FaSearch />
        </button>

        <button className="btn-danger" onClick={handleLeaveRoom}>
          Leave Room
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;