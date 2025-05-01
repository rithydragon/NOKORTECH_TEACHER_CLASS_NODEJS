import User from '../models/user.models.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UImage from '../models/uimage.models.js';
import storeUserImage from '../services/storeUserImage.js';

import { successResponse, errorResponse, RtyApiResponse } from '../utils/response.utils.js';

export const getUser = async (req, res) => {
    try {
        console.log("Decoded User:", req.user); // ✅ Check decoded token

        // Fetch user from DB
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            id: user.ID,
            name: user.NAME,
            email: user.EMAIL,
            lastLogin: user.LAST_LOGIN
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};


// In your controller
export const getAllUsers = async (req, res) => {
    try {
        // Allowed page sizes to prevent excessively large requests
        const ALLOWED_PAGE_SIZES = [10, 25, 50, 100];
        const DEFAULT_PAGE_SIZE = 100;

        const {
            page = 1,
            pageSize = DEFAULT_PAGE_SIZE,
            search = '',
            sort = 'U.ID',
            order = 'ASC',
            getAll = false
        } = req.body;

        // Validate pageSize
        const validatedPageSize = ALLOWED_PAGE_SIZES.includes(parseInt(pageSize))
            ? parseInt(pageSize)
            : DEFAULT_PAGE_SIZE;

        const result = await User.findAllUsers({
            page: Math.max(1, parseInt(page)),
            pageSize: validatedPageSize,
            search,
            sortField: sort,
            sortOrder: order,
            getAll: getAll === true
        });

        res.status(200).json({
            data: result.data,
            pagination: result.pagination,
            availablePageSizes: ALLOWED_PAGE_SIZES // Inform frontend of allowed sizes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const getAllUsers55 = async (req, res) => {
    try {
        const result = await User.findAllUsers();
        res.status(200).json(
            result
        );
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllUsers22 = async (req, res) => {  // all data
    try {
        // Extract parameters from query string
        const page = req.query.page ? parseInt(req.query.page) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : null;
        const search = req.query.search || '';
        const sortField = req.query.sortField || 'U.ID';
        const sortOrder = req.query.sortOrder || 'ASC';
        const getAll = req.query.getAll === 'true';

        const result = await User.findAllUsers({
            page,
            pageSize,
            search,
            sortField,
            sortOrder,
            getAll
        });

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.UserId; // Extracted from token by authenticateToken middleware
        console.log("User ID:", userId);

        const userProfile = await User.getUserProfile(userId);
        return res.status(200).json(userProfile);
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Internal server error' });
    }
}


export const getUserById = async (req, res) => {
    // const userId = req.params.id;
    const { userId } = req.body;
    console.log("User Id profile ---------> ", userId)


    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        // Get ID from URL parameters (for DELETE /api/users/:id)
        // If using GET /api/users/delete?id=123, use req.query.id instead
        // const { id } = req.params;
        // console.log( "Request by user id to delete ", req.query.Id)
        console.log("Query received:", req.query);
        const userId = req.query.Id;
        console.log("Request to delete user by id:", userId)

        if (!userId) {
            return res.status(400).json({ success: false, message: 'UserId query param is required' });
        }

        // Validate ID
        if (!userId || isNaN(userId)) {
            return errorResponse(res, 'Invalid user ID', 400);
        }

        // Delete user
        const deletedCount = await User.deleteUser(userId);

        // Check if user was actually deleted
        if (deletedCount === 0) {
            console.log("User count delete  ", deletedCount)
            return errorResponse(res, 'User not found', 404);
        }

        // Successful response
        return successResponse(res, 'User deleted successfully', 200);
    } catch (error) {
        console.error('Error deleting user:', error);
        return errorResponse(res, error.message || 'Failed to delete user', 500);
    }
};


export const getUsersWithRoleAndPermission = async (req, res) => {
    try {
        const { roleName, permissionName } = req.query; // Get role and permission from query params

        // Fetch users with the specified role and permission
        const users = await User.getUsersWithRoleAndPermission(roleName, permissionName);

        if (users.length === 0) {
            return errorResponse(res, "No users found with the specified role and permission", 404);
        }

        successResponse(res, "Users fetched successfully", users);
    } catch (error) {
        errorResponse(res, error.message);
    }
};

const createNewUser11 = async (req, res) => {
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


export async function createNewUser(req, res) {
    try {
        const {
            UserCode,
            Name,
            NameEnglish,
            Username,
            Email,
            Password,
            Gender,
            UserType,
            DateOfBirth,
            PlaceOfBirth,
            Address,
            PhoneNumber,
            CreatedBy,
            RoleId, // Ensure RoleId is included in the request body
        } = req.body;

        // Handle file upload (if any)
        const imagePath = req.File ? req.fFile.filename : null;
        const fileType = req.File ? req.File.mimetype : null;

        // Validate required fields
        if (!UserCode || !Username || !Email || !Password || !UserType || !Gender || !RoleId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(Password, 10);

        // Create user in the database
        const userId = await User.create({
            UserCode,
            Name,
            NameEnglish,
            Username,
            Email,
            Password: passwordHash, // Use hashed password
            Gender,
            UserType,
            DateOfBirth,
            PlaceOfBirth,
            Address,
            PhoneNumber,
            CreatedBy,
        });

        // Assign role to the user
        await assignRole(userId, RoleId, CreatedBy);

        // Store user image (if provided)
        if (imagePath) {
            await storeUserImage(userId, imagePath, fileType, CreatedBy);
        }

        // Log success and return response
        console.log("User created successfully with ID:", userId);
        res.status(201).json({ message: "User created successfully!", userId });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function createUser(req, res) {
    try {
        console.log("Body user for create ---------> ", req.body);

        const userId = req.user.UserId; //Extract userId from token
        console.log("User ID from token:", userId); // Log the userId for debugging
        // Access uploaded file details
        const imageFile = req.File ? req.File : null;
        console.log("Image request : =======> ", imageFile);

        if (!imageFile) {
            console.log("No image file uploaded");
        }

        // Handle file upload (if any)
        const imagePath = imageFile ? imageFile.filename : null;
        const fileType = imageFile ? imageFile.mimetype : null;

        console.log("Image path: ", imagePath);
        console.log("File type: ", fileType);

        // Destructure request body for user fields
        const {
            UserCode,
            Name,
            NameEnglish,
            Username,
            Email,
            Password,
            Gender,
            UserType,
            DateOfBirth,
            PlaceOfBirth,
            Address,
            PhoneNumber,
            CreatedBy,
        } = req.body;

        console.log("Req body : ", req.body)

        // Replace undefined values with null
        const sanitizedUser = {
            UserCode: UserCode || null,
            Name: Name || null,
            NameEnglish: NameEnglish || null,
            Username: Username || null,
            Email: Email || null,
            Password: Password || null,
            Gender: Gender || null,
            UserType: UserType || null,
            DateOfBirth: DateOfBirth || null,
            PlaceOfBirth: PlaceOfBirth || null,
            Address: Address || null,
            PhoneNumber: PhoneNumber || null,
            CreatedBy: CreatedBy || null,
        };

        // Validate required fields
        console.log("Validating required fields...");
        if (!sanitizedUser.UserCode || !sanitizedUser.Username || !sanitizedUser.Email || !sanitizedUser.Password || !sanitizedUser.UserType || !sanitizedUser.Gender) {
            console.log("Missing required fields:", sanitizedUser);
            // return res.status(400).json({ error: "Missing required fields" });
        }

        // Hash the password before storing
        console.log("Hashing password...");
        const passwordHash = await bcrypt.hash(sanitizedUser.Password, 10);

        console.log("Password hashed successfully");

        // Create user in the database
        console.log("Creating user in the database...");
        const user = await User.createUser({
            UserCode: sanitizedUser.UserCode,
            Name: sanitizedUser.Name,
            NameEnglish: sanitizedUser.NameEnglish,
            Username: sanitizedUser.Username,
            Email: sanitizedUser.Email,
            Password: passwordHash, // Use hashed password
            Gender: sanitizedUser.Gender,
            UserType: sanitizedUser.UserType,
            DateOfBirth: sanitizedUser.DateOfBirth,
            PlaceOfBirth: sanitizedUser.PlaceOfBirth,
            Address: sanitizedUser.Address,
            PhoneNumber: sanitizedUser.PhoneNumber,
            CreatedBy: userId,
        });

        // Log the user ID returned from the database
        console.log("User created with ID: ", user.Id);

        // Assign role to the user
        console.log("Assigning role to the user...");
        // await User.assignRole(user.Id, sanitizedUser.RoleId, sanitizedUser.CreatedBy);

        // Store user image (if provided)
        if (imagePath) {
            console.log("Storing user image...");
            await UImage.addImage(userId, imagePath, fileType, sanitizedUser.CreatedBy);
        }

        // Log success and return response
        console.log("User created successfully with ID:", userId);
        res.status(201).json({ message: "User created successfully!", userId: userId });
    } catch (error) {
        console.error("Error creating user:", error);

        // Log specific error message
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error("Unique constraint error: User with this email or username already exists.");
            return res.status(400).json({ error: "User with this email or username already exists" });
        }

        // Handle general errors
        console.error("Internal server error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const updateUser = async (req, res) => {
    try {
        const userData = req.body; // Data to update
        const { UserId: id } = req.body; // Extract the single user ID
        const authUserId = req.user.UserId; // Get the ID of the authenticated user

        console.log("User ID to update:", id);
        console.log("User data to update:", userData);
        console.log("Authenticated user ID:", authUserId);

        // Call the update function from the model
        const result = await User.updateUser(id, userData, authUserId);

        // Handle if no changes were detected
        if (!result.updated) {
            return res.status(200).json({ success: false, message: result.message });
        }

        // Return success response if user updated
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
    }
};



export const updateUserProfileImage = async (req, res) => {
    try {
        const userId = req.user.UserId; // Get the user ID from the URL
        const imageFile = req.file; // Access uploaded file details

        if (!imageFile) {
            return res.status(400).json({ error: "No image file uploaded" });
        }

        const imagePath = imageFile.path; // Path where the file is saved
        const fileType = imageFile.mimetype; // MIME type of the file

        // Check if the user already has an image
        const existingImage = await UImage.findOne({ where: { userId } });

        if (existingImage) {
            // Update the existing image
            existingImage.imagePath = imagePath;
            existingImage.fileType = fileType;
            await existingImage.save();
        } else {
            // Create a new image record
            await UImage.addImage(userId, imagePath, fileType, userId); // Assuming CreatedBy is the user ID
        }

        // Log success and return response
        console.log("User image updated successfully for user ID:", userId);
        res.status(200).json({ message: "User image updated successfully!", imagePath });
    } catch (error) {
        console.error("Error updating user image:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateUserImage = async (req, res) => {
    try {
        const userId = req.params.id; // Get the user ID from the URL
        const authenticatedUserId = req.user.id; // Get the authenticated user's ID

        // Ensure the authenticated user can only update their own image
        if (userId !== authenticatedUserId) {
            return res.status(403).json({ error: "You are not authorized to update this user's image" });
        }

        const imageFile = req.file; // Access uploaded file details

        if (!imageFile) {
            return res.status(400).json({ error: "No image file uploaded" });
        }

        const imagePath = imageFile.path; // Path where the file is saved
        const fileType = imageFile.mimetype; // MIME type of the file

        // Check if the user already has an image
        const existingImage = await UImage.findOne({ where: { userId } });

        if (existingImage) {
            // Update the existing image
            existingImage.imagePath = imagePath;
            existingImage.fileType = fileType;
            await existingImage.save();
        } else {
            // Create a new image record
            await UImage.addImage(userId, imagePath, fileType, userId); // Assuming CreatedBy is the user ID
        }

        // Log success and return response
        console.log("User image updated successfully for user ID:", userId);
        res.status(200).json({ message: "User image updated successfully!", imagePath });
    } catch (error) {
        console.error("Error updating user image:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const updateUserPhoneNumber11111 = async (req, res) => {
    try {
        const userId = req.params.id; // Get the user ID from the URL
        const { PhoneNumber } = req.body; // Get the new phone number from the request body

        if (!PhoneNumber) {
            return res.status(400).json({ error: "Phone number is required" });
        }

        // Find the user by ID
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update the phone number
        user.PhoneNumber = PhoneNumber;
        await user.save();

        // Log success and return response
        console.log("User phone number updated successfully for user ID:", userId);
        res.status(200).json({ message: "User phone number updated successfully!", user });
    } catch (error) {
        console.error("Error updating user phone number:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const updateUserPhoneNumber = async (req, res) => {
    try {
        const userId = req.params.id; // Get the user ID from the URL
        const authenticatedUserId = req.user.id; // Get the authenticated user's ID

        // Ensure the authenticated user can only update their own phone number
        if (userId !== authenticatedUserId) {
            return res.status(403).json({ error: "You are not authorized to update this user's phone number" });
        }

        const { PhoneNumber } = req.body; // Get the new phone number from the request body

        if (!PhoneNumber) {
            return res.status(400).json({ error: "Phone number is required" });
        }

        // Find the user by ID
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update the phone number
        user.PhoneNumber = PhoneNumber;
        await user.save();

        // Log success and return response
        console.log("User phone number updated successfully for user ID:", userId);
        res.status(200).json({ message: "User phone number updated successfully!", user });
    } catch (error) {
        console.error("Error updating user phone number:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const id = req.body.Id; // Get the user ID from the URL
        console.log("User ID by post method ------:", id); // Log the userId for debugging
        const UserId = req.user.UserId; // Extract userId from token
        console.log("User ID from token:", UserId); // Log the userId for debugging
        const { CurrentPassword, NewPassword } = req.body; // `changedBy` is the user ID who made the change
        if (!CurrentPassword || !NewPassword) {
            return res.status(400).json({ message: 'Missing password fields' });
        }

        console.log("Current password:", CurrentPassword); // Log the current password for debugging
        console.log("NewPassword ", NewPassword)
        const user = await User.findOneByUserId(id);
        console.log("User to change password:", user); // Log the user for debugging

        if (!user) {
            res.status(404).json({ message: 'User not found' });
        }
        const storedHash = user?.Password
        const testPassword = CurrentPassword

        bcrypt.compare(testPassword, storedHash).then(result => {
            console.log("Match?   ====", result); // true or false
        });

        const isMatch = await bcrypt.compare(CurrentPassword, user.Password);
        if (!isMatch) {
            console.log("Current password does not match", CurrentPassword); // Log the error for debugging
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.Password = await bcrypt.hash(NewPassword, 12);
        user.UpdatedBy = UserId;
        user.UpdatedAt = new Date();

        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const UpdatedBy = req.user.UserId; // User performing the password update
        const { Username, NewPassword } = req.body;
        console.log("Username and new password ---------> ", Username, NewPassword); // Log for debugging

        // Validate input
        if (!Username || !NewPassword) {
            return RtyApiResponse(res, 400, 'Username and new password are required');
        }

        // Find the user by Username
        const user = await User.findByUsername(Username);

        if (!user) {
            return RtyApiResponse(res, 404, 'User not found');
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(NewPassword, 12); // 12 rounds of salting
        console.log("Hashed password --------->", hashedPassword); // Log hashed password

        // Update the user's password and set the UpdatedBy field correctly
        const resetPassword = await User.resetPassword(Username, UpdatedBy, hashedPassword);
        console.log("Password update result --------->", resetPassword); // Log result of update

        if (!resetPassword) {
            return RtyApiResponse(res, 400, 'Failed to reset password');
        }

        return RtyApiResponse(res, 200, 'Password reset successfully');
    } catch (error) {
        console.error("Error resetting password:", error);
        return RtyApiResponse(res, 500, error.message || 'Server error');
    }
};
