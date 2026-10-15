import React from 'react';
import { FaPlay, FaPause, FaStepForward } from 'react-icons/fa';

/**
 * Background audio player bar with scrolling track marquee and controls.
 */
function MusicPlayer({
  isMusicPlaying,
  toggleMusic,
  playNextRandomSong,
  currentSongTitle
}) {
  return (
    <div className="music-player-group">
      <div className="music-buttons-row">
        <button
          onClick={toggleMusic}
          className="btn-secondary"
          title={isMusicPlaying ? 'Pause Music' : 'Play Music'}
          aria-label={isMusicPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isMusicPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button
          onClick={playNextRandomSong}
          className="btn-secondary"
          title="Skip Song"
          aria-label="Skip Song"
        >
          <FaStepForward />
        </button>
      </div>
      <div className="music-player-bar" title={currentSongTitle}>
        <div className="music-info-marquee">
          <div className={`music-marquee-track ${isMusicPlaying ? 'scrolling' : ''}`}>
            <span className="music-marquee-item">
              <span className="music-note-icon">{isMusicPlaying ? '🎵' : '🔇'}</span>
              <span className="music-song-title">
                {isMusicPlaying ? currentSongTitle : 'Music Paused'}
              </span>
            </span>
            <span className="music-marquee-item" aria-hidden="true">
              <span className="music-note-icon">{isMusicPlaying ? '🎵' : '🔇'}</span>
              <span className="music-song-title">
                {isMusicPlaying ? currentSongTitle : 'Music Paused'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;