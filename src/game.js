/* =====================================================================
   LASER MAZE  —  game.js
   ---------------------------------------------------------------------
   The conductor. It doesn't draw or calculate anything itself; it
   decides which screen is showing, asks the screens/ files to fill
   them in, and connects every button and tap to the right action.

   Three screens, only one shown at a time:
     "start"   title and menu (Story mode, Jump to a chapter, Sandbox)
     "board"   the optical table you play on
     "levels"  the level-select screen

   Whenever a new screen, start-menu view, or level appears, it fades
   in gently (see fadeIn below and styles/card.css).
   ===================================================================== */

import { SETTINGS } from "./settings.js";
import { LEVELS } from "./data/levels.js";
import { state } from "./state.js";
import { buildFrame } from "./frame.js";
import { saveProgress, clearProgress, loadProgress } from "./storage/progress.js";
import { handleTap, isTakenByLevel } from "./rules/moves.js";
import { isUnlocked, hasProgress, continueLevel, openLevel } from "./rules/scoring.js";
import { currentLevel, inSandbox, nextLevelIndex, previousLevelIndex } from "./rules/current.js";
import { freshSandbox } from "./data/sandbox.js";
import {
  currentStep, advance, isStepDone, checkTap, checkTraySelect, guideFor,
} from "./rules/tutorial.js";
import { renderStart } from "./screens/start.js";
import { renderBar } from "./screens/bar.js";
import { renderLevels } from "./screens/levels.js";
import { renderBoard, buildTray } from "./screens/board.js";


