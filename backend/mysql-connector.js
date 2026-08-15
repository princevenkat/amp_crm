import mysql from "mysql2/promise";
import "dotenv/config";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || "crm_db",

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,

  connectTimeout: 10000,

  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,

  dateStrings: true,
};

console.log("========== MYSQL CONFIG ==========");
console.log({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  passwordConfigured: Boolean(dbConfig.password),
});
console.log("===================================");

const pool = mysql.createPool(dbConfig);

// Test connection WITHOUT top-level await
pool
  .getConnection()
  .then(async (connection) => {
    try {
      console.log("✅ MYSQL CONNECTION SUCCESS");

      const [rows] = await connection.query("SELECT 1 AS test");

      console.log("✅ MYSQL TEST QUERY:", rows);
    } catch (error) {
      console.error("❌ MYSQL TEST QUERY FAILED");
      console.error("Code:", error?.code);
      console.error("Message:", error?.message);
    } finally {
      connection.release();
    }
  })
  .catch((error) => {
    console.error("❌ MYSQL CONNECTION FAILED");
    console.error("Code:", error?.code);
    console.error("Message:", error?.message);
    console.error("Errno:", error?.errno);
    console.error("SQL State:", error?.sqlState);
  });

export default pool;
