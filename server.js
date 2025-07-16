import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';
import corsOptions from './web.config.js'

// Initialize app
const app = express();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// ======================
// 1. SECURITY MIDDLEWARE
// ======================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:3000']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Trust proxy if behind reverse proxy
app.set('trust proxy', true);

// ======================
// 2. BASIC MIDDLEWARE
// ======================
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ======================
// 3. CORS CONFIGURATION (Moved after basic middleware)
// ======================
// const allowedOrigins = [
//   process.env.CLIENT_URL, 
//   'http://localhost:3000',
//   'http://localhost:4582',
//   'https://nokortech.app',
//   'https://nokortechlmsclass.vercel.app',
//   'https://nokortechlmsclassapp.vercel.app',
//   'https://nokortechlmsclass-epdir3tp4-riththylearns-projects.vercel.app' // 👈 Add this!
// ].filter(Boolean);


// // app.use(cors({
// //   origin: ['https://nokortechlmsclassapp.vercel.app', 'https://nokortech.app'],
// //   credentials: true
// // }));

// // Update your CORS middleware to be more permissive in development
// app.use(cors({
//   origin: function (origin, callback) {
//        // Allow requests with no origin (like mobile apps or curl)
//        if (!origin) return callback(null, true);

//     if (process.env.NODE_ENV === 'development') {
//       return callback(null, true);
//     } else {
//       if (allowedOrigins.includes(origin)) {
//         return  callback(null, true);
//       } else {
//         return callback(new Error('Not allowed by CORS: ' + origin));
//       }
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Set-Cookie'],
//   // allowedHeaders: ['Content-Type', 'Authorization'],
//   exposedHeaders: ['Set-Cookie']
// }));

app.use(cors(corsOptions))


// Handle preflight requests
app.options('*', cors());

// ======================
// 4. STATIC FILES (Moved after CORS)
// ======================
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// 5. ROUTES (Critical change - auth routes must come first)
// ======================
// Import auth routes FIRST
import authRoute from './routes/auth.routes.js';
app.use("/", authRoute);  // This should handle login/register

// Then import all other routes
import routes from "./routes/index.js"
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
import score from './routes/score.routes.js';
import subject from './routes/subject.routes.js';
import menuRoutes from './routes/menu.routes.js';
import uImage from './routes/uimag.routes.js'
import studentScore from './routes/studentScore.routes.js';
import TelegramStore  from "./routes/telegram_store.routes.js";
// import Attendance  from "./routes/attendance.routes.js";
// import StudentAttendance  from './routes/student_attendance.routes.js'

app.use("/", routes);
app.use("/", notificationRoutes);
app.use("/", teaching);
app.use("/", teacherRoutes);
app.use("/", classAssignmentRoutes);
app.use("/", user);
app.use("/", classes);
app.use("/", courses);
app.use("/", student);
app.use('/', department);
app.use('/', score);
app.use('/', subject);
app.use('/', menuRoutes);
app.use('/', uImage);
app.use('/', studentScore);
app.use('/', TelegramStore);

// ======================
// 6. ERROR HANDLING
// ======================
// Replace your current error handler with this

app.use((err, req, res, next) => {
  if (err.message.includes('CORS')) {
    console.error('CORS error:', err.message);
    return res.status(403).json({ error: 'CORS blocked the request.' });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    originalUrl: req.originalUrl,
    method: req.method,
    body: req.body
  });

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token'
    });
  }

  res.status(500).json({ 
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack
    } : undefined
  });
});

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     success: false,
//     message: 'Internal Server Error',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// Add this before your routes
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    cookies: req.cookies,
    headers: req.headers
  });
  next();
});
// ======================
// 7. FRONTEND SERVING
// ======================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ======================
// 8. SERVER START
// ======================
const PORT = process.env.PORT || 10000;
console.log("Port for real running : : , ", PORT)
app.listen(PORT, async () => {
  const env = process.env.NODE_ENV || 'development';
  console.log(`🚀 Server running on port http://localhost:${PORT} in ${env} mode`);
  
  if (env !== 'production') {
    try {
      await open(`http://localhost:${PORT}`);
    } catch (err) {
      console.error('Could not open browser automatically:', err.message);
    }
  }
});

// 1. Don’t Use http://localhost:${PORT} in Logs for Production
// In Render or Vercel, your app isn’t accessible at localhost, so the console log might confuse you during remote debugging.
// const PORT = process.env.PORT || 10000;
// app.listen(PORT, async () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
  
//   if (process.env.NODE_ENV !== 'production') {
//     try {
//       await open(`http://localhost:${PORT}`);
//     } catch (err) {
//       console.error('Could not open browser automatically:', err.message);
//     }
//   }
// });