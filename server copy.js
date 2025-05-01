import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./utils/errorHandler.utils.js";
import errorMiddleware from "./middlewares/error.middlewares.js";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import setupSwagger from './config/swagger.js'; // Add this line
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';

const app = express();
   
// // Routes and middlewares...  can render as html
// app.get('/', (req, res) => {
//   res.send('🚀 Server is running || NOKORTECH!');
// });

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors()); // Allow all origins (for development) // Cross-Origin Resource Sharing
app.use(express.json());// Body parser
app.use(bodyParser.json());
// Load environment variables
dotenv.config();

app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000']
app.use(morgan('dev'));
// 3. MIDDLEWARE STACK
app.use(helmet());  // Security headers
app.use(morgan('dev'));  // Request logging

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));




// Setup Swagger // Initialize Swagger
setupSwagger(app); 



// API Routes would go here
// app.use('/api', apiRouter);

// Render HTML file for root route
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// Serve HTML for all other routes
app.get('*', (req, res) => {
  app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// If you're behind a reverse proxy (e.g., Nginx, AWS ALB), you must tell Express to trust the proxy, or req.ip will always return 127.0.0.1.
app.set('trust proxy', true); // 👈 Add this
// Middleware// Middleware to parse JSON and form data
const corsOptions = {
  origin: process.env.FRONTEND_URL  || 'http://localhost:4582 ',  // Frontend URL
  credentials: true,  // Allow cookies to be sent with requests credentials: true  // ✅ Allow cookies to be sent/received
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// // Enable CORS
// app.use(cors({
//   origin: ['http://localhost:3000', 'https://yourfrontend.com'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// Solution 3: Hybrid Approach (if needed)
// If you need to mix both module systems:

// server.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// ... rest of your CommonJS code




app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  allowedHeaders: ['Content-Type', 'Authorization'], // ✅ Add Authorization here
  credentials: true,
}))

// Example Express CORS config
// app.use(cors({
//   origin: 'http://localhost:3000', // or your Nuxt app origin
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization'], // ✅ Add Authorization here
// }));


// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   credentials: true
// }));

const allowedOriginsqq = [
  'http://localhost:4582',
  // Add other domains as needed
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Required when using credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Import and use routes
import userRoutes from "./routes/user.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import teaching from "./routes/teaching.routes.js"
import teacherRoutes from "./routes/teacher.routes.js";
import classAssignmentRoutes from "./routes/classAssigned.routes.js";
// import studentScoreRecord from "./routes/studentScoreRecord.routes.js";
import user from './routes/user.routes.js';
import classes from './routes/class.routes.js';
import courses from './routes/course.routes.js';
import student from "./routes/student.routes.js";
import department from './routes/department.routes.js';
import refreshToken from './routes/refreshToken.routes.js'
import score from './routes/score.routes.js';
import subject from './routes/subject.routes.js';
import authRoute from './routes/auth.routes.js'
app.use("/uploads", express.static("uploads"));
import menuRoutes from './routes/menu.routes.js';
import uImage from './routes/uimag.routes.js'
import studentScore from './routes/studentScore.routes.js';
import TelegramStore  from "./models/telegram_store.models.js";



// Use routes
app.use("/", authRoute);
app.use("/", userRoutes);
app.use("/", notificationRoutes);
app.use("/", teaching);
app.use("/", teacherRoutes);
app.use("/", classAssignmentRoutes);
// app.use("/", studentScoreRecord);
app.use("/", user);
app.use("/", classes);
app.use("/", courses);
app.use("/", student);
app.use('/', department);
app.use('/', refreshToken);
app.use('/', score);
app.use('/', subject);
app.use('/', menuRoutes);
app.use('/', uImage);
app.use('/', studentScore);
// app.use('/', TelegramStore);

app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// For production, consider adding these helmet configurations:
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ Message: 'Something broke!' || 'Internal Server Error!' });
});

// Render HTML file for root route
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// Serve HTML for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.use(errorMiddleware);
// Error handler should be last middleware
app.use(errorHandler);

// Database status endpoint
app.get('/api/db/status', async (req, res) => {
  try {
      const [results] = await db.query("SELECT version() AS version");
      const [tables] = await db.query("SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE()");
      
      res.json({
          connected: true,
          version: results[0].version.split('-')[0],
          ping: Math.floor(Math.random() * 10) + 1, // Replace with actual ping
          tableCount: tables[0].count,
          size: "24.5 MB", // Calculate actual size
          connections: Math.floor(Math.random() * 20) + 1
      });
  } catch (error) {
      res.status(500).json({ connected: false, error: error.message });
  }
});


// Backup endpoint
app.post('/api/db/backup', async (req, res) => {
  try {
      const backupFile = `backup-${new Date().toISOString().split('T')[0]}.sql`;
      // Add actual backup logic here
      res.json({ success: true, filename: backupFile });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
const PORT = process.env.PORT
// Start the server


app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  try {
    if (process.env.NODE_ENV !== 'production') {
      await open(`http://localhost:${PORT}` || `http://127.1.0.1:65532`);
    }
  } catch (err) {
    console.error('Could not open browser automatically:', err.message);
    console.log('Please manually open http://localhost:' + PORT);
  }
});


// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`✅ Server running on port ${PORT}`);
//   console.log(`Server is running on port http://localhost:${PORT}`);

// });

// For production:
// if (process.env.NODE_ENV === 'development') {
//   await open(`http://localhost:${PORT}`);
// }

// For Windows users:
// If you still have issues with the open package, try:
// bash
// npm install open@8.4.2