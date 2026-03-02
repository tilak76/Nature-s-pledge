const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const fs = require('fs');
const path = require('path');
const jsonPath = path.join(__dirname, '../data/users.json');

// Helper for JSON fallback
const getJsonUsers = () => {
    try {
        if (!fs.existsSync(jsonPath)) return [];
        return JSON.parse(fs.readFileSync(jsonPath));
    } catch { return []; }
};

const saveJsonUser = (userData) => {
    try {
        const users = getJsonUsers();
        const existingIdx = users.findIndex(u =>
            (userData.email && u.email === userData.email) ||
            (userData.phoneNumber && u.phoneNumber === userData.phoneNumber)
        );

        if (existingIdx !== -1) {
            users[existingIdx] = { ...users[existingIdx], ...userData, lastLogin: Date.now() };
        } else {
            users.push({ ...userData, _id: 'local_' + Date.now(), lastLogin: Date.now() });
        }
        fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2));
    } catch (e) { console.error("JSON User Save Error", e); }
};

// Get all users
router.get('/', async (req, res) => {
    try {
        const jsonUsers = getJsonUsers();
        if (require('mongoose').connection.readyState !== 1) {
            return res.json(jsonUsers);
        }
        const dbUsers = await User.find().sort({ lastLogin: -1 });

        // Merge DB users with JSON users to ensure all are shown
        const mergedMap = new Map();
        jsonUsers.forEach(u => mergedMap.set(u.email || u.phoneNumber || u._id, u));
        dbUsers.forEach(u => {
            const key = u.email || u.phoneNumber || u._id.toString();
            mergedMap.set(key, { ...mergedMap.get(key), ...u.toObject() });
        });

        res.json(Array.from(mergedMap.values()).sort((a, b) => (b.lastLogin || 0) - (a.lastLogin || 0)));
    } catch (err) {
        res.json(getJsonUsers());
    }
});

// Sync User with Backend (on Login/Signup)
router.post('/sync', async (req, res) => {
    const { email, phoneNumber, name, image, role } = req.body;

    // Always save to JSON fallback
    saveJsonUser(req.body);

    try {
        if (require('mongoose').connection.readyState !== 1) throw new Error("DB Disconnected");

        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (phoneNumber) {
            user = await User.findOne({ phoneNumber });
        }

        if (user) {
            // Update last login
            user.lastLogin = Date.now();
            if (name) user.name = name;
            if (image) user.image = image;
            if (role) user.role = role;
            await user.save();
        } else {
            // Create new user record
            user = new User({
                email, phoneNumber, name: name || 'Valued Nature Pledge User',
                image, role: role || 'user', lastLogin: Date.now(),
                createdAt: Date.now()
            });
            await user.save();
        }

        res.json(user);
    } catch (err) {
        console.warn("Sync user DB fail, using body only:", err.message);
        res.json({ ...req.body, _id: 'temp_' + Date.now(), lastLogin: Date.now(), createdAt: Date.now() });
    }
});

// Logs (Tracking user activity)
router.get('/logs', async (req, res) => {
    try {
        if (require('mongoose').connection.readyState !== 1) throw new Error("DB Disconnected");
        const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (err) {
        const fallbackPath = path.join(__dirname, '../data/logs.json');
        if (fs.existsSync(fallbackPath)) {
            const logs = JSON.parse(fs.readFileSync(fallbackPath));
            return res.json(logs.slice(-50).reverse());
        }
        res.json([]);
    }
});

router.post('/log-activity', async (req, res) => {
    const { userId, userName, userEmail, action, details } = req.body;
    const logData = { userId, userName, userEmail, action, details, timestamp: new Date() };

    // Always log to a JSON file as backup
    try {
        const logPath = path.join(__dirname, '../data/activity.json');
        const logs = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath)) : [];
        logs.push(logData);
        if (logs.length > 500) logs.shift(); // Keep only last 500
        fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    } catch (e) { console.error("Activity JSON log fail:", e.message); }

    try {
        if (require('mongoose').connection.readyState === 1) {
            const log = new ActivityLog(logData);
            await log.save();
            return res.json(log);
        }
        res.json(logData);
    } catch (err) {
        console.warn("Log DB skip:", err.message);
        res.json(logData);
    }
});

// Cart Sync for Abandoned Cart Detection
router.post('/sync-cart', async (req, res) => {
    const { email, phoneNumber, cart } = req.body;
    try {
        if (require('mongoose').connection.readyState === 1) {
            let user;
            if (email) user = await User.findOne({ email });
            else if (phoneNumber) user = await User.findOne({ phoneNumber });

            if (user) {
                user.cart = cart;
                user.lastCartUpdate = new Date();
                await user.save();
                return res.json({ success: true, message: 'Cart synced to DB' });
            }
        }

        // Backup to JSON
        const users = getJsonUsers();
        const idx = users.findIndex(u => (email && u.email === email) || (phoneNumber && u.phoneNumber === phoneNumber));
        if (idx !== -1) {
            users[idx].cart = cart;
            users[idx].lastCartUpdate = new Date();
            fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2));
        }
        res.json({ success: true, message: 'Cart synced to Fallback' });
    } catch (err) {
        console.error("Cart sync fail:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
