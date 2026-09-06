import './App.css';
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import GoogleSignIn from './GoogleSignIn';
import EmojiPicker from 'emoji-picker-react';
import { getSocketUrl } from './socket';
import DiscoverRooms from './DiscoverRooms.jsx';
import Admin from './Admin';
import ParticipantsPage from './ParticipantsPage.jsx';
import { getAvatarUrl } from './utils/getAvatarUrl.js';
import { getUserColor } from './utils/getUserColor.js';
import { FaMusic, FaVolumeMute, FaDoorOpen, FaRandom, FaPlay, FaPause, FaStepForward, FaSearch, FaTime } from 'react-icons/fa';
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
          const initialIdx = Math.floor(Math.random() * uniqueSongs.length);
          setCurrentSongIndex(initialIdx);
          unplayedIndicesRef.current = uniqueSongs.map((_, i) => i).filter((i) => i !== initialIdx);
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };
    fetchSongs();
  }, []);

  const startMusic = useCallback(() => {
    setIsMusicPlaying(true);
  }, []);
  const joinChatRoomCallback = useCallback((roomName, selectedUsername, userEmail = '', userPicture = '') => {
    setShowCreateRoomPopup(false);
    const socket = socketRef.current;
    const nextRoom = (roomName || '').trim();
    const nextUsername = (selectedUsername || '').trim() || `GuestUser${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const isSwitchingRooms = Boolean(room && room !== nextRoom);
    const finalPicture = userPicture || getAvatarUrl(nextUsername, '', userEmail);
    if (isSwitchingRooms) {
      setPendingRoomSwitch({ roomName: nextRoom, selectedUsername: nextUsername, picture: finalPicture });
      return 'confirm';
    }
    pendingJoinRef.current = { room: nextRoom, username: nextUsername, email: userEmail, picture: finalPicture };
    setRoom(nextRoom);
    roomRef.current = nextRoom;
    if (socket?.connected) {
      socket.emit('join room', nextRoom);
      socket.emit('set username', nextUsername, nextRoom, userEmail, finalPicture);
    } else {
      setMessages((prevMessages) => {
        const hasConnectingMsg = prevMessages.some(m => m.text === 'Connecting to the chat server...' && (m.room || '').trim().toLowerCase() === nextRoom.toLowerCase());
        if (hasConnectingMsg) return prevMessages;
        return [...prevMessages, { text: 'Connecting to the chat server...', type: 'system', time: getFormattedTime(), room: nextRoom }];
      });
    }
    setUsername(nextUsername);
    if (userEmail) setEmail(userEmail);
    setPicture(finalPicture);
    const sessionData = { name: nextUsername, room: nextRoom, email: userEmail, picture: finalPicture };
    localStorage.setItem('chatSession', JSON.stringify(sessionData));
    setIsLoggedIn(true);
    if (soundFiles.length > 0) {
      const randomIndex = Math.floor(Math.random() * soundFiles.length);
      setCurrentSongIndex(randomIndex);
    }
    navigate(`/chat/${encodeURIComponent(nextRoom)}`);
    return 'joined'; 
  }, [room, startMusic, setCurrentSongIndex, navigate, soundFiles, setShowCreateRoomPopup, setPendingRoomSwitch, setRoom, setUsername, setEmail, setPicture, setIsLoggedIn, setMessages]);
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
  }, [messagesContainerRef, messagesEndRef]);
  useLayoutEffect(() => {
    const isDeletion = skipScrollToBottomRef.current || (prevMessagesCountRef.current > 0 && messages.length < prevMessagesCountRef.current);
    skipScrollToBottomRef.current = false;
    prevMessagesCountRef.current = messages.length;
    if (isDeletion) {
      return;
    }
    if (scrollHeightBeforeUpdate.current !== null) {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight - scrollHeightBeforeUpdate.current;
      }
      scrollHeightBeforeUpdate.current = null;
    } else {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, skipScrollToBottomRef, prevMessagesCountRef, scrollHeightBeforeUpdate, messagesContainerRef]);
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
      newSocket.off('chat message', handleChatMessage);
      newSocket.off('system message', handleSystemMessage);
      newSocket.off('chat history', handleChatHistory);
      newSocket.off('older messages', handleOlderMessages);
      newSocket.off("typing");
      newSocket.off('message deleted', handleMessageDeleted);
      newSocket.off('rooms updated', handleRoomsUpdated);
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [scrollToBottom, setMessages, roomRef, setIsFetchingOlderMessages, setRoomsSignature, skipScrollToBottomRef, setTypingUser, messagesContainerRef, scrollHeightBeforeUpdate, room, pendingJoinRef, typingTimeoutRef]);
  const playNextSong = useCallback(() => {
    if (soundFiles.length === 0) return;
    if (soundFiles.length === 1) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setIsMusicPlaying(true);
      return;
    }

    if (!unplayedIndicesRef.current || unplayedIndicesRef.current.length === 0) {
      unplayedIndicesRef.current = soundFiles
        .map((_, i) => i)
        .filter((i) => i !== currentSongIndex);
    }

    const pool = unplayedIndicesRef.current;
    const randomPoolPos = Math.floor(Math.random() * pool.length);
    const nextSongIdx = pool[randomPoolPos];

    unplayedIndicesRef.current.splice(randomPoolPos, 1);

    setCurrentSongIndex(nextSongIdx);
    setIsMusicPlaying(true);
  }, [soundFiles, currentSongIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      playNextSong();
    };

    const handleError = (e) => {
      console.warn("Audio element error on current track, auto-skipping...", e);
      setTimeout(() => {
        playNextSong();
      }, 400);
    };

    if (isMusicPlaying && soundFiles.length > 0) {
      const currentTrack = soundFiles[currentSongIndex];
      if (currentTrack) {
        if (audio.src !== currentTrack) {
          audio.src = currentTrack;
          audio.load();
        }
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Audio play promise error:", err);
            setTimeout(() => {
              if (soundFiles.length > 1) {
                playNextSong();
              }
            }, 800);
          });
        }
      }
    } else {
      audio.pause();
    }

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isMusicPlaying, currentSongIndex, soundFiles, playNextSong]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    const handleScroll = () => {
      if (container && container.scrollTop <= 20 && !isFetchingOlderMessages && messages.length > 0) {
        const oldestMessageId = messages[0]?._id;
        if (oldestMessageId) {
          setIsFetchingOlderMessages(true);
          socketRef.current.emit('fetch older messages', {
            room: room,
            lastMessageId: oldestMessageId,
          });
        }
      }
    };
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [messages, isFetchingOlderMessages, room]);
  const joinChatRoom = joinChatRoomCallback;
  const confirmRoomSwitch = () => {
    if (!pendingRoomSwitch) return;
    const socket = socketRef.current;
    const { roomName: nextRoom, selectedUsername: nextUsername, picture: userPicture } = pendingRoomSwitch;
    const userEmail = email;
    if (socket?.connected && room) {
      socket.emit('leave room', room);
    }
    setRoom(nextRoom);
    roomRef.current = nextRoom;
    pendingJoinRef.current = { room: nextRoom, username: nextUsername, email: userEmail, picture: userPicture };
    setUsername(nextUsername);
    setPicture(userPicture);
    setPendingRoomSwitch(null);
    setShowCreateRoomPopup(false);
    if (socket?.connected) {
      socket.emit('join room', nextRoom);
      socket.emit('set username', nextUsername, nextRoom, userEmail, userPicture);
    }
    const sessionData = {
    name: nextUsername,
    room: nextRoom,
    email: userEmail,
    picture: userPicture
  };
    localStorage.setItem('chatSession', JSON.stringify(sessionData));
    if (userEmail === 'harshbajpai1194@gmail.com') setIsAdmin(true);
    setIsLoggedIn(true);
    navigate(`/chat/${encodeURIComponent(nextRoom)}`);
  };
  const handleOpenCreateRoomPopup = () => {
    setNewRoomName('');
    setShowCreateRoomPopup(true);
  };
  const handleCreateRoomSubmit = (e) => {
    e.preventDefault();
    const targetRoom = (newRoomName || '').trim();
    if (targetRoom) {
      setShowCreateRoomPopup(false);
      setNewRoomName('');
      joinChatRoomCallback(targetRoom, username, email, picture);
    }
  };
  const sendMessage = (e) => {
    if (e) e.preventDefault();
    const trimmedMessage = (currentMessage || '').trim();
    if (!trimmedMessage) return;

    if (spamProtection) {
      const now = Date.now();
      if (now - lastMessageTimeRef.current < 1200) {
        setSpamWarning('Please wait a moment before sending another message (Spam Protection active).');
        setTimeout(() => setSpamWarning(''), 3000);
        return;
      }
      if (lastMessageTextRef.current.toLowerCase() === trimmedMessage.toLowerCase() && now - lastMessageTimeRef.current < 3000) {
        setSpamWarning('Duplicate message blocked by Spam Protection.');
        setTimeout(() => setSpamWarning(''), 3000);
        return;
      }
      lastMessageTimeRef.current = now;
      lastMessageTextRef.current = trimmedMessage;
    }

    const socket = socketRef.current;
    if (!socket?.connected) {
      setMessages((prevMessages) => [...prevMessages, { text: 'Unable to send right now. Please wait for the connection to finish.', type: 'system', time: getFormattedTime() }]);
      return;
    }
    socket.emit('chat message', trimmedMessage, (room || '').trim());
    setCurrentMessage('');
    setShowEmojiPicker(false);
    setSpamWarning('');
  };
  const handleGoogleSignIn = (user) => {
    const avatarUrl = user.picture || getAvatarUrl(user.name, '', user.email || '');
    setUsername(user.name);
    setEmail(user.email);
    setPicture(avatarUrl);
    if (user.email === 'harshbajpai1194@gmail.com') {
      setIsAdmin(true);
    }
    setShowRoomForm(true);
  };
  const handleDeleteMessage = (messageId) => {
    skipScrollToBottomRef.current = true;
    if (socketRef.current?.connected) {
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
            joinChatRoom={joinChatRoom}
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
          />
        } />
        <Route path="/chat/:roomName" element={
          <ChatRoomRoute
            room={room}
            setRoom={setRoom}
            isLoggedIn={isLoggedIn}
            username={username}
            email={email}
            picture={picture}
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
function LoginView({ showRoomForm, setShowRoomForm, username, setUsername, handleGoogleSignIn, handleOpenDiscoverRooms, handleOpenCreateRoomPopup, handleAdminLogin, isAdmin, theme, setTheme }) {
  const isDevTesting = process.env.NODE_ENV !== 'production' || 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.includes('dev');
    
  const toggleTheme = () => {
    if (setTheme) {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <div className={`login-container ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      {!showRoomForm ? (
        <div className="login-form">
          <h2>Join Chat <div className="release-link-wrapper">
            <a href="https://github.com/Harsh-Bajpai-1194/Real-Time-Chat-App" target="_blank" rel="noopener noreferrer" className="release-link">
              <img src="https://img.shields.io/badge/Release-v1.4.0-deeppink?style=for-the-the-badge&logo=github" alt="v1.4.0" className="release-badge" />
            </a>
          </div>
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <GoogleSignIn onSignIn={handleGoogleSignIn} />
          </div>
          <p style={{ textAlign: 'center', margin: '0 0 15px 0', opacity: 0.7 }}>— OR —</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
          <h2>Welcome{username ? `, ${username}` : ''}! {isAdmin && <span style={{ fontSize: '0.8rem', background: '#e02424', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', marginLeft: '6px', verticalAlign: 'middle', fontWeight: 'bold' }}>Admin</span>}</h2>
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
function ParticipantsRoute({ room, isLoggedIn, theme, setTheme }) {
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
  return (
    <ParticipantsPage
      roomName={decodedRoomName}
      onClose={handleClose}
      theme={theme}
      setTheme={setTheme}
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
  return <Admin socket={socketRef.current} onClose={handleClose} />;
}
function ChatRoomRoute({
  room,
  setRoom,
  isLoggedIn,
  username,
  email,
  picture,
  joinChatRoomCallback,
  selectedBackground,
  toggleMusic,
  isMusicPlaying,
  playNextRandomSong,
  soundFiles = [],
  currentSongIndex = 0,
  toggleBackgroundPicker,
  isAdmin,
  handleOpenAdminPanel,
  handleOpenDiscoverRooms,
  handleLeaveRoom,
  showBackgroundPicker,
  backgroundOptions,
  selectBackground,
  showAdminPanel,
  setShowAdminPanel,
  socketRef,
  messagesContainerRef,
  isFetchingOlderMessages,
  messages,
  handleDeleteMessage,
  messagesEndRef,
  typingUser,
  sendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  setCurrentMessage,
  currentMessage,
  enterIsSend,
  toggleEnterIsSend,
  spamProtection,
  toggleSpamProtection,
  showSettingsModal,
  setShowSettingsModal,
  spamWarning,
  theme,
  setTheme
}) {
  const { roomName } = useParams();
  const decodedRoomName = decodeURIComponent(roomName || '');
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    if (decodedRoomName && decodedRoomName !== room) {
      if (isLoggedIn && username) {
        joinChatRoomCallback(decodedRoomName, username, email, picture);
      } else {
        const savedSession = localStorage.getItem('chatSession');
        if (savedSession) {
          const { name, email: savedEmail, picture: savedPicture } = JSON.parse(savedSession);
          if (name) {
            joinChatRoomCallback(decodedRoomName, name, savedEmail, savedPicture);
            return;
          }
        }
        setRoom(decodedRoomName);
      }
    }
  }, [decodedRoomName, room, isLoggedIn, username, email, picture, joinChatRoomCallback, setRoom]);
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`chat-container${selectedBackground ? ' background-selected' : ''} ${theme === 'dark' ? 'dark-mode' : ''}`} style={{
      backgroundColor: selectedBackground || undefined,
      transition: 'background-color 0.25s ease',
    }}>
      <header className="chat-header">
        <div className="chat-header-info">
          <h1>Room: {room}</h1>
          <p>Welcome, <span style={{ color: getUserColor(username), fontWeight: 600 }}>{username}</span></p>
        </div>
        <div className="chat-header-actions">
          <button onClick={() => navigate(`/participants/${encodeURIComponent(room)}`)} className="participants-icon-btn" title="View Participants">
            <img src={`${process.env.PUBLIC_URL}/participants.png`} alt="Participants" style={{ width: '22px', height: '22px', display: 'block' }} />
          </button>
          <div className="music-player-group">
            <div className="music-buttons-row">
              <button onClick={toggleMusic} className="btn-secondary" title={isMusicPlaying ? "Pause Music" : "Play Music"}>
                {isMusicPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={playNextRandomSong} className="btn-secondary" title="Skip Song">
                <FaStepForward />
              </button>
            </div>
            <div className="music-player-bar" title={soundFiles[currentSongIndex] || 'Cloudinary Music Track'}>
              <div className="music-info-marquee">
                <div className={`music-marquee-track ${isMusicPlaying ? 'scrolling' : ''}`}>
                  <span className="music-marquee-item">
                    <span className="music-note-icon">{isMusicPlaying ? '🎵' : '🔇'}</span>
                    <span className="music-song-title">
                      {isMusicPlaying ? getSongTitleFromUrl(soundFiles[currentSongIndex]) : 'Music Paused'}
                    </span>
                  </span>
                  <span className="music-marquee-item" aria-hidden="true">
                    <span className="music-note-icon">{isMusicPlaying ? '🎵' : '🔇'}</span>
                    <span className="music-song-title">
                      {isMusicPlaying ? getSongTitleFromUrl(soundFiles[currentSongIndex]) : 'Music Paused'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="change-bg-btn" onClick={toggleBackgroundPicker} title="Change Background">
            <img src={`${process.env.PUBLIC_URL}/change_bg.png`} alt="Change Background" style={{ width: '22px', height: '22px', display: 'block' }} />
          </button>
          <button className="settings-icon-btn" onClick={() => setShowSettingsModal(true)} title="Settings" aria-label="Settings">
            <img src={`${process.env.PUBLIC_URL}/settings.png`} alt="Settings" style={{ width: '22px', height: '22px', display: 'block' }} />
          </button>
          <button className="discover-rooms-icon-btn" onClick={handleOpenDiscoverRooms} title="Discover Rooms" aria-label="Discover Rooms">
            <FaDoorOpen style={{ fontSize: '1.25rem', color: '#334155', display: 'block' }} />
          </button>
          <button className="search-toggle-btn" onClick={() => setShowSearch(!showSearch)} title="Search messages"></button>
          <button className="btn-danger" onClick={handleLeaveRoom}>Leave Room</button>
        </div>
      </header>

          {showSearch && (
            <div className="message-search-container">
              <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages or users..."
              autoFocus
              />
            </div>
          )}

      {showBackgroundPicker && (
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
              <span className="thumb-color-dot" style={{ backgroundColor: bg.color === '#ffffff' ? '#e2e8f0' : 'rgba(0,0,0,0.15)' }} />
              <span className="thumb-name">{bg.name}</span>
            </button>
          ))}
        </div>
      )}
      {showSettingsModal && (
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
                  title={enterIsSend ? "Enabled" : "Disabled"}
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
                  title={spamProtection ? "Enabled" : "Disabled"}
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
      )}
      {isAdmin && showAdminPanel && (
        <Admin socket={socketRef.current} onClose={() => setShowAdminPanel(false)} />
      )}

      <main className="chat-messages" ref={messagesContainerRef}>
        {isFetchingOlderMessages && <div className="loading-older-messages" style={{ textAlign: 'center', padding: '10px' }}>Loading...</div>}
        {messages     
          .filter(msg => {
            if (!msg.room) return true;
            return msg.room.trim().toLowerCase() === (room || '').trim().toLowerCase();
          })

          .filter(msg => {
            const query = searchQuery.toLowerCase();

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
                      <span className="username" style={{ color: getUserColor(msg.username), fontWeight: 600 }}>{msg.username}</span>
                      <span className="timestamp">{msg.time}</span>
                    </div>
                    <span className="text">{msg.text}</span>
                  </div>
                </div>
                {(isAdmin || isOwnMessage) && (
                  <button onClick={() => handleDeleteMessage(msg._id)} className="delete-btn" title="Delete message" aria-label="Delete message">
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
      {typingUser && (
        <div className="typing-indicator">{typingUser}</div>
      )}
      {spamWarning && (
        <div className="spam-warning-banner">
          <span>⚠️</span> {spamWarning}
        </div>
      )}
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
            <EmojiPicker onEmojiClick={(emojiObject) => setCurrentMessage(prev => prev + emojiObject.emoji)} />
          </div>
        )}
        <button
          type="button"
          className={`emoji-btn ${showEmojiPicker ? 'active' : ''}`}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title={showEmojiPicker ? "Close emojis" : "Open emojis"}
          aria-label={showEmojiPicker ? "Close emojis" : "Open emojis"}
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
              socketRef.current.emit("typing", {
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
        <button className="btn-primary" type="submit">Send</button>
      </form>
    </div>
  );
}
export default App;