/* =====================================================================
   LASER MAZE  —  screens/bar.js
   ---------------------------------------------------------------------
   The bar above the board:   ‹   Level 1: First Bounce ▾   ›
   Shown on both the board and the level-select screens.

   It is filled in AFTER the board, because solving a level can unlock
   the next one, and the › button should know about that straight away.
   ===================================================================== */

import { LEVELS } from "../data/levels.js";
import { state } from "../state.js";
import { isUnlocked } from "../rules/scoring.js";

/* solved: true if the level on the board is solved right now. */
export function renderBar(ui, solved) {
  const level = LEVELS[state.levelIndex];

  // The level name doubles as the button that opens level select.
  ui.levelName.textContent = `Level ${state.levelIndex + 1}: ${level.name} ▾`;
  ui.levelName.setAttribute("aria-expanded", String(state.screen === "levels"));

  // ‹ is greyed out on the first level; › on the last level, or
  // while the next level is still locked.
  const next = state.levelIndex + 1;
  ui.prevButton.disabled = state.levelIndex === 0;
  ui.nextButton.disabled = next >= LEVELS.length || !isUnlocked(next);

  // Make › pulse once a level is solved and the next one is open.
  ui.nextButton.classList.toggle("lm-ready", solved && !ui.nextButton.disabled);
}
