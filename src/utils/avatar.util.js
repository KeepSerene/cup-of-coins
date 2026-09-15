/**
 * @license Apache-2.0
 * @copyright 2026 Dhrubajyoti Bhattacharjee
 */

"use strict";

// In sync with the .avatar-color-0 .. .avatar-color-{N-1} utility
// classes defined in public/css/utils.css
const AVATAR_COLOR_COUNT = 5;

/**
 * Deterministically maps a name to an index in [0, AVATAR_COLOR_COUNT), so
 * the same name always gets the same avatar color.
 */
function getAvatarColorIndex(seed) {
  const str = seed?.trim() || "Anonymous";
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // force 32-bit int, keeps this fast and overflow-safe
  }

  return Math.abs(hash) % AVATAR_COLOR_COUNT;
}

/**
 * Returns up to 2 uppercase initials from a display name.
 * Smartly handles X handles, accents, and punctuation.
 */
function getInitials(name) {
  const trimmed = name?.trim();

  if (!trimmed) return "A";

  // Strip leading '@' for X handles
  let cleanName = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;

  // Normalize accents (e.g., 'José' -> 'Jose')
  cleanName = cleanName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Strip apostrophes completely (e.g., "O'Connor" -> "OConnor")
  cleanName = cleanName.replace(/'/g, "");

  // Replace other non-alphanumeric chars (like '-', '_') with spaces
  // This turns "@john_doe" into "john doe" and "Mary-Jane" into "Mary Jane"
  cleanName = cleanName.replace(/[^a-zA-Z0-9\s]/g, " ");

  const parts = cleanName.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "A"; // fallback if name was entirely punctuation

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

module.exports = { getAvatarColorIndex, getInitials, AVATAR_COLOR_COUNT };
