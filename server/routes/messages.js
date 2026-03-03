const express = require('express');
const router = require('express').Router();
const Message = require('../models/Message');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Gemini AI setup
let genAI = null;
try {
    if (process.env.GEMINI_API_KEY) {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log('Gemini AI initialized');
    }
} catch (e) { console.warn('Gemini not available:', e.message); }

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tilakmishra.76@gmail.com';

// Email transporter
const getTransporter = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
    }
    return null;
};

// Admin email alert
const sendAdminNotification = async (msg) => {
    const transporter = getTransporter();
    if (!transporter) return;
    const mailOptions = {
        from: '"Nature\'s Pledge Support" <' + process.env.EMAIL_USER + '>',
        to: ADMIN_EMAIL,
        subject: '💬 New Message from ' + msg.userName + ' — Nature\'s Pledge',
        html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:10px;">' +
            '<h2 style="color:#5D4037;border-bottom:2px solid #8D6E63;padding-bottom:10px;">🌿 New Customer Message</h2>' +
            '<table style="width:100%;background:white;border-radius:8px;padding:15px;border:1px solid #eee;">' +
            '<tr><td style="padding:8px;color:#888;"><strong>👤 Customer:</strong></td><td>' + msg.userName + '</td></tr>' +
            '<tr><td style="padding:8px;color:#888;"><strong>📧 Email:</strong></td><td>' + (msg.userEmail || 'Not provided') + '</td></tr>' +
            '<tr><td style="padding:8px;color:#888;"><strong>🕒 Time:</strong></td><td>' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + '</td></tr>' +
            '</table>' +
            '<div style="background:white;border-left:4px solid #8D6E63;margin:15px 0;padding:15px;border-radius:0 8px 8px 0;">' +
            '<p style="margin:0;font-size:1.1rem;color:#333;">"' + msg.text + '"</p></div>' +
            '<a href="https://www.naturespledge.in/admin" style="display:inline-block;background:#5D4037;color:white;padding:12px 25px;border-radius:25px;text-decoration:none;font-weight:bold;margin-top:10px;">💬 Reply in Admin Panel</a>' +
            '</div>'
    };
    try { await transporter.sendMail(mailOptions); } catch (err) { console.error('Admin Email fail:', err.message); }
};

// Customer email reply
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
            from: '"Nature\'s Pledge Support" <' + process.env.EMAIL_USER + '>',
            to: targetEmail,
            subject: '🌿 Reply from Nature\'s Pledge Support',
            html: '<div style="font-family:Arial,sans-serif;max-width:600px;padding:20px;">' +
                '<h2 style="color:#5D4037;">🌿 Nature\'s Pledge Support</h2>' +
                '<p>Hi! Our team has replied to your inquiry:</p>' +
                '<blockquote style="border-left:4px solid #8D6E63;padding:10px 15px;color:#333;">' + replyMsg.text + '</blockquote>' +
                '<p>You can view the full conversation in your <a href="https://www.naturespledge.in/dashboard">Dashboard → Contact Us</a></p>' +
                '</div>'
        };
        await transporter.sendMail(mailOptions);
    } catch (err) { console.error('Customer Email fail:', err.message); }
};

