/* =====================================================================
   LASER MAZE  —  screens/board.js
   ---------------------------------------------------------------------
   Fills in the board screen: works out the beam, draws the table and
   everything on it, updates the tray, records stars, and decides which
   bubble (if any) floats over the board.
   ===================================================================== */

import { SETTINGS } from "../settings.js";
import { LEVELS } from "../data/levels.js";
import { PIECES } from "../physics/pieces.js";
import {
  traceBeam, isSolved, isDetectorLit, hasEnough, hasTooMuch, missingColours,
} from "../physics/beam.js";
import { state } from "../state.js";
import { piecesLeft } from "../rules/moves.js";
import { starsFor, starText, recordStars, isUnlocked, isTraining, isWarmUp } from "../rules/scoring.js";
import { currentStep, guideFor } from "../rules/tutorial.js";
import { currentLevel, inSandbox, nextLevelIndex } from "../rules/current.js";
import { SANDBOX_EXTRAS } from "../data/sandbox.js";
import { sizeBoard } from "../drawing/canvas.js";
import { drawTable, drawHover, drawBeam } from "../drawing/board.js";
import { drawLaser, drawDetector, drawWall, drawPiece } from "../drawing/parts.js";
import { drawLabels, labelsFor } from "../drawing/labels.js";
import { drawGuideRing, drawTurnArrow } from "../drawing/guides.js";
import { renderPill, renderToast, renderBubble } from "./bubbles.js";


/* ---------------------------------------------------------------------
   buildTray — makes one tray card per piece type the level offers.
   Called once when a level opens. Each card is:
     • a big button with a small picture of the optic, its name, and
       how many are left (clicking it chooses that optic). On phones
       only the picture shows; the name appears on the chosen card
       (see styles/board.css).
     • a small ⓘ button in its top-right corner that explains the optic
   (Clicks on both are handled in game.js.)
   --------------------------------------------------------------------- */
const ICON_SIZE = 36;   // the optic's picture on the card, in pixels

/* An optic, or a Sandbox extra (the detector). */
export function trayItem(type) {
  return PIECES[type] || SANDBOX_EXTRAS[type];
}

export function buildTray(ui, level) {
  const types = Object.keys(level.tray || {});
  ui.tray.innerHTML = types
    .map((type) => `
      <div class="lm-card">
        <button class="lm-piece" data-type="${type}"
                aria-label="${trayItem(type).label}" title="${trayItem(type).label}">
          <canvas class="lm-piece-icon" aria-hidden="true"></canvas>
          <span class="lm-piece-name">${trayItem(type).label}</span>
          <span class="lm-piece-count"></span>
        </button>
        <button class="lm-piece-info" data-info="${type}"
                aria-label="About the ${trayItem(type).label}" title="About the ${trayItem(type).label}">i</button>
      </div>`)
    .join("");

  // Draw each card's little picture with the same code as the board,
  // so the card looks exactly like the optic on the table.
  ui.tray.querySelectorAll(".lm-piece").forEach((button) => {
    const canvas = button.querySelector(".lm-piece-icon");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = ICON_SIZE * dpr;
    canvas.height = ICON_SIZE * dpr;
    canvas.style.width = ICON_SIZE + "px";
    canvas.style.height = ICON_SIZE + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // a dark round "hole" behind it, like the table
    ctx.fillStyle = SETTINGS.colors.table;
    ctx.beginPath();
    ctx.roundRect(0, 0, ICON_SIZE, ICON_SIZE, 8);
    ctx.fill();

    const type = button.dataset.type;
    if (type === "detector") {
      drawDetector(ctx, ICON_SIZE, { row: 0, col: 0 }, 0);
    } else {
      drawPiece(ctx, ICON_SIZE, { row: 0, col: 0, type, angle: PIECES[type].angles[0] }, false);
    }
  });
}


/* ---------------------------------------------------------------------
   renderBoard — redraws the board screen.
   pulse: 0 to 1, makes the training guide glow (game.js supplies it).
   Hands back what game.js needs: the cell size in pixels (to turn taps
   into rows and columns) and whether the level is solved.
   --------------------------------------------------------------------- */
