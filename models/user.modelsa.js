import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { generateAccessToken, generateRefreshToken } from '../config/jwt.js';

const userQuery = `
SELECT 
  u.ID AS userId,
  u.CODE AS userCode,
  u.USER_CODE AS userUniqueCode,
  u.F_NAME_KHMER AS userFirstNameKhmer, 
  u.L_NAME_KHMER AS userLastNameKhmer,
  u.F_NAME_ENGLISH AS userFirstNameEnglish,
  u.L_NAME_ENGLISH AS userLastNameEnglish,
  u.USERNAME AS userName,
  u.GENDER AS userGender,
  u.EMAIL AS userEmail,
  u.PASSWORD AS userPassword,
  u.ROLE_ID AS userRoleId,
  u.DOB AS userDob, 
  u.POB AS userPlaceOfBirth,
  u.ADDRESS AS userAddress,
  u.PHONE_NUMBER AS userPhoneNumber,
  u.LOGON_STATUS AS userLogonStatus,
  u.IS_ACTIVE AS userIsActive,
  u.CREATED_AT AS userCreatedAt, 
  u.UPDATED_AT AS userUpdatedAt,
  u.LAST_LOGIN AS userLastLogin,
  TIMESTAMPDIFF(YEAR, u.DOB, CURDATE()) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(u.DOB, '%m%d')) AS userAge,
  COALESCE(img.IMAGE_PATH, '/images/profile.png') AS userImagePath, 
  r.NAME AS userRoleName, 
  r.PERMISSIONS AS userRolePermissions
FROM USERS u
LEFT JOIN UIMAGE img ON u.ID = img.USER_ID
LEFT JOIN ROLES r ON u.ROLE_ID = r.ID;
`
// Create a new user
const createUser = async (user) => {
    const {
        USER_CODE, F_NAME_KHMER, L_NAME_KHMER, F_NAME_ENGLISH, L_NAME_ENGLISH,
        USERNAME, EMAIL, PASSWORD, USER_TYPE, GENDER,
    } = user;

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    const query = `
        INSERT INTO USERS (USER_CODE, F_NAME_KHMER, L_NAME_KHMER, F_NAME_ENGLISH, L_NAME_ENGLISH, 
        USERNAME, EMAIL, PASSWORD, USER_TYPE, GENDER, LAST_LOGIN)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    try {
        const [result] = await db.execute(query, [
            USER_CODE, F_NAME_KHMER, L_NAME_KHMER, F_NAME_ENGLISH, L_NAME_ENGLISH,
            USERNAME, EMAIL, hashedPassword, USER_TYPE, GENDER
        ]);
        return result.insertId;
    } catch (err) {
        throw new Error('Error during user creation');
    }
};

// Login user
const loginUser = async (loginData) => {
    const { emailOrUsername, password } = loginData;

    try {
        const [rows] = await db.execute(
            `SELECT * FROM USERS WHERE EMAIL = ? OR USERNAME = ?`,
            [emailOrUsername, emailOrUsername]
        );

        if (rows.length === 0) {
            throw new Error('User not found');
        }

        const user = rows[0];

        // Compare hashed password with stored password
        const passwordMatch = await bcrypt.compare(password, user.PASSWORD);
        if (!passwordMatch) {
            throw new Error('Invalid password');
        }

        const accessToken = generateAccessToken(user);  // Generate access token
        const refreshToken = generateRefreshToken(user);  // Generate refresh token

        return {
            success: true,
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: { id: user.ID, email: user.EMAIL, username: user.USERNAME }
        };
    } catch (err) {
        throw new Error('Login failed');
    }
};

// Fetch all users with their roles and images
const getUsers = async () => {
    const query = userQuery
    try {
        const [results] = await db.execute(query);
        return results;
    } catch (err) {
        throw new Error('Error fetching users');
    }
};

// Fetch a single user by ID
const getUserById = async (userId) => {
    const query = `
    SELECT 
        u.ID AS Id, u.CODE AS userCode, u.USER_CODE AS userUniqueCode, 
        u.F_NAME_KHMER AS userFirstNameKhmer, u.L_NAME_KHMER AS userLastNameKhmer, 
        u.F_NAME_ENGLISH AS userFirstNameEnglish, u.L_NAME_ENGLISH AS userLastNameEnglish, 
        CONCAT(u.F_NAME_KHMER, ' ', u.L_NAME_KHMER) AS userFullNameKhmer, 
        CONCAT(u.F_NAME_ENGLISH, ' ', u.L_NAME_ENGLISH) AS userFullNameEnglish, 
        u.USERNAME AS userName, u.GENDER AS userGender, u.EMAIL AS userEmail, 
        u.PASSWORD AS userPassword, u.ROLE_ID AS userRoleId, u.DOB AS userDob, 
        u.POB AS userPlaceOfBirth, u.ADDRESS AS userAddress, u.PHONE_NUMBER AS userPhoneNumber, 
        u.LOGON_STATUS AS userLogonStatus, u.IS_ACTIVE AS userIsActive, u.CREATED_AT AS userCreatedAt, 
        u.UPDATED_AT AS userUpdatedAt, u.LAST_LOGIN AS userLastLogin,
        COALESCE(img.IMAGE_PATH, '/images/profile.png') AS userImagePath,  
        r.NAME AS userRoleName, r.PERMISSIONS AS userRolePermissions
    FROM USERS u
    LEFT JOIN UIMAGE img ON u.ID = img.USER_ID
    LEFT JOIN ROLES r ON u.ROLE_ID = r.ID
    WHERE u.ID = ?;
    `;

    try {
        const [rows] = await db.execute(query, [userId]);
        return rows;
    } catch (error) {
        throw new Error('Error fetching user data');
    }
};

// Update user information
const updateUser = async (userId, userData) => {
    const { name, username, email, gender, dob, address, phoneNumber } = userData;

    try {
        await db.execute(
            `UPDATE USERS SET NAME = ?, USERNAME = ?, EMAIL = ?, GENDER = ?, DOB = ?, ADDRESS = ?, PHONE_NUMBER = ? WHERE ID = ?`,
            [name, username, email, gender, dob, address, phoneNumber, userId]
        );
    } catch (error) {
        throw new Error('Error updating user data');
    }
};

// Update user status
const updateUserStatus = async (userId, isActive) => {
    const query = 'UPDATE USERS SET IS_ACTIVE = ? WHERE ID = ?';
    try {
        const [result] = await db.execute(query, [isActive, userId]);
        return result.affectedRows > 0;
    } catch (err) {
        throw new Error('Error updating user status');
    }
};

// Delete user
const deleteUser = async (userId) => {
    try {
        const [results] = await db.execute('DELETE FROM USERS WHERE ID = ?', [userId]);

        if (results.affectedRows === 0) {
            return { success: false, message: 'User not found' };
        }

        return { success: true, message: 'User deleted successfully' };
    } catch (err) {
        console.error('Error deleting user:', err);
        return { success: false, message: 'Error deleting user' };
    }
};

// Check if a user exists
const checkIfUserExists = async (userId, username) => {
    try {
        const [checkResult] = await db.execute(
            'SELECT * FROM USERS WHERE ID = ? OR USERNAME = ?',
            [userId, username]
        );
        return checkResult.length > 0;
    } catch (err) {
        console.error('Error checking if user exists:', err);
        throw new Error('Error checking user existence');
    }
};

// Insert image metadata for a user
const insertImageMetadata = async (userId, imagePath, mimeType) => {
    try {
        await db.execute(
            `INSERT INTO UIMAGE (USER_ID, IMAGE_PATH, FILE_TYPE, CREATED_BY)
             VALUES (?, ?, ?, ?)`,
            [userId, imagePath, mimeType, userId]
        );
    } catch (err) {
        throw new Error('Error inserting image metadata');
    }
};

// Update user image
const updateUserImage = async (userId, profileImage) => {
    try {
        await db.execute(
            `INSERT INTO UIMAGE (USER_ID, IMAGE_PATH) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE IMAGE_PATH = ?`,
            [userId, profileImage, profileImage]
        );
    } catch (error) {
        throw new Error('Error updating user image');
    }
};

// Create User (Register)
export const createUser1 = async (user) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const sql = `INSERT INTO USERS (CODE, USER_CODE, F_NAME_KHMER, L_NAME_KHMER, 
        F_NAME_ENGLISH, L_NAME_ENGLISH, USERNAME, EMAIL, PASSWORD, USER_TYPE, GENDER, ROLE_ID) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await db.execute(sql, [
        user.code, user.user_code, user.firstNameKh, user.lastNameKh, 
        user.firstNameEn, user.lastNameEn, user.username, user.email, 
        hashedPassword, user.userType, user.gender, user.roleId
    ]);

    return { message: "User created successfully" };
};

