require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/Message');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nature-pledge');
    const count = await Message.countDocuments();
    const latest = await Message.find().sort({ timestamp: -1 }).limit(5);
    console.log('Count:', count);
    console.log('Latest:', latest);
    process.exit(0);
}
check();
