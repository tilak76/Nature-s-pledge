const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const fs = require('fs');
const path = require('path');
const jsonPath = path.join(__dirname, '../data/messages.json');
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tilakmishra.76@gmail.com';

const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,    // Your Gmail
            pass: process.env.EMAIL_PASS     // Your App Password
        }
    });
};

// Helper for admin notifications (customer -> admin)
const sendAdminNotification = async (msg) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

    const mailOptions = {
        from: `"Nature's Pledge Support" <${process.env.EMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: `🔔 New Inquiry from ${msg.userName}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; max-width: 600px; margin: auto;">
                <h2 style="color: #5D4037; border-bottom: 2px solid #5D4037; padding-bottom: 10px;">New Customer Message!</h2>
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Customer:</strong> ${msg.userName}</p>
                    <p><strong>Email:</strong> ${msg.userEmail || 'Guest'}</p>
                    <p style="margin-top: 20px; font-style: italic; color: #555;">"${msg.text}"</p>
                </div>
                <p style="font-size: 0.95rem; color: #666;">
                    Log into your <a href="http://localhost:5173/admin" style="color: #5D4037; font-weight: bold; text-decoration: none;">Admin Dashboard</a> to reply.
                </p>
            </div>
        `
    };

    try {
        await getTransporter().sendMail(mailOptions);
    } catch (err) {
        console.error("Admin Email notification failed:", err.message);
    }
};

// Helper for customer notifications (admin -> customer)
const sendCustomerNotification = async (replyMsg) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

    try {
        // Try to find customer's email if not in body
        let targetEmail = replyMsg.userEmail;
        let targetName = "Customer";

        if (!targetEmail || targetEmail === 'Guest' || targetEmail === 'Admin') {
            // Find latest non-admin message in this conversation
            const lastMsg = await Message.findOne({ userId: replyMsg.userId, isAdmin: false }).sort({ timestamp: -1 });
            if (lastMsg && lastMsg.userEmail && lastMsg.userEmail !== 'Guest') {
                targetEmail = lastMsg.userEmail;
                targetName = lastMsg.userName;
            } else {
                // Check JSON fallback
                const localMsgs = getJsonMessages().filter(m => m.userId === replyMsg.userId && !m.isAdmin);
                const latestLocal = localMsgs[localMsgs.length - 1];
                if (latestLocal && latestLocal.userEmail && latestLocal.userEmail !== 'Guest') {
                    targetEmail = latestLocal.userEmail;
                    targetName = latestLocal.userName;
                }
            }
        }

        if (!targetEmail || targetEmail === 'Guest' || targetEmail === 'Admin') {
            console.log("Cannot send email: No valid customer email found for ID", replyMsg.userId);
            return;
        }

        const mailOptions = {
            from: `"Nature's Pledge Support" <${process.env.EMAIL_USER}>`,
            to: targetEmail,
            subject: `🌿 Support Reply: Nature's Pledge`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; max-width: 600px; margin: auto; background-color: #fdfaf7;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #5D4037; margin: 0;">Nature's Pledge</h2>
                        <p style="color: #8D6E63; font-size: 0.9rem; margin-top: 5px;">Pure Kashmiri Organics</p>
                    </div>
                    <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin: 20px 0; border-left: 5px solid #5D4037;">
                        <p style="margin-top: 0; font-size: 1.1rem; color: #5D4037;">Hi ${targetName},</p>
                        <p style="line-height: 1.6; font-size: 1.05rem;">Our support agent has replied to your inquiry:</p>
                        <div style="background: #fdfaf7; padding: 15px; border-radius: 6px; font-style: italic; color: #444; margin: 15px 0; border: 1px dashed #D7CCC8;">
                            "${replyMsg.text}"
                        </div>
                        <p style="font-size: 0.95rem; line-height: 1.6;">You can continue the chat by visiting our <a href="http://localhost:5173" style="color: #5D4037; font-weight: bold; text-decoration: underline;">online store</a> and opening the Help Widget.</p>
                    </div>
                    <p style="text-align: center; font-size: 0.85rem; color: #999; margin-top: 30px;">
                        &copy; 2026 Nature's Pledge. All rights reserved. <br>
                        Providing the best Kashmiri walnuts, almonds, and more.
                    </p>
                </div>
            `
        };

        await getTransporter().sendMail(mailOptions);
        console.log("Reply email sent to customer:", targetEmail);
    } catch (err) {
        console.error("Customer Notification Email failed:", err.message);
    }
};


// Helper for JSON fallback
const getJsonMessages = () => {
    try {
        if (!fs.existsSync(jsonPath)) return [];
        return JSON.parse(fs.readFileSync(jsonPath));
    } catch { return []; }
};

const saveJsonMessage = (msg) => {
    try {
        const messages = getJsonMessages();
        messages.push(msg);
        fs.writeFileSync(jsonPath, JSON.stringify(messages, null, 2));
    } catch (e) { console.error("JSON Message Save Error", e); }
};

// User: Get my conversation
router.get('/:userId', async (req, res) => {
    try {
        // Optimization: If DB is not connected, go to JSON immediately
        if (require('mongoose').connection.readyState !== 1) {
            throw new Error("DB Disconnected");
        }

        const messages = await Message.find({ userId: req.params.userId }).sort({ timestamp: 1 });
        if (messages.length === 0) {
            const localMsgs = getJsonMessages().filter(m => m.userId === req.params.userId);
            return res.json(localMsgs);
        }
        res.json(messages);
    } catch (err) {
        const localMsgs = getJsonMessages().filter(m => m.userId === req.params.userId);
        res.json(localMsgs);
    }
});

// User: Send message
router.post('/', async (req, res) => {
    console.log('Incoming Message:', req.body);
    try {
        const { userId, userName, userEmail, text, isAdmin } = req.body;
        const msgData = { userId, userName, userEmail, text, isAdmin, timestamp: new Date(), isRead: false };

        // Always save to JSON backup
        saveJsonMessage(msgData);

        const msg = new Message(msgData);
        await msg.save().catch(e => console.warn('DB Save Skip:', e.message));

        // NOTIFICATIONS
        if (isAdmin) {
            // If admin replies, notify the customer via email
            sendCustomerNotification(msgData).catch(e => console.error('Customer Notify Error:', e.message));
        } else {
            // If customer messages, notify the admin
            sendAdminNotification(msgData).catch(e => console.error('Admin Notify Error:', e.message));
        }

        res.json(msgData); // Return data even if DB failed (JSON fallback has it)
    } catch (err) {
        console.error('Crash in POST:', err);
        res.status(500).json(req.body);
    }
});

// Admin: Get all conversations (latest messages from each user)
router.get('/admin/all', async (req, res) => {
    try {
        if (require('mongoose').connection.readyState !== 1) {
            throw new Error("DB Disconnected");
        }

        // Group by userId, get latest message info
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

        if (conversations.length === 0) throw new Error("No DB msgs");
        res.json(conversations);
    } catch (err) {
        // JSON Fallback aggregation
        const msgs = getJsonMessages();
        const groups = {};
        msgs.forEach(m => {
            if (!groups[m.userId] || new Date(m.timestamp) > new Date(groups[m.userId].timestamp)) {
                groups[m.userId] = {
                    _id: m.userId,
                    userName: m.isAdmin ? (groups[m.userId]?.userName || 'User') : m.userName,
                    lastMessage: m.text,
                    timestamp: m.timestamp,
                    unreadCount: msgs.filter(x => x.userId === m.userId && !x.isAdmin && !x.isRead).length
                };
            }
        });
        res.json(Object.values(groups).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }
});

// Admin: Mark conversation as read
router.patch('/admin/read/:userId', async (req, res) => {
    try {
        await Message.updateMany({ userId: req.params.userId, isAdmin: false }, { isRead: true });

        // JSON Sync
        const msgs = getJsonMessages();
        msgs.forEach(m => {
            if (m.userId === req.params.userId && !m.isAdmin) m.isRead = true;
        });
        fs.writeFileSync(jsonPath, JSON.stringify(msgs, null, 2));

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Admin: Resolve/Delete Inquiry
router.delete('/admin/resolve/:userId', async (req, res) => {
    try {
        const userId = String(req.params.userId);

        // MongoDB
        await Message.deleteMany({ userId });

        // JSON Fallback Sync
        const msgs = getJsonMessages();
        const filtered = msgs.filter(m => String(m.userId) !== userId);
        fs.writeFileSync(jsonPath, JSON.stringify(filtered, null, 2));

        res.json({ success: true, message: 'Inquiry resolved' });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;