// Smart keyword bot
const getBotReply = (text) => {
    const msg = text.toLowerCase();

    // Order not received - URGENT
    if (msg.match(/not receiv|not reciev|not recieve|didn.t receive|haven.t received|order nahi|mila nahi|mila nhi|where is my order|order kahan/)) {
        return '😟 We\'re really sorry to hear that! Your concern has been flagged as URGENT and our agent will connect with you shortly.\n\nTo help you faster, please reply with:\n1. Your Order ID (e.g. NP-12345)\n2. The date you placed the order\n\nWe sincerely apologize for the inconvenience! 🙏';
    }
    // Track order
    if (msg.match(/track|order status|check.*order|where is my|mera order|tracking/)) {
        return '📦 To track your order:\n1. Go to Dashboard → Your Orders → Track Package\n2. Or use the tracking link sent to your email after dispatch\n\nIf you need help, please share your Order ID and we will check it right away!';
    }
    // Delivery
    if (msg.match(/deliver|shipping|ship|dispatch|days|arrive|kab aaye|kab milega|kitne din/)) {
        return '🚚 Our standard delivery time is 5-7 business days across India. Express delivery (2-3 days) is available at checkout for select pincodes. You will receive a tracking link via email once your order is dispatched!';
    }
    // Returns
    if (msg.match(/return|refund|exchange|wapas|vapas|cancel/)) {
        return '↩️ We have a 7-day return policy from the date of delivery. If the product is damaged or incorrect, we offer a full refund.\n\nTo initiate a return, please share:\n• Your Order ID\n• Reason for return\n• Photo of the product (if damaged)\n\nOur agent will connect with you shortly to process it.';
    }
    // Payment
    if (msg.match(/payment|pay|razorpay|upi|failed|deduct|charged|paise|money|wallet/)) {
        return '💳 For payment issues: If money was deducted but order was not placed, it will be automatically refunded within 5-7 business days to your original payment method.\n\nPlease share your transaction ID or registered email and our agent will connect with you shortly to resolve it! 🙏';
    }
    // Bulk orders
    if (msg.match(/bulk|wholesale|large order|10kg|20kg|quantity|business order/)) {
        return '📦 We offer special pricing for bulk orders above 5kg! Please email us at tilakmishra.76@gmail.com with:\n• Products needed\n• Quantity required\n• Delivery location\n\nOur team will get back to you with a custom quote!';
    }
    // COD
    if (msg.match(/cod|cash on delivery|pay on delivery/)) {
        return 'ℹ️ Currently, Cash on Delivery is not available. We accept UPI, Debit/Credit Cards, Netbanking, and Wallets via Razorpay. We are working on adding COD soon!';
    }
    // Products & prices
    if (msg.match(/walnut|akhrot|almond|badam|rajma|atta|chutney|honey|saffron|kesar|product|price|rate|cost|kitna|how much/)) {
        return '🌿 Our products include premium Kashmiri Walnuts (Rs.500-900/kg), Almonds (Rs.600-1200/kg), Rajma (Rs.180-250/kg), Organic Atta (Rs.80-120/kg), Natural Honey, Saffron, and more!\n\nAll products are 100% authentic and directly sourced from Kashmiri farmers. Visit our Shop page for full details!';
    }
    // Quality
    if (msg.match(/quality|fresh|organic|natural|genuine|real|pure|authentic/)) {
        return '✅ Nature\'s Pledge guarantees 100% pure and natural products. All our dry fruits and organic foods are directly sourced from Kashmiri farmers with no preservatives. Every batch is quality tested before dispatch!';
    }
    // Discounts
    if (msg.match(/discount|offer|coupon|code|sale|promo/)) {
        return '🎁 Currently, enjoy free shipping on orders above Rs.1500! We also run seasonal offers - follow us on social media for exclusive discount codes.';
    }
    // Contact
    if (msg.match(/contact|phone|call|email|address|office|helpline|support/)) {
        return '📞 You can reach us at:\n📧 Email: tilakmishra.76@gmail.com\n🌐 Website: naturespledge.in\n\nOur support team is available Mon-Sat, 10 AM - 6 PM IST. Our agent will connect with you shortly!';
    }
    // Greetings
    if (msg.match(/^(hello|hi|hey|hii+|namaste|namaskar|good morning|good afternoon|good evening)/)) {
        return '👋 Hello! Welcome to Nature\'s Pledge Support!\n\nI am here to help you with:\n• Order tracking & status\n• Delivery information\n• Returns & refunds\n• Product queries\n• Payment issues\n\nHow can I assist you today?';
    }
    // Thanks
    if (msg.match(/thank|thanks|shukriya|dhanyawad|great|awesome|perfect|nice/)) {
        return '😊 You are welcome! Happy to help. If you have any other questions, feel free to ask anytime. Have a wonderful day! 🌿';
    }

    return null; // Let Gemini handle it
};

// Detect technical/urgent issues
const isTechnicalIssue = (text) => {
    const t = text.toLowerCase();
    return t.match(/payment fail|money deduct|charged twice|not working|error|bug|crash|can.t login|stuck|wrong item|missing item|damaged|broken|fraud|scam|urgent|not received|lost order|wrong address|account hacked/);
};

