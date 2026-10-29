/* =====================================================================
   LASER MAZE  —  drawing/labels.js
   ---------------------------------------------------------------------
   Small name tags under the things on the table ("Laser", "Mirror",
   "Detector"…), so new players know what they're looking at.
   Switch them off with  showLabels: false  in settings.js.
   ===================================================================== */

import { SETTINGS } from "../settings.js";
import { PIECES } from "../physics/pieces.js";

/* things: a list of { row, col, text } */
export function drawLabels(ctx, cell, things) {
  if (!SETTINGS.showLabels) return;
  const c = SETTINGS.colors;
  const fontSize = Math.max(7, cell * 0.13);

  ctx.save();
  ctx.font = `${fontSize}px "Space Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const thing of things) {
    const x = thing.col * cell + cell / 2;
    const y = thing.row * cell + cell * 0.9;    // near the bottom of the cell

    // a dark rounded "pill" behind the text, so it reads over the beam
    const width = ctx.measureText(thing.text).width + fontSize * 0.8;
    const height = fontSize * 1.35;
    ctx.fillStyle = c.labelPill;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - height / 2, width, height, height / 2);
    ctx.fill();

    ctx.fillStyle = c.labelText;
    ctx.fillText(thing.text, x, y + fontSize * 0.05);
  }
  ctx.restore();
}

/* Builds the list of name tags for a level and the pieces on its table. */
export function labelsFor(level, pieces) {
  const things = [];
  things.push({ row: level.laser.row, col: level.laser.col, text: "Laser" });
  level.detectors.forEach((d) => things.push({ row: d.row, col: d.col, text: "Detector" }));
  pieces.forEach((p) => things.push({ row: p.row, col: p.col, text: PIECES[p.type].short }));
  return things;
}
