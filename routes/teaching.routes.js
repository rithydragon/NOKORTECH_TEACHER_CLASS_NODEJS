import express from "express";
import { authenticate } from '../middlewares/auth.middlewares.js';

import {
    getAllTeachings,
    getTeachingById,
    createTeaching,
    updateTeaching,
    deleteTeaching,
    updateAllTeachingsController,
    getTeachingList,
    getRoomData, getTimeData
} from "../controllers/teaching.controllers.js";


const router = express.Router();
// Apply authentication middleware to all routes
router.use(authenticate);

// router.post("/api/teaching/list", getAllTeachings);
router.get("/api/teachings/list/:Id", authenticate, getTeachingById);
router.post("/api/teaching/create", authenticate, createTeaching);
router.put("/api/teaching/update/:Id", authenticate, updateTeaching);
router.delete("/api/teaching/delete/:Id", authenticate, deleteTeaching);
router.put("/api/teachings/update_all", authenticate, updateAllTeachingsController);
// POST route to fetch filtered teaching data


router.post('/api/teaching/list',authenticate, getTeachingList);

// Route to fetch room data
router.get('/api/room/list', getRoomData);

// Route to fetch time data
router.get('/api/time/list',authenticate, getTimeData);
export default router;
