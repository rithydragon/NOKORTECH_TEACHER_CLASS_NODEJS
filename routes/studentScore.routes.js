import express from 'express';
const router = express.Router();

import { authenticate, authorizeRole, refreshTokenMiddleware, checkPermission } from '../middlewares/auth.middlewares.js';
import { deleteStudentScore, get, getAllByStudentId,getAll,studentScore } from '../controllers/studentScore.controller.js'

router.use(authenticate); // Apply authentication middleware to all routes
// router.all('*', (req, res) => {
//     console.log('❌ Unknown route hit:', req.path);
//     res.status(404).json({ message: 'Route not found' });
//   });
  
// Create or Edit 
// router.post('/api/student_score/create', create);

// router.post('/api/student_score/update', edit);

// Delete (GET)
router.get('/api/student_score/delete', deleteStudentScore);

// Get (POST)
// router.post('/api/student_score/list', get);

router.get('/api/student_score/list', getAll);


router.post('/api/student_score/student', getAllByStudentId);

router.post('/api/student_score/record', studentScore);

export default router;


