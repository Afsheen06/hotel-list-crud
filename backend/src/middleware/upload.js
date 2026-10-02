// Handles hotel image uploads, storing files locally on the server
// inside backend/uploads/. Only the file path is saved to the DB.
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `hotel-${uniqueSuffix}${ext}`);
  },
});

const cloudinary = require('cloudinary').v2;
const cloudEnabled = Boolean(process.env.CLOUDINARY_URL);
if (process.env.NODE_ENV === 'production' && !cloudEnabled) {
  throw new Error('CLOUDINARY_URL is required in production for persistent images');
}
const storage = cloudEnabled ? {
  _handleFile(req, file, cb) {
    const stream = cloudinary.uploader.upload_stream({ folder: 'hotel-list-crud', resource_type: 'image' },
      (err, result) => cb(err, result ? { filename: result.secure_url, public_id: result.public_id } : undefined));
    file.stream.on('error', (err) => stream.destroy(err));
    file.stream.pipe(stream);
  },
  _removeFile(req, file, cb) {
    if (!file.public_id) return cb(null);
    cloudinary.uploader.destroy(file.public_id).then(() => cb(null), cb);
  },
} : localStorage;

const allowedTypes = /jpeg|jpg|png|webp/;

function fileFilter(req, file, cb) {
  const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedTypes.test(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG or WEBP images are allowed'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { upload, uploadDir };
