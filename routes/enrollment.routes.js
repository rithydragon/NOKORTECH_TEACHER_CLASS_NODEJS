import express from "express";
const router = express.Router();
import {
    list,
    info,
    options,
    create,
    update,
    remove,
} from "../controllers/enrollment.controller.js";
import { authenticate } from "../middlewares/auth.middlewares.js";

// Protected routes (require authentication)
router.use(authenticate);

router.post("/api/enrollment/list", list);
router.post("/api/enrollment/info", info);
router.get("/api/enrollment/info", info);
router.post("/api/enrollment/options", options);
router.post("/api/enrollment/create", create);
router.post("/api/enrollment/update", update);
router.get("/api/enrollment/delete", remove);
router.post("/api/enrollment/delete", remove);

export default router;