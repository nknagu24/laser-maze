/* =====================================================================
   LASER MAZE  —  screens/start.js
   ---------------------------------------------------------------------
   Fills in the start screen: draws the picture and decides whether to
   show the Continue button (and which level it names).
   ===================================================================== */

import { state } from "../state.js";
import { drawHero } from "../drawing/hero.js";
import { hasProgress, continueLevel } from "../rules/scoring.js";

export function renderStart(ui) {
  drawHero(ui.hero);

  // Show Continue if they've played before, or have just come back
  // from a level during this visit.
  ui.continueButton.hidden = !(hasProgress() || state.played);
  ui.continueButton.textContent = `Continue: Level ${continueLevel() + 1}`;
}
