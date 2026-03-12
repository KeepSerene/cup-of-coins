/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

const router = require("express").Router();
const { checkoutController } = require("../controllers/checkout.controller");

router.post("/", checkoutController);

module.exports = router;
