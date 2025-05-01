// config/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const sslEnabled = ['ca.pem', 'service.cert', 'service.key'].every(file =>
  existsSync(join(__dirname, file))
);

const sslConfig = sslEnabled
  ? {
      ca: readFileSync(join(__dirname, 'ca.pem')),
      cert: readFileSync(join(__dirname, 'service.cert')),
      key: readFileSync(join(__dirname, 'service.key')),
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    }
  : null;

const remoteConfig = {
  host: process.env.REMOTE_HOST,
  user: process.env.REMOTE_USER,
  password: process.env.REMOTE_PASSWORD,
  database: process.env.REMOTE_DATABASE,
  port: process.env.REMOTE_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: sslConfig,
  queueLimit: 0,
};

const localConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: 'iThy@123',
  database: 'NOKORTECH',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let dbPool = null;

const createDBPool = async (config, label) => {
  try {
    const pool = mysql.createPool(config);
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    console.log(`✅ Connected to ${label} DB (${config.host})`);
    return pool;
  } catch (err) {
    console.error(`❌ Failed to connect to ${label} DB (${config.host}):`, err.message);
    return null;
  }
};

export const initDB = async () => {
  if (dbPool) return dbPool;

  console.log('🔌 Initializing DB connection...');

  dbPool = await createDBPool(remoteConfig, 'REMOTE');
  if (!dbPool) {
    console.log('⚠️ Falling back to LOCAL DB...');
    dbPool = await createDBPool(localConfig, 'LOCAL');
  }

  if (!dbPool) {
    console.error('🚫 Could not connect to any DB. Continuing without DB connection.');
  }

  return dbPool;
};

// export const getDB = () => dbPool;
export default mysql.createPool(remoteConfig); // or: export default db;



// if use this
// export const getDB = () => dbPool;

// for this use like this : in model
// import { getDB } from '../config/db.js';

// const db = getDB();
// // Now you can use db.query(...)