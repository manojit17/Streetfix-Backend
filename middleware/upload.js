// ─────────────────────────────────────────────────────────────
//  middleware/upload.js
//  PURPOSE : Handle image file uploads using Multer
//  HOW     : Multer intercepts multipart/form-data requests,
//            validates the file, and uploads it DIRECTLY to
//            Cloudinary instead of saving to local disk.
//
//  CHANGED FROM ORIGINAL:
//    Before → multer.diskStorage() saved files to a local
//             "uploads/" folder on the server's filesystem.
//             This worked locally, but Render wipes that folder
//             on every redeploy/sleep cycle, deleting all photos.
//
//    Now    → CloudinaryStorage uploads the file straight to
//             Cloudinary's cloud storage during the request.
//             req.file.path will now contain the full permanent
//             Cloudinary URL instead of a local filename.
// ─────────────────────────────────────────────────────────────

const multer               = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary            = require('../config/cloudinary');

// ── STORAGE CONFIG ────────────────────────────────────────────
// Tells Multer to upload directly to Cloudinary instead of disk
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder         : 'streetfix-reports',       // groups all report photos in one Cloudinary folder
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    // Auto-resize large photos to save storage + bandwidth,
    // and auto-optimise quality for faster loading
    transformation : [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});

// ── FILE FILTER ───────────────────────────────────────────────
// Extra safety check on the file type before upload even starts
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, webp)'), false);
  }
};

// ── MULTER INSTANCE ───────────────────────────────────────────
const upload = multer({
  storage   : storage,
  fileFilter: fileFilter,
  limits    : {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

module.exports = upload;