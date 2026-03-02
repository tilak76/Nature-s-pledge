import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ChatWidget.css';

const ChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    // Identity: use actual user ID if logged in, else generate a stable session ID
    const getChatId = () => {
        if (user && (user.id || user.email)) return user.id || user.email;
        let guestId = localStorage.getItem('chat_guest_id');
        if (!guestId) {
            guestId = 'Guest_' + Math.floor(Math.random() * 1000000);
            localStorage.setItem('chat_guest_id', guestId);
        }
        return guestId;
    };

    const chatId = getChatId();

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 8000); // Polling background every 8s
        return () => clearInterval(interval);
    }, [chatId]);

    // Clear unread badge when chat is opened
    useEffect(() => {
        if (isOpen) setHasUnread(false);
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`/api/messages/${chatId}`);
            setMessages(prev => {
                // If new messages found
                if (res.data.length > prev.length) {
                    const latest = res.data[res.data.length - 1];
                    // If the latest message is from admin and chat is closed, flag unread
                    if (latest.isAdmin && !isOpen) {
                        setHasUnread(true);
                    }
                    return res.data;
                }
                return prev;
            });
        } catch (err) {
            console.error("Chat sync error:", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMsg = {
            userId: chatId,
            userName: user?.name || 'Customer',
            userEmail: user?.email || 'Guest',
            text: inputValue,
            isAdmin: false
        };

        setLoading(true);
        try {
            const res = await axios.post('/api/messages', newMsg);
            setMessages(prev => [...prev, { ...res.data, timestamp: new Date() }]);
            setInputValue('');
        } catch (err) {
            console.error("Failed to send message:", err);
            // Fallback for UI if server failed but frontend should be optimistic
            setMessages(prev => [...prev, { ...newMsg, timestamp: new Date() }]);
            setInputValue('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`chat-wrapper ${isOpen ? 'open' : ''}`}>
            {/* Toggle Button */}
            {!isOpen && (
                <button className={`chat-toggle ${hasUnread ? 'pulse-alert' : ''}`} onClick={() => setIsOpen(true)}>
                    <div className="chat-badge-pulse"></div>
                    {hasUnread && <span className="chat-unread-dot">1</span>}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                    </svg>
                    <span>{hasUnread ? 'New Reply!' : 'Live Help'}</span>
                </button>
            )}

            {/* Chat Box */}
            {isOpen && (
                <div className="chat-box animate-slide-up">
                    <div className="chat-header">
                        <div className="chat-user-info">
                            <div className="support-avatar-container">
                                <img src="https://ui-avatars.com/api/?name=Nature+Pledge&background=5D4037&color=fff" alt="Support" className="support-avatar" />
                                <div className="online-status"></div>
                            </div>
                            <div>
                                <h4>Nature's Pledge Support</h4>
                                <p>Typically replies in minutes</p>
                            </div>
                        </div>
                        <button className="chat-close" onClick={() => setIsOpen(false)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div className="chat-body" ref={scrollRef}>
                        {messages.length === 0 ? (
                            <div className="chat-welcome-container">
                                <span style={{ fontSize: '2.5rem', marginBottom: '10px', display: 'block' }}>🌿</span>
                                <h3>Namaste! 🙏</h3>
                                <p>Welcome to Nature's Pledge. We're here to help you find pure Kashmiri walnuts, organic saffron, and authentic spices.</p>
                                {!user && <div className="guest-badge">Chatting as Guest</div>}
                                <div className="quick-suggestions">
                                    <button onClick={() => setInputValue("Tell me about Kashmiri Walnuts")}>About Walnuts</button>
                                    <button onClick={() => setInputValue("How to track my order?")}>Track Order</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="chat-system-msg">Support conversation started</div>
                                {messages.map((msg, i) => (
                                    <div key={i} className={`chat-bubble ${msg.isAdmin ? 'admin' : 'user'}`}>
                                        <div className="bubble-content">
                                            {msg.text}
                                            <span className="bubble-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                        {loading && <div className="typing-indicator"><span></span><span></span><span></span></div>}
                    </div>

                    <form className="chat-footer" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button type="submit" className="send-btn" disabled={loading || !inputValue.trim()}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
