/* =====================================================================
   LASER MAZE  —  drawing/board.js
   ---------------------------------------------------------------------
   The table itself, the hover highlight, and the laser beam.
   (The objects that stand on the table are in drawing/parts.js.)

   Sizes are written as fractions of a cell (e.g. cell * 0.3), so
   everything scales together when the board grows or shrinks.
   ===================================================================== */

import { SETTINGS } from "../settings.js";
import { line } from "./canvas.js";


/* The optical table and its screw holes, rows × cols cells big. */
export function drawTable(ctx, cell, rows, cols) {
  const c = SETTINGS.colors;
  const width = cell * cols;
  const height = cell * rows;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = c.tableEdge;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 10);
  ctx.fill();

  ctx.fillStyle = c.table;
  ctx.beginPath();
  ctx.roundRect(3, 3, width - 6, height - 6, 8);
  ctx.fill();

  const holeRadius = cell * 0.09;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cell + cell / 2;
      const y = row * cell + cell / 2;

      ctx.strokeStyle = c.holeRim;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, holeRadius * 1.6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = c.hole;
      ctx.beginPath();
      ctx.arc(x, y, holeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}


/* A soft square under the mouse, showing which hole you're pointing at.
   Only appears on holes where you could place or turn something. */
export function drawHover(ctx, cell, hover) {
  ctx.save();
  ctx.fillStyle = SETTINGS.colors.hover;
  ctx.beginPath();
  ctx.roundRect(hover.col * cell + 3, hover.row * cell + 3, cell - 6, cell - 6, cell * 0.12);
  ctx.fill();
  ctx.restore();
}


/* The beam: every segment is drawn in three layers — a blurred glow,
   a red line, and a bright core. We draw all the glows first, then all
   the red lines, then all the cores, so corners join up cleanly.

   Weaker beams (after a beam splitter) are drawn fainter: a beam with
   half the power is noticeably dimmer, a quarter dimmer still. */
export function drawBeam(ctx, cell, segments) {
  const c = SETTINGS.colors;
  const layers = [
    { color: c.beamGlow, width: 0.22, blur: 0.4 },
    { color: c.beam,     width: 0.06, blur: 0 },
    { color: c.beamCore, width: 0.02, blur: 0 },
  ];

  ctx.save();
  ctx.lineCap = "round";
  for (const layer of layers) {
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = cell * layer.width;
    ctx.shadowColor = c.beam;
    ctx.shadowBlur = cell * layer.blur;
    for (const seg of segments) {
      // Brightness: full power → fully opaque; weaker → more see-through,
      // but never fainter than 30% so every beam stays visible.
      ctx.globalAlpha = 0.3 + 0.7 * seg.power;

      // Segments are in cell units; multiply by cell to get pixels.
      line(ctx, seg.from.x * cell, seg.from.y * cell,
                seg.to.x * cell,   seg.to.y * cell);
    }
  }
  ctx.restore();
}
