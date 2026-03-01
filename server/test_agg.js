require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/Message');

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nature-pledge');
    const conversations = await Message.aggregate([
        { $sort: { timestamp: -1 } },
        {
            $group: {
                _id: "$userId",
                userName: { $max: { $cond: [{ $eq: ["$isAdmin", false] }, "$userName", null] } },
                userEmail: { $max: { $cond: [{ $eq: ["$isAdmin", false] }, "$userEmail", null] } },
                lastMessage: { $first: "$text" },
                timestamp: { $first: "$timestamp" },
                unreadCount: {
                    $sum: { $cond: [{ $and: [{ $eq: ["$isAdmin", false] }, { $eq: ["$isRead", false] }] }, 1, 0] }
                }
            }
        },
        { $sort: { timestamp: -1 } }
    ]);
    console.log('AGG REGULT:', conversations);
    process.exit(0);
}
check();
