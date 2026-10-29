/* =====================================================================
   LASER MAZE  —  game.js
   ---------------------------------------------------------------------
   The conductor. It doesn't draw or calculate anything itself; it
   decides which screen is showing, asks the screens/ files to fill
   them in, and connects every button and tap to the right action.

   Three screens, only one shown at a time:
     "start"   title, introduction, New game / Continue
     "board"   the optical table you play on
     "levels"  the level-select screen
   ===================================================================== */

import { SETTINGS } from "./settings.js";
import { LEVELS } from "./data/levels.js";
import { state } from "./state.js";
import { buildFrame } from "./frame.js";
import { saveProgress, clearProgress, loadProgress } from "./storage/progress.js";
import { handleTap, isTakenByLevel } from "./rules/moves.js";
import { isUnlocked, hasProgress, continueLevel } from "./rules/scoring.js";
import { renderStart } from "./screens/start.js";
import { renderBar } from "./screens/bar.js";
import { renderLevels } from "./screens/levels.js";
import { renderBoard, buildTray } from "./screens/board.js";


export function startGame(mount) {
  const ui = buildFrame(mount);
  let cell = 0;   // current cell size in pixels (set each time the board is drawn)


  /* ===================================================================
     REDRAW — runs whenever anything changes.
     =================================================================== */
  function redraw() {
    // 1) Show only the parts that belong to the current screen. This
    //    happens first, so whatever is drawn next is measured while
    //    it is visible.
    ui.start.hidden = state.screen !== "start";
    ui.bar.hidden = state.screen === "start";
    ui.levelPanel.hidden = state.screen !== "levels";
    ui.play.hidden = state.screen !== "board";

    // 2) Fill in whichever screen is showing.
    if (state.screen === "start") {
      renderStart(ui);
    } else if (state.screen === "levels") {
      renderBar(ui, false);
    } else {
      const result = renderBoard(ui);
      cell = result.cell;
      renderBar(ui, result.solved);
    }
  }


  /* ===================================================================
     MOVING BETWEEN LEVELS AND SCREENS
     =================================================================== */

  /* Open a level: clear the table, fill the tray, show the board. */
  function loadLevel(index) {
    const level = LEVELS[index];
    state.levelIndex = index;
    state.placed = [];
    state.hover = null;
    state.screen = "board";
    state.played = true;
    state.selected = Object.keys(level.tray || {})[0] || null;

    // Remember where the visitor is, for their next visit.
    state.progress.lastLevel = index;
    saveProgress(state.progress);

    buildTray(ui, level);
    redraw();
  }

  function showScreen(name) {
    state.screen = name;
    redraw();
  }


  /* ===================================================================
     THE BOARD: taps, hover, tray, Reset, Home
     =================================================================== */

  /* Turns a mouse or finger position into a (row, col).
     offsetX / offsetY are measured from the canvas's top-left corner. */
  function cellAt(event) {
    const col = Math.floor(event.offsetX / cell);
    const row = Math.floor(event.offsetY / cell);
    const inside = row >= 0 && row < SETTINGS.rows && col >= 0 && col < SETTINGS.cols;
    return inside ? { row, col } : null;
  }

  // Tapping or clicking the board.
  ui.canvas.addEventListener("click", (event) => {
    const spot = cellAt(event);
    if (!spot) return;
    handleTap(LEVELS[state.levelIndex], spot.row, spot.col);
    redraw();
  });

  // Moving the mouse over the board: highlight holes you can use.
  ui.canvas.addEventListener("mousemove", (event) => {
    const level = LEVELS[state.levelIndex];
    const spot = cellAt(event);
    const usable = spot && !isTakenByLevel(level, spot.row, spot.col);
    const newHover = usable ? spot : null;

    // Only redraw if the highlighted cell actually changed.
    const changed =
      (newHover && !state.hover) ||
      (!newHover && state.hover) ||
      (newHover && (newHover.row !== state.hover.row || newHover.col !== state.hover.col));
    if (changed) {
      state.hover = newHover;
      redraw();
    }
  });

  ui.canvas.addEventListener("mouseleave", () => {
    state.hover = null;
    redraw();
  });

  // Choosing a piece in the tray. (One listener on the whole tray
  // catches clicks on any of its buttons.)
  ui.tray.addEventListener("click", (event) => {
    const button = event.target.closest(".lm-piece");
    if (!button) return;
    state.selected = button.dataset.type;
    redraw();
  });

  // Reset: take every placed piece back.
  ui.resetButton.addEventListener("click", () => {
    state.placed = [];
    redraw();
  });

  // Home: back to the start screen. The level stays as it is, so
  // "Continue" brings the player straight back to it.
  ui.homeButton.addEventListener("click", () => showScreen("start"));


  /* ===================================================================
     THE BAR: ‹ › and the level name
     =================================================================== */

  // The ‹ and › buttons: move one level back or forward.
  [ui.prevButton, ui.nextButton].forEach((button) => {
    button.addEventListener("click", () => {
      const target = state.levelIndex + Number(button.dataset.move);   // −1 or +1
      if (target >= 0 && target < LEVELS.length && isUnlocked(target)) {
        loadLevel(target);
      }
    });
  });

  // Clicking the level name opens or closes the level-select screen.
  ui.levelName.addEventListener("click", () => {
    if (state.screen === "levels") {
      showScreen("board");
    } else {
      renderLevels(ui);
      showScreen("levels");
    }
  });


  /* ===================================================================
     THE LEVEL-SELECT SCREEN
     =================================================================== */
  ui.levelPanel.addEventListener("click", (event) => {
    // A level button: open that level.
    const pick = event.target.closest(".lm-pick");
    if (pick && !pick.disabled) {
      loadLevel(Number(pick.dataset.index));
      return;
    }

    // "Back to start screen".
    if (event.target.closest(".lm-home")) showScreen("start");
  });


  /* ===================================================================
     THE START SCREEN
     =================================================================== */

  // Continue opens the level they were on. If they only stepped out to
  // the start screen during this visit, go straight back to the board
  // with their mirrors still in place.
  ui.continueButton.addEventListener("click", () => {
    if (state.played && state.levelIndex === continueLevel()) {
      showScreen("board");
    } else {
      loadLevel(continueLevel());
    }
  });

  // New game. If there is saved progress, ask first, because starting
  // over clears all their stars.
  ui.newButton.addEventListener("click", () => {
    if (hasProgress()) {
      const sure = confirm("Start a new game? This clears all your stars.");
      if (!sure) return;
      clearProgress();
      state.progress = loadProgress();
    }
    loadLevel(0);
  });


  /* ===================================================================
     START-UP
     =================================================================== */

  // Redraw whenever the game card changes size (window resized,
  // phone rotated).
  new ResizeObserver(redraw).observe(ui.game);

  // Begin on the start screen.
  redraw();
}
