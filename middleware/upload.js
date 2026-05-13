import multer from "multer";

// =========================
// MEMORY STORAGE CONFIG
// =========================
const storage = multer.memoryStorage();

// =========================
// MULTER INSTANCE
// =========================
const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (safe default)
  },

  fileFilter: (req, file, cb) => {
    // Accept images only (adjust if needed)
    if (
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files are allowed"
        ),
        false
      );
    }
  },
});

export default upload;