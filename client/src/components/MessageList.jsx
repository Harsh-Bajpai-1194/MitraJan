import React from 'react';
import { getAvatarUrl } from '../utils/getAvatarUrl.js';
import { getUserColor } from '../utils/getUserColor.js';

/**
 * Chat history feed with system notices, messages, and deletion triggers.
 */
function MessageList({
  messages,
  room,
  searchQuery,
  username,
  isAdmin,
  handleDeleteMessage,
  isFetchingOlderMessages,
  messagesContainerRef,
  messagesEndRef
}) {
  return (
    <main className="chat-messages" ref={messagesContainerRef}>
      {isFetchingOlderMessages && (
        <div className="loading-older-messages" style={{ textAlign: 'center', padding: '10px' }}>
          Loading...
        </div>
      )}
      {messages
        .filter((msg) => {
          if (!msg.room) return true;
          return msg.room.trim().toLowerCase() === (room || '').trim().toLowerCase();
        })
        .filter((msg) => {
          const query = (searchQuery || '').toLowerCase();
          return (
            msg.text?.toLowerCase().includes(query) ||
            msg.username?.toLowerCase().includes(query)
          );
        })
        .sort((a, b) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timeA - timeB;
        })
        .map((msg, idx) => {
          const keyVal = msg._id || `${msg.timestamp || ''}-${msg.username || 'sys'}-${idx}`;
          if (msg.type !== 'chat') {
            return (
              <div key={keyVal} className="message-item system">
                <span className="system-text">{msg.text}</span>
              </div>
            );
          }
          const isOwnMessage = msg.username === username;

          return (
            <div key={keyVal} className={`message-wrapper ${isOwnMessage ? 'own-message-wrapper' : ''}`}>
              <div className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}>
                <img className="avatar" src={getAvatarUrl(msg.username, msg.picture, msg.email)} alt={`${msg.username}'s avatar`} />
                <div className="message-content">
                  <div className="message-header">
                    <span className="username" style={{ color: getUserColor(msg.username), fontWeight: 600 }}>
                      {msg.username}
                    </span>
                    <span className="timestamp">{msg.time}</span>
                  </div>
                  <span className="text">{msg.text}</span>
                </div>
              </div>
              {(isAdmin || isOwnMessage) && (
                <button
                  onClick={() => handleDeleteMessage(msg._id)}
                  className="delete-btn"
                  title="Delete message"
                  aria-label="Delete message"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M10 2h4a1 1 0 0 1 1 1v1h4a1 1 0 0 1 1 1v1.5a0.5 0.5 0 0 1-0.5 0.5H3.5A0.5 0.5 0 0 1 3 6.5V5a1 1 0 0 1 1-1h4V3a1 1 0 0 1 1-1zm1 2v1h2V4h-2zM4.5 9h15l-1.15 12.05A2 2 0 0 1 16.36 23H7.64a2 2 0 0 1-1.99-1.95L4.5 9zM9.5 12a0.75 0.75 0 0 0-0.75 0.75v6.5a0.75 0.75 0 0 0 1.5 0v-6.5A0.75 0.75 0 0 0 9.5 12zm2.5 0a0.75 0.75 0 0 0-0.75 0.75v6.5a0.75 0.75 0 0 0 1.5 0v-6.5A0.75 0.75 0 0 0 12 12zm2.5 0a0.75 0.75 0 0 0-0.75 0.75v6.5a0.75 0.75 0 0 0 1.5 0v-6.5A0.75 0.75 0 0 0 14.5 12z" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      <div ref={messagesEndRef} />
    </main>
  );
}

export default MessageList;