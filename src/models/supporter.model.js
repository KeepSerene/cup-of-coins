/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const supporterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "Anonymous",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [emailRegex, "Please enter a valid email address."],
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    amountInCents: {
      type: Number,
      required: true,
      min: 100, // $1 minimum
    },
    // Ties a supporter record to the Polar checkout that produced it, so a
    // retried webhook delivery never inserts the same contribution twice
    polarCheckoutId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

// The "recent supporters" query is always "latest N" — index the sort field
supporterSchema.index({ createdAt: -1 });

const Supporter = mongoose.model("Supporter", supporterSchema);

module.exports = { Supporter };
