/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

// Imports
const express = require("express");
const helmet = require("helmet");
const { connectDB } = require("./src/config/db.config");
const webhookRouter = require("./src/routes/webhook.route");
const homeRouter = require("./src/routes/home.route");
const checkoutRouter = require("./src/routes/checkout.route");

// Initialize express app
const app = express();

// Set HTTP response secure headers
app.use(helmet());

// Webhook routes need the *raw* request body for signature verification, so
// they're mounted before the body parsers below ever get a chance to
// consume/transform the stream
app.use("/webhooks", webhookRouter);

// Parse incoming request body
app.use(express.urlencoded({ extended: true }));

// Set static directory (public directory)
app.use(express.static(`${__dirname}/public`));

// EJS view engine setup
app.set("view engine", "ejs");

const port = process.env.PORT || 3000;

// Routes setup
app.use("/", homeRouter);
app.use("/checkout", checkoutRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).send("Not found");
});

// Centralized error handler
app.use((error, _req, res, _next) => {
  console.error("Unhandled error:", error);

  res.status(500).json({ error: "Something went wrong." });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
}

startServer();
