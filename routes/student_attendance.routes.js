import express from 'express';
import StudentAttendanceController from '../controllers/student_attendance.controller.js';

import { authenticate } from '../middlewares/auth.middlewares.js';
const router = express.Router();
// router.use(authenticate); // Apply authentication middleware to all routes

// POST methods
router.post('/api/student_attendance/create',authenticate, StudentAttendanceController.createAttendance);
router.post('/api/student_attendance/update_type',authenticate, StudentAttendanceController.updateStudentAttendanceType);

// GET methods
router.get('/student/:studentId', StudentAttendanceController.getAttendanceByStudent);
router.get('/api/attendance/daily_record', StudentAttendanceController.getAttendanceByDate);
router.get('/api/student_attendance/delete', StudentAttendanceController.deleteAttendance);  //by Id
// router.post('/api/attendance_type/list',authenticate, StudentAttendanceController.getAttendanceByDate);

// GET student comprehensive information
router.post('/api/student_attendance/list', StudentAttendanceController.getStudentComprehensiveInfo);

// GET daily attendance
router.post('/api/student_attendance/daily_record',authenticate, StudentAttendanceController.getDailyAttendance); // by date
// router.post('/api/student_attendance/daily/:date?', StudentAttendanceController.getDailyAttendance);

// GET attendance by date range
router.post('/api/student_attendance/date_range_list',StudentAttendanceController.getAttendanceByDateRange);
router.post('/api/student_attendance/disabled_days',StudentAttendanceController.getDisabledDays);

// GET class attendance summary
router.get('/api/attendance/class_summary/:date?', StudentAttendanceController.getClassAttendanceSummary);

// Attendance Type
router.post('/api/attendance_type/list', StudentAttendanceController.getAll);
router.post('/api/attendance_type/create', StudentAttendanceController.create); //create
router.post('/api/attendance_type/update', StudentAttendanceController.update); //by Id
router.get('/api/attendance_type/delete', StudentAttendanceController.remove); // By Id

export default router;