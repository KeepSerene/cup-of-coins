/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

const router = require("express").Router();
const { homeController } = require("../controllers/home.controller");

router.get("/", homeController);

module.exports = router;
