import multer from "multer";

const maxFileSizeMB = Number(
  process.env.MAX_FILE_SIZE_MB || 10
);

const maxFileSizeBytes =
  maxFileSizeMB * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",

  "application/pdf",

  "text/plain",
  "text/csv",

  "application/zip",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const storage = multer.memoryStorage();

function fileFilter(req, file, callback) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    const error = new Error(
      `File type ${file.mimetype} is not allowed`
    );

    error.status = 400;

    return callback(error);
  }

  callback(null, true);
}

export const upload = multer({
  storage,

  limits: {
    fileSize: maxFileSizeBytes,
    files: 1,
  },

  fileFilter,
});
