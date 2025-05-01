import bcrypt from 'bcryptjs';

/**
 * Find a user by username.
 * @param {object} db - Database connection instance.
 * @param {string} username - Username to search.
 * @returns {Promise<object|null>} - Returns user object or null if not found.
 */
export const findUserByUsername = async (db, username) => {
    try {
        const [results] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        throw error;
    }
};
export const findUserByEmail = async (db, username) => {
    try {
        const [results] = await db.execute('SELECT * FROM users WHERE email = ?', [username]);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        throw error;
    }
};
/**
 * Create a new user.
 * @param {object} db - Database connection instance.
 * @param {string} username - Username.
 * @param {string} password - Plain text password.
 * @returns {Promise<object>} - Returns newly created user data.
 */
export const createUser = async (db, username, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [results] = await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        return { id: results.insertId, username };
    } catch (error) {
        throw error;
    }
};

/**
 * Update a user's refresh token.
 * @param {object} db - Database connection instance.
 * @param {number} userId - User ID.
 * @param {string} refreshToken - New refresh token.
 * @returns {Promise<object>} - Returns update result.
 */
export const updateUserRefreshToken = async (db, userId, refreshToken) => {
    try {
        const [results] = await db.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, userId]);
        return results;
    } catch (error) {
        throw error;
    }
};
