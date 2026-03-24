const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'LearnUp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// Kiểm tra kết nối khi khởi động
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Kết nối MySQL thành công!');
        connection.release();
    } catch (error) {
        console.error('Lỗi kết nối MySQL:', error.message);
        process.exit(1); // Dừng server nếu không kết nối được DB
    }
}

testConnection();

module.exports = pool;