/* =====================================================================
   LASER MAZE  —  screens/levels.js
   ---------------------------------------------------------------------
   Fills in the level-select screen: one group per chapter, one button
   per level showing its number and best stars. Locked levels are
   greyed out and can't be clicked. Training and Guide levels show
   "T1" or "G1", and "done" instead of stars.
   ===================================================================== */

import { LEVELS, CHAPTERS } from "../data/levels.js";
import { state } from "../state.js";
import { isUnlocked, bestStars, starText, isTraining, levelShortLabel } from "../rules/scoring.js";

export function renderLevels(ui) {
  let html = "";

  for (const [chapter, title] of Object.entries(CHAPTERS)) {
    const heading = chapter === "0" ? title : `Chapter ${chapter}: ${title}`;
    html += `<p class="lm-chapter">${heading}</p>`;
    html += `<div class="lm-level-grid">`;

    LEVELS.forEach((level, index) => {
      if (String(level.chapter) !== chapter) return;
      const locked = !isUnlocked(index);
      const current = index === state.levelIndex ? " lm-current" : "";

      let under;   // the small line under the number
      if (locked) under = "locked";
      else if (isTraining(index)) under = bestStars(index) > 0 ? "done" : "start";
      else under = starText(bestStars(index));
      html += `
        <button class="lm-pick${current}" data-index="${index}"
                ${locked ? "disabled" : ""} title="${level.name}">
          <span class="lm-pick-number">${levelShortLabel(index)}</span>
          <span class="lm-pick-stars">${under}</span>
        </button>`;
    });

    html += `</div>`;
  }

  html += `<button class="lm-home">Back to start screen</button>`;
  ui.levelPanel.innerHTML = html;
}
