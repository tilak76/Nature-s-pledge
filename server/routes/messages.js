const express = require('express');
const router = require('express').Router();
const Message = require('../models/Message');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Gemini AI
let genAI = null;
try {
    if (process.env.GEMINI_API_KEY) {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
} catch (e) { console.warn('Gemini not available:', e.message); }

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tilakmishra.76@gmail.com';

const getTransporter = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return null;
};

// Notification helpers
const sendAdminNotification = async (msg) => {
    const transporter = getTransporter();
    if (!transporter) return;
    const mailOptions = {
        from: `"Nature's Pledge Support" <${process.env.EMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: `💬 New Message from ${msg.userName} — Nature's Pledge`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:10px;">
            <h2 style="color:#5D4037;border-bottom:2px solid #8D6E63;padding-bottom:10px;">🌿 New Customer Message</h2>
            <table style="width:100%;background:white;border-radius:8px;padding:15px;border:1px solid #eee;">
                <tr><td style="padding:8px;color:#888;width:120px;"><strong>👤 Customer:</strong></td><td style="padding:8px;">${msg.userName}</td></tr>
                <tr><td style="padding:8px;color:#888;"><strong>📧 Email:</strong></td><td style="padding:8px;">${msg.userEmail || 'Not provided'}</td></tr>
                <tr><td style="padding:8px;color:#888;"><strong>🕒 Time:</strong></td><td style="padding:8px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
            </table>
            <div style="background:white;border-left:4px solid #8D6E63;margin:15px 0;padding:15px;border-radius:0 8px 8px 0;">
                <p style="margin:0;font-size:1.1rem;color:#333;">"${msg.text}"</p>
            </div>
            <a href="https://www.naturespledge.in/admin" style="display:inline-block;background:#5D4037;color:white;padding:12px 25px;border-radius:25px;text-decoration:none;font-weight:bold;margin-top:10px;">
                💬 Reply in Admin Panel
            </a>
        </div>`
    };
    try { await transporter.sendMail(mailOptions); } catch (err) { console.error("Admin Email fail:", err.message); }
};

const sendCustomerNotification = async (replyMsg) => {
    const transporter = getTransporter();
    if (!transporter) return;
    try {
        let targetEmail = replyMsg.userEmail;
        if (!targetEmail || targetEmail === 'Guest' || targetEmail === 'Admin') {
            const lastMsg = await Message.findOne({ userId: replyMsg.userId, isAdmin: false }).sort({ timestamp: -1 });
            if (lastMsg && lastMsg.userEmail && lastMsg.userEmail !== 'Guest') targetEmail = lastMsg.userEmail;
        }
        if (!targetEmail || targetEmail === 'Guest' || targetEmail === 'Admin') return;

        const mailOptions = {
            from: `"Nature's Pledge Support" <${process.env.EMAIL_USER}>`,
            to: targetEmail,
            subject: `🌿 Support Reply: Nature's Pledge`,
            html: `<div><p>Hi,</p><p>Our agent replied:</p><blockquote>"${replyMsg.text}"</blockquote></div>`
        };
        await transporter.sendMail(mailOptions);
    } catch (err) { console.error("Customer Email fail:", err.message); }
};

