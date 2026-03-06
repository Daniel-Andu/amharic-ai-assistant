const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('✅ SQLite database connected:', dbPath);

// Wrapper to make it compatible with pg-style queries
const pool = {
    query: async (text, params = []) => {
        try {
            // Handle SELECT queries
            if (text.trim().toUpperCase().startsWith('SELECT')) {
                const stmt = db.prepare(text.replace(/\$(\d+)/g, '?'));
                const rows = stmt.all(...params);
                return { rows };
            }

            // Handle INSERT with RETURNING
            if (text.includes('RETURNING')) {
                const [insertPart, returningPart] = text.split('RETURNING');
                const cleanInsert = insertPart.replace(/\$(\d+)/g, '?');
                const stmt = db.prepare(cleanInsert);
                const info = stmt.run(...params);

                // Get the inserted row
                const selectStmt = db.prepare(`SELECT * FROM ${extractTableName(insertPart)} WHERE id = ?`);
                const rows = [selectStmt.get(info.lastInsertRowid)];
                return { rows };
            }

            // Handle UPDATE/DELETE with RETURNING
            if (text.includes('UPDATE') && text.includes('RETURNING')) {
                const [updatePart] = text.split('RETURNING');
                const cleanUpdate = updatePart.replace(/\$(\d+)/g, '?');
                const stmt = db.prepare(cleanUpdate);
                stmt.run(...params);

                // Get updated rows (simplified - returns all matching)
                const tableName = extractTableName(updatePart);
                const selectStmt = db.prepare(`SELECT * FROM ${tableName} LIMIT 1`);
                const rows = [selectStmt.get()];
                return { rows };
            }

            // Handle regular INSERT/UPDATE/DELETE
            const cleanText = text.replace(/\$(\d+)/g, '?');
            const stmt = db.prepare(cleanText);
            const info = stmt.run(...params);
            return { rows: [], rowCount: info.changes };
        } catch (error) {
            console.error('Query error:', error);
            throw error;
        }
    },

    connect: async () => {
        return {
            query: pool.query,
            release: () => { }
        };
    },

    end: async () => {
        db.close();
    }
};

function extractTableName(sql) {
    const match = sql.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
    return match ? match[1] : '';
}

module.exports = pool;
