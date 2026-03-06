const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting database migration...');

        // Read and execute schema
        const schemaSQL = fs.readFileSync(
            path.join(__dirname, 'schema.sql'),
            'utf8'
        );

        await client.query(schemaSQL);
        console.log('✅ Schema created successfully');

        // Create default admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await client.query(
            `INSERT INTO users (username, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING`,
            ['admin', 'admin@aiassistant.com', hashedPassword, 'system_admin']
        );
        console.log('✅ Default admin user created (email: admin@aiassistant.com, password: admin123)');

        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Export for use in server.js
module.exports = { runMigration };

// Run migration if called directly
if (require.main === module) {
    runMigration()
        .then(() => {
            console.log('Migration finished');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}
