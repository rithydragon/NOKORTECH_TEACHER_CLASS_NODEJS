

import express from 'express';
import UimageController from '../controllers/uimage.controller.js';
import uploadMiddleware from '../middlewares/upload.middlewares.js';
import authenticate from '../middlewares/auth.middlewares.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const router = express.Router();

// Configure upload directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, '..', '..', 'uploads', 'images');

// Create directory if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
//   console.log(`Created upload directory: ${uploadDir}`);
}

// Apply authentication middleware to all image routes
router.use(authenticate);

// Image CRUD Endpoints
// router.post('/', uploadMiddleware.single('image'), UimageController.createImage);
// router.get('/:id', UimageController.getImage);
// router.get('/user/:user_id', UimageController.getUserImages);
// router.put('/:id', uploadMiddleware.single('image'), UimageController.updateImage);
// router.delete('/:id', UimageController.deleteImage);


// Image CRUD Endpoints
router.post('/api/uimage/create', uploadMiddleware.single('image'), UimageController.createImage);
router.get('/api/uimage/get/:id', UimageController.getImage);
router.get('/api/user_image/:user_id', UimageController.getUserImages);
router.put('/api/user/update/:id', uploadMiddleware.single('image'), UimageController.updateImage);
router.delete('/api/user/delete/:id', UimageController.deleteImage);


// Image service health check
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    uploadDir: uploadDir,
    exists: fs.existsSync(uploadDir)
  });
});

export default router;