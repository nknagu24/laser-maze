/* =====================================================================
   LASER MAZE  —  drawing/guides.js
   ---------------------------------------------------------------------
   Training helpers drawn on the table:
     • a glowing, gently pulsing ring around the hole to use
       (dashed for "place here", solid for "this piece")
     • a curved arrow over a piece, meaning "tap again to turn it"
   ===================================================================== */

import { SETTINGS } from "../settings.js";

/* pulse: a number between 0 and 1 that rises and falls over time,
   making the ring breathe. (It stays at 1 if the visitor prefers less
   motion; game.js decides.) */
export function drawGuideRing(ctx, cell, row, col, pulse, dashed = true) {
  const c = SETTINGS.colors;
  const x = col * cell + cell / 2;
  const y = row * cell + cell / 2;

  ctx.save();
  ctx.strokeStyle = c.guide;
  ctx.shadowColor = c.guide;
  ctx.shadowBlur = cell * (0.2 + 0.3 * pulse);
  ctx.globalAlpha = 0.55 + 0.45 * pulse;
  ctx.lineWidth = Math.max(2, cell * 0.05);
  if (dashed) ctx.setLineDash([cell * 0.1, cell * 0.06]);
  ctx.beginPath();
  ctx.arc(x, y, cell * (0.4 + 0.04 * pulse), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/* A curved arrow arching over the top of the piece, pointing
   clockwise: "tap again to turn it". It sits a little outside the
   piece so it never hides the piece or its name tag. */
export function drawTurnArrow(ctx, cell, row, col, pulse) {
  const c = SETTINGS.colors;
  const x = col * cell + cell / 2;
  const y = row * cell + cell / 2;
  const r = cell * 0.56;
  const start = (-160 * Math.PI) / 180;   // upper left
  const end = (-20 * Math.PI) / 180;      // upper right (the arrow points here)

  ctx.save();
  ctx.strokeStyle = c.guide;
  ctx.fillStyle = c.guide;
  ctx.lineWidth = Math.max(2.5, cell * 0.06);
  ctx.lineCap = "round";
  ctx.shadowColor = c.guide;
  ctx.shadowBlur = cell * (0.1 + 0.2 * pulse);

  ctx.beginPath();
  ctx.arc(x, y, r, start, end);
  ctx.stroke();

  // arrowhead at the end, pointing along the circle (clockwise)
  const tipX = x + Math.cos(end) * r;
  const tipY = y + Math.sin(end) * r;
  const along = end + Math.PI / 2;
  const size = cell * 0.16;
  ctx.beginPath();
  ctx.moveTo(tipX + Math.cos(along) * size, tipY + Math.sin(along) * size);
  ctx.lineTo(tipX + Math.cos(along + 2.5) * size, tipY + Math.sin(along + 2.5) * size);
  ctx.lineTo(tipX + Math.cos(along - 2.5) * size, tipY + Math.sin(along - 2.5) * size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
