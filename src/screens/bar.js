/* =====================================================================
   LASER MAZE  —  screens/bar.js
   ---------------------------------------------------------------------
   The bar above the board:   ‹   Level 1: First Bounce ▾   ›
                         or   ‹   Training 1: First Steps ▾   ›
                         or       Sandbox
   Shown on both the board and the level-select screens.

   It is filled in AFTER the board, because solving a level can unlock
   the next one, and the › button should know about that straight away.
   ===================================================================== */

import { LEVELS } from "../data/levels.js";
import { state } from "../state.js";
import { isUnlocked, levelLabel } from "../rules/scoring.js";
import { inSandbox, nextLevelIndex, previousLevelIndex } from "../rules/current.js";

/* solved: true if the level on the board is solved right now. */
export function renderBar(ui, solved) {
  // The Sandbox has no levels to move between.
  const sandbox = inSandbox();
  ui.prevButton.hidden = sandbox;
  ui.nextButton.hidden = sandbox;
  ui.levelName.disabled = sandbox;
  if (sandbox) {
    if (ui.levelName.textContent !== "Sandbox") ui.levelName.textContent = "Sandbox";
    return;
  }

  // The level name doubles as the button that opens level select.
  const level = LEVELS[state.levelIndex];
  const text = `${levelLabel(state.levelIndex)}: ${level.name} ▾`;
  if (ui.levelName.textContent !== text) ui.levelName.textContent = text;
  ui.levelName.setAttribute("aria-expanded", String(state.screen === "levels"));

  // ‹ is greyed out on the first level; › on the last level, or while
  // the next level is still locked. (With "without tutorial", guided
  // levels are skipped over.)
  const previous = previousLevelIndex();
  const next = nextLevelIndex();
  ui.prevButton.disabled = previous === -1;
  ui.nextButton.disabled = next === -1 || !isUnlocked(next);

  // Make › pulse once a level is solved and the next one is open.
  ui.nextButton.classList.toggle("lm-ready", solved && !ui.nextButton.disabled);
}
