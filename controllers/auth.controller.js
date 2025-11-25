import jwt from 'jsonwebtoken'; // Import the JWT library
import User from '../models/user.models.js';
import AuthsModel from '../models/auth.models.js';
import UImage from '../models/uimage.models.js';
import cookie from 'cookie';
import dotenv from 'dotenv';
import db from '../config/db.js';
import crypto from 'crypto';


import { generateTokens } from '../utils/jwt.utils.js';
dotenv.config();
import bcrypt from 'bcryptjs';
import { errorResponse, RtyApiResponse } from '../utils/response.utils.js';

// In-memory store for refresh tokens (in production, use Redis or database)
let refreshTokens = [];

// Token blacklist for logged out tokens
const tokenBlacklist = new Set();

export const login = async (req, res) => {
  try {
    const { Username, Password, DeviceId } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress11 = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0].trim() || // from proxy/load balancer
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip;

    console.log("userAgent ========", userAgent)
    console.log("ipAddress ========", ipAddress)

    if (!Username) {
      return errorResponse(res, 501, 'Username are required');
    }

    if (!Password) {
      return errorResponse(res, 501, 'Password are required');
    }

    // Find user with retry logic
    let user;
    try {
      user = await User.findByUsername(Username);
      if (!user || user.length === 0) {
        return RtyApiResponse(res, 401, 'Username not found');
      }
    } catch (findError) {
      console.error('User lookup error:', findError);
      return RtyApiResponse(res, 500, 'Authentication service error');
    }

    const validPassword = await bcrypt.compare(Password, user.Password);
    if (!validPassword) {
      return res.status(401).json({ Message: 'Password incorrect' });
    }

    if (!user.UserId) {
      console.log("User ID is null or undefined.");
      return res.status(400).json({ error: 'User ID is missing' });
    }

    console.log("User id -------=------------", user.UserId)
    // ✅ Save login history
    try {
      await db.query(`
          INSERT INTO USER_LOG (USER_ID, DEVICE_ID, IP_ADDRESS, USER_AGENT)
          VALUES (?, ?, ?, ?)
        `, [user.UserId, DeviceId, ipAddress, userAgent]);

      console.log("Login history saved successfully.");
    } catch (error) {
      console.error("Error saving login history:", error);
      return res.status(500).json({ error: 'Failed to save login history' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const refreshTokenExpiresAt = new Date(decoded.exp * 1000); // Convert seconds to milliseconds

    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await db.query(`
      INSERT INTO AUTHS (USER_ID, DEVICE_ID, REFRESH_TOKEN, REFRESH_TOKEN_EXPIRES)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        REFRESH_TOKEN = VALUES(REFRESH_TOKEN),
        REFRESH_TOKEN_EXPIRES = VALUES(REFRESH_TOKEN_EXPIRES)
    `, [user.UserId, DeviceId, refreshToken, refreshTokenExpires]);


    const auth = await db.query(`
      SELECT * FROM AUTHS WHERE USER_ID = ? AND DEVICE_ID = ? AND REFRESH_TOKEN = ?
    `, [user.UserId, DeviceId, refreshToken]);
    // Generate all tokens

    // store refresh token in DB (optional but recommended)
    await db.query('UPDATE AUTHS SET REFRESH_TOKEN = ? WHERE ID = ?', [refreshToken, user.UserId]);

    // // Store refresh token in database
    const refreshUpdated = await AuthsModel.createOrUpdateRefreshToken(user.UserId, refreshToken);
    if (!refreshUpdated) {
      console.warn('Failed to update refresh token');
      return RtyApiResponse(res, 401, 'Failed to update refresh token!');
    }

    // Store refresh token securely (should be stored in a database in production)
    global.refreshTokens = global.refreshTokens || [];
    global.refreshTokens.push(refreshToken);

    // await User.update({ LastLogin: new Date() }, { where: { UserId: user.UserId } });
    const updateLastLogin = await AuthsModel.updateLastLogin(user.UserId);
    if (!updateLastLogin) {
      console.warn('Failed to update last login');
      return RtyApiResponse(res, 401, 'Failed to update last login!');
    }

    // const tokenExpiration = 60 * 60 * 1000; // 1 hour
    //by DeepSeek
    // In your login backend code, modify cookie settings:
    res.cookie('rty_access_token', accessToken, {
      httpOnly: false, // Allow JS to read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 1000 * 60 * 15, // 15 minutes
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost'
    });

    res.cookie('rty_refresh_token', refreshToken, {
      httpOnly: true, // Keep refresh token httpOnly for security
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/api/auth/refresh_token',
      domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost'
    });

    // // // Set secure cookies for all tokens
    // // ✅ Set refresh token as HttpOnly cookie
    // res.cookie('rty_refresh_token', refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'Strict',
    //   maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    //   path: '/api/auth/refresh_token', // optional
    // });

    // // Cookie will be automatically set by the browser, so there's no need for frontend code to handle it manually.
    // res.cookie('rty_access_token', accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production', // ensures it's only sent over HTTPS in production  // Set to true in production (requires HTTPS)
    //   sameSite: 'Strict', // to prevent CSRF
    //   maxAge: 1000 * 60 * 15, // 15 minutes
    // });

    // // httpOnly: false, // Only if you need access client-side (for SPA)


    // Prepare user data

    const userData = {
      Id: user.UserId,
      Name: user.Name,
      NameEnglish: user.EnglishName,
      Username: user.Username,
      Email: user.Email,
      Gender: user.Gender,
      IsActive: user.IsActive,
      LastLogin: user.LastLogin,
      Roles: user.Roles || []
    };

    return res.status(201).json({
      success: true,
      Message: "User registered successfully",
      accessToken,
      refreshToken,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || 3600,
      tokenType: 'Bearer',
      issuedAt: Math.floor(Date.now() / 1000),
      user: userData
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error.message);
    return errorResponse(res, 500, 'Internal server error');
  }
};

export const register = async (req, res) => {
  try {
    const {
      Name,
      NameEnglish,
      Username,
      Email,
      Password,
      Gender,
      DateOfBirth,
      Address,
      PhoneNumber,
    } = req.body;

    // Validation
    if (!Name || !Username || !Email || !Password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check existing user
    if (await User.findByEmail(Email)) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Create inactive user (requires admin approval)
    const hashedPassword = await bcrypt.hash(Password, 10);
    const newUser = await User.createUser({
      Name,
      NameEnglish,
      Username,
      Email,
      Password: hashedPassword,
      Gender,
      DateOfBirth,
      Address,
      PhoneNumber,
      IsActive: false, // Inactive by default
      Status: 'pending', // 'pending', 'approved', 'rejected'
      Role: 'user', // Default role
      UserType: 'standard' // Default type
    });

    // Notify admin (implementation depends on your system)
    await notifyAdminForApproval(newUser.UserId);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Awaiting admin approval.',
      userId: newUser._id
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Refresh token endpoint to generate a new access token
export const buildRefreshToken = async (req, res) => {
  console.log("----Refresh token from req body : ", req.body)

  const { refreshToken } = req.body;

  // Validate the refresh token
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  // Verify the refresh token
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    // Generate a new access token using the utility function
    const accessToken = generateAccessToken({ username: user.username })

    // Send the new access token to the client
    res.json({ accessToken });
  });
};


// Middleware to verify the token
function verifyTokenAce(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from 'Authorization: Bearer <token>'
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach decoded data to the request
    req.user = decoded;
    next();
  });
}

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verifyToken(token, process.env.RESET_TOKEN_SECRET);
    const user = await User.findOneByUserId({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export async function checkUserPermission(req, res) {
  try {
    const { userId } = req.user.UserId; // from token
    const users = await User.userPermission(userId);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found with this permission" });
    }

    return res.json({ users });
  } catch (error) {
    console.error("Error fetching users by permission:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getUsersByPermission(req, res) {
  try {
    const { permissionName } = req.params;
    const users = await UserModel.getUsersByPermission(permissionName);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found with this permission" });
    }

    return res.json({ users });
  } catch (error) {
    console.error("Error fetching users by permission:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getUsersByRole(req, res) {
  try {
    const { roleName } = req.params;
    const users = await UserModel.getUsersByRole(roleName);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for this role" });
    }

    return res.json({ users });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function checUserRole(req, res, userRole) {
  try {
    const { userId } = req.user.UserId; // from token
    const users = await User.userRole(userId);

    if (!userRole) return res.status(404).json({ message: "No users found for this role ----" });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for this role" });
    }

    return res.json({ users });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function constuserWithRolePermission(req, res) {
  try {
    const { userId, permissionId } = req.params;
    const { allowedRoles } = req.body;

    const userRoles = await UserModel.getUserRoles(userId);
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));

    return res.json({ hasPermission });
  } catch (error) {
    console.error("Role Check Error:", error);
    return res.status(500).json({ message: "Failed to check user roles" });
  }
}

import { sendEmail, sendPasswordResetEmail } from '../utils/sendEmail.utils.js';
import Role from '../models/role.models.js';
import { access } from 'fs';
import { response } from 'express';


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneByUserId({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `Click <a href="${resetUrl}">here</a> to reset your password.`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getToken = async (req, res) => {
  const userId = req.user?.UserId;

  if (!userId) {
    console.error('🚨 No user ID found in request');
    return RtyApiResponse(res, 401, 'Authentication required');
  }

  try {
    try {
      const [authRecords] = await db.query(
        'SELECT USER_ID, ACCESS_TOKEN, refreshToken, EXPIRES_AT FROM AUTHS WHERE USER_ID = ? FOR UPDATE',
        [userId]
      );

      if (!authRecords || authRecords.length === 0) {
        console.warn('⚠️ No auth record found for user:', userId);
        await db.rollback();
        return RtyApiResponse(res, 404, 'User session not found');
      }

      const userAuth = authRecords[0];

      // Security: Never log actual tokens in production
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Retrieved auth data:', {
          userId: userAuth.USER_ID,
          tokenExpires: userAuth.EXPIRES_AT,
          hasAccessToken: !!userAuth.ACCESS_TOKEN,
          hasRefreshToken: !!userAuth.refreshToken
        });
      }


      // Return sanitized response
      return RtyApiResponse(res, 200, 'Token retrieved successfully', {
        userId: userAuth.USER_ID,
        expiresAt: userAuth.EXPIRES_AT,
        tokenStatus: {
          accessToken: userAuth.ACCESS_TOKEN ? 'present' : 'missing',
          refreshToken: userAuth.refreshToken ? 'present' : 'missing'
        }
      });

    } catch (dbError) {
      await db.rollback();
      console.error('💾 Database error:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error('❌ Token fetch failed:', {
      error: error.message,
      userId,
      timestamp: new Date().toISOString()
    });

    return RtyApiResponse(res, 500, 'Failed to retrieve token', {
      referenceId: `ERR-${Date.now()}`,
      systemMessage: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    console.log("=== Refresh Token Endpoint Hit ===");

    // 1. Get refresh token from cookie
    const refreshToken = req.cookies.rty_refresh_token;
    console.log("Refresh token from cookie:", refreshToken || "NOT FOUND");

    if (!refreshToken) {
      console.log("Refresh token missing from cookies");
      return RtyApiResponse(res, 401, 'Refresh token missing - please login again');
    }

    // 2. First verify token signature
    let decoded;
    try {
      console.log("Attempting to verify with secret:", process.env.REFRESH_TOKEN_SECRET);
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      console.log("Token successfully verified");
    } catch (jwtError) {
      console.error("JWT Verification Failed:", {
        error: jwtError.message,
        token: refreshToken,
        secretUsed: process.env.REFRESH_TOKEN_SECRET,
        env: process.env.NODE_ENV
      });
      res.clearCookie('rty_refresh_token');
      return RtyApiResponse(res, 401, 'Session expired - please login again');
    }

    // 3. Check database for valid token (using consistent column names)
    const [authRecords] = await db.execute(
      `SELECT * FROM AUTHS 
       WHERE USER_ID = ? 
       AND REFRESH_TOKEN = ?
       AND REFRESH_TOKEN_EXPIRES > NOW()`,
      [decoded.UserId, refreshToken]
    );

    if (!authRecords.length) {
      console.log("No valid session found in database");
      res.clearCookie('rty_refresh_token');
      return RtyApiResponse(res, 401, 'Session expired - please login again');
    }

    // 4. Get user data
    const user = await User.findByPk(decoded.UserId);
    if (!user) {
      console.log("User not found for ID:", decoded.UserId);
      return RtyApiResponse(res, 404, 'User not found');
    }

    // 5. Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);
    console.log("New tokens generated for user:", user.UserId);

    // 6. Update refresh token in database
    await db.execute(
      `UPDATE AUTHS SET
        REFRESH_TOKEN = ?,
        REFRESH_TOKEN_EXPIRES = DATE_ADD(NOW(), INTERVAL 7 DAY)
       WHERE USER_ID = ?`,
      [newRefreshToken, decoded.UserId]
    );

    // 7. Set new cookie (relax security in development)
    res.cookie('rty_refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    // 8. Return response
    return res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });

  } catch (error) {
    console.error("CRITICAL ERROR in refreshToken:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    res.clearCookie('rty_refresh_token');

    return RtyApiResponse(res, 500, {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const logout = async (req, res) => {
  const userId = req.user?.UserId;
  console.log("Auth user id in logout : ", userId)

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  try {
    // 1. Invalidate refresh token in DB
    await AuthsModel.invalidateRefreshToken(userId);

    // 2. Update user login status
    await AuthsModel.loginStatus(userId);

    // 3. Clear refresh token cookie
    res.clearCookie('rty_refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/', // Optional: ensure scope is correct
    });

    // 4. Optionally: Clear local storage / session (frontend)
    res.setHeader('Clear-Site-Data', '"cookies", "storage"');

    console.log("✅ Logout complete for user:", userId);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: error.message
    });
  }
};
