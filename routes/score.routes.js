// routes/scoreRoutes.js
import express from 'express';
import {getAllScores,getScoreByStudentId,createScore,updateScore,deleteScore,searchScores} from '../controllers/score.controller.js';
import {authenticate} from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.post('/api/score/list',authenticate, getAllScores);  
router.post('/api/score/list_student',authenticate ,getScoreByStudentId); // BY STUDENT ID
router.post('/api/score/create',authenticate, createScore);
router.post('/api/score/update',authenticate, updateScore);
router.delete('/api/score/:scoreId',authenticate, deleteScore);
router.get('/api/score/search',authenticate, searchScores);
export default router;