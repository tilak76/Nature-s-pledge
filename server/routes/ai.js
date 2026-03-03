const express = require('express');
const router = express.Router();

let genAI = null;
try {
    if (process.env.GEMINI_API_KEY) {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
} catch (e) { console.warn('Gemini AI load error:', e.message); }

const SYSTEM_PROMPT = `You are "Pledge AI", a smart and friendly shopping assistant for Nature's Pledge - a premium Kashmiri organic food brand.

PRODUCTS AVAILABLE:
- Kashmiri Walnuts (Akhrot): Rs.500-900/kg. Rich in Omega-3, great for brain health, heart health, weight management
- Kashmiri Almonds (Badam): Rs.600-1200/kg. Boost memory, great for skin, energy, daily snacking  
- Bhaderwahi Rajma (Kidney Beans): Rs.180-250/kg. High protein, great for vegetarians, makes excellent curry
- Organic Whole Wheat Atta: Rs.80-120/kg. Healthier than refined flour, good for diabetes management
- Anardana (Pomegranate Seeds): Rs.300-500/kg. Great digestive, antioxidant powerhouse
- Natural Kashmiri Honey: Rs.400-700/jar. Pure, unprocessed, great for immunity and throat infections
- Kashmiri Saffron (Kesar): Rs.200-500/gm. Premium grade, great for skin, milk, biryani, sweets
- Kashmiri Spices & Masalas: Various prices. Authentic flavors

ABOUT THE BRAND:
- All products sourced directly from Kashmiri farmers - no middlemen, 100% authentic
- No preservatives, no artificial additives
- Free shipping on orders above Rs.1500
- Delivery: 5-7 business days standard
- 7-day return policy for damaged items
- Website: naturespledge.in

HOW TO HELP USERS:
- Help them find the right product for their needs (health goals, cooking, gifting)
- Suggest product combinations (e.g., "For immunity: Honey + Saffron + Almonds")
- Explain health benefits in simple terms
- Guide them on how to place orders, track orders, and use the website
- Answer questions about delivery, returns, pricing
- Suggest gift ideas and seasonal specials

IMPORTANT RULES:
- Reply in English only (even if user writes in Hindi)
- Be friendly, warm, like a knowledgeable friend
- Keep responses helpful and to the point (3-5 sentences max)
- Do NOT use markdown like ** or * in replies - plain text only
- Always end with an invitation to ask more questions or browse the shop`;

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
    try {
        const { message, userName, history } = req.body;
        if (!message) return res.status(400).json({ error: 'Message required' });

        if (!genAI) {
            return res.json({ reply: 'Our AI assistant is currently unavailable. Please use the Support Chat in your Dashboard for help, or email us at tilakmishra.76@gmail.com 🌿' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Build conversation with history
        const chat = model.startChat({
            history: (history || []).map(h => ({
                role: h.role,
                parts: [{ text: h.text }]
            })),
            generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
        });

        const fullPrompt = SYSTEM_PROMPT + '\n\nCustomer name: ' + (userName || 'Guest') + '\nCustomer: ' + message;
        const result = await chat.sendMessage(fullPrompt);
        const reply = result.response.text();

        res.json({ reply: reply || 'I am here to help! Could you please rephrase your question? 😊' });
    } catch (err) {
        console.error('AI chat error:', err.message);
        res.json({ reply: 'I am having a little trouble right now. Please try again or contact us at tilakmishra.76@gmail.com 🌿' });
    }
});

// GET /api/ai/recommend - product recommendations
router.get('/recommend', async (req, res) => {
    try {
        const { goal } = req.query; // e.g. "immunity", "weight loss", "gifting"
        if (!genAI) return res.json({ recommendations: [] });

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = SYSTEM_PROMPT + '\n\nUser goal: ' + (goal || 'general health') + '\n\nSuggest 3 best products from our store for this goal. Reply in JSON format: [{"name":"product name","reason":"short reason","price":"price range"}]';

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Extract JSON from response
        const match = text.match(/\[[\s\S]*\]/);
        const recommendations = match ? JSON.parse(match[0]) : [];
        res.json({ recommendations });
    } catch (err) {
        console.error('AI recommend error:', err.message);
        res.json({ recommendations: [] });
    }
});

module.exports = router;
