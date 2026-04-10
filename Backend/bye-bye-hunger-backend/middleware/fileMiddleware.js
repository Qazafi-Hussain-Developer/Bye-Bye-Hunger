// middleware/fileMiddleware.js
import multer, { diskStorage } from 'multer';
import { extname as _extname, join } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = join(__dirname, '../uploads');

// Create directory synchronously at module load
const initUploadsDir = async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory ready');
  } catch (error) {
    console.error('Error creating uploads directory:', error.message);
  }
};

// Initialize directory (don't await at top level - use init function)
initUploadsDir();

// Set storage engine
const storage = diskStorage({
  destination: function (req, file, cb) {
    // Determine subfolder based on file type
    let subfolder = 'general';
    if (file.fieldname === 'profileImage') {
      subfolder = 'profiles';
    } else if (file.fieldname === 'image' || file.fieldname === 'foodImage') {
      subfolder = 'foods';
    } else if (file.fieldname === 'testimonialImage') {
      subfolder = 'testimonials';
    }
    
    const uploadPath = join(uploadsDir, subfolder);
    
    // Create subfolder if it doesn't exist
    fs.mkdir(uploadPath, { recursive: true })
      .then(() => cb(null, uploadPath))
      .catch(err => cb(err, null));
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = _extname(file.originalname);
    const fieldPrefix = file.fieldname === 'profileImage' ? 'profile' : 'food';
    cb(null, `${fieldPrefix}-${uniqueSuffix}${ext}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp'];
  
  const ext = _extname(file.originalname).toLowerCase();
  const mimetype = allowedTypes.includes(file.mimetype);
  const extension = allowedExtensions.includes(ext);
  
  if (mimetype && extension) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.'), false);
  }
};

// Configure multer for single file upload
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: fileFilter
});

// Configure multer for multiple files
const uploadMultiple = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5
  },
  fileFilter: fileFilter
});

// Custom error handler for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

// Export all at once - NO DUPLICATES
export default upload;
export { uploadMultiple, handleUploadError };