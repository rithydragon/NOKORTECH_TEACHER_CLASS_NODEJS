import express from "express";
import {authenticate} from '../middlewares/auth.middlewares.js';

import {
  getAll,
  getById,
  create,
  update,
  deleteTeacher,
} from "../controllers/teacher.controllers.js";


const router = express.Router();
// Apply authentication middleware to all routes
router.use(authenticate);

router.get("/api/teachers/list", getAll);
router.get("/api/teachers/list/:id", getById);
router.post("/api/teachers/create", create);
router.put("/api/teachers/update/:id", update);
router.delete("/api/teachers/delete/:id", deleteTeacher);

export default router;
