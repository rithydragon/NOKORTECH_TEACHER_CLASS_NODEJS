import express from 'express';
import { create, update, deleteStudents, getStudentById, getAllStudents } from '../controllers/student.controllers.js';
import { authenticate } from '../middlewares/auth.middlewares.js';

import { getAllStudentData, createStudent,importStudents } from '../controllers/student.controllers.js';
import uploadMiddleware from '../middlewares/upload_data.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// CRUD Routes
router.post('/api/student/create', create);
router.post('/api/student/getInfo', getStudentById);
router.put('/api/student/update/:id', update);
router.delete('/api/student/delete/:id', deleteStudents);
router.post('/api/student/list', getAllStudents);

//Report Routes
// router.get('/api/students/list', getAllStudentData);
router.post('/api/students/create', createStudent);
// router.post('/api/students/list/import', uploadMiddleware.single('file'), importStudents);
router.post('/api/students/list/import', uploadMiddleware, importStudents);






import StudentAttendanceController from '../controllers/student_attendance.controller.js';

// POST methods
router.post('/api/student_attendance/create',authenticate, StudentAttendanceController.createAttendance);
router.post('/api/student_attendance/update',authenticate, StudentAttendanceController.updateAttendance);

// GET methods
router.get('/student/:studentId', StudentAttendanceController.getAttendanceByStudent);
router.get('/api/attendance/daily_record', StudentAttendanceController.getAttendanceByDate);
router.get('/api/student_attendance/delete', StudentAttendanceController.deleteAttendance);
router.post('/api/attendance_type/list',authenticate, StudentAttendanceController.getAttendanceByDate);



// GET student comprehensive information
router.post('/api/student_attendance/list', StudentAttendanceController.getStudentComprehensiveInfo);

// GET daily attendance
router.post('/api/student_attendance/daily_record',authenticate, StudentAttendanceController.getDailyAttendance); // by date
// router.post('/api/student_attendance/daily/:date?', StudentAttendanceController.getDailyAttendance);

// GET attendance by date range
router.get('/api/student_attendance/range',authenticate, StudentAttendanceController.getAttendanceByDateRange);

// GET class attendance summary
router.get('/api/attendance/class_summary/:date?', StudentAttendanceController.getClassAttendanceSummary);



export default router;