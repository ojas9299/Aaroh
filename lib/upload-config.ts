import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads", "images");

export function ensureUploadDirectory() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function imageFileFilter(_req: any, file: any, cb: any) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new Error("Only image files are allowed"));
    return;
  }

  cb(null, true);
}

const memoryStorage = multer.memoryStorage();

const diskStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    ensureUploadDirectory();
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeOriginal}`);
  },
});

const sharedLimits = {
  fileSize: 2 * 1024 * 1024,
};

export const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: sharedLimits,
});

export const uploadDisk = multer({
  storage: diskStorage,
  fileFilter: imageFileFilter,
  limits: sharedLimits,
});
