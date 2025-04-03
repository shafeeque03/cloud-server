import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
    throw new Error("❌ MONGO_URL is not defined in environment variables");
}

// Enable strict query mode for security
mongoose.set("strictQuery", true);

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000, // Timeout for initial connection
            maxPoolSize: 10, // Control connection pooling
            socketTimeoutMS: 45000, // Timeout for socket inactivity
        });

        console.log("✅ MongoDB connected successfully!");
    } catch (error) {
        console.error("⛔️ MongoDB connection error:", error.message);
        process.exit(1); // Exit if connection fails
    }
};

// Handle disconnection events
mongoose.connection.on("disconnected", () => {
    console.log("⚠️ MongoDB disconnected. Reconnecting...");
    connectDB();
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("🛑 Closing MongoDB connection...");
    await mongoose.connection.close();
    process.exit(0);
});

export default connectDB;
