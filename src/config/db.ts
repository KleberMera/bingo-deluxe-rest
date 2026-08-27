import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '120.40.73.63',
  user: process.env.DB_USER || 'server',
  password: process.env.DB_PASSWORD || 'Server2026%lalibertad..',
  database: process.env.DB_NAME || 'bingo',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
