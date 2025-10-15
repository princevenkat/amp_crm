import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'crm_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log('MySQL Connection Pool created.');

export default pool;
