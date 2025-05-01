// db.js
import mysql from 'mysql2/promise';

let pool;

export const initDB = async () => {
  try {
    pool = await mysql.createPool({
      host: process.env.REMOTE_HOST,
      user: process.env.REMOTE_USER,
      password: process.env.REMOTE_PASSWORD,
      database: process.env.REMOTE_DATABASE,
      port: process.env.REMOTE_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('✅ MySQL connected');
  } catch (err) {
    console.error('❌ MySQL initial connect failed:', err.message);
    setTimeout(initDB, 5000); // retry every 5s
  }

  pool.on('error', (err) => {
    console.error('⛔ DB error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      initDB(); // reconnect
    }
  });

  return pool;
};

export const getDB = () => pool;



// for this use like this : 

// import { getDB } from '../config/db.js';

// const db = getDB();
// // Now you can use db.query(...)
