import express from "express";
const router = express.Router();

// Import route modules
import studentAttendanceRoutes from './student_attendance.routes.js'
import timeRecord from './time_record.routes.js'
// Add more route files as needed

// Use route modules
router.use('/', studentAttendanceRoutes);
router.use('/', timeRecord);

export default router;