// Find User by Email
export const findUserByEmail = async (email) => {
    const [rows] = await db.execute("SELECT * FROM USERS WHERE EMAIL = ?", [email]);
    return rows.length ? rows[0] : null;
};


export default class User {
    static async findAll() {
        const [rows] = await db.execute("SELECT id, name, email, role_id FROM users");
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute("SELECT id, name, email, role_id FROM users WHERE id = ?", [id]);
        return rows[0];
    }

    static async create(name, email, hashedPassword, role_id) {
        await db.execute("INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)", 
                           [name, email, hashedPassword, role_id]);
    }

    static async update(id, name, email, role_id) {
        await db.execute("UPDATE users SET name = ?, email = ?, role_id = ? WHERE id = ?", 
                           [name, email, role_id, id]);
    }

    static async delete(id) {
        await db.execute("DELETE FROM users WHERE id = ?", [id]);
    }
}

class User1 {
    static async create(user) {
        const [result] = await db.query(
            'INSERT INTO USERS (USER_CODE, NAME, EMAIL, PASSWORD) VALUES (?, ?, ?, ?)',
            [user.userCode, user.name, user.email, user.password]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM USERS WHERE EMAIL = ?', [email]);
        return rows[0];
    }
}

export { createUser, loginUser, getUsers, getUserById, updateUser, updateUserStatus, deleteUser, insertImageMetadata, checkIfUserExists, updateUserImage };


