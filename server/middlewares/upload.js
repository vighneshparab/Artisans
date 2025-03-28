import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get the current directory dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadPath = path.join(__dirname, "../uploads/");

// Ensure uploads directory exists
import fs from "fs";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Store images in 'server/uploads/'
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter (Only images allowed)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images (jpeg, jpg, png, gif) are allowed"));
  }
};

// Initialize Multer for **single and multiple file uploads**
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
  fileFilter,
});

// Middleware for single image upload
export const uploadSingle = upload.single("image");

// Middleware for multiple images upload (max 5)
export const uploadMultiple = upload.array("images", 5);

export default upload;
