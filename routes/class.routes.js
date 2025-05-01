import express from "express";
const router = express.Router();
import {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass,
    getAll,
    getTeachingClass
    
} from "../controllers/class.controller.js";
import { authenticateToken,authenticate } from "../middlewares/auth.middlewares.js";


// Protected routes (require authentication)
router.post("/api/class/class_list",authenticateToken, getAll);
router.post("/api/teaching/list",authenticate, getTeachingClass);
router.post("/api/class/list", authenticateToken, createClass);
router.get("/api/class/list/all", authenticateToken, getAllClasses);
router.get("/api/class/list/:id", authenticateToken, getClassById);
router.put("/api/class/update/:id", authenticateToken, updateClass);
router.delete("/api/class/delete/:id", authenticateToken, deleteClass);

export default router;