import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Storage } from '@google-cloud/storage';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const useGcs = process.env.UPLOAD_STORAGE === 'gcs' && !!process.env.GCS_BUCKET;
const gcsBucketName = process.env.GCS_BUCKET || '';
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// Local disk: ensure directory exists
if (!useGcs) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName) || '.jpg';
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${base}-${Date.now()}${ext}`;
}

const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
};

// GCS: use memory storage (no disk write)
const memoryStorage = multer.memoryStorage();

// Local: disk storage
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, sanitizeFilename(file.originalname)),
});

const upload = multer({
  storage: useGcs ? memoryStorage : diskStorage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

/**
 * POST /api/upload
 * Upload a single image (doctor profile, practice logo, certifications, badges, awards).
 * With GCS: returns full public URL (https://storage.googleapis.com/...).
 * Local: returns path (/uploads/xxx); frontend prepends API_BASE_URL.
 */
router.post('/', authenticateToken, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (useGcs && req.file.buffer) {
      const storage = new Storage();
      const bucket = storage.bucket(gcsBucketName);
      const objectName = `uploads/${sanitizeFilename((req.file as Express.Multer.File).originalname)}`;
      const file = bucket.file(objectName);
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
      });
      // With uniform bucket-level access, object ACLs (makePublic) are not allowed.
      // Make the bucket (or uploads/ prefix) public via bucket IAM: grant allUsers "Storage Object Viewer".
      const publicUrl = `https://storage.googleapis.com/${gcsBucketName}/${objectName}`;
      return res.json({ url: publicUrl });
    }

    // Local disk: req.file has path and filename
    const localFile = req.file as Express.Multer.File & { filename?: string };
    const url = `/uploads/${localFile.filename ?? sanitizeFilename(localFile.originalname)}`;
    res.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: (error as Error).message || 'Upload failed' });
  }
});

export default router;
