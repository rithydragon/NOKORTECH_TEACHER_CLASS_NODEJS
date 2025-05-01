import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import db from "../config/db.js";
import User from '../models/user.models.js';
import Role from '../models/role.models.js';
import Permission from '../models/permission.models.js';
import { successResponse, errorResponse, RtyApiResponse,response } from '../utils/response.utils.js';

// Ensure the JWT_SECRET or ACCESS_TOKEN_SECRET environment variable is the same in both the login and authentication middleware.
const verifyTokenReal = async (token, userId) => {
  const [auth] = await db.execute(
    `SELECT ACCESS_TOKEN FROM AUTHS 
       WHERE USER_ID = ? AND ACCESS_TOKEN = ?`,
    [userId, token]
  );
  return auth.length > 0;
};


export const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return response(res, 401, 'Unauthorized - Missing token', false);
  }

  try {
    let decoded;

    // Try verifying with JWT_SECRET first
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // If verification with JWT_SECRET fails, try ACCESS_TOKEN_SECRET
      try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      } catch (accessTokenError) {
        return response(res, 401, 'Invalid token - Access token verification failed', false);
      }
    }

    // Check if the token has expired
    if (decoded.exp < Date.now() / 1000) {
      return response(res, 401, 'Token has expired', false);
    }

    // Attach the decoded user data to the request object
    req.user = decoded;
    console.log('User authenticated successfully:');

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Token Verification Error:', error);
    return response(res, 401, 'Unauthorized - Invalid token', false);
  }
};

export const refreshTokenMiddleware = async (req, res, next) => {
  // Use `req.body` or `req.headers`
  const { refreshToken } = req.headers //`req.body` // or use `req.headers['authorization']` if sent via header

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' })
  }

  const decoded = verifyToken(refreshToken)
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' })
  }

  req.userId = decoded.userId // Ensure consistency with how you set userId in the token
  next()
}

export const authorizeRole = (role) => (req, res, next) => {
  if (req.user.RoleName !== role) {
    return res.status(403).json({ error: 'Access denied. You do not have the required role  ==========.' });
  }
  next();
};

export const checkPermission = (requiredPermissions) => async (req, res, next) => {
    console.log("🔍 Required Permissions  ------ :", requiredPermissions);
    try {
    const permissions = await Permission.getPermissionsByUserId(req.user?.UserId);

    console.log("🔍 User Permissions ------------- :", permissions);

    // If no permissions or not an array, return error
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(403).json({ error: "Access denied. No permissions assigned to this user." });
    }

    // Check if the user has at least one of the required permissions
    const hasPermission = requiredPermissions.some(permission =>
      permissions.includes(permission)
    );

    console.log("🔍 User has permission >>:", hasPermission);

    if (!hasPermission) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};


