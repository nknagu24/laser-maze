/* =====================================================================
   LASER MAZE  —  screens/start.js
   ---------------------------------------------------------------------
   Fills in the start screen. It has three small views, one at a time:
     "menu"      Story mode / Jump to a chapter / Sandbox
     "story"     Continue / New game
     "chapters"  every chapter, each with "With tutorial" and
                 "Without tutorial" (or just "Start" if it has none)
   ===================================================================== */

import { CHAPTERS } from "../data/levels.js";
import { state } from "../state.js";
import { drawHero } from "../drawing/hero.js";
import { hasProgress, continueLevel, levelLabel, chapterStarts } from "../rules/scoring.js";

export function renderStart(ui) {
  drawHero(ui.hero);

  // Show only the current view.
  ui.startViews.forEach((view) => {
    view.hidden = view.dataset.view !== state.startView;
  });

  // Story mode: show Continue if they've played before, or have just
  // come back from a level during this visit.
  ui.continueButton.hidden = !(hasProgress() || state.played);
  ui.continueButton.textContent = `Continue: ${levelLabel(continueLevel())}`;

  // Jump to a chapter: one row per chapter. (Built only when that view
  // is open; the buttons carry the level to start at.)
  if (state.startView === "chapters") {
    ui.chapterList.innerHTML = chapterStarts()
      .map(({ chapter, guided, plain }) => {
        const buttons = guided !== undefined
          ? `<button data-start="${guided}" data-guides="yes">With tutorial</button>
             <button data-start="${plain}" data-guides="no">Without tutorial</button>`
          : `<button data-start="${plain}" data-guides="no">Start</button>`;
        return `
          <div class="lm-chapter-row">
            <p class="lm-chapter-name">Chapter ${chapter}: ${CHAPTERS[chapter]}</p>
            <div class="lm-chapter-buttons">${buttons}</div>
          </div>`;
      })
      .join("");
  }
}