export function startGame(mount) {
  const ui = buildFrame(mount);
  let cell = 0;   // current cell size in pixels (set each time the board is drawn)

  // Visitors who ask their device for less motion get a steady guide
  // instead of a pulsing one.
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* ===================================================================
     FADING IN
     Restarting a CSS animation needs a small trick: remove the class,
     make the browser notice (reading offsetWidth does that), add it back.
     =================================================================== */
  function fadeIn(element) {
    element.classList.remove("lm-fade");
    void element.offsetWidth;
    element.classList.add("lm-fade");
  }

  // What was showing last time, so we only fade when it changes.
  let shown = { screen: null, view: null, level: null };

  function fadeChanges() {
    const level = inSandbox() ? "sandbox" : state.levelIndex;
    if (state.screen !== shown.screen) {
      if (state.screen === "start") fadeIn(ui.start);
      if (state.screen === "levels") fadeIn(ui.levelPanel);
      if (state.screen === "board") fadeIn(ui.play);
    } else if (state.screen === "start" && state.startView !== shown.view) {
      ui.startViews.forEach((view) => {
        if (view.dataset.view === state.startView) fadeIn(view);
      });
    } else if (state.screen === "board" && level !== shown.level) {
      fadeIn(ui.play);
    }
    shown = { screen: state.screen, view: state.startView, level };
  }


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
      // The guide's glow rises and falls smoothly (a sine wave).
      const pulse = calm ? 1 : (Math.sin(performance.now() / 300) + 1) / 2;
      const result = renderBoard(ui, pulse);
      cell = result.cell;
      renderBar(ui, result.solved);
    }

    fadeChanges();
  }


  /* ===================================================================
     THE GLOWING GUIDE
     During a training step that points at a hole, the board is
     redrawn about 60 times a second so the ring can pulse. The loop
     stops by itself as soon as there's nothing to point at.
     =================================================================== */
  let animating = false;

  function needsAnimation() {
    return !calm && state.screen === "board" && guideFor(currentLevel()) !== null;
  }

  function startAnimation() {
    if (animating || !needsAnimation()) return;
    animating = true;
    const tick = () => {
      if (!needsAnimation()) {
        animating = false;
        return;
      }
      redraw();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }


  /* ===================================================================
     THE POP-UP ("Not there! …")
     =================================================================== */
  let toastTimer = null;

  function showToast(message) {
    state.toast = message;
    redraw();
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      state.toast = "";
      redraw();
    }, SETTINGS.toastSeconds * 1000);
  }


  /* ===================================================================
     MOVING BETWEEN LEVELS AND SCREENS
     =================================================================== */

  /* Open a level: clear the table, fill the tray, show the board.
     showNote: open the ⓘ note bubble straight away (true when a level
     is first opened, false for Reset). */
  function loadLevel(index, showNote = true) {
    const level = LEVELS[index];
    state.mode = "story";
    state.levelIndex = index;
    state.placed = [];
    state.hover = null;
    state.screen = "board";
    state.played = true;
    state.selected = Object.keys(level.tray || {})[0] || null;
    state.tutorialStep = 0;
    state.infoOpen = showNote && !level.tutorial;
    state.pieceInfo = null;
    state.winClosed = false;
    state.toast = "";

    // Remember where the visitor is, for their next visit.
    state.progress.lastLevel = level.name;
    saveProgress(state.progress);

    buildTray(ui, level);
    redraw();
    startAnimation();
  }

  function showScreen(name) {
    state.screen = name;
    redraw();
    startAnimation();
  }

  /* Open the Sandbox: a fresh empty table every time. */
  function openSandbox() {
    state.mode = "sandbox";
    state.sandbox = freshSandbox();
    state.placed = [];
    state.hover = null;
    state.screen = "board";
    state.selected = "mirror";
    state.tutorialStep = 0;
    state.infoOpen = true;
    state.pieceInfo = null;
    state.winClosed = false;
    state.toast = "";
    buildTray(ui, state.sandbox);
    redraw();
  }

  /* Reset: clear the table (story level or Sandbox). */
  function resetTable() {
    if (inSandbox()) {
      state.placed = [];
      state.sandbox.detectors = [];
      redraw();
    } else {
      loadLevel(state.levelIndex, false);
    }
  }

  /* After the player does something on a training level, check
     whether the current step is finished, and if so move on. */
  function checkTutorialProgress() {
    const level = currentLevel();
    const step = currentStep(level);
    if (step && isStepDone(step)) advance(level);
    startAnimation();
  }


  /* ===================================================================
     THE BOARD: taps, hover
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
    const level = currentLevel();

    // During training, only the tap the current step asks for is allowed.
    const problem = checkTap(level, spot.row, spot.col);
    if (problem) {
      showToast(problem);
      return;
    }

    handleTap(level, spot.row, spot.col);
    checkTutorialProgress();
    redraw();
  });

  // Moving the mouse over the board: highlight holes you can use.
  ui.canvas.addEventListener("mousemove", (event) => {
    const level = currentLevel();
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


  /* ===================================================================
     THE MESSAGE PANEL (beside or above the board)
     One listener catches clicks on any button inside it; each button
     says what it does in its data-action.
     =================================================================== */
  ui.panel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const level = currentLevel();
    const action = button.dataset.action;

    if (action === "tutorial-next") {
      advance(level);
      startAnimation();
    } else if (action === "next-level") {
      loadLevel(nextLevelIndex());
      return;
    } else if (action === "close") {
      // Close whichever bubble is showing.
      if (ui.bubble.dataset.kind === "win") state.winClosed = true;
      if (ui.bubble.dataset.kind === "info") state.infoOpen = false;
      if (ui.bubble.dataset.kind === "piece") state.pieceInfo = null;
    }
    redraw();
  });


  /* ===================================================================
     THE TRAY AND THE BUTTONS BESIDE IT
     =================================================================== */

  // The tray. One listener on the whole tray catches clicks on any of
  // its cards: either the small i (explain this optic) or the card
  // itself (choose this optic).
  ui.tray.addEventListener("click", (event) => {
    const info = event.target.closest(".lm-piece-info");
    if (info) {
      const type = info.dataset.info;
      state.pieceInfo = state.pieceInfo === type ? null : type;   // tap again to close
      redraw();
      return;
    }

    const button = event.target.closest(".lm-piece");
    if (!button) return;
    const level = currentLevel();

    const problem = checkTraySelect(level, button.dataset.type);
    if (problem) {
      showToast(problem);
      return;
    }

    state.selected = button.dataset.type;
    checkTutorialProgress();
    redraw();
  });

  // Reset: clear the table. On a training level this restarts the
  // training from its first step.
  ui.resetButton.addEventListener("click", resetTable);

  // Sandbox: the laser's colour and polarization buttons.
  ui.sandboxBox.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-value]");
    if (!button || !inSandbox()) return;
    const setting = button.closest(".lm-chips").dataset.setting;   // "color" or "polarization"
    let value = button.dataset.value;
    if (setting === "polarization" && !isNaN(Number(value))) value = Number(value);   // "45" → 45
    state.sandbox.laser[setting] = value;
    redraw();
  });

  // ⓘ: show or hide the level's note.
  ui.infoButton.addEventListener("click", () => {
    state.pieceInfo = null;                       // the level note replaces an optic's
    state.infoOpen = !state.infoOpen;
    if (state.infoOpen) state.winClosed = true;   // the note replaces "Solved!"
    redraw();
  });

  // Home: back to the start screen. The level stays as it is, so
  // "Continue" brings the player straight back to it.
  ui.homeButton.addEventListener("click", () => {
    state.startView = "menu";
    showScreen("start");
  });


  /* ===================================================================
     THE BAR: ‹ › and the level name
     =================================================================== */

  // The ‹ and › buttons: move one level back or forward (skipping
  // guided levels after "Jump to a chapter → without tutorial").
  [ui.prevButton, ui.nextButton].forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.move === "1" ? nextLevelIndex() : previousLevelIndex();
      if (target !== -1 && isUnlocked(target)) loadLevel(target);
    });
  });

  // Clicking the level name opens or closes the level-select screen.
  ui.levelName.addEventListener("click", () => {
    if (inSandbox()) return;
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
    if (event.target.closest(".lm-home")) {
      state.startView = "menu";
      showScreen("start");
    }
  });


  /* ===================================================================
     THE START SCREEN
     =================================================================== */

  // Menu buttons and "‹ Back": each says where it goes in data-go.
  ui.start.addEventListener("click", (event) => {
    const go = event.target.closest("[data-go]");
    if (go) {
      if (go.dataset.go === "sandbox") {
        openSandbox();
      } else {
        state.startView = go.dataset.go;   // "story", "chapters" or "menu"
        redraw();
      }
      return;
    }

    // Jump to a chapter: each button carries the level to start at,
    // and whether to keep the guided levels.
    const jump = event.target.closest("[data-start]");
    if (jump) {
      const index = Number(jump.dataset.start);
      state.skipGuides = jump.dataset.guides === "no";
      openLevel(index);   // keep it open from now on
      loadLevel(index);
    }
  });

  // Story mode → Continue opens the level they were on. If they only
  // stepped out to the start screen during this visit, go straight back
  // to the board with their pieces still in place.
  ui.continueButton.addEventListener("click", () => {
    state.skipGuides = false;
    if (state.played && state.mode === "story" && state.levelIndex === continueLevel()) {
      showScreen("board");
    } else {
      loadLevel(continueLevel());
    }
  });

  // Story mode → New game: starts at the first training level. If there
  // is saved progress, ask first, because starting over clears it.
  ui.newButton.addEventListener("click", () => {
    if (hasProgress()) {
      const sure = confirm("Start a new game? This clears all your stars.");
      if (!sure) return;
      clearProgress();
      state.progress = loadProgress();
    }
    state.skipGuides = false;
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
