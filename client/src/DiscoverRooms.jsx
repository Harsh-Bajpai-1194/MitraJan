import React, { useState, useEffect, useMemo } from 'react';
import './DiscoverRooms.css';

const DiscoverRooms = ({
  joinChatRoom,
  onClose,
  onJoin,
  username,
  email,
  picture,
  roomsSignature,
  onViewMembers,
  isAdmin,
  onOpenAdmin,
  toggleBackgroundPicker,
  theme,
  setTheme
}) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'trending', 'popular'
  const [sortBy, setSortBy] = useState('messages'); // 'messages', 'members', 'name'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [copiedRoom, setCopiedRoom] = useState(null);
  const [activeSettingsRoom, setActiveSettingsRoom] = useState(null);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/rooms');
        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }
        const data = await response.json();
        setRooms(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [roomsSignature]);

  // Handle Escape key to close settings modal or go back
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeSettingsRoom || showGlobalSettings) {
          setActiveSettingsRoom(null);
          setShowGlobalSettings(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, activeSettingsRoom, showGlobalSettings]);

  const handleJoinRoom = (roomName) => {
    const result = joinChatRoom(roomName, username, email, picture);
    if (result !== 'confirm') {
      onJoin(roomName);
    }
  };

  const handleCopyLink = (e, roomName) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/chat/${encodeURIComponent(roomName)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedRoom(roomName);
        setTimeout(() => setCopiedRoom(null), 2000);
      }).catch(() => {});
    } else {
      setCopiedRoom(roomName);
      setTimeout(() => setCopiedRoom(null), 2000);
    }
  };

  // Filter & Sort Rooms
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        const matchesSearch =
          room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (room.desc && room.desc.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        if (activeCategory === 'trending') {
          return (room.totalMessages || 0) > 0;
        }
        if (activeCategory === 'popular') {
          return (room.memberCount || 0) > 1;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'members') {
          return (b.memberCount || 0) - (a.memberCount || 0);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return (b.totalMessages || 0) - (a.totalMessages || 0);
      });
  }, [rooms, searchTerm, activeCategory, sortBy]);

  // Summary Metrics
  const totalMembersCount = useMemo(() => {
    return rooms.reduce((acc, curr) => acc + (curr.memberCount || 0), 0);
  }, [rooms]);

  const totalMessagesCount = useMemo(() => {
    return rooms.reduce((acc, curr) => acc + (curr.totalMessages || 0), 0);
  }, [rooms]);

  const getRoomGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
      'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const toggleTheme = () => {
    if (setTheme) {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <div className={`discover-rooms-page ${theme === 'dark' ? 'dark-mode' : ''}`}>
      
      {/* Full Page Header Navbar */}
      <header className="discover-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h2>Discover Public Rooms</h2>
          </div>

          <div className="navbar-actions">
            <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"} style={{ marginRight: '10px' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {/* Close / Go Back Button */}
            <button onClick={onClose} className="close-btn" title="Close & Go Back" aria-label="Close">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Full Page Body Content */}
      <div className="discover-page-content">
        
        {/* Hero / Banner Area */}
        <section className="discover-hero-banner">
          <div className="hero-text-content">
            <h1>Explore Active Chat Rooms</h1>
            <p>Join live conversations, discover vibrant communities, or start your own discussion room.</p>
          </div>

          {/* Quick Metrics Counter */}
          <div className="metrics-pills">
            <div className="metric-pill" title="Total public rooms">
              <span className="metric-value">{rooms.length}</span>
              <span className="metric-label">Public Rooms</span>
            </div>
            <div className="metric-pill" title="Active participants across rooms">
              <span className="metric-value">{totalMembersCount}</span>
              <span className="metric-label">Active Members</span>
            </div>
            <div className="metric-pill" title="Total messages posted">
              <span className="metric-value">{totalMessagesCount}</span>
              <span className="metric-label">Messages</span>
            </div>
          </div>
        </section>

        {/* Search Bar & Controls */}
        <section className="discover-controls-section">
          <div className="search-box-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search rooms by title or topic description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm('')} title="Clear search">
                ✕
              </button>
            )}
          </div>
        </section>

        {/* Filter & Sort Bar */}
        <section className="discover-filter-bar">
          <div className="filter-tabs">
            <button
              className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Rooms
            </button>
            <button
              className={`tab-btn ${activeCategory === 'trending' ? 'active' : ''}`}
              onClick={() => setActiveCategory('trending')}
            >
              🔥 Trending
            </button>
            <button
              className={`tab-btn ${activeCategory === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveCategory('popular')}
            >
              👥 Most Popular
            </button>
          </div>

          <div className="sort-view-controls">
            <div className="sort-select-wrapper">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="messages">Most Active (Messages)</option>
                <option value="members">Most Members</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>

            <div className="view-toggle-btns">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                </svg>
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Main Rooms Grid */}
        <main className={`discover-rooms-list ${viewMode === 'list' ? 'list-layout' : 'grid-layout'}`}>
          {/* Loading Skeletons */}
          {loading && (
            <div className="skeleton-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-header">
                    <div className="skeleton-circle"></div>
                    <div className="skeleton-lines">
                      <div className="skeleton-line short"></div>
                      <div className="skeleton-line long"></div>
                    </div>
                  </div>
                  <div className="skeleton-body"></div>
                  <div className="skeleton-footer"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <div>
                <h4>Failed to load rooms</h4>
                <p>{error}</p>
              </div>
              <button className="btn-secondary retry-btn" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          )}

          {/* Room Cards List */}
          {!loading && !error && filteredRooms.map((room, index) => {
            const isTopTrending = index === 0 && (room.totalMessages || 0) > 0;
            return (
              <div key={room.name} className={`room-card ${isTopTrending ? 'trending-card' : ''}`}>
                
                {/* Card Top / Header */}
                <div className="room-card-header">
                  <div
                    className="room-icon-badge"
                    style={{ background: getRoomGradient(room.name) }}
                  >
                    {room.icon || room.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="room-title-area">
                    <div className="room-title-row">
                      <h3>{room.name}</h3>
                      {isTopTrending && (
                        <span className="trending-badge">🔥 Hot</span>
                      )}
                    </div>
                    <p className="room-desc">{room.desc || 'Public chat channel for real-time discussions.'}</p>
                  </div>
                </div>

                {/* Card Stats */}
                <div className="room-stats">
                  <div
                    className="stat-pill clickable-stat-pill"
                    title={`View participants in ${room.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewMembers) {
                        onViewMembers(room.name);
                      }
                    }}
                  >
                    <img src={`${process.env.PUBLIC_URL}/participants.png`} alt="Members" className="stat-pill-img" />
                    <span><strong>{room.memberCount || 0}</strong> Members</span>
                  </div>

                  <div className="stat-pill" title={`${room.totalMessages || 0} total messages`}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span><strong>{room.totalMessages || 0}</strong> Messages</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="room-actions">
                  <button
                    className="btn-primary join-room-btn"
                    onClick={() => handleJoinRoom(room.name)}
                  >
                    <span>Join Room</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>

                  <div className="room-sub-actions">
                    {/* Room Settings Button */}
                    <button
                      className="card-icon-btn settings-btn"
                      type="button"
                      title="Room Settings"
                      onClick={() => setActiveSettingsRoom(room)}
                    >
                      <img src={`${process.env.PUBLIC_URL}/settings.png`} alt="Settings" className="card-btn-img" />
                      <span className="btn-label">Settings</span>
                    </button>

                    {/* Copy Link Button */}
                    <button
                      className="card-icon-btn copy-btn"
                      type="button"
                      title={copiedRoom === room.name ? "Link copied!" : "Copy room link"}
                      onClick={(e) => handleCopyLink(e, room.name)}
                    >
                      {copiedRoom === room.name ? (
                        <span className="check-mark">✓</span>
                      ) : (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

          {/* Empty Search Results */}
          {!loading && !error && filteredRooms.length === 0 && (
            <div className="empty-rooms-state">
              <div className="empty-icon">🔍</div>
              <h3>No rooms found</h3>
              <p>
                {searchTerm
                  ? `We couldn't find any rooms matching "${searchTerm}".`
                  : 'There are currently no public rooms available.'}
              </p>
              {searchTerm && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                >
                  Clear Search & Filters
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Room Settings Modal */}
      {activeSettingsRoom && (
        <div className="settings-modal-overlay" onClick={() => setActiveSettingsRoom(null)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={`${process.env.PUBLIC_URL}/settings.png`} alt="Settings" style={{ width: '24px', height: '24px' }} />
                <h3>Room Settings: {activeSettingsRoom.name}</h3>
              </div>
              <button className="close-btn" onClick={() => setActiveSettingsRoom(null)}>✕</button>
            </div>

            <div className="settings-modal-body">
              <div className="settings-option-item">
                <div>
                  <strong>Room Description</strong>
                  <p>{activeSettingsRoom.desc || 'Public chat channel.'}</p>
                </div>
              </div>

              <div className="settings-option-item">
                <div>
                  <strong>Direct Shareable Link</strong>
                  <p>{window.location.origin}/chat/{encodeURIComponent(activeSettingsRoom.name)}</p>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => handleCopyLink(null, activeSettingsRoom.name)}
                >
                  {copiedRoom === activeSettingsRoom.name ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <div className="settings-option-item">
                <div>
                  <strong>View Participants</strong>
                  <p>Check list of active members in this room</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setActiveSettingsRoom(null);
                    if (onViewMembers) onViewMembers(activeSettingsRoom.name);
                  }}
                >
                  Participants List
                </button>
              </div>

              {isAdmin && (
                <div className="settings-option-item admin-highlight">
                  <div>
                    <strong>Admin Controls</strong>
                    <p>Manage server rooms, broadcast announcements, or view logs.</p>
                  </div>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      setActiveSettingsRoom(null);
                      if (onOpenAdmin) onOpenAdmin();
                    }}
                  >
                    Open Admin Panel 🛡️
                  </button>
                </div>
              )}
            </div>

            <div className="settings-modal-footer">
              <button className="btn-secondary" onClick={() => setActiveSettingsRoom(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Global App Settings Modal */}
      {showGlobalSettings && (
        <div className="settings-modal-overlay" onClick={() => setShowGlobalSettings(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={`${process.env.PUBLIC_URL}/settings.png`} alt="Settings" style={{ width: '24px', height: '24px' }} />
                <h3>Application Settings</h3>
              </div>
              <button className="close-btn" onClick={() => setShowGlobalSettings(false)}>✕</button>
            </div>

            <div className="settings-modal-body">
              <div className="settings-option-item">
                <div>
                  <strong>Audio & Sound Effects</strong>
                  <p>Play audio chime when receiving messages</p>
                </div>
                <button
                  className={`btn-${notificationsEnabled ? 'primary' : 'secondary'}`}
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                >
                  {notificationsEnabled ? 'Enabled 🔔' : 'Muted 🔕'}
                </button>
              </div>

              {toggleBackgroundPicker && (
                <div className="settings-option-item">
                  <div>
                    <strong>Theme & Background</strong>
                    <p>Customize wallpaper background for chat rooms</p>
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setShowGlobalSettings(false);
                      toggleBackgroundPicker();
                    }}
                  >
                    Change Wallpaper 🎨
                  </button>
                </div>
              )}

              {isAdmin && (
                <div className="settings-option-item admin-highlight">
                  <div>
                    <strong>Admin Panel</strong>
                    <p>Server management & user moderation</p>
                  </div>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      setShowGlobalSettings(false);
                      if (onOpenAdmin) onOpenAdmin();
                    }}
                  >
                    Open Admin Dashboard 🛡️
                  </button>
                </div>
              )}
            </div>

            <div className="settings-modal-footer">
              <button className="btn-secondary" onClick={() => setShowGlobalSettings(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DiscoverRooms;