// 🤖 Smart Bot - Auto replies to common questions
const getBotReply = (text) => {
    const msg = text.toLowerCase();

    if (msg.match(/deliver|shipping|ship|dispatch|days|arrive|kab aaye|kab milega|kitne din/)) {
        return "🚚 Our standard delivery time is 5-7 business days across India. Express delivery (2-3 days) is available at checkout for select pincodes. You'll receive a tracking link via email once your order is dispatched!";
    }
    if (msg.match(/track|order status|where is my|mera order|tracking/)) {
        return "📦 To track your order, go to Dashboard → Your Orders → Track Package. You can also use the tracking link sent to your email after dispatch. If you haven't received a tracking link within 2 days of ordering, please let us know!";
    }
    if (msg.match(/return|refund|exchange|wapas|vapas|cancel/)) {
        return "↩️ We have a 7-day return policy from the date of delivery. If the product is damaged or incorrect, we offer a full refund. To initiate a return, please reply with your Order ID and reason. Our team will process it within 2-3 business days.";
    }
    if (msg.match(/payment|pay|razorpay|upi|failed|deduct|paise|money|wallet/)) {
        return "💳 For payment issues: If money was deducted but order not placed, it will be automatically refunded within 5-7 business days to your original payment method. For wallet issues, please share your registered email and we'll investigate. You can also pay via UPI, Cards, or Netbanking.";
    }
    if (msg.match(/walnut|akhrot|almond|badam|rajma|atta|chutney|honey|saffron|kesar|product|price|rate/)) {
        return "🌿 All our products are 100% authentic Kashmiri organics sourced directly from farmers. Visit our Shop page to view the latest prices and stock. We offer bulk discounts for orders above ₹2000! Is there a specific product you'd like to know more about?";
    }
    if (msg.match(/quality|fresh|organic|natural|genuine|real|pure/)) {
        return "✅ Nature's Pledge guarantees 100% pure and natural products. All our dry fruits and organic foods are directly sourced from Kashmiri farmers with no preservatives or artificial additives. Every batch is quality tested before dispatch!";
    }
    if (msg.match(/discount|offer|coupon|code|sale|promo/)) {
        return "🎁 We occasionally have seasonal offers! Currently, enjoy free shipping on orders above ₹1500. Follow us on social media for exclusive discount codes. Would you like to be added to our offer notification list?";
    }
    if (msg.match(/contact|phone|call|email|address|office|helpline/)) {
        return "📞 You can reach us at:\n📧 Email: tilakmishra.76@gmail.com\n🌐 Website: naturespledge.in\n\nOur support team is available Mon-Sat, 10 AM - 6 PM IST. For urgent issues, please email us directly!";
    }
    if (msg.match(/hello|hi|hey|hii|namaste|namaskar|good morning|good afternoon/)) {
        return "👋 Hello! Welcome to Nature's Pledge Support! 🌿\n\nI'm here to help you with:\n• Order tracking & status\n• Delivery information\n• Returns & refunds\n• Product queries\n• Payment issues\n\nHow can I assist you today?";
    }
    if (msg.match(/thank|thanks|shukriya|dhanyawad|great|awesome|good/)) {
        return "😊 You're welcome! We're happy to help. If you have any other questions, feel free to ask. Have a great day and enjoy your Nature's Pledge products! 🌿";
    }

    // No match - let Gemini AI handle it
    return null;
};

// 🔍 Detect if message is a technical/urgent issue needing admin
const isTechnicalIssue = (text) => {
    const t = text.toLowerCase();
    return t.match(/payment fail|money deduct|charged twice|not working|error|bug|crash|can't login|cannot login|stuck|wrong item|missing item|damaged|broken|fraud|scam|urgent|emergency|help me|please help|not received|lost order|wrong address|account hacked/);
};

// 🧠 Gemini AI - handles ALL questions intelligently
const getAIReply = async (userText, userName) => {
    if (!genAI) return null;
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const systemPrompt = `You are "Pledge Assistant" - the friendly AI support bot for "Nature's Pledge", a premium Kashmiri organic food e-commerce brand based in India.

PRODUCTS WE SELL (with approximate prices):
- Kashmiri Walnuts (Akhrot) - Regular & Premium grades - ₹500-900/kg
- Kashmiri Almonds (Badam) - Soft shell & Gurbandi - ₹600-1200/kg  
- Bhaderwahi Rajma (Kidney Beans) - ₹180-250/kg
- Organic Whole Wheat Atta - ₹80-120/kg
- Anardana (Dried Pomegranate Seeds) - ₹300-500/kg
- Natural Kashmiri Honey - ₹400-700/jar
- Kashmiri Saffron (Kesar) - ₹200-500/gm
- Kashmiri Spices & Masalas
- All products are 100% natural, no preservatives, sourced directly from farmers

COMPANY POLICIES:
- Delivery: 5-7 business days standard across India | 2-3 days express (select pincodes)
- FREE shipping on orders above ₹1500
- Return Policy: 7 days from delivery for damaged/wrong items → full refund
- Payment: UPI, Debit/Credit Cards, Netbanking, Razorpay
- Cash on Delivery: Not available currently
- Bulk orders (above 5kg): Special pricing available - contact admin

CONTACT:
- Email: tilakmishra.76@gmail.com
- Website: naturespledge.in
- Support hours: Mon-Sat 10 AM - 6 PM IST

HOW TO RESPOND:
- Always reply in ENGLISH only, even if user writes in Hindi/Hinglish
- Be warm, friendly, and helpful - like a knowledgeable friend
- Keep replies concise (2-4 sentences max unless a detailed answer is needed)
- If user asks about specific order status → ask them to share Order ID
- For product recommendations → suggest based on their needs
- Use relevant emojis but not too many
- If user seems frustrated → be extra empathetic and apologetic
- End each reply inviting further questions

Customer Name: ${userName}
Customer Message: ${userText}

IMPORTANT: Do NOT use markdown formatting like **bold** or *italic*. Write plain text only.
Respond naturally and helpfully:`;

        const result = await model.generateContent(systemPrompt);
        const reply = result.response.text();
        return reply || null;
    } catch (err) {
        console.error('Gemini AI error:', err.message);
        return null;
    }
};


