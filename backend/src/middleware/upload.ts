import multer from "multer";
import { AppError } from "../utils/errors.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg"]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new AppError("Only PDF, PNG, and JPEG files are allowed", 400));
    }

    return callback(null, true);
  },
});
