/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing required environment variable: MONGODB_URI");
  }

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });

  await mongoose.connect(mongoUri, {
    dbName: "supporters-collection",
    serverApi: {
      version: "1",
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: 10,
  });

  console.log("Connected to MongoDB");
}

module.exports = { connectDB };
