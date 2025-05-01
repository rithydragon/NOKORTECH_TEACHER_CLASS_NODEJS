import express from 'express';
import { login, buildRefreshToken } from '../controllers/auth.controller.js';

const router = express.Router();

// Login route
router.post('/api/refreshToken/login', login);

// Refresh token route
router.post('/api/refreshToken', buildRefreshToken);

export default router;