// Gemini AI for intelligent replies
const getAIReply = async (userText, userName) => {
    if (!genAI) return null;
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = 'You are Pledge Assistant, a friendly customer support bot for Nature\'s Pledge - a premium Kashmiri organic food brand in India.\n\n' +
            'PRODUCTS: Kashmiri Walnuts (Rs.500-900/kg), Almonds (Rs.600-1200/kg), Rajma (Rs.180-250/kg), Organic Atta (Rs.80-120/kg), Honey (Rs.400-700), Saffron (Rs.200-500/gm). All 100% natural, sourced directly from Kashmiri farmers.\n\n' +
            'POLICIES: Delivery 5-7 days standard, 2-3 days express. Free shipping above Rs.1500. 7-day return policy. No COD. Payments via UPI/Cards/Razorpay.\n\n' +
            'CONTACT: tilakmishra.76@gmail.com | naturespledge.in | Mon-Sat 10AM-6PM IST\n\n' +
            'RULES: Reply in English only. Be warm and helpful. Max 3-4 sentences. No markdown like ** or *. If order specific, ask for Order ID. End by offering more help.\n\n' +
            'Customer: ' + userName + '\nMessage: ' + userText + '\n\nReply:';

        const result = await model.generateContent(prompt);
        return result.response.text() || null;
    } catch (err) {
        console.error('Gemini AI error:', err.message);
        return null;
    }
};

// Busy admin fallback - user always gets a reply
const getBusyReply = (userName) => {
    return 'Hi ' + (userName || 'there') + '! 👋 Thank you for reaching out to Nature\'s Pledge Support.\n\nYour message has been received and our agent will connect with you shortly.\n\nFor urgent issues, you can directly email us at tilakmishra.76@gmail.com\n\nWe appreciate your patience! 🌿';
};

// GET messages for a user
router.get('/:userId', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return res.json([]);
        const messages = await Message.find({ userId: req.params.userId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) { res.json([]); }
});

// POST new message
router.post('/', async (req, res) => {
    try {
        const { userId, userName, userEmail, text, isAdmin } = req.body;
        const msgData = { userId, userName, userEmail, text, isAdmin, timestamp: new Date(), isRead: false };

        if (mongoose.connection.readyState === 1) {
            const msg = new Message(msgData);
            await msg.save();

            if (isAdmin) {
                sendCustomerNotification(msgData).catch(console.error);
                return res.json(msg);
            }

            // Step 1: Check if urgent/technical issue - alert admin immediately
            if (isTechnicalIssue(text)) {
                sendAdminNotification(msgData).catch(console.error);
            }

            // Step 2: Keyword bot (fast)
            const botReply = getBotReply(text);
            if (botReply) {
                const botMsg = new Message({
                    userId, userName: "Nature's Pledge Support", userEmail: 'support@naturespledge.in',
                    text: botReply, isAdmin: true, timestamp: new Date(), isRead: true
                });
                await botMsg.save();
                return res.json({ userMsg: msg, botMsg });
            }

            // Step 3: Gemini AI
            const aiReply = await getAIReply(text, userName);
            if (aiReply) {
                const aiMsg = new Message({
                    userId, userName: "Nature's Pledge AI", userEmail: 'ai@naturespledge.in',
                    text: aiReply, isAdmin: true, timestamp: new Date(), isRead: true
                });
                await aiMsg.save();
                return res.json({ userMsg: msg, botMsg: aiMsg });
            }

            // Step 4: Busy admin fallback - user always gets a reply
            sendAdminNotification(msgData).catch(console.error);
            const busyMsg = new Message({
                userId, userName: "Nature's Pledge Support", userEmail: 'support@naturespledge.in',
                text: getBusyReply(userName), isAdmin: true, timestamp: new Date(), isRead: true
            });
            await busyMsg.save();
            return res.json({ userMsg: msg, botMsg: busyMsg });
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
            { $group: { _id: '$userId', lastMessage: { $last: '$text' }, lastTime: { $last: '$timestamp' }, userName: { $last: '$userName' }, userEmail: { $last: '$userEmail' }, unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } } } },
            { $sort: { lastTime: -1 } }
        ]);
        res.json(conversations);
    } catch (err) { res.json([]); }
});

// Admin: Reply to user
router.post('/admin/reply', async (req, res) => {
    try {
        const { userId, text } = req.body;
        if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
        const replyMsg = new Message({
            userId, userName: 'Admin', userEmail: ADMIN_EMAIL,
            text, isAdmin: true, timestamp: new Date(), isRead: true
        });
        await replyMsg.save();
        sendCustomerNotification(replyMsg).catch(console.error);
        res.json(replyMsg);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