export function renderBoard(ui, pulse = 1) {
  const level = currentLevel();
  const sandbox = inSandbox();
  const { ctx, cell } = sizeBoard(
    ui.canvas, SETTINGS.rows, SETTINGS.cols, SETTINGS.maxBoardSize, ui.boardWrap
  );

  // Every piece on the table: the level's fixed ones + the player's.
  const pieces = [...(level.fixed || []), ...state.placed];

  // Physics first: where does the light go?
  const { segments, detectorPower, arrived, seen } = traceBeam(level, pieces, SETTINGS.rows, SETTINGS.cols);
  const solved = isSolved(level, detectorPower, seen);

  // Then drawing, bottom layer to top layer. (Skipped if the board
  // has no width yet, which can happen for a moment while loading.)
  if (cell > 0) {
    drawTable(ctx, cell, SETTINGS.rows, SETTINGS.cols);
    if (state.hover) drawHover(ctx, cell, state.hover);
    (level.walls || []).forEach((wall) => drawWall(ctx, cell, wall));
    drawBeam(ctx, cell, segments, usesPolarization(level));
    (level.fixed || []).forEach((piece) => drawPiece(ctx, cell, piece, true));
    state.placed.forEach((piece) => drawPiece(ctx, cell, piece, false));
    level.detectors.forEach((detector, i) =>
      drawDetector(ctx, cell, detector, detectorPower[i], seen[i])
    );
    drawLaser(ctx, cell, level.laser);
    drawLabels(ctx, cell, labelsFor(level, pieces));

    // Training guide on top of everything.
    const guide = guideFor(level);
    if (guide) {
      drawGuideRing(ctx, cell, guide.row, guide.col, pulse, !guide.arrow);
      if (guide.arrow) drawTurnArrow(ctx, cell, guide.row, guide.col, pulse);
    }
  }

  // Tray buttons: how many of each piece are left, which is chosen,
  // and which one to glow during a training "choose" step.
  const step = currentStep(level);
  ui.tray.querySelectorAll(".lm-piece").forEach((button) => {
    const type = button.dataset.type;
    const left = piecesLeft(level, type);
    const count = button.querySelector(".lm-piece-count");
    const text = left === Infinity ? "×∞" : `×${left}`;
    if (count.textContent !== text) count.textContent = text;
    button.classList.toggle("lm-empty", left === 0);
    button.classList.toggle("lm-selected", type === state.selected);
    button.classList.toggle("lm-attention", Boolean(step && step.select === type));
  });

  // Stars (saved only once the level is truly solved).
  let stars = 0;
  if (solved && !step && !sandbox) {
    stars = starsFor(level, state.placed.length);   // fixed pieces don't count
    recordStars(state.levelIndex, stars);
  }

  // Once the level stops being solved, a closed "Solved!" bubble may
  // appear again the next time it's solved.
  if (!solved) state.winClosed = false;

  // What floats over the board.
  renderToast(ui, state.toast);
  renderPill(ui, step ? "" : sandbox ? sandboxPill(detectorPower) : pillText(level, solved, stars, detectorPower, arrived, seen));
  renderBubble(ui, chooseBubble(level, step, solved && !sandbox, stars));
  renderSandboxControls(ui, level);

  return { cell, solved };
}


/* ---------------------------------------------------------------------
   usesPolarization — does this level have anything to do with
   polarization? If not (Training, Chapters 1–2), the beam is drawn
   without polarization badges, to keep the table uncluttered.
   --------------------------------------------------------------------- */
const POLARIZATION_PIECES = ["polarizer", "wollaston", "halfwave", "quarterwave", "pbs", "displacer"];

function usesPolarization(level) {
  const pieces = [...Object.keys(level.tray || {}), ...(level.fixed || []).map((p) => p.type)];
  return (
    level.laser.polarization !== undefined ||
    level.detectors.some((d) => d.accepts !== undefined) ||
    pieces.some((type) => POLARIZATION_PIECES.includes(type))
  );
}


/* ---------------------------------------------------------------------
   chooseBubble — which bubble to show, most important first:
     1. a training step
     2. an optic's explanation, if its small i was tapped
     3. "Solved!" (until the player closes it)
     4. the level's note, if the ⓘ button opened it
   --------------------------------------------------------------------- */
