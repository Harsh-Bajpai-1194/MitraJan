import React, { useState, useEffect } from 'react';
import './ParticipantsPage.css';
import { getAvatarUrl } from './utils/getAvatarUrl.js';
import { getUserColor } from './utils/getUserColor.js';

  const ParticipantsPage = ({ roomName, onClose, theme, setTheme, onlineUsers = [] }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOnline = (member) => {
    if (!member || !Array.isArray(onlineUsers)) return false;
    const memberKey = member.memberId || (member.username || '').trim().toLowerCase();
    return onlineUsers.some(u => {
      const uKey = u.memberId || (u.username || '').trim().toLowerCase();
      return uKey === memberKey;
    });
  };

  const isGuestUser = (member) => {
    if (!member) return false;
    const name = (member.username || member.name || '').trim();
    return name.toLowerCase().includes('guestuser');
  };

  const regularUsers = members.filter((m) => !isGuestUser(m));
  const guestUsers = members.filter((m) => isGuestUser(m));

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        // Use a relative path. This requires the `/api/rooms/:roomName/members` endpoint on the server.
        const response = await fetch(`/api/rooms/${encodeURIComponent(roomName)}/members`);
        if (!response.ok) {
          throw new Error(`Failed to fetch room members (status: ${response.status})`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setMembers(data);
          setError(null);
        } else {
          throw new Error('Received an invalid response from the server. Expected JSON.');
        }
      } catch (err) {
        setError(err.message);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [roomName]);

  const toggleTheme = () => {
    if (setTheme) {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <div className={`members-page ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <header className="members-header">
        <h2>All Members in "{roomName}" {!loading && `(${members.length})`}</h2>
        <div style={{ position: 'absolute', top: '16px', right: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={onClose} className="close-btn" title="Close">×</button>
        </div>
      </header>
      <main className="members-list">
        {loading && (
          <div className="loading-spinner-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && members.length > 0 && (
          <div className="members-container">
            {regularUsers.length > 0 && (
              <div className="members-section">
                <h3 className="section-title">Members ({regularUsers.length})</h3>
                <ul>
                  {/* Regular Users */}
                  {regularUsers.map((member, index) => (
                    <li key={member.username || index} className="member-item">
                      <div className="avatar-wrapper">
                        <img
                          src={getAvatarUrl(member.username, member.picture, member.email)}
                          alt={member.username}
                          className="member-avatar"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getAvatarUrl(member.username, '', member.email);
                          }}
                        />
                        <span className={`presence-indicator ${isOnline(member) ? 'online' : 'offline'}`} />
                      </div>
                      <span className="member-name" style={{ color: getUserColor(member.username), fontWeight: 600 }}>
                        {member.username}
                      </span>
                      <span className={`status-badge ${isOnline(member) ? 'status-online' : 'status-offline'}`}>
                        {isOnline(member) ? '● Online' : '○ Offline'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guestUsers.length > 0 && (
              <div className="members-section guest-section">
                <h3 className="section-title guest-title">Guest Users ({guestUsers.length})</h3>
                <ul>
                  {guestUsers.map((member, index) => (
                    <li key={member.username || index} className="member-item guest-item">
                      <div className="avatar-wrapper">
                        <img
                          src={getAvatarUrl(member.username, member.picture, member.email)}
                          alt={member.username}
                          className="member-avatar"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getAvatarUrl(member.username, '', member.email);
                          }}
                        />
                        <span className={`presence-indicator ${isOnline(member) ? 'online' : 'offline'}`} />
                      </div>
                      <span className="member-name" style={{ color: getUserColor(member.username), fontWeight: 600 }}>
                        {member.username}
                      </span>
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="guest-badge" style={{ margin: 0 }}>Guest</span>
                        <span className={`status-badge ${isOnline(member) ? 'status-online' : 'status-offline'}`} style={{ margin: 0 }}>
                          {isOnline(member) ? '● Online' : '○ Offline'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ParticipantsPage;