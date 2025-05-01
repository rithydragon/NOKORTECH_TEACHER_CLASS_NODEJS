import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';  // Use environment variable or fallback to a default
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key'; // Strong refresh secret

// Generate Access Token
export const generateAccessToken = (user) => {
    return jwt.sign(
        { userId: user.ID, username: user.USERNAME },
        JWT_SECRET,
        { expiresIn: '15m' } // Token expires in 15 minutes
    );
};

// Generate Refresh Token
export const generateRefreshToken = (user) => {
    return jwt.sign(
        { userId: user.ID },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
    );
};
