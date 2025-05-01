import express from "express";
import { getAllScores, getScoreById, createScore, updateScore, deleteScore } from "../controllers/scoreRecord.controllers.js";
import { authenticate } from '../middlewares/auth.middlewares.js';

const router = express.Router();
router.use(authenticate); // Apply authentication middleware to all routes

// router.get("/api/student/list", getAllStudents);
// router.get("/api/student/list/:id", getStudentById);
// router.post("/api/student/create", createStudent);
// router.put("/api/student/update/:id", updateStudent);
// router.delete("/api/student/delete/:id", deleteStudent);

router.get("/api/scores/list", getAllScores);
router.get("/api/scores/list/:id", getScoreById);
router.post("/api/scores/create", createScore);
router.put("/api/scores/update/:id", updateScore);
router.delete("/api/scores/delete/:id", deleteScore);

export default router;
