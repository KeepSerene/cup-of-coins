/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

const { Polar } = require("@polar-sh/sdk");
const { HTTPClient } = require("@polar-sh/sdk/lib/http");

function requireEnv(key) {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

const POLAR_ACCESS_TOKEN = requireEnv("POLAR_ACCESS_TOKEN");
const POLAR_PRODUCT_ID = requireEnv("POLAR_PRODUCT_ID");
const POLAR_SUCCESS_URL = requireEnv("POLAR_SUCCESS_URL");
const POLAR_RETURN_URL = requireEnv("POLAR_RETURN_URL");
const POLAR_WEBHOOK_SECRET = requireEnv("POLAR_WEBHOOK_SECRET");

// Pin every outgoing request to the 2026-04 API contract so a quarterly
// Polar release can't silently change request/response shapes under us
const httpClient = new HTTPClient();

httpClient.addHook("beforeRequest", (request) => {
  const nextRequest = new Request(request);
  nextRequest.headers.set("Polar-Version", "2026-04");
  return nextRequest;
});

const polarClient = new Polar({
  accessToken: POLAR_ACCESS_TOKEN,
  server: "sandbox",
  httpClient,
});

module.exports = {
  polarClient,
  POLAR_PRODUCT_ID,
  POLAR_SUCCESS_URL,
  POLAR_RETURN_URL,
  POLAR_WEBHOOK_SECRET,
};
