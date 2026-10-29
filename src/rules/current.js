/* =====================================================================
   LASER MAZE  —  rules/current.js
   ---------------------------------------------------------------------
   Which level is on the table right now, and which levels come before
   and after it. (In the Sandbox, the "level" is the Sandbox table.)
   ===================================================================== */

import { LEVELS } from "../data/levels.js";
import { state } from "../state.js";

export function inSandbox() {
  return state.mode === "sandbox";
}

/* The level being played: a story level, or the Sandbox table. */
export function currentLevel() {
  return inSandbox() ? state.sandbox : LEVELS[state.levelIndex];
}

/* The next level to play after `from`, or −1 if there is none.
   When the player chose "without guides", guided levels are skipped. */
export function nextLevelIndex(from = state.levelIndex) {
  for (let i = from + 1; i < LEVELS.length; i++) {
    if (!(state.skipGuides && LEVELS[i].tutorial)) return i;
  }
  return -1;
}

/* The level before `from`, or −1 if there is none. */
export function previousLevelIndex(from = state.levelIndex) {
  for (let i = from - 1; i >= 0; i--) {
    if (!(state.skipGuides && LEVELS[i].tutorial)) return i;
  }
  return -1;
}
