/* =====================================================================
   LASER MAZE  —  drawing/parts.js
   ---------------------------------------------------------------------
   Everything that stands on the table: the laser, detectors, walls,
   and the optical pieces players place (mirrors, and later splitters
   and polarizers).

   To add a new piece: write its drawing function here, then add it to
   PIECE_DRAWERS at the bottom so drawPiece knows about it.
   ===================================================================== */

import { SETTINGS } from "../settings.js";
import { line } from "./canvas.js";


/* The laser: a metal box with a yellow warning stripe and a small
   red aperture on the side it shoots from. We draw it pointing right,
   then rotate it to face the level's direction. */
const FACING_ANGLE = {
  right: 0,
  down: Math.PI / 2,
  left: Math.PI,
  up: -Math.PI / 2,
};

export function drawLaser(ctx, cell, laser) {
  const c = SETTINGS.colors;
  ctx.save();
  ctx.translate(laser.col * cell + cell / 2, laser.row * cell + cell / 2);
  ctx.rotate(FACING_ANGLE[laser.facing]);

  // body
  ctx.fillStyle = c.housing;
  ctx.strokeStyle = c.housingEdge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-cell * 0.4, -cell * 0.22, cell * 0.72, cell * 0.44, cell * 0.06);
  ctx.fill();
  ctx.stroke();

  // warning stripe
  ctx.fillStyle = c.warning;
  ctx.fillRect(-cell * 0.3, -cell * 0.22, cell * 0.08, cell * 0.44);

  // aperture (where the light comes out)
  ctx.fillStyle = c.beam;
  ctx.shadowColor = c.beam;
  ctx.shadowBlur = cell * 0.2;
  ctx.beginPath();
  ctx.arc(cell * 0.32, 0, cell * 0.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}


/* A detector: a square metal housing with a round sensor window.
   The window is dark, or glows green when the beam reaches it. */
export function drawDetector(ctx, cell, detector, isLit) {
  const c = SETTINGS.colors;
  const x = detector.col * cell + cell / 2;
  const y = detector.row * cell + cell / 2;

  ctx.save();
  ctx.fillStyle = c.housing;
  ctx.strokeStyle = c.housingEdge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - cell * 0.32, y - cell * 0.32, cell * 0.64, cell * 0.64, cell * 0.1);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isLit ? c.sensorOn : c.sensorOff;
  if (isLit) {
    ctx.shadowColor = c.sensorOn;
    ctx.shadowBlur = cell * 0.5;
  }
  ctx.beginPath();
  ctx.arc(x, y, cell * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}


/* A wall (beam block): a dark slab with diagonal hatching. */
export function drawWall(ctx, cell, wall) {
  const c = SETTINGS.colors;
  const size = cell * 0.8;
  const left = wall.col * cell + (cell - size) / 2;
  const top = wall.row * cell + (cell - size) / 2;

  ctx.save();
  ctx.fillStyle = c.wall;
  ctx.strokeStyle = c.wallEdge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(left, top, size, size, cell * 0.05);
  ctx.fill();
  ctx.stroke();

  // hatching: three parallel diagonal lines, clipped to stay inside
  // the slab. "shift" slides each line sideways by half the slab.
  ctx.clip();
  ctx.lineWidth = 1;
  for (const shift of [-0.5, 0, 0.5]) {
    const dx = size * shift;
    line(ctx, left + dx, top + size, left + size + dx, top);
  }
  ctx.restore();
}


/* A mirror: a round mount with a thin mirror standing on it.
   The silvered face is light; the back is darker, like a real mirror
   in its holder. Fixed (bolted-down) mirrors get a bronze mount.

   Canvas angles turn clockwise because its y-axis points down, so we
   rotate by MINUS the physics angle to make 45° look like  /  */
export function drawMirror(ctx, cell, piece, isFixed) {
  const c = SETTINGS.colors;
  ctx.save();
  ctx.translate(piece.col * cell + cell / 2, piece.row * cell + cell / 2);

  // mount
  ctx.fillStyle = isFixed ? c.mountFixed : c.mount;
  ctx.strokeStyle = c.housingEdge;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, cell * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // mirror: a long thin bar, back first, then the silvered face
  ctx.rotate((-piece.angle * Math.PI) / 180);
  const length = cell * 0.78;
  const thickness = cell * 0.1;
  ctx.fillStyle = c.mirrorBack;
  ctx.fillRect(-length / 2, -thickness / 2, length, thickness);
  ctx.fillStyle = c.mirrorFace;
  ctx.fillRect(-length / 2, -thickness / 2, length, thickness * 0.5);

  ctx.restore();
}


/* ---------------------------------------------------------------------
   PIECE_DRAWERS — which function draws which piece type.
   The names on the left must match the names in physics/pieces.js.
   --------------------------------------------------------------------- */
const PIECE_DRAWERS = {
  mirror: drawMirror,
};

/* Draw any placed or fixed piece by looking up its type above. */
export function drawPiece(ctx, cell, piece, isFixed) {
  const draw = PIECE_DRAWERS[piece.type];
  if (draw) draw(ctx, cell, piece, isFixed);
}
