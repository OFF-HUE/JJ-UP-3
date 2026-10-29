import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const isProduction = process.env.NODE_ENV === 'production';
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5500';

if (!process.env.MONGODB_URI || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error('Set MONGODB_URI and a SESSION_SECRET of at least 32 characters in .env');
}

if (isProduction) app.set('trust proxy', 1);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: frontendOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '20kb', type: 'application/json' }));
app.use(cookieParser());

// Basic Origin check for browser state-changing requests. Configure FRONTEND_ORIGIN exactly.
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.get('origin');
    if (origin && origin !== frontendOrigin) return res.status(403).json({ error: 'Request origin not allowed.' });
  }
  next();
});

app.use(session({
  name: 'jjup.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 60 * 60 * 24 * 7
  }),
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/'
  }
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'jj-up-api' }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/jobs', jobRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

try {
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => console.log(`Jj Up API listening on port ${port}`));
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message);
  process.exit(1);
}
