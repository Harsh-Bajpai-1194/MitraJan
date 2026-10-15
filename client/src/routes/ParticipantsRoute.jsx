import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ParticipantsPage from '../pages/ParticipantsPage';

/**
 * Route wrapper that resolves parameters and navigates back to active room or discover view.
 */
function ParticipantsRoute({ room, isLoggedIn, theme, setTheme, onlineUsers }) {
  const { roomName } = useParams();
  const decodedRoomName = roomName || '';
  const navigate = useNavigate();

  const handleClose = () => {
    if (room && isLoggedIn) {
      navigate(`/chat/${encodeURIComponent(room)}`);
    } else {
      navigate('/discover');
    }
  };

  const isCurrentRoom = Boolean(
    room &&
    decodedRoomName &&
    room.trim().toLowerCase() === decodedRoomName.trim().toLowerCase()
  );

  return (
    <ParticipantsPage
      roomName={decodedRoomName}
      onClose={handleClose}
      theme={theme}
      setTheme={setTheme}
      onlineUsers={isCurrentRoom ? onlineUsers : []}
    />
  );
}

export default ParticipantsRoute;

