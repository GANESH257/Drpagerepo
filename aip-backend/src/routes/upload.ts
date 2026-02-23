import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch {
  // ignore
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

/**
 * POST /api/upload
 * Upload a single image (certifications, badges, awards).
 * Returns { url: string } - path to access the file (e.g. /uploads/xxx).
 * Frontend should use API_BASE_URL + url for full URL.
 */
router.post('/', authenticateToken, upload.single('file'), (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: (error as Error).message || 'Upload failed' });
  }
});

export default router;
