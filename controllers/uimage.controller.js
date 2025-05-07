import UImage from '../models/uimage.models.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { successResponse, errorResponse, RtyApiResponse } from '../utils/response.utils.js';

class UImageController {
  static async createImage(req, res, next) {
    try {
      const { user_id, file_type, created_by } = req.body;
      const imagepath = req.file ? req.file.path : null;

      if (!imagepath) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      const imageId = await UImage.create({
        user_id,
        imagepath,
        file_type,
        created_by
      });

      res.status(201).json({
        success: true,
        data: { image_id: imageId, imagepath },
        message: 'Image created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getImage(req, res, next) {
    try {
      const { id } = req.params;
      const image = await UImage.findById(id);

      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Check if file exists
      if (!fs.existsSync(image.IMAGEPATH)) {
        return res.status(404).json({ error: 'Image file not found' });
      }

      // Send the image file
      res.sendFile(path.resolve(image.IMAGEPATH));
    } catch (error) {
      next(error);
    }
  }

  static async getUserImages(req, res, next) {
    try {
      const { user_id } = req.params;
      const images = await UImage.findByUserId(user_id);

      res.json({
        success: true,
        data: images.map(img => ({
          image_id: img.IMAGE_ID,
          imagepath: img.IMAGEPATH,
          created_date: img.CREATED_DATE
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateImage(req, res, next) {
    try {
      const { id } = req.params;
      const { file_type, updated_by } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'New image file is required' });
      }

      // Get old image to delete the file
      const oldImage = await UImage.findById(id);
      if (oldImage && fs.existsSync(oldImage.IMAGEPATH)) {
        fs.unlinkSync(oldImage.IMAGEPATH);
      }

      const affectedRows = await UImage.update(id, {
        imagepath: req.file.path,
        file_type,
        updated_by
      });

      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Image not found' });
      }

      res.json({
        success: true,
        message: 'Image updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }


  // In your controller (UImageController.uploadImageAvatar), process the file:
  static async uploadImageAvatar1(req, res) {
    try {
      const { UserId: id } = req.body; // can also use req.body.userId
      const createdBy = req.user?.UserId;
      const userId = id || createdBy;

      if (!req.file) {
        return RtyApiResponse(res, 400, 'No file uploaded.');
      }

      const originalPath = req.file.path;
      // Define a new path for the compressed image
      const compressedPath = originalPath.replace(/(\.[\w\d_-]+)$/i, '_compressed$1');

      // Use Sharp to compress/resize the image. For example, resize to 800x800 max:
      await sharp(originalPath)
        .resize(800, 800, { fit: 'inside' })
        .toFile(compressedPath);

      // Optionally, you may want to delete the original file if not needed:
      // fs.unlinkSync(originalPath);

      const fileType = req.file.mimetype;

      console.log("File Type:", fileType);
      console.log("Compressed Image Path:", compressedPath);
      console.log("User ID:", userId);
      console.log("Created By:", createdBy);

      // Save compressed image path to DB
      const imageId = await UImage.addImage(userId, compressedPath, fileType, createdBy);

      return RtyApiResponse(res, 200, 'Image uploaded successfully!', {
        imageId,
        imagePath: compressedPath
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      return RtyApiResponse(res, 500, 'Failed to upload image.');
    }
  }


  // Method to upload image and store metadata
  // Controller method to handle avatar image upload
  static async uploadImageAvatar1(req, res) {
    try {
      // Get UserId from body or fallback to the authenticated user
      console.log("Request Body:", req.body);
      console.log("Request File:", req.file);
      console.log("Request User:", req.user);
      console.log("Request User ID:", req.user?.UserId);
      console.log("Request User ID (from body):", req.body.UserId);
      console.log("Request User ID (from params):", req.params.UserId);
      console.log("Request User ID (from query):", req.query.UserId);
      console.log("Request User ID (from headers):", req.headers.UserId);
      console.log("Request User ID (from cookies):", req.cookies.UserId);
      console.log("Request User ID (from session):", req.session.UserId);
      console.log("Request User ID (from locals):", req.app.locals.UserId);
      console.log("Request User ID (from globals):", global.UserId);
      console.log("Request User ID (from environment):", process.env.UserId);
      console.log("Request User ID (from config):", req.app.get('UserId'));
      console.log("Request User ID (from config):", req.app.locals.UserId);
      console.log("Request User ID (from config):", req.app.get('UserId'));
      const { UserId: id } = req.body;
      const createdBy = req.user?.UserId; // Comes from your auth middleware
      const userId = id || createdBy;

      if (!userId) {
        return RtyApiResponse(res, 400, 'User ID is required.');
      }

      // Validate uploaded file
      if (!req.file) {
        return RtyApiResponse(res, 400, 'No file uploaded.');
      }

      const imagePath = req.file.path;
      const fileType = req.file.mimetype;

      // Validate file type
      if (!fileType.startsWith('image/')) {
        fs.unlinkSync(imagePath); // Delete the uploaded file
        return RtyApiResponse(res, 400, 'Only image files are allowed.');
      }

      // Insert image metadata into database
      const imageId = await UImage.addImage(userId, imagePath, fileType, createdBy);

      return RtyApiResponse(res, 200, 'Image uploaded successfully!', {
        imageId,
        imagePath
      });

    } catch (error) {
      // Clean up uploaded file if error occurred
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Error deleting uploaded file:", err);
        }
      }
      console.error("❌ Error uploading image:", error);
      return RtyApiResponse(res, 500, 'Failed to upload image.');
    }
  }

  static async uploadImageAvatar(req, res) {
    try {
      // Debugging logs (remove in production)
      console.log("Headers:", req.headers);
      console.log("Content-Type:", req.headers['content-type']);
      console.log("Body fields:", Object.keys(req.body));
      console.log("File info:", req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null);
  
      // Get UserId from form data
      const userId = req.body.UserId;
      const createdBy = req.user?.UserId;
  
      if (!userId) {
        return RtyApiResponse(res, 400, 'User ID is required.');
      }
  
      // Validate uploaded file
      if (!req.file) {
        return RtyApiResponse(res, 400, 'No file uploaded.');
      }
  
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        fs.unlinkSync(req.file.path);
        return RtyApiResponse(res, 400, 'Only JPG, PNG, or WEBP images are allowed.');
      }
  
      // Validate file size (5MB max)
      if (req.file.size > 5 * 1024 * 1024) {
        fs.unlinkSync(req.file.path);
        return RtyApiResponse(res, 400, 'Image must be smaller than 5MB.');
      }
  
      // Insert image metadata into database
      const imageId = await UImage.addImage(userId, req.file.path, req.file.mimetype, createdBy);
  
      return RtyApiResponse(res, 200, 'Image uploaded successfully!', {
        imageId,
        imagePath: req.file.path
      });
  
    } catch (error) {
      // Clean up uploaded file if error occurred
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Error deleting uploaded file:", err);
        }
      }
      console.error("Error uploading image:", error);
      return RtyApiResponse(res, 500, error.message || 'Failed to upload image.');
    }
  }

  static async deleteImage(req, res, next) {
    try {
      const { id } = req.params;

      // Get image to delete the file
      const image = await UImage.findById(id);
      if (image && fs.existsSync(image.IMAGEPATH)) {
        fs.unlinkSync(image.IMAGEPATH);
      }

      const affectedRows = await UImage.delete(id);

      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Image not found' });
      }

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UImageController;