require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 10000,
});

async function testConnection() {
    console.log('Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);

    try {
        const client = await pool.connect();
        console.log('✅ Connection successful!');

        const result = await client.query('SELECT NOW()');
        console.log('✅ Query successful:', result.rows[0]);

        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('✅ Tables found:', tables.rows.length);
        tables.rows.forEach(row => console.log('  -', row.table_name));

        client.release();
        await pool.end();
        console.log('✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

testConnection();
