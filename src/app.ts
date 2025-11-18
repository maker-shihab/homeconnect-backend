import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { globalRoute } from "./routes/index";
import { ensureDBConnection } from "./shared/middleware/dbConnection.middleware";
import { errorHandler } from "./shared/middleware/errorMiddleware";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" })); // This is crucial!
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Ensure database connection before API routes (critical for serverless)
app.use("/api", ensureDBConnection);

// Global routes
app.use("/api", globalRoute);

// Error handling (MUST be last)
app.use(errorHandler);

export default app;
