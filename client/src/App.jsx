import './App.css';
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getSocketUrl } from './socket';

// Page Routes
import DiscoverRooms from './pages/DiscoverRooms';
import ParticipantsPage from './pages/ParticipantsPage';
import LoginView from './pages/LoginView';
import ChatRoomPage from './pages/ChatRoomPage';
import Admin from './pages/Admin';

import { getAvatarUrl } from './utils/getAvatarUrl.js';

const getFormattedTime = (timestamp) => {
  if (!timestamp) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? timestamp : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getSongTitleFromUrl = (url) => {
  if (!url) return 'Cloudinary Music Track';
  try {
    const filename = url.split('/').pop().split('?')[0];
    const nameWithoutExt = filename.replace(/\.(mp3|wav|mp4|m4a|ogg|aac)$/i, '');
    const cleaned = nameWithoutExt.replace(/_[a-z0-9]{6,8}$/i, '').replace(/_/g, ' ');
    return decodeURIComponent(cleaned);
  } catch (err) {
    return 'Cloudinary Track';
  }
};

const defaultCloudinarySongs = [
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979770/Vaari_Jaavan_Psytrance_Mix_lcf4g8.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979767/Rang_De_Lal_Oye_Oye_Bollytech_Mashup_fcionh.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979751/The_OTC_Roman_Reigns_makes_his_entrance_at_WrestleMania_42_WWE_WrestleMania_42_4_19_26_-_WWE_on_Netflix_oro3bz.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979738/Phir_Se_-_8K_Video_Dhurandhar_The_Revenge_Ranveer_Singh_Shashwat_Sachdev_Arijit_S_Irshad_K_-_T-Series_nlw65f.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979732/TAMMA_TAMMA_Full_Video_Dhurandhar_The_Revenge_Ranveer_Singh_Sanjay_Dutt_Bappi_L_Anuradha_P_-_T-Series_rn8dyz.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979732/Shararat_Techno_Mashup_ugdkdi.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979731/Run_Down_The_City_x_Rumble_Mashup_xitlgn.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979725/Roman_Reigns_I_Am_Greatness_Intro_Cut_ekahyr.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979714/Shakira_-_Waka_Waka_This_Time_for_Africa_The_Official_2010_FIFA_World_Cup_Song_-_shakiraVEVO_a5h2ke.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979700/Made_In_India_-_Alisha_Chinai_Official_Video_Biddu_Shyam_Anuragi_-_SonyMusicIndiaVEVO_tnvxjp.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979639/Main_Aur_Tu_Bollytech_Mashup_iki1mc.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979625/John_Cena_-_The_Time_Is_Now_Entrance_Theme_copy_smfbkm.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979616/Hum_Pyaar_Karne_Wale_Electro_House_Mashup_lx5hsu.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979609/Ishq_Jalakar_Bollytech_Mashup_sjlm9k.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979594/India_-_Unreal_World_Cup_Anthem_-_Unreal_Fc_Content_fdg22k.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979584/Gehra_Hua_Melodic_Techno_Mashup_jutpyh.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979567/Ed_Sheeran_-_Shape_of_You_Official_Music_Video_-_Ed_Sheeran_vwfe2f.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979564/Give_Me_Some_Sunshine_-_Aamir_Khan_Madhavan_Sharman_J_Suraj_Jagan_Shantanu_Moitra_3_Idiots_-_Dil_Se_Bollywood_24x7_glwuqe.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979551/Dhurandhar_The_Revenge_-_Aari_Aari_-_Dhurandhar_The_Revenge_320_kbps_lky23v.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979523/CM_Punk_-_Theme_Song__mp3.pm_ydyaqq.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979503/Run_Down_The_City_x_Rumble_Mashup_zvg5hl.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784979407/Roman_Reigns_I_Am_Greatness_Intro_Cut_rf1piv.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784978423/Dhurandhar-Title-Track-Mp3-Song-by-Hanumankind_PagalWorldi.com.co_ip41xj.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784978401/JAIYE_SAJANA_Video_Dhurandhar_The_Revenge_Ranveer_Singh_Shashwat_S_Satinder_S_Jasmine_S_-_T-Series_xv8d6k.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784966560/Dhurandhar-Title-Track-Mp3-Song-by-Hanumankind_PagalWorldi.com.co_ym91nf.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784966560/JAAN_SE_GUZARTE_HAIN_Full_Video_Dhurandhar_The_Revenge_Ranveer_Singh_Shashwat_Sachdev_Khan_Saab_-_T-Series_gomfhr.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784952946/John_Cena_-_The_Time_Is_Now_Entrance_Theme_copy_ovdfun.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784952589/John_Cena_-_The_Time_Is_Now_Entrance_Theme_copy_jgjrdu.mp3",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1772783708/samples/cld-sample-video.mp4",
  "https://res.cloudinary.com/dhet30juy/video/upload/v1772783708/samples/elephants.mp4"
];

function App() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [email, setEmail] = useState('');
  const [picture, setPicture] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFetchingOlderMessages, setIsFetchingOlderMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(() => Math.floor(Math.random() * defaultCloudinarySongs.length));
  const audioRef = useRef(null);
  const unplayedIndicesRef = useRef([]);
  const pendingJoinRef = useRef(null);
  const roomRef = useRef();
  const typingTimeoutRef = useRef(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [soundFiles, setSoundFiles] = useState(defaultCloudinarySongs);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const backgroundOptions = [
    { name: 'Default', value: '', color: '#ffffff', textColor: '#1e293b' },
    { name: 'Aqua', value: '#e0f7fa', color: '#e0f7fa', textColor: '#0e7490' },
    { name: 'Green', value: '#dcfce7', color: '#dcfce7', textColor: '#15803d' },
    { name: 'Yellow', value: '#fef9c3', color: '#fef9c3', textColor: '#a16207' },
    { name: 'Orange', value: '#ffedd5', color: '#ffedd5', textColor: '#c2410c' },
    { name: 'Pink', value: '#fce7f3', color: '#fce7f3', textColor: '#be185d' },
    { name: 'Red', value: '#fee2e2', color: '#fee2e2', textColor: '#b91c1c' },
    { name: 'Navy Blue', value: '#1e293b', color: '#1e293b', textColor: '#ffffff' },
    { name: 'Sky Blue', value: '#bae6fd', color: '#bae6fd', textColor: '#0369a1' },
    { name: 'Violet', value: '#f3e8ff', color: '#f3e8ff', textColor: '#6b21a8' },
  ];
  const [selectedBackground, setSelectedBackground] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [showCreateRoomPopup, setShowCreateRoomPopup] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [pendingRoomSwitch, setPendingRoomSwitch] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [roomsSignature, setRoomsSignature] = useState(Date.now());
  const scrollHeightBeforeUpdate = useRef(null);
  const skipScrollToBottomRef = useRef(false);
  const prevMessagesCountRef = useRef(0);

  // User Settings: Enter is Send & Spam Protection
  const [enterIsSend, setEnterIsSend] = useState(() => {
    const saved = localStorage.getItem('setting_enterIsSend');
    return saved !== null ? saved === 'true' : true;
  });
  const [spamProtection, setSpamProtection] = useState(() => {
    const saved = localStorage.getItem('setting_spamProtection');
    return saved !== null ? saved === 'true' : true;
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [spamWarning, setSpamWarning] = useState('');
  const lastMessageTimeRef = useRef(0);
  const lastMessageTextRef = useRef('');

  const toggleEnterIsSend = () => {
    setEnterIsSend((prev) => {
      const next = !prev;
      localStorage.setItem('setting_enterIsSend', String(next));
      return next;
    });
  };

  const toggleSpamProtection = () => {
    setSpamProtection((prev) => {
      const next = !prev;
      localStorage.setItem('setting_spamProtection', String(next));
      return next;
    });
  };

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch(`${getSocketUrl()}/api/folder-songs`);
        const songs = await response.json();
        if (Array.isArray(songs) && songs.length > 0) {
          const uniqueSongs = Array.from(new Set(songs));
          setSoundFiles(uniqueSongs);
        }
      } catch (err) {
        console.warn('Could not fetch songs from backend, using defaults.');
      }
    };
    fetchSongs();
  }, []);

  const startMusic = useCallback(() => {
    setIsMusicPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const joinChatRoomCallback = useCallback((roomToJoin, userToSet, emailToSet = '', pictureToSet = '') => {
    const trimmedRoom = (roomToJoin || '').trim();
    if (!trimmedRoom) return 'error';

    if (room && room.trim().toLowerCase() !== trimmedRoom.toLowerCase()) {
      setPendingRoomSwitch({
        targetRoom: trimmedRoom,
        username: userToSet,
        email: emailToSet,
        picture: pictureToSet
      });
      return 'pending_confirm';
    }

    setRoom(trimmedRoom);
    setUsername(userToSet);
    setEmail(emailToSet);
    setPicture(pictureToSet);
    setIsLoggedIn(true);
    setMessages([]);
    localStorage.setItem('chatSession', JSON.stringify({ name: userToSet, email: emailToSet, picture: pictureToSet }));

    if (socketRef.current) {
      if (socketRef.current.connected) {
        socketRef.current.emit('join room', trimmedRoom);
        socketRef.current.emit('set username', userToSet, trimmedRoom, emailToSet, pictureToSet);
      } else {
        pendingJoinRef.current = { room: trimmedRoom, username: userToSet, email: emailToSet, picture: pictureToSet };
      }
    }
    startMusic();
    navigate(`/chat/${encodeURIComponent(trimmedRoom)}`);
    return 'joined'; 
  }, [room, startMusic, navigate]);

  const toggleBackgroundPicker = () => { 
    setShowBackgroundPicker((prev) => !prev);
  };
  const selectBackground = (bg) => {
    setSelectedBackground(bg);
    setShowBackgroundPicker(false);
  };
  const scrollToBottom = useCallback((instant = false) => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: instant ? "auto" : "smooth" });
    }
  }, []);

  useLayoutEffect(() => {
    const isDeletion = skipScrollToBottomRef.current || (prevMessagesCountRef.current > 0 && messages.length < prevMessagesCountRef.current);
    skipScrollToBottomRef.current = false;
    prevMessagesCountRef.current = messages.length;
    if (isDeletion) return;
    if (scrollHeightBeforeUpdate.current !== null) {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight - scrollHeightBeforeUpdate.current;
      }
      scrollHeightBeforeUpdate.current = null;
    } else {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    roomRef.current = room;
    if (room && isLoggedIn) {
      scrollToBottom(true);
      const timer1 = setTimeout(() => scrollToBottom(true), 50);
      const timer2 = setTimeout(() => scrollToBottom(true), 150);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [room, isLoggedIn, scrollToBottom]);

  useEffect(() => {
    const newSocket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = newSocket;

    const handleConnect = () => {
      const pendingJoin = pendingJoinRef.current;
      if (pendingJoin) {
        newSocket.emit('join room', pendingJoin.room);
        newSocket.emit('set username', pendingJoin.username, pendingJoin.room, pendingJoin.email, pendingJoin.picture);
      } else if (roomRef.current) {
        newSocket.emit('join room', roomRef.current);
      }
    };

    const handleChatMessage = (message) => {
      if (!message) return;
      const currentRoom = (roomRef.current || '').trim().toLowerCase();
      const msgRoom = (message.room || '').trim().toLowerCase();
      if (!msgRoom || msgRoom === currentRoom) {
        setMessages((prevMessages) => [...prevMessages, { ...message, room: message.room || roomRef.current, type: 'chat', time: getFormattedTime(message.timestamp) }]);
      }
    };

    const handleSystemMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, { text: message, type: 'system', time: getFormattedTime(), room: roomRef.current, timestamp: Date.now() }]);
    };

    const handleChatHistory = (history, roomName) => {
      const currentRoom = (roomRef.current || '').trim().toLowerCase();
      const historyRoom = (roomName || '').trim().toLowerCase();
      if (!currentRoom || currentRoom === historyRoom) {
        const safeHistory = Array.isArray(history) ? history : [];
        const formattedHistory = safeHistory.map(msg => ({
          ...msg,
          room: msg.room || roomName,
          type: msg.username ? 'chat' : 'system', 
          time: getFormattedTime(msg.timestamp)
        }));
        setMessages(prevMessages => {
          const otherMessages = prevMessages.filter(msg => {
            if (!msg.room) return false;
            return msg.room.trim().toLowerCase() !== historyRoom;
          });
          return [...otherMessages, ...formattedHistory];
        });
        setTimeout(() => scrollToBottom(true), 50);
        setTimeout(() => scrollToBottom(true), 150);
      }
    };

    const handleOlderMessages = (olderMessages, roomName) => {
      const currentRoom = (roomRef.current || '').trim().toLowerCase();
      const historyRoom = (roomName || '').trim().toLowerCase();
      if (currentRoom === historyRoom && Array.isArray(olderMessages) && olderMessages.length > 0) {
        const container = messagesContainerRef.current;
        if (container) {
          scrollHeightBeforeUpdate.current = container.scrollHeight;
        }
        const formattedHistory = olderMessages.map(msg => ({
          ...msg,
          type: msg.username ? 'chat' : 'system', 
          time: getFormattedTime(msg.timestamp)
        }));
        setMessages(prevMessages => [...formattedHistory, ...prevMessages]);
      }
      setIsFetchingOlderMessages(false);
    };

    const handleRoomsUpdated = () => {
      setRoomsSignature(Date.now());
    };

    const handleMessageDeleted = (messageId) => {
      skipScrollToBottomRef.current = true;
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
    };

    const handleRoomUsers = (users) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    };

    const handleDisconnect = () => {
      setOnlineUsers([]);
    };

    newSocket.on('room users', handleRoomUsers);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('connect', handleConnect);
    newSocket.on('chat message', handleChatMessage);
    newSocket.on('system message', handleSystemMessage);
    newSocket.on('chat history', handleChatHistory);
    newSocket.on('older messages', handleOlderMessages);
    newSocket.on('rooms updated', handleRoomsUpdated);
    newSocket.on('message deleted', handleMessageDeleted);

    if (newSocket.connected) {
      handleConnect();
    }

    newSocket.on("typing", (username) => {
      setTypingUser(`${username} is typing...`);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser("");
      }, 2000);
    });

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('chat message', handleChatMessage);
      newSocket.off('system message', handleSystemMessage);
      newSocket.off('chat history', handleChatHistory);
      newSocket.off('older messages', handleOlderMessages);
      newSocket.off("typing");
      newSocket.off('message deleted', handleMessageDeleted);
      newSocket.off('rooms updated', handleRoomsUpdated);
      newSocket.off('room users', handleRoomUsers);
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [scrollToBottom, setMessages, roomRef, setIsFetchingOlderMessages, setRoomsSignature, skipScrollToBottomRef, setTypingUser, messagesContainerRef, scrollHeightBeforeUpdate, pendingJoinRef, typingTimeoutRef]);

  const playNextSong = useCallback(() => {
    if (soundFiles.length === 0) return;
    if (soundFiles.length === 1) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }
    if (unplayedIndicesRef.current.length === 0) {
      unplayedIndicesRef.current = Array.from({ length: soundFiles.length }, (_, i) => i)
        .filter(i => i !== currentSongIndex);
    }
    const randPick = Math.floor(Math.random() * unplayedIndicesRef.current.length);
    const nextIdx = unplayedIndicesRef.current[randPick];
    unplayedIndicesRef.current.splice(randPick, 1);
    setCurrentSongIndex(nextIdx);
  }, [soundFiles, currentSongIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const currentTrack = soundFiles[currentSongIndex];
    if (currentTrack) {
      audio.src = currentTrack;
      if (isMusicPlaying) {
        audio.play().catch(() => {});
      }
    }
    const handleEnded = () => playNextSong();
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentSongIndex, isMusicPlaying, soundFiles, playNextSong]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    if (spamProtection) {
      const now = Date.now();
      const timeSinceLastMessage = now - lastMessageTimeRef.current;
      const isDuplicate = currentMessage.trim().toLowerCase() === lastMessageTextRef.current.trim().toLowerCase();

      if (timeSinceLastMessage < 1500) {
        setSpamWarning('Please wait a moment before sending another message.');
        setTimeout(() => setSpamWarning(''), 3000);
        return;
      }
      if (isDuplicate && timeSinceLastMessage < 5000) {
        setSpamWarning('Please avoid sending duplicate messages so quickly.');
        setTimeout(() => setSpamWarning(''), 3000);
        return;
      }
      lastMessageTimeRef.current = now;
      lastMessageTextRef.current = currentMessage;
    }

    if (socketRef.current && (room || '').trim()) {
      socketRef.current.emit('chat message', currentMessage, (room || '').trim());
      setCurrentMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleOpenCreateRoomPopup = () => {
    setShowCreateRoomPopup(true);
  };

  const handleCreateRoomSubmit = (e) => {
    e.preventDefault();
    const trimmed = (newRoomName || '').trim();
    if (!trimmed) return;
    const defaultUsername = username.trim() || 'GuestUser';
    setUsername(defaultUsername);
    setShowCreateRoomPopup(false);
    setNewRoomName('');
    joinChatRoomCallback(trimmed, defaultUsername, email, picture);
  };

  const confirmRoomSwitch = () => {
    if (!pendingRoomSwitch) return;
    const { targetRoom, username: u, email: em, picture: pic } = pendingRoomSwitch;
    setPendingRoomSwitch(null);

    if (socketRef.current?.connected && room) {
      socketRef.current.emit('leave room', room);
    }
    setRoom(targetRoom);
    setUsername(u);
    setEmail(em);
    setPicture(pic);
    setIsLoggedIn(true);
    setMessages([]);
    localStorage.setItem('chatSession', JSON.stringify({ name: u, email: em, picture: pic }));

    if (socketRef.current?.connected) {
      socketRef.current.emit('join room', targetRoom);
      socketRef.current.emit('set username', u, targetRoom, em, pic);
    }
    startMusic();
    navigate(`/chat/${encodeURIComponent(targetRoom)}`);
  };

  const handleGoogleSignIn = (user) => {
    setUsername(user.name);
    setEmail(user.email);
    setPicture(user.picture);
    setShowRoomForm(true);
  };

  const handleDeleteMessage = (messageId) => {
    if (socketRef.current && room) {
      socketRef.current.emit('delete message', messageId, room);
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current?.connected && room) {
      socketRef.current.emit('leave room', room);
    }
    pendingJoinRef.current = null;
    setIsLoggedIn(false);
    setRoom('');
    setEmail('');
    setPicture('');
    setIsAdmin(false);
    setOnlineUsers([]);
    localStorage.removeItem('chatSession');
    navigate('/login');
  };

  const handleOpenDiscoverRooms = () => {
    navigate('/discover');
  };

  const handleAdminLogin = () => {
    const adminUsername = username.trim() || 'AdminUser';
    const adminEmail = 'harshbajpai1194@gmail.com';
    const avatarUrl = getAvatarUrl(adminUsername, '', adminEmail);
    setUsername(adminUsername);
    setEmail(adminEmail);
    setPicture(avatarUrl);
    setIsAdmin(true);
    setShowRoomForm(true);
  };

  const handleViewMembers = (roomName) => {
    navigate(`/participants/${encodeURIComponent(roomName)}`);
  };

  const toggleMusic = useCallback(() => {
    setIsMusicPlaying((prev) => !prev);
  }, []);

  const playNextRandomSong = useCallback(() => {
    playNextSong();
  }, [playNextSong]);

  return (
    <>
      <audio ref={audioRef} preload="auto"/>
      {showCreateRoomPopup && (
        <div className="popup-overlay">
          <form onSubmit={handleCreateRoomSubmit} className="login-form">
            <h2>Create a New Room</h2>
            <input
              type="text"
              placeholder="Enter room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              required
              autoFocus
            />
            <div className="form-actions">
              <button className="btn-primary" type="submit">Join</button>
              <button className="btn-secondary" type="button" onClick={() => { setShowCreateRoomPopup(false); setNewRoomName(''); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {pendingRoomSwitch && (
        <div className="popup-overlay">
          <div className="login-form" style={{ maxWidth: '420px' }}>
            <h2>Switch Room?</h2>
            <p style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
              Are you sure you want to join this room? This will make you leave the previous room.
            </p>
            <div className="form-actions">
              <button className="btn-primary" type="button" onClick={confirmRoomSwitch}>Yes, Join Room</button>
              <button className="btn-secondary" type="button" onClick={() => setPendingRoomSwitch(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/" element={
          isLoggedIn && room ? (
            <Navigate to={`/chat/${encodeURIComponent(room)}`} replace />
          ) : (
            <LoginView
              showRoomForm={showRoomForm}
              setShowRoomForm={setShowRoomForm}
              username={username}
              setUsername={setUsername}
              handleGoogleSignIn={handleGoogleSignIn}
              handleOpenDiscoverRooms={handleOpenDiscoverRooms}
              handleOpenCreateRoomPopup={handleOpenCreateRoomPopup}
              handleAdminLogin={handleAdminLogin}
              isAdmin={isAdmin}
              theme={theme}
              setTheme={setTheme}
            />
          )
        } />
        <Route path="/login" element={
          isLoggedIn && room ? (
            <Navigate to={`/chat/${encodeURIComponent(room)}`} replace />
          ) : (
            <LoginView
              showRoomForm={showRoomForm}
              setShowRoomForm={setShowRoomForm}
              username={username}
              setUsername={setUsername}
              handleGoogleSignIn={handleGoogleSignIn}
              handleOpenDiscoverRooms={handleOpenDiscoverRooms}
              handleOpenCreateRoomPopup={handleOpenCreateRoomPopup}
              handleAdminLogin={handleAdminLogin}
              isAdmin={isAdmin}
              theme={theme}
              setTheme={setTheme}
            />
          )
        } />
        <Route path="/discover" element={
          <DiscoverRooms
            joinChatRoom={joinChatRoomCallback}
            onClose={() => {
              if (room && isLoggedIn) {
                navigate(`/chat/${encodeURIComponent(room)}`);
              } else {
                navigate('/login');
              }
            }}
            onJoin={(joinedRoom) => {
              if (joinedRoom) {
                navigate(`/chat/${encodeURIComponent(joinedRoom)}`);
              }
            }}
            username={username}
            email={email}
            picture={picture}
            onViewMembers={handleViewMembers}
            roomsSignature={roomsSignature}
            isAdmin={isAdmin}
            onOpenAdmin={() => navigate('/admin')}
            toggleBackgroundPicker={toggleBackgroundPicker}
            theme={theme}
            setTheme={setTheme}
          />
        } />
        <Route path="/participants/:roomName" element={
          <ParticipantsRoute
            room={room}
            isLoggedIn={isLoggedIn}
            theme={theme}
            setTheme={setTheme}
            onlineUsers={onlineUsers}
          />
        } />
        <Route path="/chat/:roomName" element={
          <ChatRoomPage
            room={room}
            setRoom={setRoom}
            isLoggedIn={isLoggedIn}
            username={username}
            email={email}
            picture={picture}
            onlineUsers={onlineUsers}
            joinChatRoomCallback={joinChatRoomCallback}
            selectedBackground={selectedBackground}
            toggleMusic={toggleMusic}
            isMusicPlaying={isMusicPlaying}
            playNextRandomSong={playNextRandomSong}
            soundFiles={soundFiles}
            currentSongIndex={currentSongIndex}
            toggleBackgroundPicker={toggleBackgroundPicker}
            isAdmin={isAdmin}
            handleOpenAdminPanel={() => navigate('/admin')}
            handleOpenDiscoverRooms={handleOpenDiscoverRooms}
            handleLeaveRoom={handleLeaveRoom}
            showBackgroundPicker={showBackgroundPicker}
            backgroundOptions={backgroundOptions}
            selectBackground={selectBackground}
            showAdminPanel={showAdminPanel}
            setShowAdminPanel={setShowAdminPanel}
            socketRef={socketRef}
            messagesContainerRef={messagesContainerRef}
            isFetchingOlderMessages={isFetchingOlderMessages}
            messages={messages}
            handleDeleteMessage={handleDeleteMessage}
            messagesEndRef={messagesEndRef}
            typingUser={typingUser}
            sendMessage={sendMessage}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            setCurrentMessage={setCurrentMessage}
            currentMessage={currentMessage}
            enterIsSend={enterIsSend}
            toggleEnterIsSend={toggleEnterIsSend}
            spamProtection={spamProtection}
            toggleSpamProtection={toggleSpamProtection}
            showSettingsModal={showSettingsModal}
            setShowSettingsModal={setShowSettingsModal}
            spamWarning={spamWarning}
            theme={theme}
            setTheme={setTheme}
            getSongTitleFromUrl={getSongTitleFromUrl}
          />
        } />
        <Route path="/admin" element={
          <AdminRoute
            socketRef={socketRef}
            room={room}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
          />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function ParticipantsRoute({ room, isLoggedIn, theme, setTheme, onlineUsers }) {
  const { roomName } = useParams();
  const decodedRoomName = decodeURIComponent(roomName || '');
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

export default App;