

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// export const generateToken = (user) => {
//   if (!user || !user.UserId || !user.Username || !user.Email) {
//     return null; // Handle missing data gracefully
//   }

//   const payload = {
//     UserId: user.UserId,
//     Username: user.Username,
//     Email: user.Email,
//     Name: user.Name,
//     NameEnglish: user.EnglishName,
//     Gender: user.Gender,
//     PhoneNumber: user.PhoneNumber,
//     IsActive: user.IsActive,
//     RoleName: user.RoleName,
//     Permission: user.PermissionName
//   };

//   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });
// };

// export const generateAccessToken = (user) => {
//   // console.log("Generating access token for:", user); // Debugging

//   if (!user || !user.UserId || !user.Username || !user.Email) {
//     console.error("generateAccessToken: Missing required user data");
//     return null; // Handle missing data gracefully
//   }

//   const payload = {
//     UserId: user.UserId,
//     Username: user.Username,
//     Email: user.Email,
//     Name: user.Name,
//     NameEnglish: user.EnglishName,
//     Gender: user.Gender,
//     PhoneNumber: user.PhoneNumber,
//     IsActive: user.IsActive,
//     RoleName: user.RoleName,
//     Permission: user.PermissionName,
//   };
//   return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });
// };


// export const generateSessionToken = (user) => {

//   const secretKey = process.env.JWT_SECRET; // Make sure this is set
//   if (!secretKey) {
//     throw new Error("JWT Secret key is not defined");
//   }
//   return jwt.sign(
//     { UserId: user.UserId, session: true },
//     secretKey,
//     { expiresIn: process.env.SESSION_SECRET_EXPIRES_IN } // Session token for client-side use
//   );
// };

// export const generateRefreshToken = (user) => {
//   const payload = {
//     UserId: user.UserId,
//     Username: user.Username,
//     Email: user.Email,
//     Name: user.Name,
//     NameEnglish: user.EnglishName,
//     Gender: user.Gender,
//     PhoneNumber: user.PhoneNumber,
//     IsActive: user.IsActive,
//     RoleName: user.RoleName,
//     Permission: user.PermissionName
//   };
//   return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN } // Longer-lived refresh token
//   );
// };



// export const decodeToken = (token) => {
//   try {
//     return jwt.decode(token);
//   } catch (error) {
//     console.error('Token decoding failed:', error);
//     return null;
//   }
// };



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

// export const verifyToken = (token, secret) => {
//   try {
//     return jwt.verify(token, secret);
//   } catch (error) {
//     console.error('Token verification failed:', error);
//     return null;
//   }
// };