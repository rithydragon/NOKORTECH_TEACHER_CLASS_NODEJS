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


const app = express();

// Routes and middlewares...
app.get('/', (req, res) => {
  res.send('🚀 Server is running!');
});

// If you're behind a reverse proxy (e.g., Nginx, AWS ALB), you must tell Express to trust the proxy, or req.ip will always return 127.0.0.1.
app.set('trust proxy', true); // 👈 Add this
// Middleware// Middleware to parse JSON and form data
// Example Express.js CORS config  // Integrate with clientSet CORS headers:
const corsOptions = {
  origin: process.env.FRONTEND_URL  || 'http://localhost:4582  ||http://your-frontend-domain.com',  // Frontend URL
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


// Initialize Swagger
setupSwagger(app); // Add this line

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

app.use(errorMiddleware);
// Error handler should be last middleware
app.use(errorHandler);

const PORT = process.env.PORT
// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Server is running on port http://localhost:${PORT}`);

});
