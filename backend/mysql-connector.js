import mysql from "mysql2/promise";
import "dotenv/config";

const requiredEnv = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_DATABASE"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0,

  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  dateStrings: true,
});

console.log("MySQL pool configured:", {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
});

try {
  const connection = await pool.getConnection();

  await connection.ping();

  console.log("✅ MySQL connection successful");

  connection.release();
} catch (error) {
  console.error("❌ MySQL connection failed:", {
    code: error.code,
    message: error.message,
    errno: error.errno,
    sqlState: error.sqlState,
  });
}

export default pool;
