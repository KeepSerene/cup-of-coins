/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

const { Supporter } = require("../models/supporter.model");
const { getAvatarColorIndex, getInitials } = require("../utils/avatar.util");

const RECENT_SUPPORTERS_LIMIT = 5;

async function homeController(req, res) {
  try {
    const recentSupporterDocs = await Supporter.find()
      .sort({ createdAt: -1 })
      .limit(RECENT_SUPPORTERS_LIMIT)
      .lean();

    const recentSupporters = recentSupporterDocs.map((supporter) => ({
      name: supporter.name,
      message: supporter.message,
      amount: Math.round(supporter.amountInCents / 100),
      initials: getInitials(supporter.name),
      avatarColorIndex: getAvatarColorIndex(supporter.name),
    }));

    res.render("./pages/home", {
      recentSupporters,
      showThankYouBanner: req.query.success === "true",
    });
  } catch (error) {
    console.error("Error in home controller:", error);

    res.render("./pages/home", {
      recentSupporters: [],
      showThankYouBanner: req.query.success === "true",
    });
  }
}

module.exports = { homeController };
