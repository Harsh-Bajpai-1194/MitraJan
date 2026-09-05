const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Node.js to use Google's public DNS

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from the .env file in the project root or local folder
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const fs = require('fs');
const Filter = require('bad-words');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const Room = require('./models/Room');
const Message = require('./models/Message');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*", // Allow specific origin or any for development
        methods: ["GET", "POST"]
    }
});

const filter = new Filter();
const googleClient = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'harshbajpai1194@gmail.com';

/**
 * Helper to prevent XSS attacks by escaping HTML special characters.
 * This converts characters like `<` and `>` into their safe HTML entity equivalents.
 */
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 1000);

app.use(cors());
app.use((req, res, next) => {
    // This header is needed to allow the Google Sign-In popup to communicate with the main page.
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});

app.use(express.json()); 

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dhet30juy',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const defaultSongsList = [
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
  "https://res.cloudinary.com/dhet30juy/video/upload/v1784952589/John_Cena_-_The_Time_Is_Now_Entrance_Theme_copy_jgjrdu.mp3"
];

app.get('/api/folder-songs', async (req, res) => {
  if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const result = await cloudinary.search
        .expression('folder:"Real-Time-Chat-App" OR asset_folder:"Real-Time-Chat-App" OR public_id:Real-Time-Chat-App/*')
        .sort_by('created_at', 'desc')
        .max_results(500)
        .execute();

      if (result && result.resources && result.resources.length > 0) {
        const urls = result.resources.map(r => {
          let url = r.secure_url;
          if (r.format && !url.toLowerCase().endsWith('.' + r.format.toLowerCase())) {
            url = `${url}.${r.format}`;
          }
          return url;
        });
        const validUrls = urls.filter(url => {
          const lUrl = url.toLowerCase();
          return lUrl.endsWith('.mp3') || lUrl.endsWith('.wav') || lUrl.endsWith('.m4a') || lUrl.endsWith('.ogg') || lUrl.endsWith('.aac') || lUrl.endsWith('.mp4');
        });
        if (validUrls.length > 0) {
          const uniqueUrls = Array.from(new Set(validUrls));
          return res.json(uniqueUrls);
        }
      }
    } catch (err) {
      console.error('Cloudinary API search error:', err.message);
    }
  }

  const uniqueDefaults = Array.from(new Set(defaultSongsList));
  res.json(uniqueDefaults);
}); 

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI;
const roomMessages = new Map();
const roomRegistry = new Map();

const defaultRooms = [
    { name: 'Tech Talk', desc: 'Discuss latest tech trends, programming, gadgets.', icon: '💻' },
    { name: 'Gaming Lair', desc: 'Community for gamers, share tips, find teammates.', icon: '🎮' },
    { name: 'Open Discussions', desc: 'General chat for everyone on various topics.', icon: '🗣️' },
    { name: 'Creative Corner', desc: 'Showcase art, design projects, and get feedback.', icon: '🎨' },
    { name: 'Movie Buffs', desc: 'Talking about films, series, and reviews.', icon: '🍿' },
    { name: 'Book Club', desc: 'Share current reads, recommendations, and reviews.', icon: '📚' },
];

// Listen for the 'roomDeleted' event emitted from the Room model's middleware.
Room.on('roomDeleted', (roomName) => {
    roomRegistry.delete(roomName);
    roomMessages.delete(roomName);
    console.log(`Removed room "${roomName}" from in-memory stores.`);
    io.emit('rooms updated');
});

const isMongoAvailable = () => mongoose.connection.readyState === 1;

let isConnecting = false;
let reconnectTimer = null;

const scheduleReconnect = () => {
    if (reconnectTimer || mongoose.connection.readyState === 1) return;
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (mongoose.connection.readyState !== 1 && process.env.MONGO_URI) {
            console.log('Retrying MongoDB connection...');
            connectToDatabase();
        }
    }, 5000);
};

