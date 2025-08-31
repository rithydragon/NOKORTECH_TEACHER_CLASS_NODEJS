// config/corsOptions.js
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:4582',
  'http://localhost:443', // NITRO CLIENT
  'https://www.angkordragon.space',
  'https://nokortechlmsapp.vercel.app'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    } else {
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS: ' + origin));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Set-Cookie'],
  exposedHeaders: ['Set-Cookie']
};

export default corsOptions;
