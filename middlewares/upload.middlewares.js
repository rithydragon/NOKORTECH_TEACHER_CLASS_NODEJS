import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads/images directory exists
const uploadPath = path.join(process.cwd(), 'uploads/images/users');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter: Allow only image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimetypeOk = allowedTypes.test(file.mimetype);
  const extnameOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetypeOk && extnameOk) {
    return cb(null, true);
  }

  cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'));
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export default upload;
