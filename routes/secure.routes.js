import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Only "Admin" can access this
router.get("/admin-dashboard", authenticate, authorize(["Admin"]), (req, res) => {
    res.json({ message: "Welcome Admin!" });
});

// Only "Student" can access this
router.get("/student-dashboard", authenticate, authorize(["Student"]), (req, res) => {
    res.json({ message: "Welcome Student!" });
});

export default router;
