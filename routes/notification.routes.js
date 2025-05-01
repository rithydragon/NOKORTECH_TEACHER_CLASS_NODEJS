import express from 'express';
import { getNotifications, getNotificationsByType, markAllNotificationsRead, clearAllNotifications, clearNotificationById } from '../controllers/notification.controllers.js';

const router = express.Router();

// Routes
router.get('/api/notifications', getNotifications);
router.get('/api/notifications23', getNotificationsByType);
router.put('/api/notifications/read-all', markAllNotificationsRead);
router.delete('/api/notifications/clear', clearAllNotifications);
router.delete('/api/notifications/clear/:id', clearNotificationById);

export default router;
