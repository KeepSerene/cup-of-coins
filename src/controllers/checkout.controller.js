/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

async function checkoutController(req, res) {
  try {
    const { amount } = req.body;
  } catch (error) {
    console.error("Error in checkout controller:", error);

    throw error;
  }
}

module.exports = { checkoutController };
