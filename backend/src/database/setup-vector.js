const pool = require('../config/database');

async function setupVectorExtension() {
    const client = await pool.connect();

    try {
        console.log('🚀 Setting up pgvector extension...');

        // Enable pgvector extension
        await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
        console.log('✅ pgvector extension enabled');

        // Create vector embeddings table
        await client.query(`
      CREATE TABLE IF NOT EXISTS document_embeddings (
        id SERIAL PRIMARY KEY,
        document_id INTEGER REFERENCES knowledge_documents(id) ON DELETE CASCADE,
        chunk_text TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        embedding vector(1536),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ document_embeddings table created');

        // Create index for vector similarity search
        await client.query(`
      CREATE INDEX IF NOT EXISTS document_embeddings_vector_idx 
      ON document_embeddings 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `);
        console.log('✅ Vector similarity index created');

        // Create FAQ embeddings table
        await client.query(`
      CREATE TABLE IF NOT EXISTS faq_embeddings (
        id SERIAL PRIMARY KEY,
        faq_id INTEGER REFERENCES faqs(id) ON DELETE CASCADE,
        question_embedding vector(1536),
        answer_embedding vector(1536),
        language VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ faq_embeddings table created');

        // Create index for FAQ embeddings
        await client.query(`
      CREATE INDEX IF NOT EXISTS faq_question_embedding_idx 
      ON faq_embeddings 
      USING ivfflat (question_embedding vector_cosine_ops)
      WITH (lists = 100);
    `);
        console.log('✅ FAQ embedding index created');

        console.log('🎉 pgvector setup completed successfully!');
    } catch (error) {
        console.error('❌ pgvector setup failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

setupVectorExtension();
