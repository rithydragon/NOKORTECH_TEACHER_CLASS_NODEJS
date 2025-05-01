import express from 'express';
const router = express.Router();

import { checkRole } from '../middlewares/auth.middlewares.js'
import UImageController from '../controllers/uimage.controller.js';
import compressImage from '../middlewares/compress_size.middleware.js'
import { authenticate, authorizeRole,refreshTokenMiddleware ,checkPermission} from '../middlewares/auth.middlewares.js';
import { getAllUsers, createUser, getUserProfile, getUserById, updateUser, deleteUser,resetPassword, changePassword,getUsersWithRoleAndPermission,updateUserImage,updateUserPhoneNumber,updateUserProfileImage } from '../controllers/user.controller.js';
// import { login, register } from "../controllers/auth.controller.js";
import { studentScore,getAllByStudentId,createStudentScore ,updateStudentScore,deleteStudentScore ,updateAllScores,createAllScores} from '../controllers/studentScore.controller.js';

import AuthController from '../auth/auth.controller.js';
// import  {authenticateUser } from '../middlewares/authorization/index.js'; // The updated checkPermission middleware

// router.use(checkPermission());  // This will check permissions for every route dynamically
import multer from 'multer';
// const upload = multer({ dest: 'uploads/users/' });
import upload from "../middlewares/upload.middlewares.js";

// router.use(checkPermission());  // This will check permissions for every route dynamically
router.use(authenticate); // Apply authentication middleware to all routes

// Protected Route (Only Admins)
router.get("/admin-only", authorizeRole(["admin"]), (req, res) => {
    res.json({ message: "Welcome, Admin!" });
});
router.get('/protected-route', authenticate, (req, res) => {
    // Route logic
  });
// router.post('/api/user/list', authenticate,checkRole('SyAdmin'),checkPermission(['Download Reports','VIEW_USERS']),getAllUsers);
router.post('/api/user/list', authenticate,getAllUsers);
router.post('/api/user/create',authenticate, upload.single('Image'),compressImage, createUser);
router.post('/api/user/upload_avatar', upload.single('Image'), UImageController.uploadImageAvatar);
router.put("/api/user/:id/phone",authenticate, updateUserPhoneNumber);
router.post("/api/user/:id/image",authenticate, upload.single("Image"), updateUserImage);
router.get('/api/users/profile/:id', getUserById);
router.post('/api/user/userInfo', authenticate,getUserById);
router.post('/api/user/update', authenticate, updateUser);
router.get('/api/user/delete', authenticate, deleteUser);
router.get("/api/user/role_permission", getUsersWithRoleAndPermission);
router.post('/api/user/profile', authenticate, getUserProfile)
router.post('/api/user/change_password', authenticate,changePassword);
router.post('/api/user/reset_password', authenticate,resetPassword);

// router.post('/api/student_score/student', authenticate, studentScore);
router.post('/api/student_score/by_student', authenticate, getAllByStudentId);

// Create or Edit (POST)
router.post('/api/student_score/create', createStudentScore); // by student id
router.post('/api/student_score/update', updateStudentScore);  //by student id
router.get('/api/student_score/delete', deleteStudentScore);  //by student id
router.post('/student_score/update_all', updateAllScores);  //by student id
router.post('/student_score/create_all', createAllScores);  // create all

export default router;