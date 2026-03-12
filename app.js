/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

// Imports
const express = require("express");
const helmet = require("helmet");
const homeRouter = require("./src/routes/home.route");
const checkoutRouter = require("./src/routes/checkout.route");

// Initialize express app
const app = express();

// Set HTTP response secure headers
app.use(helmet());

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

app.listen(port, () => console.log(`Server running on port ${port}`));
