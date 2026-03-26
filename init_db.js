const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    let connection;
    try {
        console.log('Connecting to MySQL database...');
        connection = await mysql.createConnection(process.env.DATABASE_URL);
        
        console.log('Creating table if not exists...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255),
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Success: Table "messages" is ready');
    } catch (err) {
        console.error('❌ Error initializing database:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('💡 Tip: Check if your Railway MySQL instance is active and the URL is correct.');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initDB();
