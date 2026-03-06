#!/usr/bin/env node

/**
 * System Health Check Script
 * Run this to diagnose common issues
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running System Health Check...\n');

// Check 1: Environment Variables
console.log('1️⃣  Checking Environment Variables...');
require('dotenv').config();

const requiredEnvVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'GROQ_API_KEY'
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
    console.log('   ❌ Missing environment variables:', missingVars.join(', '));
    console.log('   💡 Add these to backend/.env file\n');
} else {
    console.log('   ✅ All required environment variables present\n');
}

// Check 2: Database Connection
console.log('2️⃣  Checking Database Connection...');
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.query('SELECT NOW()')
    .then(result => {
        console.log('   ✅ Database connected successfully');
        console.log('   📅 Server time:', result.rows[0].now);
        return pool.query('SELECT COUNT(*) FROM users');
    })
    .then(result => {
        console.log('   👥 Users in database:', result.rows[0].count);
        return pool.query('SELECT COUNT(*) FROM conversations');
    })
    .then(result => {
        console.log('   💬 Conversations in database:', result.rows[0].count);
        return pool.query('SELECT COUNT(*) FROM faqs');
    })
    .then(result => {
        console.log('   ❓ FAQs in database:', result.rows[0].count);
        console.log('');
        return checkTables();
    })
    .catch(error => {
        console.log('   ❌ Database connection failed:', error.message);
        console.log('   💡 Check your database credentials in .env');
        console.log('   💡 Make sure PostgreSQL is running\n');
    })
    .finally(() => {
        pool.end();
    });

async function checkTables() {
    console.log('3️⃣  Checking Database Tables...');
    const requiredTables = [
        'users',
        'conversations',
        'messages',
        'faqs',
        'company_info',
        'documents'
    ];

    try {
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        const existingTables = result.rows.map(r => r.table_name);
        const missingTables = requiredTables.filter(t => !existingTables.includes(t));

        if (missingTables.length > 0) {
            console.log('   ❌ Missing tables:', missingTables.join(', '));
            console.log('   💡 Run: npm run migrate\n');
        } else {
            console.log('   ✅ All required tables exist\n');
        }
    } catch (error) {
        console.log('   ❌ Could not check tables:', error.message, '\n');
    }
}

// Check 4: Required Modules
console.log('4️⃣  Checking Node Modules...');
const requiredModules = [
    'express',
    'pg',
    'dotenv',
    'jsonwebtoken',
    'bcryptjs',
    'groq-sdk',
    'cors',
    'helmet'
];

const missingModules = [];
requiredModules.forEach(mod => {
    try {
        require.resolve(mod);
    } catch (e) {
        missingModules.push(mod);
    }
});

if (missingModules.length > 0) {
    console.log('   ❌ Missing modules:', missingModules.join(', '));
    console.log('   💡 Run: npm install\n');
} else {
    console.log('   ✅ All required modules installed\n');
}

// Check 5: File Structure
console.log('5️⃣  Checking File Structure...');
const requiredFiles = [
    'src/server.js',
    'src/routes/index.js',
    'src/config/database.js',
    'src/services/aiService.js',
    'src/controllers/chatController.js',
    'src/controllers/authController.js',
    '.env'
];

const missingFiles = requiredFiles.filter(f => !fs.existsSync(path.join(__dirname, f)));

if (missingFiles.length > 0) {
    console.log('   ❌ Missing files:', missingFiles.join(', '));
    console.log('   💡 Check your project structure\n');
} else {
    console.log('   ✅ All required files present\n');
}

// Check 6: Groq API Key
console.log('6️⃣  Checking Groq API Configuration...');
if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    console.log('   ❌ Groq API key not configured');
    console.log('   💡 Get free key from: https://console.groq.com/keys');
    console.log('   💡 Add to backend/.env: GROQ_API_KEY=gsk_xxxxx\n');
} else if (!process.env.GROQ_API_KEY.startsWith('gsk_')) {
    console.log('   ⚠️  Groq API key format looks incorrect');
    console.log('   💡 Keys should start with "gsk_"\n');
} else {
    console.log('   ✅ Groq API key configured\n');
}

// Check 7: Port Availability
console.log('7️⃣  Checking Port Availability...');
const net = require('net');
const port = process.env.PORT || 5000;

const server = net.createServer();
server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`   ⚠️  Port ${port} is already in use`);
        console.log('   💡 Stop the other process or change PORT in .env\n');
    }
});

server.once('listening', () => {
    server.close();
    console.log(`   ✅ Port ${port} is available\n`);
});

server.listen(port);

// Summary
setTimeout(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (missingVars.length === 0 && missingModules.length === 0 && missingFiles.length === 0) {
        console.log('✅ System looks healthy!');
        console.log('\n🚀 Next steps:');
        console.log('   1. Make sure PostgreSQL is running');
        console.log('   2. Run: npm run dev');
        console.log('   3. Visit: http://localhost:3000\n');
    } else {
        console.log('⚠️  Some issues found. Please fix them and run this check again.\n');
    }

    process.exit(0);
}, 2000);
