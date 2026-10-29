/* =====================================================================
   LASER MAZE  —  screens/board.js
   ---------------------------------------------------------------------
   Fills in the board screen: works out the beam, draws the table and
   everything on it, updates the tray counts, the status line and the
   note, and records stars when the level is solved.
   ===================================================================== */

import { SETTINGS } from "../settings.js";
import { LEVELS } from "../data/levels.js";
import { PIECES } from "../physics/pieces.js";
import { traceBeam, isSolved, isDetectorLit, hasEnough, hasTooMuch } from "../physics/beam.js";
import { state } from "../state.js";
import { piecesLeft } from "../rules/moves.js";
import { starsFor, starText, recordStars } from "../rules/scoring.js";
import { sizeBoard } from "../drawing/canvas.js";
import { drawTable, drawHover, drawBeam } from "../drawing/board.js";
import { drawLaser, drawDetector, drawWall, drawPiece } from "../drawing/parts.js";


/* ---------------------------------------------------------------------
   buildTray — makes one tray button per piece type the level offers.
   Called once when a level opens. (Clicks on these buttons are
   handled in game.js.)
   --------------------------------------------------------------------- */
export function buildTray(ui, level) {
  const types = Object.keys(level.tray || {});
  ui.tray.innerHTML = types
    .map((type) => `<button class="lm-piece" data-type="${type}"></button>`)
    .join("");
}


/* ---------------------------------------------------------------------
   renderBoard — redraws the board screen. It hands back two things
   game.js needs: the cell size in pixels (to turn taps into rows and
   columns) and whether the level is solved (for the › button).
   --------------------------------------------------------------------- */
export function renderBoard(ui) {
  const level = LEVELS[state.levelIndex];
  const { ctx, cell } = sizeBoard(ui.canvas, SETTINGS.rows, SETTINGS.cols, SETTINGS.maxBoardSize);

  // Every piece on the table: the level's fixed ones + the player's.
  const pieces = [...(level.fixed || []), ...state.placed];

  // Physics first: where does the light go?
  const { segments, detectorPower } = traceBeam(level, pieces, SETTINGS.rows, SETTINGS.cols);

  // Then drawing, bottom layer to top layer. (Skipped if the board
  // has no width yet, which can happen for a moment while loading.)
  if (cell > 0) {
    drawTable(ctx, cell, SETTINGS.rows, SETTINGS.cols);
    if (state.hover) drawHover(ctx, cell, state.hover);
    (level.walls || []).forEach((wall) => drawWall(ctx, cell, wall));
    drawBeam(ctx, cell, segments);
    (level.fixed || []).forEach((piece) => drawPiece(ctx, cell, piece, true));
    state.placed.forEach((piece) => drawPiece(ctx, cell, piece, false));
    level.detectors.forEach((detector, i) =>
      drawDetector(ctx, cell, detector, detectorPower[i])
    );
    drawLaser(ctx, cell, level.laser);
  }

  // The note under the board.
  ui.note.textContent = level.note || "";

  // Tray buttons: show how many of each piece are left.
  ui.tray.querySelectorAll(".lm-piece").forEach((button) => {
    const type = button.dataset.type;
    button.textContent = `${PIECES[type].label} × ${piecesLeft(level, type)}`;
    button.classList.toggle("lm-selected", type === state.selected);
  });

  // Status line and stars.
  const solved = isSolved(level, detectorPower);
  if (solved) {
    const used = state.placed.length;   // fixed pieces don't count
    const stars = starsFor(level, used);
    const pieceWord = used === 1 ? "piece" : "pieces";
    ui.status.textContent =
      `${starText(stars)} Solved with ${used} ${pieceWord}.` +
      (stars < 3 ? ` Can you do it with ${level.par}?` : "");
    recordStars(state.levelIndex, stars);
  } else {
    ui.status.textContent = unsolvedMessage(level, detectorPower);
  }
  ui.status.classList.toggle("lm-solved", solved);

  return { cell, solved };
}


/* ---------------------------------------------------------------------
   unsolvedMessage — a helpful status line while the level isn't solved.
   --------------------------------------------------------------------- */
function unsolvedMessage(level, detectorPower) {
  const total = level.detectors.length;
  const pct = (v) => Math.round(v * 100);

  // A delicate sample getting too much light?
  const over = level.detectors.findIndex((d, i) => hasTooMuch(d, detectorPower[i]));
  if (over !== -1) {
    return `Too bright! A sample can take at most ${pct(level.detectors[over].max)}% but gets ${pct(detectorPower[over])}%.`;
  }

  // A detector that gets some light, but not enough?
  const short = level.detectors.findIndex(
    (d, i) => detectorPower[i] > 0 && !hasEnough(d, detectorPower[i])
  );
  if (short !== -1) {
    return `A detector needs ${pct(level.detectors[short].need)}% but only gets ${pct(detectorPower[short])}%.`;
  }

  if (total === 1) return "The detector is still dark.";

  const lit = level.detectors.filter((d, i) => isDetectorLit(d, detectorPower[i])).length;
  return `${lit} of ${total} detectors lit.`;
}
