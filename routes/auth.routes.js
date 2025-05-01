import express from 'express';
const router = express.Router();

import { login, register } from "../controllers/auth.controller.js";
import { checkPermission } from '../middlewares/authorization/index.js'; // The updated checkPermission middleware
import { authenticate,verifyToken,verifyAccessToken,refreshTokenMiddleware, authorizeRole} from '../middlewares/auth.middlewares.js';
import { refreshToken,logout ,getToken} from '../controllers/auth.controller.js';
router.post("/api/auth/signup", register);
router.post("/api/auth/login", login);

router.post('/api/auth/refresh_token', authenticate, refreshToken);

router.get('/api/auth/token', authenticate, getToken);

router.post('/api/auth/logout',verifyAccessToken, authenticate, logout, (req, res) => {
  console.log("User has logout! : ", req.userId);
  res.json({ message: "User has logged out!" });
});

router.post('/api/auth/verify_token', authenticate,verifyToken);

export default router;

// When does refresh token heppend?
// Refresh tokens are used in authentication systems to maintain secure, long-lived sessions without compromising security. Here's when they typically come into play:

// 1. Initial Login
// When a user first logs in, they receive:

// An access token (short-lived, typically 15-60 minutes)

// A refresh token (long-lived, typically days or weeks)

// 2. Access Token Expiration
// When the access token expires (you'll get a 401 Unauthorized response from your API)

// The client automatically uses the refresh token to get a new access token

// 3. Silent Authentication
// When reopening an app/browser tab and needing to:

// Restore the session without requiring login

// Get new tokens if the old ones expired

// 4. Periodic Rotation
// Some systems refresh tokens periodically (e.g., every 24 hours) even if the access token hasn't expired

// Technical Flow:
// mermaid
// Copy
// sequenceDiagram
//     Client->>+Server: Login (credentials)
//     Server-->>-Client: {accessToken, refreshToken}
    
//     Client->>+API: Request (with expired accessToken)
//     API-->>-Client: 401 Unauthorized
    
//     Client->>+Auth Server: Refresh Token Request
//     Auth Server-->>-Client: New {accessToken, refreshToken}
    
//     Client->>+API: Retry Request (with new accessToken)
//     API-->>-Client: 200 Success
