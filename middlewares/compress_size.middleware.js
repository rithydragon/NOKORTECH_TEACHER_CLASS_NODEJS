import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const compressSize = async (req, res, next) => {
  // Check if there's an uploaded file
  if (!req.file) {
    return next();
  }

  try {
    const originalPath = req.file.path;
    // Create a new filename for the compressed image, e.g. append _compressed before the extension
    const compressedPath = originalPath.replace(/(\.[\w\d_-]+)$/i, '_compressed$1');

    // Use Sharp to compress and optionally resize the image.
    // In this example, the image is resized to fit within 800x800 pixels
    await sharp(originalPath)
      .resize(800, 800, { fit: 'inside' })
      .toFile(compressedPath);

    // Optionally, if you don't need the original, delete it:
    // fs.unlinkSync(originalPath);

    // Update the file path in req.file so downstream processing uses the compressed image.
    req.file.path = compressedPath;
    
    next();
  } catch (error) {
    next(error);
  }
};

export default compressSize;
