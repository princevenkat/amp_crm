import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: "u720807186_advancecrm",
  password: "tBsrSa5!C",
  database: "u720807186_advancecrm",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true,
});

console.log("MySQL connection pool created.");

async function testDatabaseConnection() {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.query("SELECT 1");
    console.log("Direct MySQL test successful");
  } catch (error) {
    console.error("Direct MySQL test failed:", {
      code: error.code,
      message: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
}

testDatabaseConnection();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function query(sql, values = []) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    let connection;

    try {
      connection = await pool.getConnection();

      const [result] = await connection.query(sql, values);

      connection.release();
      connection = null;

      return result;
    } catch (error) {
      console.error(`Database attempt ${attempt} failed:`, {
        code: error.code,
        message: error.message,
      });

      if (connection) connection.destroy();

      const retryable = [
        "PROTOCOL_CONNECTION_LOST",
        "ECONNRESET",
        "ETIMEDOUT",
      ].includes(error.code);

      if (!retryable || attempt === 2) {
        throw error;
      }

      await delay(1000);
    }
  }
}

export default pool;
