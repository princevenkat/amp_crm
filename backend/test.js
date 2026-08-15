import mysql from "mysql2/promise";
import "dotenv/config";

console.log("Testing DIRECT MySQL connection...");

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectTimeout: 15000,
};

console.log({
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database,
  hasPassword: !!config.password,
});

try {
  const connection = await mysql.createConnection(config);

  console.log("✅ CONNECTED");

  const [rows] = await connection.query("SELECT 1 AS test");

  console.log("✅ QUERY SUCCESS:", rows);

  await connection.end();

  console.log("✅ CONNECTION CLOSED CLEANLY");
} catch (error) {
  console.error("❌ CONNECTION FAILED");
  console.error("Code:", error.code);
  console.error("Message:", error.message);
  console.error("Errno:", error.errno);
  console.error("SQL State:", error.sqlState);
  console.error("Stack:", error.stack);
}
