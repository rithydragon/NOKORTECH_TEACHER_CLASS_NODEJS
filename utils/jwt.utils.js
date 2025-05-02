

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


export const generateTokens = (user) => {
  console.log('Using secret to SIGN token:', process.env.REFRESH_TOKEN_SECRET);
  const payload = {
    UserId: user.UserId,
    Username: user.Username,
    Email: user.Email,
    Name: user.Name,
    NameEnglish: user.EnglishName,
    Gender: user.Gender,
    PhoneNumber: user.PhoneNumber,
    IsActive: user.IsActive,
    RoleName: user.RoleName,
    Permission: user.PermissionName
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
  return { token, accessToken, refreshToken };
};



// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// // const crypto = require('crypto')

// // Dynamically generated secrets (should be stored securely in real apps)
// // const accessSecret = crypto.randomBytes(32).toString('base64')
// // const refreshSecret = crypto.randomBytes(32).toString('base64')
// dotenv.config();
// console.log("000000000000000000000000000000000000000000000000000 ",process.env.ACCESS_TOKEN_SECRET)
// const accessSecret = Buffer.from(process.env.ACCESS_TOKEN_SECRET, 'base64');
// const refreshSecret = Buffer.from(process.env.REFRESH_TOKEN_SECRET, 'base64');

// console.log("Access Secret :  ---", accessSecret)
// console.log("Refresh Secret :  ---", refreshSecret)

// // 🎯 Generate tokens
// export const generateTokens = (data) => {
//   const accessPayload = {
//     UserId: data.UserId,
//     Username: data.Username,
//     Email: data.Email,
//     Name: data.Name,
//     NameEnglish: data.EnglishName,
//     Gender: data.Gender,
//     PhoneNumber: data.PhoneNumber,
//     IsActive: data.IsActive,
//     RoleName: data.RoleName,
//     Permission: data.PermissionName
//   }

//   const refreshPayload = {
//     UserId: data.UserId
//   }

//   const accessToken = jwt.sign(accessPayload, accessSecret, {
//     expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
//     algorithm: 'HS256'
//   })

//   const refreshToken = jwt.sign(refreshPayload, refreshSecret, {
//     expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
//     algorithm: 'HS256'
//   })

//   return { accessToken, refreshToken }
// }

// // ✅ Verify Access Token
// export const verifyAccessToken = (token) => {
//   console.log("Verify access token ============> ", token)
//   try {
//     return jwt.verify(token, accessSecret)
//   } catch (err) {
//     console.error('Access token verification failed:', err.message);
//     return null;
//   }
// }

// export const verifyRefreshToken = (token) => {
//   console.log("Verify refresh token ============> ", token)
//   try {
//     return jwt.verify(token, refreshSecret)
//   } catch (err) {
//     console.error('Access token verification failed:', err.message);
//     return null;
//   }
// }

// //Usage
// // import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js'

// // // When logging in:
// // const { accessToken, refreshToken } = generateTokens(userData)
