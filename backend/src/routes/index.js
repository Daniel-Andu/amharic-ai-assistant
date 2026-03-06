const express = require('express');
const router = express.Router();
const multer = require('multer');

const authController = require('../controllers/authController');
const chatController = require('../controllers/chatController');
const dashboardController = require('../controllers/dashboardController');
const knowledgeController = require('../controllers/knowledgeController');
const voiceController = require('../controllers/voiceController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Multer for audio file uploads
const audioUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authMiddleware, adminOnly, authController.register);
router.get('/auth/profile', authMiddleware, authController.getProfile);

// Chat routes (public)
router.post('/chat/start', chatController.startConversation);
router.post('/chat/message', chatController.sendMessage);
router.get('/chat/history/:sessionId', chatController.getConversationHistory);
router.post('/chat/end/:sessionId', chatController.endConversation);

// Voice routes (public)
router.post('/voice/speech-to-text', audioUpload.single('audio'), voiceController.speechToText);
router.post('/voice/text-to-speech', voiceController.textToSpeech);
router.post('/voice/message', audioUpload.single('audio'), voiceController.voiceMessage);

// Dashboard routes (admin only)
router.get('/dashboard/stats', authMiddleware, adminOnly, dashboardController.getStats);
router.get('/dashboard/top-questions', authMiddleware, adminOnly, dashboardController.getTopQuestions);
router.get('/dashboard/conversations', authMiddleware, adminOnly, dashboardController.getConversationLogs);
router.get('/dashboard/conversations/:id', authMiddleware, adminOnly, dashboardController.getConversationDetails);

// Knowledge base routes (admin only)
router.post('/knowledge/documents', authMiddleware, adminOnly, knowledgeController.uploadDocument);
router.get('/knowledge/documents', authMiddleware, adminOnly, knowledgeController.getDocuments);
router.delete('/knowledge/documents/:id', authMiddleware, adminOnly, knowledgeController.deleteDocument);

router.post('/knowledge/faqs', authMiddleware, adminOnly, knowledgeController.createFAQ);
router.get('/knowledge/faqs', authMiddleware, adminOnly, knowledgeController.getFAQs);
router.put('/knowledge/faqs/:id', authMiddleware, adminOnly, knowledgeController.updateFAQ);
router.delete('/knowledge/faqs/:id', authMiddleware, adminOnly, knowledgeController.deleteFAQ);

module.exports = router;
