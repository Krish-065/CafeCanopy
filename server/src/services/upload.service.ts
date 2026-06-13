import { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only images are allowed'));
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('image');

export const handleImageUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    let imageUrl: string;

    if (useCloudinary) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'cafecanopy/products',
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
      });
      imageUrl = result.secure_url;
      // Clean up local file
      fs.unlinkSync(req.file.path);
    } else {
      // Serve locally
      imageUrl = `/uploads/${req.file.filename}`;
    }

    return res.json({ success: true, data: { url: imageUrl } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
};
