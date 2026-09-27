import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";
import shareRoutes from "./routes/share.routes.js";

const app = express();

app.disable("x-powered-by");

// Security middleware
app.use(helmet());

// CORS
app.use(cors());

// Request parsing
app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

// Logging
app.use(
  morgan("combined")
);

// Root endpoint
app.get("/", (req, res) => {
  return res
    .status(200)
    .json({
      success: true,

      name:
        "CloudDrop API",

      description:
        "Secure Cloud File Storage Platform on AWS",

      version:
        "1.0.0",
    });
});

// Health
app.use(
  "/health",
  healthRoutes
);

// Authentication
app.use(
  "/api/auth",
  authRoutes
);

// Authenticated file management
app.use(
  "/api/files",
  fileRoutes
);

// Public temporary share links
app.use(
  "/api/share",
  shareRoutes
);

// 404
app.use((req, res) => {
  return res
    .status(404)
    .json({
      success: false,
      message:
        "Route not found",
    });
});

// Global error handler
app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(error);

    // Zod validation
    if (
      error.name ===
      "ZodError"
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Validation failed",

          errors:
            error.issues.map(
              (issue) => ({
                field:
                  issue.path.join(
                    "."
                  ),

                message:
                  issue.message,
              })
            ),
        });
    }

    // Multer
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(413)
          .json({
            success: false,

            message:
              `File exceeds the maximum allowed size of ${
                process.env
                  .MAX_FILE_SIZE_MB ||
                10
              } MB`,
          });
      }

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Only one file can be uploaded at a time",
          });
      }

      if (
        error.code ===
        "LIMIT_UNEXPECTED_FILE"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Unexpected file field",
          });
      }

      return res
        .status(400)
        .json({
          success: false,
          message:
            error.message,
        });
    }

    // Application errors
    if (error.status) {
      return res
        .status(error.status)
        .json({
          success: false,

          message:
            error.message,
        });
    }

    // Generic error
    return res
      .status(500)
      .json({
        success: false,

        message:
          process.env.NODE_ENV ===
          "production"
            ? "Internal server error"
            : error.message ||
              "Internal server error",
      });
  }
);

export default app;