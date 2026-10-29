/* =====================================================================
   LASER MAZE  —  screens/levels.js
   ---------------------------------------------------------------------
   Fills in the level-select screen: one group per chapter, one button
   per level showing its number and best stars. Locked levels are
   greyed out and can't be clicked.
   ===================================================================== */

import { LEVELS, CHAPTERS } from "../data/levels.js";
import { state } from "../state.js";
import { isUnlocked, bestStars, starText } from "../rules/scoring.js";

export function renderLevels(ui) {
  let html = "";

  for (const [chapter, title] of Object.entries(CHAPTERS)) {
    html += `<p class="lm-chapter">Chapter ${chapter}: ${title}</p>`;
    html += `<div class="lm-level-grid">`;

    LEVELS.forEach((level, index) => {
      if (String(level.chapter) !== chapter) return;
      const locked = !isUnlocked(index);
      const current = index === state.levelIndex ? " lm-current" : "";
      html += `
        <button class="lm-pick${current}" data-index="${index}"
                ${locked ? "disabled" : ""} title="${level.name}">
          <span class="lm-pick-number">${index + 1}</span>
          <span class="lm-pick-stars">${locked ? "locked" : starText(bestStars(index))}</span>
        </button>`;
    });

    html += `</div>`;
  }

  html += `<button class="lm-home">Back to start screen</button>`;
  ui.levelPanel.innerHTML = html;
}
