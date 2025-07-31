import express from 'express';
import {
  getSchedules,
  addSchedule,
  deleteSchedule
} from '../controllers/DailyScheduleController.js';

const router = express.Router();

router.post('/api/schedules/list', getSchedules);
router.post('/api/schedules/create', addSchedule);
router.get('/api/schedules/delete', deleteSchedule); //by Id

export default router;
