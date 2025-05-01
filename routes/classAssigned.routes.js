import express from "express";
import { assignTeacher, getAll ,getAllAssignments} from "../controllers/classAssigned.controllers.js";

const router = express.Router();
import { authenticateToken } from "../middlewares/auth.middlewares.js";

router.post("/api/class_assign/assign",authenticateToken, assignTeacher);
router.get("/api/class_assign/lists",authenticateToken, getAll);

// Get all teaching assignments (with optional filters)
router.post("/api/class_assign/list", getAll);
export default router;
