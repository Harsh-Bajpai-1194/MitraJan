const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: String,
    email: String,
    picture: String,
    text: String,
    room: String,
    edited: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
    
});


const Message = mongoose.model('Message', messageSchema);

module.exports = Message;