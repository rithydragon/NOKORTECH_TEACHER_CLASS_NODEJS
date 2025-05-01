import express from 'express';
import AttendanceController from '../controllers/attendance.controller.js';

import { authenticate } from '../middlewares/auth.middlewares.js';
const router = express.Router();
router.use(authenticate); // Apply authentication middleware to all routes

// POST methods
router.post('/api/student_attendance/create', AttendanceController.createAttendance);
router.post('/api/student_attendance/update', AttendanceController.updateAttendance);

// GET methods
router.get('/student/:studentId', AttendanceController.getAttendanceByStudent);
router.get('/api/attendance/daily_record', AttendanceController.getAttendanceByDate);
router.get('/api/student_attendance/delete', AttendanceController.deleteAttendance);
router.post('/api/attendance_type/list', AttendanceController.getAttendanceByDate);

export default router;