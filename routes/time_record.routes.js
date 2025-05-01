import express from 'express';
import ProfessorTeachingController from '../controllers/time_record.controller.js';
import { authenticate } from '../middlewares/auth.middlewares.js';
const router = express.Router();

router.use(authenticate); // Apply authentication middleware to all routes

// Get teaching summary
router.post('/api/time_record/summary', ProfessorTeachingController.getTeachingSummary);

// Create teaching record
router.post('/api/time_record/create', ProfessorTeachingController.createRecord);  // by proffessional id
// router.post('/api/time_record/:professorId/records', ProfessorTeachingController.createRecord);

// Update teaching record
router.post('/api/time_record/update', ProfessorTeachingController.updateRecord);

// Delete teaching record
router.get('/api/time_record/delete', ProfessorTeachingController.deleteRecord);

export default router;