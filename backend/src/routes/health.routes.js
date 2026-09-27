import { Router } from "express";
import pool from "../config/database.js";

const router = Router();

router.get("/", async (req, res) => {
  const startedAt = Date.now();

  try {
    await pool.query("SELECT 1");

    return res.status(200).json({
      success: true,
      status: "healthy",
      service: "clouddrop-api",
      database: "healthy",
      uptime: process.uptime(),
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return res.status(503).json({
      success: false,
      status: "unhealthy",
      service: "clouddrop-api",
      database: "unhealthy",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