export const checkRole = (allowedRoles) => async (req, res, next) => {
  // Check if user data is present in the request
  const userId = req.user.UserId;
  if (!req.user || !userId) {
    return res.status(401).json({ error: "Unauthorized - Missing user data" });
  }

  try {
    // Check if the user has one of the allowed roles
    // const hasAllowedRole = await Role.hasRole(req.user.UserId, allowedRoles);
    console.log("Check : ", allowedRoles)
    const hasAllowedRole = await Role.hasRole(userId, allowedRoles);
    console.log("Check : ", hasAllowedRole)

    if (!hasAllowedRole) {
      return res.status(403).json({ error: "Forbidden - Insufficient roles" });
    }

    // If the user has an allowed role, proceed to the next middleware
    next();
  } catch (error) {
    console.error("Role Check Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const decodeRefreshToken = (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Missing token' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
// router.post('/refresh_token', decodeRefreshToken, refreshToken);

export const verifyToken = async (req, res, next) => {
  console.log("Verifying token:", req.headers.authorization?.slice(0, 500));

  try {
    const token =
      // req.headers.authorization?.split(' ')[1] ||
      // req.cookies.token ||
      // req.body.rty_access_token;
      req.body.accessToken

      console.log("Token verify ============================",req.body.accessToken)
      console.log("Token verify ============================",token)
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // const decoded = await new Promise((resolve, reject) => {
    //   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //     if (err) {
    //       console.log("JWT Error   ------  verify   :", err.message); // <-- very important
    //       if (err.name === 'TokenExpiredError') {
    //         return reject({ code: 401, message: 'Access token expired' });
    //       }
    //       return reject({ code: 403, message: 'Invalid token' });
    //     }
    //     resolve(decoded);
    //   });
    // });
    
    const userId = decoded.UserId || decoded.userId || decoded.id || req.user?.UserId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Token missing user identifier' });
    }

    return res.json({ 
      valid: true,
      user: {
        Id: decoded.UserId,
      }
    });

  } catch (err) {
    return res.status(err.code || 500).json({
      success: false,
      message: err.message || 'Server error',
    });
  }
};

export function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // ✅ Save full user object
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
}



// Role and Permission is authorization
// A


// router.post('/create-course', 
//     authenticateUser, // Authenticate the user
//     checkPermission(), // Dynamically check if the user has the required permissions for this route
//     (req, res) => {
//         res.status(200).json({ message: "Course created successfully!" });
//     }
// );


import { promisify } from 'util';

// Promisify jwt.verify for async/await usage
const verifyToken66 = promisify(jwt.verify);

export default (options = {}) => {
  // Default options
  const config = {
    secret: process.env.JWT_SECRET || 'your_default_secret',
    tokenHeader: 'authorization',
    tokenScheme: 'Bearer',
    cookieName: 'riththyToken',
    ...options
  };

  return {
    // Main authentication middleware
    authenticate: async (req, res, next) => {
      try {
        // 1. Get token from various sources
        const token = getTokenFromRequest(req, config);

        if (!token) {
          return res.status(401).json({
            success: false,
            message: 'Authentication token required'
          });
        }

        // 2. Verify token
        const decoded = await verifyToken(token, config.secret);

        // 3. Attach user to request
        req.user = decoded;

        // 4. Optional: Verify user exists in DB
        if (config.verifyUser) {
          const user = await config.verifyUser(decoded);
          if (!user) {
            return res.status(401).json({
              success: false,
              message: 'User not found'
            });
          }
          req.user = { ...decoded, ...user };
        }

        next();
      } catch (error) {
        handleAuthError(error, res);
      }
    },

    // Role-based access control
    authorize: (roles) => {
      return (req, res, next) => {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized'
          });
        }

        if (!roles || roles.length === 0) {
          return next();
        }

        const userRoles = req.user.roles || [];
        const hasRole = roles.some(role => userRoles.includes(role));

        if (!hasRole) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
          });
        }

        next();
      };
    },

    // Token refresh middleware
    refreshToken: async (req, res, next) => {
      try {
        const refreshToken = req.cookies['refreshToken'] || req.body.refreshToken;

        if (!refreshToken) {
          return res.status(401).json({
            success: false,
            message: 'Refresh token required'
          });
        }

        const decoded = await verifyToken(refreshToken, config.secret);

        // Verify refresh token is valid for this user
        if (config.verifyRefreshToken) {
          const isValid = await config.verifyRefreshToken(decoded.userId, refreshToken);
          if (!isValid) {
            return res.status(401).json({
              success: false,
              message: 'Invalid refresh token'
            });
          }
        }

        // Generate new access token
        const newToken = jwt.sign(
          { userId: decoded.userId, roles: decoded.roles },
          config.secret,
          { expiresIn: '15m' }
        );

        // Attach to response
        res.locals.newToken = newToken;
        next();
      } catch (error) {
        handleAuthError(error, res);
      }
    }
  };
};



// Helper functions
function getTokenFromRequest(req, config) {
  // Check header first
  if (req.headers[config.tokenHeader]) {
    const parts = req.headers[config.tokenHeader].split(' ');
    if (parts.length === 2 && parts[0] === config.tokenScheme) {
      return parts[1];
    }
  }

  // Check cookie
  if (req.cookies && req.cookies[config.cookieName]) {
    return req.cookies[config.cookieName];
  }

  // Check body
  if (req.body && req.body.token) {
    return req.body.token;
  }

  return null;
}

function handleAuthError(error, res) {
  let status = 401;
  let message = 'Invalid token';

  if (error.name === 'TokenExpiredError') {
    message = 'Token expired';
  } else if (error.name === 'JsonWebTokenError') {
    message = 'Malformed token';
  } else {
    console.error('Authentication error:', error);
    status = 500;
    message = 'Authentication failed';
  }

  return res.status(status).json({
    success: false,
    message
  });
}

export const verifyAccessToken = (req, res, next) => {
  const token = req.cookies?.rty_access_token || req.headers.authorization?.split(' ')[1];
  console.log("Token verifyAccessToken in middleware : ", token)

  if (!token) {
    console.log('Access token missing')
    return res.status(401).json({ success: false, message: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
