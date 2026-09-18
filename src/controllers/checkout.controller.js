/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

const {
  MIN_CONTRIBUTION,
  MAX_CONTRIBUTION,
} = require("../config/contribution.config");
const {
  polarClient,
  POLAR_PRODUCT_ID,
  POLAR_SUCCESS_URL,
  POLAR_RETURN_URL,
} = require("../config/polar.config");

const MAX_MESSAGE_LENGTH = 500;

// Standard names or X handles
const nameRegex = /^([a-zA-Z\s\-']+|@[a-zA-Z0-9_]{1,15})$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

async function checkoutController(req, res) {
  try {
    const { amount, name, email, message } = req.body;
    const parsedAmount = Number(amount);

    // --- VALIDATIONS ---
    if (
      !Number.isInteger(parsedAmount) ||
      parsedAmount < MIN_CONTRIBUTION ||
      parsedAmount > MAX_CONTRIBUTION
    ) {
      return res.status(400).json({
        error: `Amount must be a whole number between $${MIN_CONTRIBUTION} and $${MAX_CONTRIBUTION}.`,
      });
    }

    const clampedAmount = clamp(
      parsedAmount,
      MIN_CONTRIBUTION,
      MAX_CONTRIBUTION,
    );

    const rawEmail = (email || "").trim();

    if (!rawEmail || !emailRegex.test(rawEmail)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address." });
    }

    const rawName = (name || "").trim();

    if (rawName) {
      if (rawName.length < 2 || rawName.length > 60) {
        return res
          .status(400)
          .json({ error: "Name must be between 2 and 60 characters." });
      }

      if (!nameRegex.test(rawName)) {
        return res
          .status(400)
          .json({ error: "Invalid name or X handle format." });
      }
    }

    const supporterName = rawName || "Anonymous";
    const rawMessage = (message || "").trim();

    if (rawMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    const supporterMessage = rawMessage;
    const metadata = { supporterName, supporterEmail: rawEmail };

    if (supporterMessage) {
      metadata.supporterMessage = supporterMessage;
    }

    const checkout = await polarClient.checkouts.create({
      products: [POLAR_PRODUCT_ID],
      amount: clampedAmount * 100, // dollars -> cents
      customerEmail: rawEmail,
      customerName: supporterName,
      successUrl: POLAR_SUCCESS_URL,
      returnUrl: POLAR_RETURN_URL,
      // Round-tripped back to us on the `order.paid` webhook so we can save
      // the supporter's note without asking Polar to persist app-specific data
      metadata,
    });

    res.status(200).json({ checkoutUrl: checkout.url });
  } catch (error) {
    console.error("Error in checkout controller:", error);

    res.status(502).json({
      error: "Could not start the checkout. Try again in a moment.",
    });
  }
}

module.exports = { checkoutController };
