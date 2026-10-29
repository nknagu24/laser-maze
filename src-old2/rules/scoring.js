/* =====================================================================
   LASER MAZE  —  rules/scoring.js
   ---------------------------------------------------------------------
   Stars, unlocking, and where "Continue" should take the player.
   ===================================================================== */

import { LEVELS } from "../data/levels.js";
import { state } from "../state.js";
import { saveProgress } from "../storage/progress.js";


/* Stars for solving a level with `used` pieces:
   par or fewer → 3, one over par → 2, anything more → 1. */
export function starsFor(level, used) {
  if (used <= level.par) return 3;
  if (used === level.par + 1) return 2;
  return 1;
}

/* Turns a number of stars into text, e.g. 2 → "★★☆". */
export function starText(count) {
  return "★".repeat(count) + "☆".repeat(3 - count);
}

/* Best stars saved for a level (0 if never solved). */
export function bestStars(index) {
  return state.progress.stars[LEVELS[index].name] || 0;
}

/* Remember a result, but only if it beats the player's best. */
export function recordStars(index, stars) {
  if (stars > bestStars(index)) {
    state.progress.stars[LEVELS[index].name] = stars;
    saveProgress(state.progress);
  }
}

/* The first level is always open; every other level opens once the
   level before it has been solved. */
export function isUnlocked(index) {
  return index === 0 || bestStars(index - 1) > 0;
}

/* Has this visitor played before? (Any stars, or past Level 1.) */
export function hasProgress() {
  return Object.keys(state.progress.stars).length > 0 || state.progress.lastLevel > 0;
}

/* The level "Continue" should open: the last one played, if it still
   exists and is unlocked; otherwise Level 1. */
export function continueLevel() {
  const last = state.progress.lastLevel;
  return last < LEVELS.length && isUnlocked(last) ? last : 0;
}
