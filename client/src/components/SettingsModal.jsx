import React from 'react';

/**
 * Settings dialog for toggling Enter-is-Send, Spam Protection, and Admin navigation.
 */
function SettingsModal({
  showSettingsModal,
  setShowSettingsModal,
  enterIsSend,
  toggleEnterIsSend,
  spamProtection,
  toggleSpamProtection,
  isAdmin,
  handleOpenAdminPanel
}) {
  if (!showSettingsModal) return null;

  return (
    <div className="popup-overlay" onClick={() => setShowSettingsModal(false)}>
      <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <div className="settings-title">
            <img src={`${process.env.PUBLIC_URL}/settings.png`} alt="Settings" style={{ width: '22px', height: '22px' }} />
            <h3>Settings</h3>
          </div>
          <button className="settings-close-btn" onClick={() => setShowSettingsModal(false)} aria-label="Close Settings">
            ✕
          </button>
        </div>

        <div className="settings-modal-body">
          {/* Option 1: Enter is Send */}
          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">Enter is Send</span>
              <span className="settings-desc">Send messages by pressing Enter key</span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${enterIsSend ? 'enabled' : 'disabled'}`}
              onClick={toggleEnterIsSend}
              title={enterIsSend ? 'Enabled' : 'Disabled'}
              aria-label="Enter is Send toggle"
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          {/* Option 2: Spam Protection */}
          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">Spam Protection</span>
              <span className="settings-desc">Prevent rapid or duplicate messages</span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${spamProtection ? 'enabled' : 'disabled'}`}
              onClick={toggleSpamProtection}
              title={spamProtection ? 'Enabled' : 'Disabled'}
              aria-label="Spam Protection toggle"
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          {isAdmin && (
            <div className="settings-row admin-row" style={{ marginTop: '4px', borderStyle: 'dashed', borderColor: '#fca5a5', background: '#fff5f5' }}>
              <div className="settings-info">
                <span className="settings-label" style={{ color: '#991b1b' }}>Admin Panel 🛡️</span>
                <span className="settings-desc">Server moderation & user controls</span>
              </div>
              <button
                type="button"
                className="btn-danger"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => {
                  setShowSettingsModal(false);
                  handleOpenAdminPanel();
                }}
              >
                Open
              </button>
            </div>
          )}
        </div>

        <div className="settings-modal-footer">
          <button className="btn-secondary" onClick={() => setShowSettingsModal(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;