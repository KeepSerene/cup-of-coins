/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

const {
  verifyPolarWebhook,
  WebhookVerificationError,
} = require("../utils/webhook.util");
const { Supporter } = require("../models/supporter.model");
const {
  POLAR_WEBHOOK_SECRET,
  POLAR_PRODUCT_ID,
} = require("../config/polar.config");
const { MAX_CONTRIBUTION } = require("../config/contribution.config");

async function polarWebhookController(req, res) {
  let event;

  try {
    event = verifyPolarWebhook(req.body, req.headers, POLAR_WEBHOOK_SECRET);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.error(
        "Polar webhook signature verification failed:",
        error.message,
      );

      return res.status(403).send("");
    }

    console.error("Error parsing Polar webhook payload:", error);

    return res.status(400).send("");
  }

  console.log("Received Polar webhook event:", event.type);

  try {
    if (event.type === "order.paid") {
      const order = event.data;

      if (order.product_id !== POLAR_PRODUCT_ID) {
        return res.status(202).send("");
      }

      if (order.total_amount > MAX_CONTRIBUTION * 100) {
        console.warn(
          `Contribution of $${(order.total_amount / 100).toFixed(2)} exceeds the site's advertised $${MAX_CONTRIBUTION} max (checkout ${order.checkout_id}).`,
        );
      }

      try {
        await Supporter.create({
          name:
            order.metadata?.supporterName ||
            order.customer?.name ||
            order.billing_name ||
            "Anonymous",
          email:
            order.metadata?.supporterEmail ||
            order.customer_email ||
            order.customer?.email,
          message: order.metadata?.supporterMessage || "",
          amountInCents: order.total_amount,
          polarCheckoutId: order.id,
        });
      } catch (error) {
        if (error?.code !== 11000) {
          throw error;
        }
      }
    }

    // Every other event type is acknowledged and ignored
    res.status(202).send("");
  } catch (error) {
    console.error("Error processing Polar webhook event:", error);

    // A 5xx tells Polar to retry the delivery later
    res.status(500).send("");
  }
}

module.exports = { polarWebhookController };
