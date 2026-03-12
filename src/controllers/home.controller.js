/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

async function homeController(req, res) {
  try {
    res.render("./pages/home");
  } catch (error) {
    console.error("Error in home controller:", error);
  }
}

module.exports = { homeController };
