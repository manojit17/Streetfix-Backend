// ─────────────────────────────────────────────────────────────
//  middleware/upload.js
//  PURPOSE : Handle image file uploads using Multer
//  HOW     : Multer intercepts multipart/form-data requests,
//            validates the file, and saves it to /uploads folder
// ─────────────────────────────────────────────────────────────

const multer = require('multer');
const path   = require('path');

// ── STORAGE CONFIG ────────────────────────────────────────────
// Tells Multer WHERE to save files and WHAT to name them
const storage = multer.diskStorage({

  // Save all uploaded files into the /uploads folder
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // null = no error
  },

  // Name each file uniquely: timestamp-originalname
  // e.g. "1712345678901-pothole.jpg"
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  },
});

// ── FILE FILTER ───────────────────────────────────────────────
// Only allow image files (jpg, jpeg, png, webp)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  // Check the file extension
  const extname  = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  // Check the MIME type (the browser-reported file type)
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true); // accept the file
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
