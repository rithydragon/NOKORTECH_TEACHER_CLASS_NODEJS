import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
// const sslConfig = {
//     ca: readFileSync(join(__dirname, 'config', 'ca.pem')),
//     cert: readFileSync(join(__dirname, 'config', 'service.cert')),
//     key: readFileSync(join(__dirname, 'config', 'service.key')),
//     rejectUnauthorized: true
//   };

// Check if SSL files exist
const checkSSLFiles = () => {
  const requiredFiles = ['ca.pem', 'service.cert', 'service.key'];
  const missingFiles = requiredFiles.filter(file => 
    !existsSync(join(__dirname, 'config', file))
  );

  if (missingFiles.length > 0) {
    console.error('❌ Missing SSL files:', missingFiles.join(', '));
    console.log('ℹ️ Download them from Aiven Console -> MySQL service -> Overview');
    return false;
  }
  return true;
};

// Remote Aiven MySQL configuration
const remoteConfig = {
  host: process.env.REMOTE_HOST,
  user: process.env.REMOTE_USER,
  password: process.env.REMOTE_PASSWORD,
  database: process.env.REMOTE_DATABASE,
  port: process.env.REMOTE_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: checkSSLFiles() ? {
    ca: readFileSync(join(__dirname, 'config', 'ca.pem')),
    cert: readFileSync(join(__dirname, 'config', 'service.cert')),
    key: readFileSync(join(__dirname, 'config', 'service.key')),
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  } : null,
// ssl: sslConfig,
  queueLimit: 0,
};


// Local MySQL fallback configuration
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

// Enhanced connection tester
const createDBPool = async (config, dbType) => {
  try {
    console.log(`Attempting ${dbType} MySQL connection to ${config.host}...`);
    
    const pool = mysql.createPool(config);
    const conn = await pool.getConnection();
    
    // Verify connection works
    const [rows] = await conn.query('SELECT 1 AS connection_test');
    conn.release();
    
    if (rows[0].connection_test === 1) {
      console.log(`✅ Successfully connected to ${dbType} MySQL`);
      return pool;
    }
    throw new Error('Connection test query failed');
    
  } catch (err) {
    console.error(`❌ ${dbType} MySQL connection failed (${config.host}):`);
    
    // Detailed error diagnostics
    if (err.code === 'ETIMEDOUT') {
      console.error('- Network connectivity issue');
      console.error('- Verify host/port are correct');
    } 
    else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('- Authentication failed');
      console.error('- Verify username/password');
    }
    else if (err.code === 'ENOTFOUND') {
      console.error('- Hostname resolution failed');
      console.error('- Verify REMOTE_HOST in .env');
    }
    else if (err.message.includes('SSL file missing')) {
      console.error('- SSL certificate issue');
      console.error(err.message);
    }
    else {
      console.error('- Unknown error:', err.message);
    }
    
    return null;
  }
};

