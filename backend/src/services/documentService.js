const fs = require('fs').promises;
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const pool = require('../config/database');

class DocumentService {
    async processDocument(documentId) {
        try {
            const doc = await pool.query(
                'SELECT * FROM knowledge_documents WHERE id = $1',
                [documentId]
            );

            if (doc.rows.length === 0) {
                throw new Error('Document not found');
            }

            const document = doc.rows[0];
            const content = await this.extractContent(document);

            // Mark as processed (no embeddings needed for now)
            await pool.query(
                'UPDATE knowledge_documents SET processed = true WHERE id = $1',
                [documentId]
            );

            console.log(`✅ Document ${documentId} processed successfully`);
            return content;
        } catch (error) {
            console.error('Process document error:', error);
            throw error;
        }
    }

    async extractContent(document) {
        const fileBuffer = await fs.readFile(document.file_path);

        switch (document.file_type.toLowerCase()) {
            case '.pdf':
                return await this.extractPDF(fileBuffer);
            case '.docx':
                return await this.extractDOCX(fileBuffer);
            case '.txt':
                return fileBuffer.toString('utf-8');
            default:
                throw new Error('Unsupported file type');
        }
    }

    async extractPDF(buffer) {
        const data = await pdf(buffer);
        return data.text;
    }

    async extractDOCX(buffer) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }
}

module.exports = new DocumentService();
