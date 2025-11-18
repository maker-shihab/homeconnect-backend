import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

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

export const connectDB = async (): Promise<void> => {
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
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    // Don't exit in serverless - let the request fail gracefully
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
};