// Connection sequence with retries
const connectWithRetry = async (attempts = 3) => {
  for (let i = 1; i <= attempts; i++) {
    console.log(`Connection attempt ${i}/${attempts}`);
    
    // Try remote first
    let db = await createDBPool(remoteConfig, "REMOTE");
    if (db) return db;
    
    // Then try local
    db = await createDBPool(localConfig, "LOCAL");
    if (db) return db;
    
    if (i < attempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error(`Failed to connect after ${attempts} attempts`);
};

// Initialize and export connection
let db;
try {
  db = await connectWithRetry();
} catch (err) {
  console.error('FATAL: Could not establish database connection');
  console.error(err.message);
  process.exit(1);
}

// Create and export the pool
export default mysql.createPool(remoteConfig);
// export default db;










// // 1. Auto-download missing certificates
// const downloadCertificate = async (url, filePath) => {
//     return new Promise((resolve, reject) => {
//       https.get(url, (res) => {
//         const file = writeFileSync(filePath, '');
//         res.pipe(file);
//         file.on('finish', () => resolve());
//         file.on('error', reject);
//       });
//     });
//   };
  
//   // 2. Check and download required SSL files
//   const ensureCertificates = async () => {
//     const certs = [
//       { 
//         url: 'https://your-aiven-url/ca.pem',
//         path: join(__dirname, 'ca.pem') 
//       },
//       { 
//         url: 'https://your-aiven-url/service.cert',
//         path: join(__dirname, 'service.cert') 
//       },
//       { 
//         url: 'https://your-aiven-url/service.key',
//         path: join(__dirname, 'service.key') 
//       }
//     ];
  
//     for (const cert of certs) {
//       if (!existsSync(cert.path)) {
//         console.log(`Downloading ${cert.path}...`);
//         await downloadCertificate(cert.url, cert.path);
//       }
//     }
//   };
  
//   // 3. Create connection pool
//   const createPool = async () => {
//     try {
//       await ensureCertificates();
      
//       const connectionString = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?ssl-mode=REQUIRED`;
      
//       return mysql.createPool({
//         uri: connectionString,
//         ssl: {
//           ca: readFileSync(join(__dirname, 'ca.pem')),
//           cert: readFileSync(join(__dirname, 'service.cert')),
//           key: readFileSync(join(__dirname, 'service.key')),
//           rejectUnauthorized: true
//         },
//         waitForConnections: true,
//         connectionLimit: 10
//       });
//     } catch (error) {
//       console.error('Database connection failed:', error);
//       throw error;
//     }
//   };
  
//   // 4. Export initialized pool
//   const pool = createPool();
//   export default pool;




// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';
// import { readFileSync } from 'fs';
// import { join, dirname } from 'path';
// import { fileURLToPath } from 'url';
// // Load environment variables
// dotenv.config();

// // Get current directory path (ES Modules compatible)
// const __dirname = dirname(fileURLToPath(import.meta.url));
// // Helper function to safely read files
// const readSSLFile = (filename) => {
//     try {
//       return readFileSync(join(__dirname, filename));
//     } catch (err) {
//       if (err.code === 'ENOENT') {
//         throw new Error(`SSL file missing: ${filename}. Download from Aiven console.`);
//       }
//       throw err;
//     }
//   };



// // // Define MySQL connection configurations
// // const remoteConfig = {
// //     host: process.env.REMOTE_HOST,
// //     user: process.env.REMOTE_USER,
// //     password: process.env.REMOTE_PASSWORD,
// //     database: process.env.REMOTE_DATABASE,
// //     port: process.env.REMOTE_PORT || 3306,
// //     waitForConnections: true,
// //     connectionLimit: 10,
// //     // ssl: {
// //     //     rejectUnauthorized: true,
// //     //     ca: fs.readFileSync('path/to/ca.pem').toString()
// //     // },
// //     // For Aiven MySQL specifically:
// //     ssl: {
// //         ca: readFileSync(join(__dirname, 'ca.pem')),
// //         cert: readFileSync(join(__dirname, 'service.cert')),
// //         key: readFileSync(join(__dirname, 'service.key')),
// //         rejectUnauthorized: true
// //       },

// //       //Troubleshoot
// // //       ssl: process.env.NODE_ENV === 'production' 
// // //   ? { ca: readFileSync('./config/ca.pem') } 
// // //   : null

// // //for developement only
// // // ssl: process.env.NODE_ENV === 'production' ? {
// // //     ca: readFileSync(join(__dirname, 'ca.pem')),
// // //     rejectUnauthorized: true
// // //   } : null


// // // Temporary Development Workaround
// // // If you need to bypass SSL temporarily during development:
// // // ssl: process.env.NODE_ENV === 'production' ? {
// // //     ca: readSSLFile('ca.pem'),
// // //     cert: readSSLFile('service.cert'),
// // //     key: readSSLFile('service.key'),
// // //     rejectUnauthorized: true
// // //   } : null
// //     queueLimit: 0,
// // };

// // const localConfig = {
// //     host: '127.0.0.1',
// //     user: 'root',
// //     password: 'iThy@123',
// //     database: 'NOKORTECH',
// //     port: 3306,
// //     waitForConnections: true,
// //     connectionLimit: 10,
// //     queueLimit: 0,
// // };

// // // Function to create a MySQL pool
// // const createDBPool = async (config, dbType) => {
// //     try {
// //         const pool = await mysql.createPool(config);
// //         await pool.getConnection(); // Test connection
// //         console.log(`✅ Connected to ${dbType} MySQL at ${config.host}`);
// //         return pool;
// //     } catch (err) {
// //         console.error(`❌ Error connecting to ${dbType} MySQL (${config.host}):`, err.message);
// //         return null;
// //     }
// // };

// // // Try connecting to the remote database first
// // let db = await createDBPool(remoteConfig, "REMOTE");

// // if (!db) {
// //     console.log("🔄 Falling back to LOCAL MySQL...");
// //     db = await createDBPool(localConfig, "LOCAL");
// // }

// // if (!db) {
// //     console.error("❌ No database connection established. Exiting...");
// //     process.exit(1);
// // }

// // // Export the database connection pool
// // export default db;
