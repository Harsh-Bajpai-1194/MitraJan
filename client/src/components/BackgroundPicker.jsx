import React from 'react';

/**
 * Color palette selector for custom room background themes.
 */
function BackgroundPicker({ backgroundOptions, selectedBackground, selectBackground }) {
  return (
    <div className="background-picker">
      {backgroundOptions.map((bg) => (
        <button
          key={bg.name}
          type="button"
          className={`background-thumb ${selectedBackground === bg.value ? 'active' : ''}`}
          style={{
            backgroundColor: bg.color,
            color: bg.textColor,
            borderColor: selectedBackground === bg.value ? '#2563eb' : 'rgba(0,0,0,0.12)'
          }}
          onClick={() => selectBackground(bg.value)}
          title={`${bg.name} Background`}
        >
          <span
            className="thumb-color-dot"
            style={{ backgroundColor: bg.color === '#ffffff' ? '#e2e8f0' : 'rgba(0,0,0,0.15)' }}
          />
          <span className="thumb-name">{bg.name}</span>
        </button>
      ))}
    </div>
  );
}

export default BackgroundPicker;