const loadAndSeedRooms = async () => {
    roomRegistry.clear();

    if (!isMongoAvailable()) {
        console.warn('MongoDB not available. Using in-memory rooms.');
        for (const room of defaultRooms) {
            roomRegistry.set(room.name, { ...room });
        }
        return;
    }

    try {
        const upsertPromises = defaultRooms.map(room =>
            Room.findOneAndUpdate(
                { name: room.name },
                { $setOnInsert: { desc: room.desc, icon: room.icon } },
                { upsert: true, new: true }
            )
        );
        await Promise.all(upsertPromises);

        const allDbRooms = await Room.find({});
        for (const dbRoom of allDbRooms) {
            roomRegistry.set(dbRoom.name, dbRoom.toObject());
        }
        console.log(`${roomRegistry.size} rooms loaded into registry from MongoDB.`);
    } catch (error) {
        console.error('Error loading or seeding rooms:', error.message);
        for (const room of defaultRooms) {
            roomRegistry.set(room.name, { ...room });
        }
    }
};

const connectToDatabase = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.warn('MONGO_URI not set. The app will use in-memory storage for rooms and chat history.');
        await loadAndSeedRooms();
        return;
    }

    if (mongoose.connection.readyState === 1 || isConnecting) {
        return;
    }

    isConnecting = true;
    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 3000,
            socketTimeoutMS: 5000,
        });
        isConnecting = false;
        console.log('MongoDB connected successfully.');
        await loadAndSeedRooms();
    } catch (error) {
        isConnecting = false;
        console.warn(`MongoDB connection failed: ${error.message}`);
        await loadAndSeedRooms();
        scheduleReconnect();
    }
};

mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established.');
    loadAndSeedRooms();
});

mongoose.connection.on('error', (error) => {
    console.warn(`MongoDB connection error: ${error.message}`);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected; scheduling reconnect.');
    scheduleReconnect();
});

