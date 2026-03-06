import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { Send, Mic, MicOff, Bot, User, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatWidget = ({ embedded = false }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [language, setLanguage] = useState('am');
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        startConversation();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const startConversation = async () => {
        try {
            const response = await chatAPI.startConversation(language);
            setSessionId(response.data.conversation.session_id);

            // Welcome message
            setMessages([{
                type: 'ai',
                content: language === 'am'
                    ? 'ሰላም! እንዴት ልርዳዎት እችላለሁ?'
                    : 'Hello! How can I help you today?',
                timestamp: new Date()
            }]);
        } catch (error) {
            toast.error('Failed to start conversation');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !sessionId) return;

        const userMessage = {
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setLoading(true);

        try {
            const response = await chatAPI.sendMessage({
                sessionId,
                message: inputMessage,
                messageType: 'text',
                language
            });

            const aiMessage = {
                type: 'ai',
                content: response.data.response,
                confidence: response.data.confidence,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);

            // Auto-speak if voice enabled
            if (voiceEnabled) {
                speakMessage(response.data.response);
            }
        } catch (error) {
            toast.error('Failed to send message');
            setMessages(prev => [...prev, {
                type: 'ai',
                content: language === 'am'
                    ? 'ይቅርታ፣ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።'
                    : 'Sorry, something went wrong. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceInput = () => {
        if (!isRecording) {
            // Start browser speech recognition
            try {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

                if (!SpeechRecognition) {
                    toast.error(language === 'am'
                        ? 'የድምጽ ማወቂያ በዚህ አሳሽ አይደገፍም። Chrome ወይም Edge ይጠቀሙ።'
                        : 'Speech recognition not supported. Please use Chrome or Edge.');
                    return;
                }

                const recognition = new SpeechRecognition();
                recognition.lang = language === 'am' ? 'am-ET' : 'en-US';
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;

                recognition.onstart = () => {
                    setIsRecording(true);
                    toast.success(language === 'am' ? 'እያዳመጥኩ ነው...' : 'Listening...');
                };

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setInputMessage(transcript);
                    setIsRecording(false);
                    toast.success(language === 'am' ? 'ተሰምቷል!' : 'Got it!');
                };

                recognition.onerror = (event) => {
                    setIsRecording(false);
                    console.error('Speech recognition error:', event.error);

                    if (event.error === 'no-speech') {
                        toast.error(language === 'am'
                            ? 'ምንም ድምጽ አልተሰማም። እንደገና ይሞክሩ።'
                            : 'No speech detected. Please try again.');
                    } else if (event.error === 'not-allowed') {
                        toast.error(language === 'am'
                            ? 'ማይክሮፎን ፈቃድ ተከልክሏል። በአሳሽ ቅንብሮች ውስጥ ይፍቀዱ።'
                            : 'Microphone permission denied. Please allow in browser settings.');
                    } else {
                        toast.error(language === 'am'
                            ? 'የድምጽ ስህተት። እንደገና ይሞክሩ።'
                            : 'Speech error. Please try again.');
                    }
                };

                recognition.onend = () => {
                    setIsRecording(false);
                };

                recognition.start();
                recognitionRef.current = recognition;
            } catch (error) {
                console.error('Speech recognition error:', error);
                toast.error(language === 'am'
                    ? 'የድምጽ ማወቂያ ስህተት'
                    : 'Speech recognition error');
            }
        } else {
            // Stop recording
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                setIsRecording(false);
            }
        }
    };

    const speakMessage = (text) => {
        if (isSpeaking) {
            // Stop speaking
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        try {
            // Check if browser supports speech synthesis
            if (!window.speechSynthesis) {
                toast.error(language === 'am'
                    ? 'የድምጽ ማጫወት በዚህ አሳሽ አይደገፍም'
                    : 'Text-to-speech not supported in this browser');
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'am' ? 'am-ET' : 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            utterance.onstart = () => {
                setIsSpeaking(true);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                setIsSpeaking(false);
                toast.error(language === 'am'
                    ? 'ድምጽ ማጫወት አልተቻለም'
                    : 'Failed to play audio');
            };

            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Text-to-speech error:', error);
            setIsSpeaking(false);
            toast.error(language === 'am'
                ? 'ድምጽ ማጫወት አልተቻለም'
                : 'Failed to play audio');
        }
    };

    return (
        <div className={`flex flex-col ${embedded ? 'h-full' : 'h-screen'} bg-gray-50`}>
            {/* Header */}
            <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold">AI Assistant</h3>
                        <p className="text-xs text-primary-100">
                            {language === 'am' ? 'የአማርኛ ድጋፍ' : 'Amharic Support'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-primary-700 text-white px-3 py-1 rounded text-sm border border-primary-500"
                    >
                        <option value="am">አማርኛ</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.type === 'ai' && (
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-primary-600" />
                            </div>
                        )}

                        <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.type === 'user'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-800 shadow-sm'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm flex-1 ${language === 'am' ? 'amharic-text' : ''}`}>
                                    {msg.content}
                                </p>
                                {msg.type === 'ai' && (
                                    <button
                                        onClick={() => speakMessage(msg.content)}
                                        className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                                        title={language === 'am' ? 'ድምጽ ያድምጡ' : 'Listen'}
                                    >
                                        {isSpeaking ? (
                                            <VolumeX className="w-4 h-4 text-primary-600" />
                                        ) : (
                                            <Volume2 className="w-4 h-4 text-gray-500" />
                                        )}
                                    </button>
                                )}
                            </div>
                            {msg.confidence && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Confidence: {(msg.confidence * 100).toFixed(0)}%
                                </p>
                            )}
                        </div>

                        {msg.type === 'user' && (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <Bot className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-4">
                {/* Voice toggle */}
                <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={voiceEnabled}
                            onChange={(e) => setVoiceEnabled(e.target.checked)}
                            className="rounded"
                        />
                        <span>{language === 'am' ? 'ድምጽ አንቃ' : 'Enable Voice'}</span>
                    </label>
                    {isRecording && (
                        <span className="text-sm text-red-500 animate-pulse flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            {language === 'am' ? 'እያዳመጥኩ...' : 'Listening...'}
                        </span>
                    )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleVoiceInput}
                        className={`p-3 rounded-lg transition-colors ${isRecording
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        title={language === 'am' ? 'የድምጽ መልእክት' : 'Voice message'}
                    >
                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={language === 'am' ? 'መልእክት ይጻፉ...' : 'Type a message...'}
                        className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${language === 'am' ? 'amharic-text' : ''
                            }`}
                        disabled={loading || isRecording}
                    />

                    <button
                        type="submit"
                        disabled={loading || !inputMessage.trim() || isRecording}
                        className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWidget;
