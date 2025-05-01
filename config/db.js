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

// console.log('Remote DB Host:', process.env.REMOTE_HOST);
// console.log('Remote DB User:', process.env.REMOTE_USER);
// console.log('Remote DB Password:', process.env.REMOTE_PASSWORD);
// console.log('Remote DB Name:', process.env.REMOTE_DATABASE);

// Define local and remote config
const localConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: 'iThy@123',
  database: 'NOKORTECH_LMS_DB',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};
const remoteConfig = {
  host: process.env.REMOTE_HOST,
  user: process.env.REMOTE_USER,
  password: process.env.REMOTE_PASSWORD,
  database: process.env.REMOTE_DATABASE,
  port: process.env.REMOTE_PORT,
  // ssl: {
  //   ca: fs.readFileSync(path.join(__dirname, 'path_to_cert', 'ca-cert.pem'))  // Replace with the actual path to your SSL certificate
  // },
  ssl: {
    ca: readFileSync(join(__dirname, '', 'ca.pem'))  // Replace with the actual path to your SSL certificate
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};


// Function to create a MySQL pool
const createDBPool = async (config, dbType) => {
  try {
    const pool = await mysql.createPool(config);
    await pool.getConnection(); // Test connection
    console.log(`✅ Connected to ${dbType} MySQL at ${config.host}`);
    return pool;
  } catch (err) {
    console.error(`❌ Error connecting to ${dbType} MySQL (${config.host}):`, err.message);
    return null;
  }
};

// Try connecting to the remote database first
let db = await createDBPool(remoteConfig, "REMOTE");

if (!db) {
  console.log("🔄 Falling back to LOCAL MySQL...");
  db = await createDBPool(localConfig, "LOCAL");
}

if (!db) {
  console.error("❌ No database connection established. Exiting...");
  process.exit(1);
}

// // / Test connection on startup
// async function testConnection() {
//   let conn;
//   try {
//     conn = await createDBPool.getConnection();
//     await conn.ping();
//     console.log('Database connected successfully');
//   } catch (error) {
//     console.error('Database connection failed:', error);
//     throw error;
//   } finally {
//     if (conn) conn.release();
//   }
// }

// // Call immediately and periodically
// testConnection();
// setInterval(testConnection, 300000); // Test every 5 minutes

// Export the database connection pool
export default db;
