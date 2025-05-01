import express from "express";
const router = express.Router();
import { authorizeRole } from "../middlewares/auth.middlewares.js";

import { createCourse,getAllCourse,getAllDataById} from "../controllers/course.controller.js"; // ✅ Default import

router.post("/api/course/list", getAllCourse);
router.get("/api/course/list/:id", getAllDataById);
router.post("/api/course/create", createCourse);


// Only "Admin" and "Manager" roles can create courses
router.post("/api/course/create", authorizeRole(["Admin", "Manager"]), createCourse);

// Only users with the "CREATE_COURSE" permission can create a course
router.post("/api/course/create", createCourse);

export default router;
