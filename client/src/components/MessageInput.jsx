import React from 'react';
import EmojiPicker from 'emoji-picker-react';

/**
 * Message compose bar with emoji picker and typing dispatch.
 */
function MessageInput({
  sendMessage,
  currentMessage,
  setCurrentMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  socketRef,
  room,
  username,
  enterIsSend
}) {
  return (
    <form onSubmit={sendMessage} className="message-form">
      {showEmojiPicker && (
        <div className="emoji-picker-container">
          <button
            type="button"
            className="close-emoji-picker-btn"
            onClick={() => setShowEmojiPicker(false)}
            title="Close emoji picker"
            aria-label="Close emoji picker"
          >
            ✕
          </button>
          <EmojiPicker onEmojiClick={(emojiObject) => setCurrentMessage((prev) => prev + emojiObject.emoji)} />
        </div>
      )}
      <button
        type="button"
        className={`emoji-btn ${showEmojiPicker ? 'active' : ''}`}
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        title={showEmojiPicker ? 'Close emojis' : 'Open emojis'}
        aria-label={showEmojiPicker ? 'Close emojis' : 'Open emojis'}
      >
        {showEmojiPicker ? '✕' : '😀'}
      </button>
      <input
        type="text"
        placeholder="Type a message..."
        value={currentMessage}
        onChange={(e) => {
          setCurrentMessage(e.target.value);
          if (socketRef.current && (room || '').trim()) {
            socketRef.current.emit('typing', {
              room: (room || '').trim(),
              username,
            });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !enterIsSend) {
            e.preventDefault();
          }
        }}
      />
      <button className="btn-primary" type="submit">
        Send
      </button>
    </form>
  );
}

export default MessageInput;