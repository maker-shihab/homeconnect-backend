import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://shihab_db:shihab_db%4099@homeconnectcluster.2utr95m.mongodb.net/?retryWrites=true&w=majority&appName=homeconnectcluster";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

// MongoDB connection options for serverless environments
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0,
};

// MongoDB connection - optimized for serverless
const connectDB = async (): Promise<void> => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB Already Connected");
      return;
    }

    // Check if connection is in progress
    if (mongoose.connection.readyState === 2) {
      console.log("⏳ MongoDB Connection in progress, waiting...");
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
      return;
    }

    // Connect with options
    await mongoose.connect(MONGO_URI, mongooseOptions);
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    // Don't exit in serverless - let the request fail gracefully
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
    throw error;
  }
};

// MongoDB connection events
mongoose.connection.on("disconnected", () => {
  console.log("🔌 MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB connection error:", error);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed through app termination");
  process.exit(0);
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
