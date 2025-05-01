import express from 'express';
import {
  createLink,
  getLinks,
  getLinkById,
  updateLink,
  deactivateLink,
  deleteLink
} from '../controllers/telegram_store.controller.js';
// import authMiddleware from '../middlewares/authMiddleware.js';
// import roleMiddleware from '../middlewares/roleMiddleware.js';

import { authenticate } from '../middlewares/auth.middlewares.js';
const router = express.Router();

router.use(authenticate); // Apply authentication middleware to all routes
// Public routes
router.get('/', getLinks);
router.get('/:id', getLinkById);

// Protected routes
// router.use(authMiddleware);

// Teacher/Admin only routes
router.post('/api/telegram_store/create', createLink);
router.put('/:id', updateLink);

// Admin only routes
router.patch('/:id/deactivate', deactivateLink);
router.delete('/:id', deleteLink);

export default router;