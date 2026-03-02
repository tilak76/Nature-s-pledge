const mongoose = require('mongoose');

module.exports = async (req, res) => {
    try {
        if (!process.env.MONGO_URI) {
            return res.status(500).json({
                status: 'error',
                message: 'CRITICAL: MONGO_URI is not set in Vercel Environment Variables!'
            });
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });

        res.status(200).json({
            status: 'success',
            message: 'Database connection established from standalone function',
            readyState: mongoose.connection.readyState
        });
    } catch (e) {
        res.status(500).json({
            status: 'connection_failed',
            error: e.message,
            hint: "Check if you have added the current IP to MongoDB Atlas whitelist (0.0.0.0/0)"
        });
    }
};
