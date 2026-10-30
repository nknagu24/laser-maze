/* =====================================================================
   LASER MAZE  —  drawing/hero.js
   ---------------------------------------------------------------------
   The picture on the start screen: a small 3 × 6 table with a laser,
   one mirror and a lit detector. It is a real (tiny) level, so the
   beam is worked out by the same physics as the game.
   ===================================================================== */

import { traceBeam } from "../physics/beam.js";
import { sizeBoard } from "./canvas.js";
import { drawTable, drawBeam } from "./board.js";
import { drawLaser, drawDetector, drawPiece } from "./parts.js";

const HERO = {
  rows: 3,
  cols: 6,
  maxWidth: 360,   // the picture never grows wider than this (pixels)
  level: {
    laser: { row: 2, col: 0, facing: "right" },
    detectors: [{ row: 0, col: 4 }],
    walls: [],
  },
  pieces: [{ row: 2, col: 4, type: "mirror", angle: 45 }],
};

export function drawHero(canvas) {
  const { ctx, cell } = sizeBoard(canvas, HERO.rows, HERO.cols, HERO.maxWidth);
  if (cell <= 0) return;
  const { segments, detectorPower } = traceBeam(HERO.level, HERO.pieces, HERO.rows, HERO.cols);

  drawTable(ctx, cell, HERO.rows, HERO.cols);
  drawBeam(ctx, cell, segments, false);   // no polarization badges in the picture
  HERO.pieces.forEach((piece) => drawPiece(ctx, cell, piece, false));
  HERO.level.detectors.forEach((d, i) => drawDetector(ctx, cell, d, detectorPower[i]));
  drawLaser(ctx, cell, HERO.level.laser);
}
