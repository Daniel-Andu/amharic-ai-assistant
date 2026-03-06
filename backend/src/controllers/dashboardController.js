const pool = require('../config/database');

exports.getStats = async (req, res) => {
    try {
        // Total conversations
        const totalChats = await pool.query(
            'SELECT COUNT(*) as count FROM conversations'
        );

        // Total messages
        const totalMessages = await pool.query(
            'SELECT COUNT(*) as count FROM messages'
        );

        // Average confidence score
        const avgConfidence = await pool.query(
            'SELECT AVG(confidence_score) as avg FROM messages WHERE confidence_score IS NOT NULL'
        );

        // Today's stats
        const todayChats = await pool.query(
            `SELECT COUNT(*) as count FROM conversations 
       WHERE DATE(started_at) = CURRENT_DATE`
        );

        // Escalation rate
        const escalated = await pool.query(
            'SELECT COUNT(*) as count FROM conversations WHERE escalated = true'
        );

        const escalationRate = totalChats.rows[0].count > 0
            ? (escalated.rows[0].count / totalChats.rows[0].count * 100).toFixed(2)
            : 0;

        // Language usage
        const languageStats = await pool.query(
            `SELECT language, COUNT(*) as count 
       FROM conversations 
       GROUP BY language`
        );

        res.json({
            totalChats: parseInt(totalChats.rows[0].count),
            totalMessages: parseInt(totalMessages.rows[0].count),
            avgConfidence: parseFloat(avgConfidence.rows[0].avg || 0).toFixed(2),
            todayChats: parseInt(todayChats.rows[0].count),
            escalationRate: parseFloat(escalationRate),
            languageStats: languageStats.rows
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

exports.getTopQuestions = async (req, res) => {
    try {
        const { limit = 10, language } = req.query;

        let query = `SELECT question, ask_count, last_asked, language 
                 FROM top_questions`;
        const params = [];

        if (language) {
            query += ' WHERE language = $1';
            params.push(language);
        }

        query += ` ORDER BY ask_count DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await pool.query(query, params);

        res.json({ topQuestions: result.rows });
    } catch (error) {
        console.error('Get top questions error:', error);
        res.status(500).json({ error: 'Failed to fetch top questions' });
    }
};

exports.getConversationLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, startDate, endDate, keyword, escalated } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT c.*, COUNT(m.id) as message_count
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE 1=1
    `;
        const params = [];
        let paramIndex = 1;

        if (startDate) {
            query += ` AND c.started_at >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            query += ` AND c.started_at <= $${paramIndex}`;
            params.push(endDate);
            paramIndex++;
        }

        if (escalated !== undefined) {
            query += ` AND c.escalated = $${paramIndex}`;
            params.push(escalated === 'true');
            paramIndex++;
        }

        query += ` GROUP BY c.id ORDER BY c.started_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        const countResult = await pool.query('SELECT COUNT(*) FROM conversations');

        res.json({
            conversations: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            totalPages: Math.ceil(countResult.rows[0].count / limit)
        });
    } catch (error) {
        console.error('Get conversation logs error:', error);
        res.status(500).json({ error: 'Failed to fetch conversation logs' });
    }
};

exports.getConversationDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const conversation = await pool.query(
            'SELECT * FROM conversations WHERE id = $1',
            [id]
        );

        if (conversation.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const messages = await pool.query(
            'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
            [id]
        );

        res.json({
            conversation: conversation.rows[0],
            messages: messages.rows
        });
    } catch (error) {
        console.error('Get conversation details error:', error);
        res.status(500).json({ error: 'Failed to fetch conversation details' });
    }
};
