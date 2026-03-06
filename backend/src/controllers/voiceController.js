const pool = require('../config/database');

// Check if Azure Speech Service is configured
const isAzureSpeechConfigured = process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION;
let azureSpeechService = null;
let azureOpenAIService = null;

if (isAzureSpeechConfigured) {
    try {
        azureSpeechService = require('../services/azureSpeechService');
        azureOpenAIService = require('../services/azureOpenAIService');
    } catch (error) {
        console.warn('⚠️  Azure services not available. Voice features disabled.');
    }
}

exports.speechToText = async (req, res) => {
    try {
        if (!azureSpeechService) {
            return res.status(503).json({
                error: 'Voice features not configured',
                message: 'Azure Speech Service is not set up. Please configure AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env file.'
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const audioBuffer = req.file.buffer;
        const result = await azureSpeechService.speechToText(audioBuffer);

        res.json({
            text: result.text,
            confidence: result.confidence
        });
    } catch (error) {
        console.error('Speech to text error:', error);
        res.status(500).json({ error: 'Failed to convert speech to text' });
    }
};

exports.textToSpeech = async (req, res) => {
    try {
        if (!azureSpeechService) {
            return res.status(503).json({
                error: 'Voice features not configured',
                message: 'Azure Speech Service is not set up. Please configure AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env file.'
            });
        }

        const { text, language = 'am-ET', rate = '1.0', pitch = '0%' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Generate SSML for better control
        const ssml = azureSpeechService.generateSSML(text, language, rate, pitch);
        const result = await azureSpeechService.textToSpeechSSML(ssml, language);

        res.set({
            'Content-Type': result.format,
            'Content-Length': result.audioData.byteLength
        });
        res.send(Buffer.from(result.audioData));
    } catch (error) {
        console.error('Text to speech error:', error);
        res.status(500).json({ error: 'Failed to convert text to speech' });
    }
};

exports.voiceMessage = async (req, res) => {
    try {
        if (!azureSpeechService || !azureOpenAIService) {
            return res.status(503).json({
                error: 'Voice features not configured',
                message: 'Azure Speech Service is not set up. Please configure AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env file.'
            });
        }

        const { sessionId, language = 'am' } = req.body;

        if (!req.file || !sessionId) {
            return res.status(400).json({ error: 'Audio file and session ID required' });
        }

        // Convert speech to text
        const audioBuffer = req.file.buffer;
        const sttResult = await azureSpeechService.speechToText(audioBuffer);
        const userMessage = sttResult.text;

        // Get conversation
        const convResult = await pool.query(
            'SELECT * FROM conversations WHERE session_id = $1',
            [sessionId]
        );

        if (convResult.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const conversation = convResult.rows[0];
        const startTime = Date.now();

        // Get AI response
        const aiResponse = await azureOpenAIService.getResponse(userMessage, language);
        const responseTime = Date.now() - startTime;

        // Convert AI response to speech
        const ttsResult = await azureSpeechService.textToSpeech(aiResponse.response, language);

        // Save message
        await pool.query(
            `INSERT INTO messages (conversation_id, message_type, user_message, ai_response, 
       confidence_score, language, response_time_ms) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [conversation.id, 'voice', userMessage, aiResponse.response,
            aiResponse.confidence, language, responseTime]
        );

        // Update conversation
        await pool.query(
            'UPDATE conversations SET total_messages = total_messages + 1 WHERE id = $1',
            [conversation.id]
        );

        res.json({
            userMessage: userMessage,
            aiResponse: aiResponse.response,
            confidence: aiResponse.confidence,
            audioData: Buffer.from(ttsResult.audioData).toString('base64'),
            audioFormat: ttsResult.format,
            responseTime: responseTime
        });
    } catch (error) {
        console.error('Voice message error:', error);
        res.status(500).json({ error: 'Failed to process voice message' });
    }
};
