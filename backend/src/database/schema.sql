-- Users Table (Admin & System Administrators)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'system_admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Base Documents
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    processed BOOLEAN DEFAULT FALSE
);

-- FAQ Management
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question_am TEXT NOT NULL,
    question_en TEXT,
    answer_am TEXT NOT NULL,
    answer_en TEXT,
    category VARCHAR(100),
    priority INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Company Information
CREATE TABLE IF NOT EXISTS company_info (
    id SERIAL PRIMARY KEY,
    info_type VARCHAR(100) NOT NULL,
    title_am VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    content_am TEXT NOT NULL,
    content_en TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_ip VARCHAR(50),
    user_agent TEXT,
    language VARCHAR(10) DEFAULT 'am',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    total_messages INTEGER DEFAULT 0,
    escalated BOOLEAN DEFAULT FALSE
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    message_type VARCHAR(20) CHECK (message_type IN ('text', 'voice')),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    language VARCHAR(10) DEFAULT 'am',
    response_time_ms INTEGER,
    flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Training Versions
CREATE TABLE IF NOT EXISTS ai_training_versions (
    id SERIAL PRIMARY KEY,
    version_name VARCHAR(100) NOT NULL,
    version_number VARCHAR(50) NOT NULL,
    training_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'training' CHECK (status IN ('training', 'completed', 'active', 'inactive')),
    is_active BOOLEAN DEFAULT FALSE,
    trained_by INTEGER REFERENCES users(id),
    notes TEXT
);

-- Top Questions Tracking
CREATE TABLE IF NOT EXISTS top_questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    question_normalized TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'am',
    ask_count INTEGER DEFAULT 1,
    last_asked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_normalized, language)
);

-- Response Corrections
CREATE TABLE IF NOT EXISTS response_corrections (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id),
    original_response TEXT NOT NULL,
    corrected_response TEXT NOT NULL,
    corrected_by INTEGER REFERENCES users(id),
    correction_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Logs
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    log_type VARCHAR(50) NOT NULL,
    log_level VARCHAR(20) CHECK (log_level IN ('info', 'warning', 'error')),
    message TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id),
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_knowledge_docs_status ON knowledge_documents(status);
CREATE INDEX idx_faqs_active ON faqs(is_active);
CREATE INDEX idx_top_questions_count ON top_questions(ask_count DESC);