const escapeRegex = (string) => {
    return (string || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const saveMessageToStore = async (messageData) => {
    const room = (messageData.room || '').trim();
    const normalizedData = {
        ...messageData,
        room,
        timestamp: messageData.timestamp || new Date(),
        _id: messageData._id || new mongoose.Types.ObjectId().toString()
    };
    const messages = roomMessages.get(room) || [];
    messages.push(normalizedData);
    if (messages.length > 250) {
        messages.splice(0, messages.length - 250);
    }
    roomMessages.set(room, messages);

    if (isMongoAvailable()) {
        try {
            const message = new Message(normalizedData);
            await message.save();
            return typeof message.toObject === 'function' ? message.toObject() : message;
        } catch (error) {
            console.error('Error saving message to database:', error.message);
        }
    }

    return normalizedData;
};

const getRoomHistory = async (room) => {
    const trimmedRoom = (room || '').trim();
    if (!trimmedRoom) return [];

    if (isMongoAvailable()) {
        try {
            const history = await Message.find({
                room: { $regex: new RegExp(`^${escapeRegex(trimmedRoom)}$`, 'i') }
            })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();

            if (history && history.length > 0) {
                return history.reverse();
            }
        } catch (error) {
            console.error('Error fetching chat history for room "%s": %s', trimmedRoom, error.message);
        }
    }

    // Fallback to in-memory store
    const inMem = roomMessages.get(trimmedRoom);
    if (inMem && inMem.length > 0) {
        return inMem.slice(-50);
    }

    // Case-insensitive lookup in memory store
    for (const [k, msgs] of roomMessages.entries()) {
        if (k.toLowerCase() === trimmedRoom.toLowerCase() && msgs.length > 0) {
            return msgs.slice(-50);
        }
    }

    return [];
};

const getOlderRoomHistory = async (room, lastMessageId) => {
    if (!lastMessageId) return [];
    const trimmedRoom = (room || '').trim();

    if (isMongoAvailable()) {
        try {
            const lastMessage = await Message.findById(lastMessageId).lean();
            if (lastMessage) {
                const olderMessages = await Message.find({
                    room: { $regex: new RegExp(`^${escapeRegex(trimmedRoom)}$`, 'i') },
                    timestamp: { $lt: lastMessage.timestamp }
                })
                .sort({ timestamp: -1 })
                .limit(50)
                .lean();

                if (olderMessages && olderMessages.length > 0) {
                    return olderMessages.reverse();
                }
            }
        } catch (error) {
            console.error('Error fetching older messages:', error.message);
        }
    }

    const allMessages = roomMessages.get(trimmedRoom) || [];
    const index = allMessages.findIndex((m) => String(m._id) === String(lastMessageId));
    if (index === -1) return [];
    return allMessages.slice(Math.max(0, index - 50), index);
};

const ensureRoomExists = async (roomName) => {
    const trimmed = roomName.trim();
    if (!trimmed) {
        return null;
    }

    if (!roomRegistry.has(trimmed)) {
        const newRoomData = {
            name: trimmed,
            desc: 'A custom chat room.',
            icon: '💬',
        };

        // Add to in-memory registry first for responsiveness
        roomRegistry.set(trimmed, { ...newRoomData });

        // Then save to database if available
        if (isMongoAvailable()) {
            try {
                // Use findOneAndUpdate with upsert to prevent race conditions
                await Room.findOneAndUpdate({ name: trimmed }, { $setOnInsert: newRoomData }, { upsert: true });
            } catch (error) {
                console.error('Error saving new room "%s" to database: %s', trimmed, error.message);
            }
        }
    }
    return roomRegistry.get(trimmed);
};

app.get('/api/rooms', async (req, res) => {
    if (!isMongoAvailable() && process.env.MONGO_URI) {
        connectToDatabase();
    }

    const roomsFromRegistry = Array.from(roomRegistry.values());

    if (!isMongoAvailable()) {
        const rooms = roomsFromRegistry.map(room => {
            const messages = roomMessages.get(room.name) || [];
            const totalMessages = messages.length;
            const memberCount = new Set(messages.map(m => m.username).filter(Boolean)).size;
            return { ...room, memberCount, totalMessages };
        }).sort((a, b) => (b.totalMessages || 0) - (a.totalMessages || 0));
        return res.json(rooms);
    }

    try {
        const stats = await Message.aggregate([
            {
                $group: {
                    _id: '$room',
                    totalMessages: { $sum: 1 },
                    uniqueUsers: { $addToSet: { $ifNull: ['$username', 'Anonymous'] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    totalMessages: 1,
                    memberCount: { $size: '$uniqueUsers' }
                }
            }
        ]);

        const statsMap = new Map();
        for (const stat of stats) {
            if (stat.name) {
                const roomNameStr = String(stat.name).trim();
                statsMap.set(roomNameStr.toLowerCase(), {
                    ...stat,
                    name: roomNameStr
                });

                if (!roomRegistry.has(roomNameStr)) {
                    roomRegistry.set(roomNameStr, {
                        name: roomNameStr,
                        desc: 'A chat room.',
                        icon: '💬'
                    });
                }
            }
        }

        const updatedRoomsFromRegistry = Array.from(roomRegistry.values());

        const rooms = updatedRoomsFromRegistry.map(room => {
            const key = room.name ? String(room.name).trim().toLowerCase() : '';
            const roomStats = statsMap.get(key) || { memberCount: 0, totalMessages: 0 };
            return {
                ...room,
                memberCount: roomStats.memberCount,
                totalMessages: roomStats.totalMessages
            };
        }).sort((a, b) => b.totalMessages - a.totalMessages);

        res.json(rooms);
    } catch (error) {
        console.error('Error fetching room stats from MongoDB:', error);
        const rooms = roomsFromRegistry.map(room => {
            const messages = roomMessages.get(room.name) || [];
            return {
                ...room,
                memberCount: new Set(messages.map(m => m.username).filter(Boolean)).size,
                totalMessages: messages.length
            };
        }).sort((a, b) => (b.totalMessages || 0) - (a.totalMessages || 0));
        res.json(rooms);
    }
});

app.get('/api/rooms/:roomName/participants', (req, res) => {
    const { roomName } = req.params;
    const roomSockets = io.sockets.adapter.rooms.get(roomName);

    if (!roomSockets) {
        // Return an empty array if the room doesn't exist or is empty
        return res.json([]);
    }

    const participants = [];
    for (const socketId of roomSockets) {
        const socket = io.sockets.sockets.get(socketId);
        // Ensure the socket and its username exist before adding
        if (socket && socket.username) {
            participants.push({
                username: socket.username,
                picture: socket.picture || null, // Fallback to null if no picture
            });
        }
    }

    // A user might have multiple tabs open, creating multiple sockets in the same room.
    // We can filter to get a list of unique users based on their username.
    const uniqueParticipants = Array.from(new Map(participants.map(p => [p.username, p])).values());

    res.json(uniqueParticipants);
});

app.get('/api/rooms/:roomName/members', async (req, res) => {
    try {
      const roomName = req.params.roomName.trim();
  
      if (!isMongoAvailable()) {
          const messages = roomMessages.get(roomName) || [];
          const uniqueMembersMap = new Map();
          for (const m of messages) {
              if (m.username) {
                  const key = m.email || m.username;
                  if (!uniqueMembersMap.has(key)) {
                      uniqueMembersMap.set(key, {
                          username: m.username,
                          picture: m.picture || null,
                          email: m.email || ''
                      });
                  }
              }
          }
          return res.json(Array.from(uniqueMembersMap.values()));
      }

      const members = await Message.aggregate([
        { $match: { room: { $regex: new RegExp(`^${escapeRegex(roomName)}$`, 'i') } } },
        {
          $group: {
            _id: { $ifNull: ['$email', '$username'] },
            username: { $first: '$username' },
            picture: { $first: '$picture' },
            email: { $first: '$email' }
          }
        },
        {
          $project: {
            _id: 0,
            username: 1,
            picture: 1,
            email: 1
          }
        },
        { $sort: { username: 1 } }
      ]);
  
      res.json(members);
    } catch (error) {
      console.error('Failed to fetch room members:', error);
      const messages = roomMessages.get(req.params.roomName.trim()) || [];
      const uniqueMembersMap = new Map();
      for (const m of messages) {
          if (m.username) {
              const key = m.email || m.username;
              if (!uniqueMembersMap.has(key)) {
                  uniqueMembersMap.set(key, {
                      username: m.username,
                      picture: m.picture || null,
                      email: m.email || ''
                  });
              }
          }
      }
      res.json(Array.from(uniqueMembersMap.values()));
    }
  });

// --- Authentication Routes ---
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        res.json({ success: true, user: { name: payload.name, email: payload.email, picture: payload.picture } });
    } catch (error) {
        console.error('Google token verification failed:', error);
        res.status(401).json({ success: false, message: 'Invalid Google token' });
    }
});

io.on('connection', (socket) => {
    let username = 'Anonymous';

    console.log('A user connected');
    
    // Ask for username when connecting
    socket.on('set username', (name, room, email, picture) => {
        username = name.trim() || 'Anonymous';
        socket.username = username; // Store username on the socket instance
        if (email) socket.email = email;
        if (picture) socket.picture = picture;
    });
    
    // Typing indicator
        socket.on("typing", (data) => {
        socket.to(data.room).emit("typing", data.username);
    });

    // Handle chat messages
    socket.on('chat message', async (msg, room) => {
        if (!msg.trim() || !room) return;

        // A more robust check for profanity that ignores spaces and special characters.
        const profanityCheckText = msg.replace(/[^a-zA-Z0-9]/g, '');

        // Block the message entirely if it contains profanity
        if (filter.isProfane(profanityCheckText)) {
            return socket.emit('system message', 'Your message was blocked for containing inappropriate language.');
        }

        const messageData = {
            username: socket.username,
            email: socket.email || '',
            picture: socket.picture || '',
            text: escapeHtml(msg), // Sanitize text to prevent XSS attacks
            room: room,
            timestamp: new Date()
        };

        // Save message to the store first to get a persistent ID
        const savedMessage = await saveMessageToStore(messageData);

        // If saving was successful, broadcast the full message data (including ID)
        if (savedMessage) {
            io.to(room).emit('chat message', savedMessage);
        }
    });

    // Handle joining rooms
    socket.on('join room', async (room) => {
        const normalizedRoom = room.trim();

        if (!normalizedRoom) {
            return;
        }
        if (filter.isProfane(normalizedRoom.replace(/[^a-zA-Z0-9]/g, ''))) {
            return socket.emit('system message', 'This room name is not allowed due to inappropriate language.');
        }

        await ensureRoomExists(normalizedRoom);
        socket.join(normalizedRoom);
        // Announce that a user has joined the room
        io.to(normalizedRoom).emit('system message', `${socket.username || 'Anonymous'} has joined the room.`);
        io.emit('rooms updated');

        // Send recent chat history to the newly joined user
        const history = await getRoomHistory(normalizedRoom);
        socket.emit('chat history', Array.isArray(history) ? history : [], normalizedRoom);
    });

    socket.on('fetch older messages', async ({ room, lastMessageId }) => {
        if (!room || !lastMessageId) {
            return;
        }

        const normalizedRoom = room.trim();
        if (!normalizedRoom) {
            return;
        }

        const olderMessages = await getOlderRoomHistory(normalizedRoom, lastMessageId);
        socket.emit('older messages', Array.isArray(olderMessages) ? olderMessages : [], normalizedRoom);
    });

    // Handle leaving rooms
    socket.on('leave room', (room) => {
        socket.leave(room);
        io.to(room).emit('system message', `${socket.username || 'Anonymous'} has left the room.`);
    });

    socket.on('delete message', async (messageId, room) => {
        if (socket.email !== ADMIN_EMAIL) {
            return socket.emit('system message', 'You are not authorized to delete messages.');
        }

        if (isMongoAvailable()) {
            try {
                const result = await Message.findByIdAndDelete(messageId);
                if (result) {
                    io.to(room).emit('message deleted', messageId);
                }
            } catch (error) {
                console.error('Error deleting message:', error);
                socket.emit('system message', 'Error deleting message.');
            }
        } else {
            const messages = roomMessages.get(room) || [];
            const updated = messages.filter(m => m._id !== messageId);
            roomMessages.set(room, updated);
            io.to(room).emit('message deleted', messageId);
        }
    });

    socket.on('edit_message', async ({ messageId, text, room }) => {
        const normalizedRoom = (room || '').trim();
        const trimmedText = (text || '').trim();
        if (!messageId || !normalizedRoom || !trimmedText) return;

        const profanityCheckText = trimmedText.replace(/[^a-zA-Z0-9]/g, '');
        if (filter.isProfane(profanityCheckText)) {
            return socket.emit('system message', 'Your edited message was blocked for containing inappropriate language.');
        }

        const sanitizedText = escapeHtml(trimmedText);
        let editedMessage = null;
        if (isMongoAvailable()) {
            try {
                const message = await Message.findOne({ _id: messageId, room: normalizedRoom });
                if (!message) return;
                if (message.email !== (socket.email || '') && message.username !== socket.username) {
                    return socket.emit('system message', 'You are not authorized to edit this message.');
                }
                message.text = sanitizedText;
                message.edited = true;
                editedMessage = await message.save();
                editedMessage = editedMessage.toObject();
            } catch (error) {
                console.error('Error editing message:', error.message);
                return socket.emit('system message', 'Error editing message.');
            }
        } else {
            const messages = roomMessages.get(normalizedRoom) || [];
            const message = messages.find((item) => String(item._id) === String(messageId));
            if (!message) return;
            if (message.email !== (socket.email || '') && message.username !== socket.username) {
                return socket.emit('system message', 'You are not authorized to edit this message.');
            }
            message.text = sanitizedText;
            message.edited = true;
            editedMessage = { ...message };
        }

        io.to(normalizedRoom).emit('message edited', editedMessage);
    });
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
        // You could add logic here to announce that a user has left.
    });
});

// Serve the built frontend when it exists; otherwise provide a helpful local-dev fallback.
const buildPath = path.join(__dirname, '..', 'client', 'build');
const buildIndexPath = path.join(buildPath, 'index.html');

app.use(express.static(buildPath));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
        return next();
    }
    if (fs.existsSync(buildIndexPath)) {
        return res.sendFile(buildIndexPath);
    }
    res.status(200).send(`
        <!doctype html>
        <html>
        <head><meta charset="utf-8"><title>Real-Time Chat App</title></head>
        <body style="font-family: Arial, sans-serif; padding: 2rem;">
            <h1>Real-Time Chat App</h1>
            <p>The backend is running successfully.</p>
            <p>Start the React frontend with:</p>
            <pre>cd client && npm start</pre>
            <p>Then open <a href="http://localhost:3000">http://localhost:3000</a>.</p>
        </body>
        </html>
    `);
});

/**
 * Starts the server after ensuring the database is connected and initial data is loaded.
 * This prevents a race condition where the server might start accepting requests
 * before it's fully initialized.
 */
const startServer = async () => {
    await connectToDatabase(); // This function connects and then seeds/loads rooms.
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is ready and running on port ${PORT}`);
    });
};

startServer();
