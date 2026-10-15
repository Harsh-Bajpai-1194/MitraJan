import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Admin from '../pages/Admin';

/**
 * Protected route wrapper ensuring admin permissions before mounting the Admin dashboard.
 */
function AdminRoute({ socketRef, room, isLoggedIn, isAdmin }) {
  const navigate = useNavigate();

  const handleClose = () => {
    if (room && isLoggedIn) {
      navigate(`/chat/${encodeURIComponent(room)}`);
    } else {
      navigate('/login');
    }
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Admin
      socket={socketRef.current}
      onClose={handleClose}
    />
  );
}

export default AdminRoute;

