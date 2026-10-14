import React from 'react';
import GoogleSignIn from '../components/GoogleSignIn';

/**
 * Entry screen for Google Authentication, Guest Login, and Room Creation modal triggers.
 */
function LoginView({
  showRoomForm,
  setShowRoomForm,
  username,
  setUsername,
  handleGoogleSignIn,
  handleOpenDiscoverRooms,
  handleOpenCreateRoomPopup,
  handleAdminLogin,
  isAdmin,
  theme,
  setTheme
}) {
  const isDevTesting = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`login-container ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div style={{ position: 'absolute', top: '16px', right: '24px' }}>
        <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {!showRoomForm ? (
        <div className="login-form">
          <h2>Join Chat</h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '20px',
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}>
              <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
              </svg>
              Release <span style={{ background: '#e11d48', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '0.7rem' }}>v1.4.1</span>
            </span>
          </div>

          <GoogleSignIn onSuccess={handleGoogleSignIn} />
          <div className="login-divider">
            <span>OR</span>
          </div>
          <div className="form-actions" style={{ flexDirection: 'column', gap: '10px' }}>
            <button className="btn-primary" type="button" onClick={() => setShowRoomForm(true)}>
              Join as a Guest User
            </button>
            {isDevTesting && (
              <button
                className="btn-secondary"
                type="button"
                onClick={handleAdminLogin}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px dashed #e02424', color: '#ff6b6b' }}
                title="Only visible for local and development testing"
              >
                🛡️ Login as Admin <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>(Local Testing Only)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="login-form">
          <h2>
            Welcome{username ? `, ${username}` : ''}!{' '}
            {isAdmin && (
              <span style={{ fontSize: '0.8rem', background: '#e02424', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', marginLeft: '6px', verticalAlign: 'middle', fontWeight: 'bold' }}>
                Admin
              </span>
            )}
          </h2>
          <p style={{ textAlign: 'center', margin: '0 0 20px 0' }}>How would you like to join?</p>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleOpenDiscoverRooms}>Discover Rooms</button>
            <button className="btn-primary" onClick={handleOpenCreateRoomPopup}>Create a New Room</button>
            <button className="btn-secondary" type="button" onClick={() => { setShowRoomForm(false); setUsername(''); }}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginView;