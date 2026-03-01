const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/walnut-shop', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const users = await User.find().sort({ lastLogin: -1 }).lean();
        console.log("Users found: ", users.length);
        console.log(JSON.stringify(users, null, 2));
        mongoose.disconnect();
    })
    .catch(console.error);