// GET messages for user
router.get('/:userId', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return res.json([]);
        const messages = await Message.find({ userId: req.params.userId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) { res.json([]); }
});

// POST message
router.post('/', async (req, res) => {
    try {
        const { userId, userName, userEmail, text, isAdmin } = req.body;
        const msgData = { userId, userName, userEmail, text, isAdmin, timestamp: new Date(), isRead: false };

        if (mongoose.connection.readyState === 1) {
            const msg = new Message(msgData);
            await msg.save();

            if (isAdmin) {
                // Admin reply → notify customer via email
                sendCustomerNotification(msgData).catch(console.error);
                return res.json(msg);
            }

            // User message → Smart routing
            // Step 1: Check if it's a technical/urgent issue → alert admin immediately
            if (isTechnicalIssue(text)) {
                sendAdminNotification({ ...msgData, subject: `🚨 URGENT: Technical Issue from ${userName}` }).catch(console.error);
            }

            // Step 2: Check keyword bot first (fast, no API call)
            const botReply = getBotReply(text);
            if (botReply) {
                const botMsg = new Message({
                    userId, userName: "Nature's Pledge Support", userEmail: 'bot@naturespledge.in',
                    text: botReply, isAdmin: true, timestamp: new Date(), isRead: true
                });
                await botMsg.save();
                return res.json({ userMsg: msg, botMsg });
            }

            // Step 3: Gemini AI handles everything else
            const aiReply = await getAIReply(text, userName);
            if (aiReply) {
                const aiMsg = new Message({
                    userId, userName: "Nature's Pledge AI", userEmail: 'ai@naturespledge.in',
                    text: aiReply, isAdmin: true, timestamp: new Date(), isRead: true
                });
                await aiMsg.save();
                return res.json({ userMsg: msg, botMsg: aiMsg });
            }

            // Neither bot nor AI could handle → alert admin
            sendAdminNotification(msgData).catch(console.error);
            return res.json(msg);
        }
        res.json(msgData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get all conversations
router.get('/admin/all', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return res.json([]);
        const conversations = await Message.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$userId",
                    userName: { $max: { $cond: [{ $eq: ["$isAdmin", false] }, "$userName", null] } },
                    userEmail: { $max: { $cond: [{ $eq: ["$isAdmin", false] }, "$userEmail", null] } },
                    lastMessage: { $first: "$text" },
                    timestamp: { $first: "$timestamp" },
                    unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$isAdmin", false] }, { $eq: ["$isRead", false] }] }, 1, 0] } }
                }
            },
            { $sort: { timestamp: -1 } }
        ]);
        res.json(conversations);
    } catch (err) { res.json([]); }
});

// Admin: Mark read
router.patch('/admin/read/:userId', async (req, res) => {
    try {
        await Message.updateMany({ userId: req.params.userId, isAdmin: false }, { isRead: true });
        res.json({ success: true });
    } catch (err) { res.json({ success: false }); }
});

// Admin: Resolve
router.delete('/admin/resolve/:userId', async (req, res) => {
    try {
        await Message.deleteMany({ userId: req.params.userId });
        res.json({ success: true });
    } catch (err) { res.json({ success: false }); }
});

module.exports = router;
