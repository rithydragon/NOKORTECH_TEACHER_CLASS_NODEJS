// routes/subjectRoutes.js
import express from 'express';
import { getAllSubjects,getSubjectById,createSubject,updateSubject,deleteSubject,searchSubjects } from '../controllers/subject.controller.js';
import { authenticate } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.post('/api/subject/list',authenticate, getAllSubjects);
router.get('/api/subject/list/:id',authenticate, getSubjectById);
router.post('/api/subject/create',authenticate, createSubject);
router.post('/api/subject/update',authenticate, updateSubject);
router.post('/api/subject/delete/:id',authenticate, deleteSubject);
router.post('/api/subject/search',authenticate, searchSubjects);

export default router;