/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

const crypto = require("crypto");

// Standard Webhooks spec's default replay-protection window
const TOLERANCE_SECONDS = 5 * 60;

class WebhookVerificationError extends Error {}

/**
 * Verifies a Standard Webhooks-signed request (the spec Polar's webhooks
 * follow) and returns the parsed JSON event on success
 */
function verifyPolarWebhook(rawBody, headers, secret) {
  const id = headers["webhook-id"];
  const timestamp = headers["webhook-timestamp"];
  const signatureHeader = headers["webhook-signature"];

  if (!id || !timestamp || !signatureHeader) {
    throw new WebhookVerificationError("Missing required webhook headers.");
  }

  const skewSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));

  if (!Number.isFinite(skewSeconds) || skewSeconds > TOLERANCE_SECONDS) {
    throw new WebhookVerificationError("Webhook timestamp outside tolerance.");
  }

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${id}.${timestamp}.${rawBody.toString("utf-8")}`;
  const expectedSignature = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");
  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

  // The header can carry multiple space-separated "v1,<sig>" values (e.g.
  // during secret rotation) — a match against any one of them is valid
  const isValid = signatureHeader.split(" ").some((candidate) => {
    const [version, signature] = candidate.split(",");

    if (version !== "v1" || !signature) return false;

    const candidateBuffer = Buffer.from(signature, "utf-8");

    return (
      candidateBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(candidateBuffer, expectedBuffer)
    );
  });

  if (!isValid) {
    throw new WebhookVerificationError("No matching signature found.");
  }

  return JSON.parse(rawBody.toString("utf-8"));
}

module.exports = { verifyPolarWebhook, WebhookVerificationError };
