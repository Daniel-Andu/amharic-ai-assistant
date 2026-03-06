const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const documentService = require('../services/documentService');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.docx', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOCX, and TXT allowed'));
        }
    }
}).single('document');

exports.uploadDocument = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const result = await pool.query(
                `INSERT INTO knowledge_documents 
         (filename, original_name, file_type, file_size, file_path, uploaded_by) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [
                    req.file.filename,
                    req.file.originalname,
                    path.extname(req.file.originalname),
                    req.file.size,
                    req.file.path,
                    req.user.id
                ]
            );

            // Process document asynchronously
            documentService.processDocument(result.rows[0].id);

            res.status(201).json({ document: result.rows[0] });
        } catch (error) {
            console.error('Upload document error:', error);
            res.status(500).json({ error: 'Failed to upload document' });
        }
    });
};

exports.getDocuments = async (req, res) => {
    try {
        const { status = 'active' } = req.query;

        const result = await pool.query(
            `SELECT d.*, u.username as uploaded_by_name 
       FROM knowledge_documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.status = $1
       ORDER BY d.upload_date DESC`,
            [status]
        );

        res.json({ documents: result.rows });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await pool.query(
            'SELECT * FROM knowledge_documents WHERE id = $1',
            [id]
        );

        if (doc.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Delete file
        await fs.unlink(doc.rows[0].file_path).catch(console.error);

        // Update status
        await pool.query(
            'UPDATE knowledge_documents SET status = $1 WHERE id = $2',
            ['deleted', id]
        );

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
};

// FAQ Management
exports.createFAQ = async (req, res) => {
    try {
        const { question_am, question_en, answer_am, answer_en, category, priority } = req.body;

        const result = await pool.query(
            `INSERT INTO faqs (question_am, question_en, answer_am, answer_en, category, priority, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [question_am, question_en, answer_am, answer_en, category, priority || 0, req.user.id]
        );

        res.status(201).json({ faq: result.rows[0] });
    } catch (error) {
        console.error('Create FAQ error:', error);
        res.status(500).json({ error: 'Failed to create FAQ' });
    }
};

exports.getFAQs = async (req, res) => {
    try {
        const { category, language } = req.query;

        let query = 'SELECT * FROM faqs WHERE is_active = true';
        const params = [];

        if (category) {
            query += ' AND category = $1';
            params.push(category);
        }

        query += ' ORDER BY priority DESC, created_at DESC';

        const result = await pool.query(query, params);
        res.json({ faqs: result.rows });
    } catch (error) {
        console.error('Get FAQs error:', error);
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
};

exports.updateFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const { question_am, question_en, answer_am, answer_en, category, priority, is_active } = req.body;

        const result = await pool.query(
            `UPDATE faqs 
       SET question_am = $1, question_en = $2, answer_am = $3, answer_en = $4, 
           category = $5, priority = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
            [question_am, question_en, answer_am, answer_en, category, priority, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'FAQ not found' });
        }

        res.json({ faq: result.rows[0] });
    } catch (error) {
        console.error('Update FAQ error:', error);
        res.status(500).json({ error: 'Failed to update FAQ' });
    }
};

exports.deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('UPDATE faqs SET is_active = false WHERE id = $1', [id]);

        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        console.error('Delete FAQ error:', error);
        res.status(500).json({ error: 'Failed to delete FAQ' });
    }
};
