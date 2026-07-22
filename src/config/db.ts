import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '38.147.104.74',
  user: process.env.DB_USER || 'firmesco_root',
  password: process.env.DB_PASSWORD || 'firmescontamariz',
  database: process.env.DB_NAME || 'firmesco_bingo',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
