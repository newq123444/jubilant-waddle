// src/middleware/upload.ts — multer config for local file storage
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload dirs exist
const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');
const DIRS = ['residents', 'belongings', 'staff'];
for (const dir of DIRS) {
  const p = path.join(UPLOAD_ROOT, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    // Determine folder from route path
    let folder = 'residents';
    const url = req.originalUrl || req.url || '';
    if (url.includes('/belongings')) folder = 'belongings';
    else if (url.includes('/staff/avatar') || url.includes('/avatar')) folder = 'staff';
    else if (url.includes('/residents')) folder = 'residents';
    cb(null, path.join(UPLOAD_ROOT, folder));
  },
  filename: (req: Request, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

// File filter — images only
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, WebP)'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// CSV/Spreadsheet upload config — accepts .csv and .xlsx files
const csvStorage = multer.memoryStorage();

const csvFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(file.mimetype) || ext === '.csv' || ext === '.xlsx') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV or Excel files are allowed (.csv, .xlsx)'));
  }
};

export const csvUpload = multer({
  storage: csvStorage,
  fileFilter: csvFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
