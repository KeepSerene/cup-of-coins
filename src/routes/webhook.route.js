/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

const express = require("express");
const router = express.Router();
const { polarWebhookController } = require("../controllers/webhook.controller");

// Polar signs the *raw* request body, so this route needs the unparsed
// buffer — that's why this middleware is scoped to just this route instead
// of relying on any global JSON/urlencoded parser.
router.post(
  "/polar",
  express.raw({ type: "application/json" }),
  polarWebhookController,
);

module.exports = router;
