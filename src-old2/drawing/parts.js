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
import { isDetectorLit } from "../physics/beam.js";


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
     • dark window   → no light at all
     • amber window  → some light, but less than it needs
     • green window  → enough light
   power: how much light reached it (1 = everything the laser makes).

   It also prints numbers, like a real power meter:
     • at the bottom, the reading (e.g. "50%") once any light arrives
     • at the top, what it needs (e.g. "≥50%") if the level sets one */
export function drawDetector(ctx, cell, detector, power) {
  const c = SETTINGS.colors;
  const x = detector.col * cell + cell / 2;
  const y = detector.row * cell + cell / 2;
  const lit = isDetectorLit(detector, power);
  const hasNeed = Boolean(detector.need);

  ctx.save();

  // housing (a little taller if it has numbers to show)
  const half = cell * 0.36;
  ctx.fillStyle = c.housing;
  ctx.strokeStyle = c.housingEdge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - half, y - half, half * 2, half * 2, cell * 0.1);
  ctx.fill();
  ctx.stroke();

  // sensor window
  let windowColor = c.sensorOff;
  if (lit) windowColor = c.sensorOn;
  else if (power > 0) windowColor = c.sensorLow;

  ctx.fillStyle = windowColor;
  if (power > 0) {
    ctx.shadowColor = windowColor;
    ctx.shadowBlur = cell * 0.5;
  }
  ctx.beginPath();
  ctx.arc(x, y, cell * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // numbers (never smaller than 8px, so they stay readable on phones)
  const fontSize = Math.max(8, cell * 0.15);
  ctx.font = `${fontSize}px "Space Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (hasNeed) {
    ctx.fillStyle = lit ? c.sensorOn : c.sensorLow;
    ctx.fillText(`≥${Math.round(detector.need * 100)}%`, x, y - cell * 0.245);
  }
  if (power > 0) {
    ctx.fillStyle = c.label;
    ctx.fillText(`${Math.round(power * 100)}%`, x, y + cell * 0.245);
  }

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


/* A beam splitter: a small glass cube on a round mount, with its
   half-silvered surface drawn as a bright line across the diagonal.
   45° puts the surface like  /  and 135° like  \ , matching the mirror.
   Fixed (bolted-down) splitters get a bronze mount. */
export function drawSplitter(ctx, cell, piece, isFixed) {
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

  // glass cube
  const s = cell * 0.22;   // half the cube's width
  ctx.fillStyle = c.glass;
  ctx.strokeStyle = c.glassEdge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(-s, -s, s * 2, s * 2);
  ctx.fill();
  ctx.stroke();

  // half-silvered surface along the diagonal
  // (canvas y points down, so "/" runs from bottom-left to top-right)
  ctx.strokeStyle = c.mirrorFace;
  ctx.lineWidth = 2;
  if (piece.angle === 45) line(ctx, -s, s, s, -s);
  else line(ctx, -s, -s, s, s);

  ctx.restore();
}


/* ---------------------------------------------------------------------
   PIECE_DRAWERS — which function draws which piece type.
   The names on the left must match the names in physics/pieces.js.
   --------------------------------------------------------------------- */
const PIECE_DRAWERS = {
  mirror: drawMirror,
  splitter: drawSplitter,
};

/* Draw any placed or fixed piece by looking up its type above. */
export function drawPiece(ctx, cell, piece, isFixed) {
  const draw = PIECE_DRAWERS[piece.type];
  if (draw) draw(ctx, cell, piece, isFixed);
}
