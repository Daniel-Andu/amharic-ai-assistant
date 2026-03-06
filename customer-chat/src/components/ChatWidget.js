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
    }, [language]); // Add language dependency

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
                recognition.interimResults = true; // Changed to true for better feedback
                recognition.maxAlternatives = 1;

                recognition.onstart = () => {
                    setIsRecording(true);
                    toast.success(language === 'am' ? '🎤 እያዳመጥኩ ነው... ጮክ ብለው ይናገሩ!' : '🎤 Recording... Speak LOUDLY and CLEARLY!', {
                        duration: 15000, // Increased to 15 seconds
                        icon: '🔴'
                    });
                    console.log('🎤 Recording started - Speak now!');
                };

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    const isFinal = event.results[0].isFinal;

                    if (isFinal) {
                        setInputMessage(transcript);
                        setIsRecording(false);
                        toast.success(language === 'am'
                            ? `✅ ተቀርጿል! "${transcript}"`
                            : `✅ Recorded! "${transcript}"`, {
                            duration: 4000,
                            icon: '✅'
                        });
                        console.log('✅ Final transcript:', transcript);
                    } else {
                        // Show interim results
                        console.log('⏳ Interim:', transcript);
                    }
                };

                recognition.onerror = (event) => {
                    setIsRecording(false);
                    console.error('❌ Speech recognition error:', event.error);

                    // Don't show error for network issues (common and not critical)
                    if (event.error === 'network') {
                        console.log('ℹ️ Network error in speech recognition - this is normal');
                        return;
                    }

                    if (event.error === 'no-speech') {
                        toast.error(language === 'am'
                            ? '⚠️ ምንም ድምጽ አልተሰማም። ጮክ ብለው ይናገሩ እና እንደገና ይሞክሩ።'
                            : '⚠️ No speech detected. Speak LOUDER and try again.', {
                            duration: 5000
                        });
                        console.log('⚠️ No speech detected - Tips:');
                        console.log('1. Check microphone permissions in browser');
                        console.log('2. Speak LOUDER and CLEARER');
                        console.log('3. Check Windows Sound Settings → Input → Microphone volume');
                        console.log('4. Make sure microphone is not muted');
                    } else if (event.error === 'not-allowed') {
                        toast.error(language === 'am'
                            ? '🚫 ማይክሮፎን ፈቃድ ተከልክሏል። በአሳሽ ቅንብሮች ውስጥ ይፍቀዱ።'
                            : '🚫 Microphone permission denied. Please allow in browser settings.', {
                            duration: 6000
                        });
                    } else if (event.error === 'aborted') {
                        // User stopped recording - don't show error
                        console.log('ℹ️ Recording aborted by user');
                    } else if (event.error === 'audio-capture') {
                        toast.error(language === 'am'
                            ? '🎤 ማይክሮፎን ችግር። መሳሪያው ተሰክቷል እና እየሰራ እንደሆነ ያረጋግጡ।'
                            : '🎤 Microphone problem. Check if device is plugged in and working.', {
                            duration: 6000
                        });
                    } else {
                        // Show error for unexpected issues
                        console.log('❌ Unexpected speech recognition error:', event.error);
                        toast.error(language === 'am'
                            ? `ስህተት: ${event.error}`
                            : `Error: ${event.error}`, {
                            duration: 4000
                        });
                    }
                };

                recognition.onend = () => {
                    setIsRecording(false);
                    console.log('🎤 Recording ended');
                };

                // Request microphone permission first
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(() => {
                        console.log('✅ Microphone permission granted');
                        recognition.start();
                        recognitionRef.current = recognition;
                    })
                    .catch((error) => {
                        console.error('❌ Microphone permission error:', error);
                        toast.error(language === 'am'
                            ? '🚫 ማይክሮፎን መዳረሻ ተከልክሏል። እባክዎ በአሳሽ ቅንብሮች ውስጥ ይፍቀዱ።'
                            : '🚫 Microphone access denied. Please allow in browser settings.', {
                            duration: 6000
                        });
                    });

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
                console.log('🛑 Recording stopped by user');
            }
        }
    }

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

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            // Small delay to ensure cancellation completes
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);

                // Get voices
                let voices = window.speechSynthesis.getVoices();

                // If no voices yet, wait for them
                if (voices.length === 0) {
                    window.speechSynthesis.onvoiceschanged = () => {
                        voices = window.speechSynthesis.getVoices();
                        setupAndSpeak(utterance, voices, text);
                    };
                } else {
                    setupAndSpeak(utterance, voices, text);
                }
            }, 250); // Increased delay to prevent interruption

            const setupAndSpeak = (utterance, voices, text) => {
                let selectedVoice = null;
                let selectedLang = 'en-US';

                // Detect if text is Amharic (contains Ethiopic script)
                const isAmharicText = /[\u1200-\u137F]/.test(text);

                if (isAmharicText || language === 'am') {
                    // Try to find Amharic voice
                    selectedVoice = voices.find(voice =>
                        voice.lang.startsWith('am') ||
                        voice.lang.includes('am-ET') ||
                        voice.name.includes('Amharic') ||
                        voice.name.includes('መቅደስ')
                    );

                    if (selectedVoice) {
                        selectedLang = 'am-ET';
                        console.log('🎤 Using Amharic voice:', selectedVoice.name);
                    } else {
                        console.log('⚠️ Amharic voice not found, using default');
                    }
                } else {
                    // Use English voice
                    selectedVoice = voices.find(voice =>
                        voice.lang.includes('en-US') ||
                        voice.lang.includes('en-GB') ||
                        voice.lang.startsWith('en')
                    );
                    console.log('🎤 Using English voice:', selectedVoice?.name || 'default');
                }

                // Set voice if found
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }

                utterance.lang = selectedLang;
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                utterance.onstart = () => {
                    setIsSpeaking(true);
                    console.log('✅ Speaking:', text.substring(0, 50));
                };

                utterance.onend = () => {
                    setIsSpeaking(false);
                    console.log('✅ Finished speaking');
                };

                utterance.onerror = (event) => {
                    setIsSpeaking(false);

                    // Don't log or show errors for interrupted/canceled (happens when clicking multiple times)
                    if (event.error === 'interrupted' || event.error === 'canceled') {
                        return;
                    }

                    console.error('❌ Speech error:', event.error);
                    toast.error(language === 'am'
                        ? 'ድምጽ ማጫወት አልተቻለም'
                        : 'Failed to play audio');
                };

                // Speak!
                window.speechSynthesis.speak(utterance);
                console.log('🔊 Speech command sent');
            };
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
                {/* Voice toggle and info */}
                <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={voiceEnabled}
                            onChange={(e) => setVoiceEnabled(e.target.checked)}
                            className="rounded"
                        />
                        <span>{language === 'am' ? 'ድምጽ አንቃ (ራስ-ሰር ይናገራል)' : 'Enable Voice (Auto-speak)'}</span>
                    </label>
                    {isRecording && (
                        <span className="text-sm text-red-500 animate-pulse flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            {language === 'am' ? 'እያዳመጥኩ...' : 'Listening...'}
                        </span>
                    )}
                </div>

                {/* Voice recording tip */}
                {!isRecording && (
                    <div className="mb-2 text-xs text-gray-500 flex items-center gap-1">
                        <Mic className="w-3 h-3" />
                        <span>
                            {language === 'am'
                                ? 'የማይክሮፎን ቁልፍን ጠቅ በማድረግ የድምጽ መልእክት ይላኩ'
                                : 'Click microphone button to send voice message'}
                        </span>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleVoiceInput}
                        className={`p-3 rounded-lg transition-all ${isRecording
                            ? 'bg-red-500 text-white animate-pulse shadow-lg'
                            : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                            }`}
                        title={language === 'am' ? 'የድምጽ መልእክት ይቅዱ' : 'Record voice message'}
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
