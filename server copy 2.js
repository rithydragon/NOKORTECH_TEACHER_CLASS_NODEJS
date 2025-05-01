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
// app.use(express.static(path.join(__dirname, 'public')));


// ======================
// 3. CORS CONFIGURATION (Moved after basic middleware)
// ======================
const allowedOrigins = [
  process.env.CLIENT_URL, 
  'http://localhost:3000',
  'http://localhost:4582'
].filter(Boolean);// Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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
import userRoutes from "./routes/user.routes.js";
app.use("/", authRoute);

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
import refreshToken from './routes/refreshToken.routes.js'
import score from './routes/score.routes.js';
import subject from './routes/subject.routes.js';
import authRoute from './routes/auth.routes.js'
import menuRoutes from './routes/menu.routes.js';
import uImage from './routes/uimag.routes.js'
import studentScore from './routes/studentScore.routes.js';
import TelegramStore  from "./routes/telegram_store.routes.js";
// import Attendance  from "./routes/attendance.routes.js";
// import StudentAttendance  from './routes/student_attendance.routes.js'

app.use("/", routes);
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
// app.use('/', Attendance);
app.use('/', TelegramStore);
// app.use('/', StudentAttendance);

// ======================
// 6. ERROR HANDLING
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
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
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  if (process.env.NODE_ENV !== 'production') {
    try {
      await open(`http://localhost:${PORT}`);
    } catch (err) {
      console.error('Could not open browser automatically:', err.message);
    }
  }
});