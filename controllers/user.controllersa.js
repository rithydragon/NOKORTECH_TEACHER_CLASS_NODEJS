import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

import User from "../models/userModels.js";
import bcrypt from "bcrypt";
import {
    createUser,
    loginUser as loginUserModel,
    getUsers,
    getUserById,
    updateUserStatus,
    insertImageMetadata,
    checkIfUserExists,
    updateUser,
    updateUserImage,
    deleteUser as deleteUserModel
} from '../models/user.modelsa.js';

// CREATE - Create a new user
const createUserController = async (req, res) => {
    try {
        const userData = req.body;
        const userId = await createUser(userData);
        res.status(201).json({ success: true, message: 'User created successfully', userId });
    } catch (err) {
        console.error('Error in createUserController:', err);
        res.status(500).json({ success: false, message: err.message || 'Error during user creation' });
    }
};

// LOGIN - Authenticate a user
const loginUser = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        const loginResponse = await loginUserModel({ emailOrUsername, password });
        res.status(200).json(loginResponse);
    } catch (err) {
        console.error('Error in loginUserController:', err);
        res.status(500).json({ success: false, message: err.message || 'Login failed' });
    }
};

// READ - Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await getUsers();
        res.status(200).json(users);
    } catch (err) {
        console.error('Error in getAllUsers:', err);
        res.status(500).json({ error: err.message || 'Error fetching users' });
    }
};

// READ - Get user by ID
const getUserByIdController = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await getUserById(userId);
        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user[0]);
    } catch (error) {
        console.error('Error in getUserByIdController:', error);
        res.status(500).json({ message: 'Error fetching user data' });
    }
};

// CREATE - Register user with profile image upload
const createNewUser = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const userData = req.body;
    if (!userData.user_id || !userData.CODE || !userData.USERNAME || !userData.PASSWORD || !userData.ROLE_ID) {
        return res.status(400).json({ message: 'Missing required user information' });
    }

    try {
        const userExists = await checkIfUserExists(userData.user_id, userData.USERNAME);
        if (userExists) {
            return res.status(409).json({ message: 'User already exists with the provided ID or Username' });
        }
        const userId = await createUser(userData);

        const imagePath = req.file.path;
        const mimeType = mime.lookup(req.file.originalname) || 'application/octet-stream';
        await insertImageMetadata(userId, imagePath, mimeType);

        res.status(201).json({ message: 'User and image uploaded successfully', userId });
    } catch (err) {
        console.error('Error in createNewUser:', err);
        res.status(500).json({ message: 'Error processing request' });
    }
};

// UPDATE - Update user status
const updateStatus = async (req, res) => {
    const userId = req.params.id;
    const { IS_ACTIVE } = req.body;
    if (typeof IS_ACTIVE !== 'number') {
        return res.status(400).json({ error: 'IS_ACTIVE must be a number' });
    }
    try {
        const updated = await updateUserStatus(userId, IS_ACTIVE);
        if (!updated) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User status updated successfully', IS_ACTIVE });
    } catch (err) {
        console.error('Error in updateStatus:', err);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

// UPDATE - Update user details and optional profile image
const updateUserController = async (req, res) => {
    const { id } = req.params;
    const userData = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        await updateUser(id, userData);
        if (profileImage) await updateUserImage(id, profileImage);
        res.status(200).json({ message: 'User updated successfully', imageUpdated: !!profileImage });
    } catch (err) {
        console.error('Error in updateUserController:', err);
        res.status(500).json({ message: 'Error updating user data' });
    }
};

// DELETE - Remove user by ID
const deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const userDeleted = await deleteUserModel(userId);
        if (!userDeleted) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error in deleteUser:', err);
        res.status(500).json({ message: 'Error deleting user' });
    }
};


export const getAllUsers1 = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById1 = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createUser1 = async (req, res) => {
    try {
        const { name, email, password, role_id } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create(name, email, hashedPassword, role_id);
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUser1 = async (req, res) => {
    try {
        const { name, email, role_id } = req.body;
        await User.update(req.params.id, name, email, role_id);
        res.json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser1 = async (req, res) => {
    try {
        await User.delete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    createUserController,
    createNewUser,
    getUserByIdController,
    loginUser,
    getAllUsers,
    getUserById,
    updateStatus,
    updateUserController,
    deleteUser
};
