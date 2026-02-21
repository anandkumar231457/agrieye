import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import {
    Send, Sprout, Loader2, MessageCircle, X, Maximize2, Minimize2, Move,
    Mic, Volume2, VolumeX, Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function FarmerQA({ contextData, variant = 'floating' }) {
    // VARIANT: 'floating' | 'static'
    const isFloating = variant === 'floating';

    // UI State
    const [isOpen, setIsOpen] = useState(false); // Only for floating
    const [isFullScreen, setIsFullScreen] = useState(false); // Only for floating
    const [dimensions, setDimensions] = useState({ width: 380, height: 500 });

    // Voice State
    const [isListening, setIsListening] = useState(false);
    const [speakingId, setSpeakingId] = useState(null);
    const [isAutoSpeak, setIsAutoSpeak] = useState(true); // Default to TRUE
    const lastSpokenIdRef = useRef(null); // Track last spoken message to prevent loops

    const { t, i18n } = useTranslation();

    // Chat Logic State
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: t('chatbot.placeholder') // Use translation key
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Context Effect: Send greeting when context changes significantly
    const contextKey = useMemo(() => {
        if (!contextData) return null;
        return contextData.disease || contextData.alert || null;
    }, [contextData?.disease, contextData?.alert]);

    useEffect(() => {
        if (contextKey) {
            setMessages(prev => {
                // Prevent duplicate greeting
                if (prev.some(m => m.text.includes(contextKey))) return prev;
                return [
                    ...prev,
                    {
                        id: Date.now(),
                        type: 'ai',
                        text: `I see a diagnosis for ${contextKey}. Do you have any specific questions about treating it?`
                    }
                ];
            });
            if (isFloating) setIsOpen(true);
        }
    }, [contextKey, isFloating]);

    // Scroll Effect
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!isFloating || isOpen) scrollToBottom();
    }, [messages, isTyping, isOpen, isFloating]);

    // Voice Input Logic
    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error(event.error);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        };

        recognition.start();
    };

    // Text-to-Speech Logic
    useEffect(() => {
        const loadVoices = () => {
            window.speechSynthesis.getVoices();
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const handleSpeak = useCallback((text, id) => {
        if (speakingId === id) {
            window.speechSynthesis.cancel();
            setSpeakingId(null);
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.lang.includes('en-US')) || voices[0];

        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setSpeakingId(id);
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = (e) => {
            console.error("Speech Error:", e);
            setSpeakingId(null);
        };

        window.speechSynthesis.speak(utterance);
    }, [speakingId]);

    // Auto-Speak Effect - Fixed to prevent loops and respect toggle
    useEffect(() => {
        // If auto-speak is off, cancel any ongoing speech and return
        if (!isAutoSpeak) {
            window.speechSynthesis.cancel();
            setSpeakingId(null);
            return;
        }

        const lastMsg = messages[messages.length - 1];

        // Only speak new AI messages that haven't been spoken yet
        if (lastMsg?.type === 'ai' && lastMsg.id !== 1 && lastMsg.id !== lastSpokenIdRef.current) {
            lastSpokenIdRef.current = lastMsg.id;
            handleSpeak(lastMsg.text, lastMsg.id);
        }
    }, [messages, isAutoSpeak, handleSpeak]);
    // Note: dependency 'messages' works because we append new objects.

    // Cleanup speech on unmount
    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    const handleSend = useCallback(async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const questionText = input; // Capture input before clearing
        setInput('');
        setIsTyping(true);

        const history = messages.map(msg => ({
            role: msg.type === 'ai' ? 'model' : 'user',
            content: msg.text
        }));

        // Context Stringification
        let contextStr = "";
        if (contextData) {
            contextStr = Object.entries(contextData)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ");
        }

        try {
            const response = await api.post('/qa', {
                question: questionText,
                context: contextStr,
                history: history.slice(-5),
                language: i18n.language
            });
            const data = response.data;

            await new Promise(resolve => setTimeout(resolve, 600));

            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                text: data.answer || "I'm having trouble connecting to the network."
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('QA Error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                text: "Sorry, I'm unable to reach the server right now. Please try again later."
            }]);
        } finally {
            setIsTyping(false);
        }
    }, [input, messages, contextData]);

    const renderMessage = (text) => {
        const formatBold = (str) => {
            const parts = str.split(/(\*\*.*?\*\*)/g);
            return parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
                }
                return part;
            });
        };
        return text.split('\n').map((line, i) => {
            if (!line.trim()) return <br key={i} />;
            const isListItem = /^\d+\.|^-|\*/.test(line.trim());
            const className = isListItem ? "ml-4 mb-2 block" : "mb-2 block";
            return <span key={i} className={className}>{formatBold(line)}</span>;
        });
    };

    const [isResizing, setIsResizing] = useState(false);
    const handleMouseDown = (e) => {
        if (!isFloating) return;
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = dimensions.width;
        const startHeight = dimensions.height;
        const onMouseMove = (moveEvent) => {
            if (isFullScreen) return;
            const deltaX = startX - moveEvent.clientX;
            const deltaY = startY - moveEvent.clientY;
            setDimensions({
                width: Math.max(300, Math.min(1000, startWidth + deltaX)),
                height: Math.max(400, Math.min(window.innerHeight - 100, startHeight + deltaY))
            });
        };
        const onMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const ChatContent = useMemo(() => (
        <>
            {/* Header */}
            <div className="bg-brand-deep p-3 flex items-center justify-between shadow-md z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                            <Sprout className="w-5 h-5 text-brand-leaf" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-brand-deep rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-base leading-tight">AgriGenius AI</h3>
                        <p className="text-brand-light/80 text-[10px] font-medium">
                            {isFloating && isFullScreen ? 'Full Screen Mode' : 'Online • Instant Support'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Mute Toggle (Always visible) */}
                    <button
                        onClick={() => setIsAutoSpeak(!isAutoSpeak)}
                        className={`p-1.5 rounded-lg transition-colors ${isAutoSpeak ? 'text-brand-leaf hover:bg-white/10' : 'text-gray-400 hover:text-white'}`}
                        title={isAutoSpeak ? "Mute Auto-Voice" : "Enable Auto-Voice"}
                    >
                        {isAutoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>

                    {isFloating && (
                        <>
                            <button
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                            >
                                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-white/70 hover:text-white hover:bg-red-500/80 rounded-lg transition-colors"
                                title="Minimize to Icon"
                            >
                                <X size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className={`flex-1 bg-gray-50/50 p-3 overflow-y-auto space-y-3 scroll-smooth custom-scrollbar relative ${isResizing ? 'select-none' : ''}`}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${msg.type === 'user'
                                ? 'bg-brand-main text-white rounded-tr-none'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'
                                }`}
                        >
                            {msg.type === 'ai' && (
                                <button
                                    onClick={() => handleSpeak(msg.text, msg.id)}
                                    className={`absolute -top-2 -right-2 p-1 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 ${speakingId === msg.id
                                        ? 'bg-red-500 text-white opacity-100 animate-pulse'
                                        : 'bg-white text-gray-500 hover:text-brand-main border border-gray-100'
                                        }`}
                                    title="Read Aloud"
                                >
                                    {speakingId === msg.id ? <Square size={10} fill="currentColor" /> : <Volume2 size={12} />}
                                </button>
                            )}
                            {renderMessage(msg.text)}
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <motion.div className="flex justify-start">
                        <div className="bg-white border border-gray-200 px-3 py-2 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 shrink-0">
                <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? t('common.loading') : t('chatbot.placeholder')}
                            className={`w-full bg-gray-100 text-gray-900 placeholder-gray-500 rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 transition-all text-sm font-medium ${isListening ? 'ring-2 ring-red-400 bg-red-50' : 'focus:ring-brand-main/50'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={handleVoiceInput}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${isListening
                                ? 'text-red-500 bg-red-100 animate-pulse'
                                : 'text-gray-400 hover:text-brand-main hover:bg-gray-200'
                                }`}
                            title="Voice Input"
                        >
                            <Mic size={16} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="p-2.5 bg-brand-main text-white rounded-full hover:bg-brand-deep disabled:opacity-50 disabled:hover:bg-brand-main transition-colors shadow-sm shrink-0"
                    >
                        {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </form>
        </>
    ), [messages, input, isTyping, isListening, speakingId, isAutoSpeak, isFloating, isFullScreen, isResizing, handleSend, handleSpeak, renderMessage, messagesEndRef]);

    if (!isFloating) {
        return (
            <div className="bg-white rounded-2xl shadow-elevated border border-gray-200 overflow-hidden flex flex-col h-full w-full">
                {ChatContent}
            </div>
        );
    }

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 p-4 bg-brand-main text-white rounded-full shadow-lg hover:shadow-xl hover:bg-brand-deep transition-all duration-300 group"
                    >
                        <MessageCircle className="w-8 h-8" />
                        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs font-bold py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none top-1/2 -translate-y-1/2">
                            Ask Expert
                        </span>
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                    </motion.button>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        style={{
                            width: isFullScreen ? '100%' : `${dimensions.width}px`,
                            height: isFullScreen ? '100%' : `${dimensions.height}px`,
                            zIndex: 50
                        }}
                        className={`fixed shadow-2xl bg-white border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 ${isFullScreen ? 'inset-0 rounded-none' : 'bottom-6 right-6 rounded-2xl'
                            }`}
                    >
                        {!isFullScreen && (
                            <div
                                onMouseDown={handleMouseDown}
                                className="absolute top-0 left-0 w-12 h-12 z-50 cursor-nw-resize flex items-center justify-center group"
                            >
                                <div className="w-8 h-8 bg-brand-main/10 rounded-br-2xl flex items-center justify-center opacity-75 group-hover:opacity-100 group-hover:bg-brand-main/20 transition-all text-brand-main">
                                    <Move size={20} />
                                </div>
                            </div>
                        )}
                        {ChatContent}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