function chooseBubble(level, step, solved, stars) {
  if (step) {
    return {
      kind: "guide",
      text: step.say,
      wave: step.wave || null,
      button: step.next ? { label: step.next, action: "tutorial-next" } : null,
      closable: false,
    };
  }

  if (state.pieceInfo) {
    const piece = trayItem(state.pieceInfo);
    return {
      kind: "piece",
      title: piece.label,
      text: piece.about,
      more: piece.more || null,
      moreOpen: state.moreOpen,
      wave: piece.wave || null,
      button: null,
      closable: true,
    };
  }

  if (solved && !state.winClosed) {
    const next = nextLevelIndex();
    const hasNext = next !== -1 && isUnlocked(next);
    const used = state.placed.length;

    let text;
    if (isWarmUp(state.levelIndex)) {
      text = "Training complete!";
    } else if (isTraining(state.levelIndex)) {
      text = "Guide complete! Now try it yourself.";
    } else if (level.par === undefined) {
      text = "Solved!";
    } else {
      text = `${starText(stars)}  Solved with ${used} ${used === 1 ? "piece" : "pieces"}.`;
      if (stars < 3) text += ` Can you do it with ${level.par}?`;
    }
    if (next === -1) text += " That was the last level, for now!";

    return {
      kind: "win",
      text,
      button: hasNext ? { label: "Next level ›", action: "next-level" } : null,
      closable: true,
    };
  }

  if (state.infoOpen && level.note) {
    return { kind: "info", text: level.note, button: null, closable: true };
  }

  return null;
}


/* ---------------------------------------------------------------------
   Sandbox: the status line lists what each detector reads, and the
   panel shows the laser's colour and polarization buttons.
   --------------------------------------------------------------------- */
function sandboxPill(detectorPower) {
  if (detectorPower.length === 0) return "Choose Detector in the tray to measure the light.";
  const readings = detectorPower.map((p) => `${Math.round(p * 100)}%`).join(", ");
  return `Detectors read: ${readings}`;
}

function renderSandboxControls(ui, level) {
  ui.sandboxBox.hidden = !level.sandbox;
  if (!level.sandbox) return;
  const current = {
    color: level.laser.color,
    polarization: String(level.laser.polarization),
  };
  ui.sandboxBox.querySelectorAll(".lm-chips").forEach((group) => {
    group.querySelectorAll("button[data-value]").forEach((button) => {
      button.classList.toggle("lm-on", button.dataset.value === current[group.dataset.setting]);
    });
  });
}


/* ---------------------------------------------------------------------
   pillText — the small status line at the top of the board.
   --------------------------------------------------------------------- */
function pillText(level, solved, stars, detectorPower, arrived, seen) {
  const pct = (v) => Math.round(v * 100);

  if (solved) {
    return level.par === undefined || isTraining(state.levelIndex)
      ? "Solved!"
      : `${starText(stars)} Solved`;
  }

  const total = level.detectors.length;

  // A delicate sample getting too much light?
  const over = level.detectors.findIndex((d, i) => hasTooMuch(d, detectorPower[i]));
  if (over !== -1) {
    return `Too bright! A sample takes at most ${pct(level.detectors[over].max)}%, but gets ${pct(detectorPower[over])}%.`;
  }

  // A detector that gets some light, but not enough?
  const short = level.detectors.findIndex(
    (d, i) => detectorPower[i] > 0 && !hasEnough(d, detectorPower[i])
  );
  if (short !== -1) {
    return `A detector needs ${pct(level.detectors[short].need)}% but only gets ${pct(detectorPower[short])}%.`;
  }

  // A white detector still missing a colour?
  const white = level.detectors.findIndex(
    (d, i) => d.color === "white" && arrived[i] > 0 && missingColours(d, seen[i]).length > 0
  );
  if (white !== -1) {
    return `The white detector is still missing: ${missingColours(level.detectors[white], seen[white]).join(" and ")}.`;
  }

  // Light arriving, but none of it the colour or polarization it accepts?
  const wrong = level.detectors.findIndex((d, i) => arrived[i] > 0 && detectorPower[i] === 0);
  if (wrong !== -1) {
    return level.detectors[wrong].color
      ? `Light reaches a detector, but not the ${level.detectors[wrong].color} light it wants.`
      : "Light reaches a detector, but not the polarization it accepts.";
  }

  if (total === 1) return "The detector is still dark.";

  const lit = level.detectors.filter((d, i) => isDetectorLit(d, detectorPower[i], seen[i])).length;
  return `${lit} of ${total} detectors lit.`;
}
