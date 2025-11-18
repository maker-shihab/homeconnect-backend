import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { connectDB } from "../config/database";
import { AppError } from "../utils/AppError";

/**
 * Middleware to ensure MongoDB connection is established before handling requests
 * Critical for serverless environments like Vercel where connections might not persist
 */
export const ensureDBConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Skip database check for health endpoint
  if (req.path === "/health" || req.path === "/api/health") {
    return next();
  }

  try {
    // Check connection state
    const readyState = mongoose.connection.readyState;

    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (readyState === 1) {
      // Already connected
      return next();
    }

    if (readyState === 2) {
      // Connection in progress, wait for it
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Database connection timeout"));
        }, 10000); // 10 second timeout

        mongoose.connection.once("connected", () => {
          clearTimeout(timeout);
          resolve(undefined);
        });

        mongoose.connection.once("error", (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      return next();
    }

    // Not connected, establish connection
    await connectDB();
    next();
  } catch (error) {
    console.error("❌ Database connection middleware error:", error);
    next(
      new AppError("Database connection failed. Please try again later.", 503)
    );
  }
};
