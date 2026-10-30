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
import { isDetectorLit, hasEnough, hasTooMuch } from "../physics/beam.js";
import { drawColour, coloursOf } from "../physics/colour.js";
import { PIECES } from "../physics/pieces.js";
import { drawPolBadge } from "./symbols.js";


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

  // aperture (where the light comes out), in the laser's colour
  const beamColour = drawColour(coloursOf(laser.color));
  ctx.fillStyle = beamColour;
  ctx.shadowColor = beamColour;
  ctx.shadowBlur = cell * 0.2;
  ctx.beginPath();
  ctx.arc(cell * 0.32, 0, cell * 0.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}


/* A detector: a steel-blue housing with a round sensor window.
     • dark window   → no light at all
     • amber window  → some light, but less than it needs
     • red window    → too much light for a delicate sample
     • green window  → just right
   power: how much light reached it (1 = everything the laser makes).

   A detector that only accepts one polarization (accepts: "R", say)
   wears that polarization's badge on its top-left corner.

   It also prints numbers, like a real power meter:
     • at the bottom, the reading (e.g. "50%") once any light arrives
     • at the top, what it wants, if the level sets it:
         "≥50%" at least,  "≤50%" at most,
         "=25%" exactly,   "25–50%" a range */
export function drawDetector(ctx, cell, detector, power, seenColours) {
  const c = SETTINGS.colors;
  const x = detector.col * cell + cell / 2;
  const y = detector.row * cell + cell / 2;
  const lit = isDetectorLit(detector, power, seenColours);

  ctx.save();

  // housing: steel blue, so detectors stand out from the dark table
  const half = cell * 0.36;
  ctx.fillStyle = c.detector;
  ctx.strokeStyle = c.detectorEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - half, y - half, half * 2, half * 2, cell * 0.1);
  ctx.fill();
  ctx.stroke();

  // sensor window
  let windowColor = c.sensorOff;
  if (lit) windowColor = c.sensorOn;
  else if (hasTooMuch(detector, power)) windowColor = c.sensorHigh;
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

  const wants = targetLabel(detector);
  if (wants) {
    ctx.fillStyle = lit ? c.sensorOn : hasTooMuch(detector, power) ? c.sensorHigh : c.sensorLow;
    ctx.fillText(wants, x, y - cell * 0.245);
  }
  if (power > 0) {
    ctx.fillStyle = c.label;
    ctx.fillText(`${Math.round(power * 100)}%`, x, y + cell * 0.245);
  }

  ctx.restore();

  // Polarization badge for picky detectors (top-left corner).
  if (detector.accepts !== undefined) {
    drawPolBadge(ctx, x - half, y - half, cell * 0.13, detector.accepts);
  }

  // Colour dot for colour-picky detectors (top-right corner): its
  // colour, or a three-colour dot for one that wants white light.
  if (detector.color) {
    drawColourDot(ctx, x + half, y - half, cell * 0.12, detector.color);
  }
}


/* A small round dot showing a colour; "white" shows red, green and
   blue slices. */
function drawColourDot(ctx, x, y, r, colour) {
  ctx.save();
  ctx.strokeStyle = SETTINGS.colors.polBadge;
  ctx.lineWidth = 2;
  if (colour === "white") {
    ["red", "green", "blue"].forEach((name, i) => {
      ctx.fillStyle = drawColour([name]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, r, -Math.PI / 2 + (i * 2 * Math.PI) / 3, -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / 3);
      ctx.closePath();
      ctx.fill();
    });
  } else {
    ctx.fillStyle = drawColour([colour]);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}


/* The label printed at the top of a detector, or "" if it has none. */
function targetLabel(detector) {
  const pct = (v) => Math.round(v * 100);
  const hasNeed = detector.need !== undefined;
  const hasMax = detector.max !== undefined;
  if (hasNeed && hasMax) {
    return detector.need === detector.max
      ? `=${pct(detector.need)}%`
      : `${pct(detector.need)}–${pct(detector.max)}%`;
  }
  if (hasNeed) return `≥${pct(detector.need)}%`;
  if (hasMax) return `≤${pct(detector.max)}%`;
  return "";
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


/* A polarizer: a dark filter disc on a round mount, with fine lines
   running along its axis — the direction of polarization it lets
   through. 0° lines run like  —, 90° like  |, and so on.
   Fixed (bolted-down) polarizers get a bronze mount. */
export function drawPolarizer(ctx, cell, piece, isFixed) {
  const c = SETTINGS.colors;
  ctx.save();
  ctx.translate(piece.col * cell + cell / 2, piece.row * cell + cell / 2);

  // mount
  ctx.fillStyle = isFixed ? c.mountFixed : c.mount;
  ctx.strokeStyle = c.housingEdge;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, cell * 0.33, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // filter disc
  const r = cell * 0.25;
  ctx.fillStyle = c.filter;
  ctx.strokeStyle = c.filterLines;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // axis lines, clipped to the disc. Canvas angles turn clockwise,
  // so we rotate by MINUS the physics angle.
  ctx.clip();
  ctx.rotate((-piece.angle * Math.PI) / 180);
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.55;
  for (const offset of [-0.6, -0.3, 0.3, 0.6]) {
    line(ctx, -r, offset * r, r, offset * r);
  }
  // the main axis, brighter and thicker
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2;
  line(ctx, -r, 0, r, 0);

  ctx.restore();
}


/* A wave plate: a coloured crystal disc on a round mount, with one
   bold line along its axis and its name in the middle:
     "½" for a half-wave plate (blue)
     "¼" for a quarter-wave plate (purple)
   Fixed (bolted-down) plates get a bronze mount. */
function drawWavePlate(ctx, cell, piece, isFixed, fill, symbol) {
  const c = SETTINGS.colors;
  ctx.save();
  ctx.translate(piece.col * cell + cell / 2, piece.row * cell + cell / 2);

  // mount
  ctx.fillStyle = isFixed ? c.mountFixed : c.mount;
  ctx.strokeStyle = c.housingEdge;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, cell * 0.33, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // crystal disc
  const r = cell * 0.25;
  ctx.fillStyle = fill;
  ctx.strokeStyle = c.filterLines;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // axis line (rotate by MINUS the angle; canvas angles turn clockwise)
  ctx.save();
  ctx.rotate((-piece.angle * Math.PI) / 180);
  ctx.lineWidth = 2;
  line(ctx, -r, 0, r, 0);
  ctx.restore();

  // the symbol in a small dark dot, so the axis line never hides it
  ctx.fillStyle = c.polBadge;
  ctx.beginPath();
  ctx.arc(0, 0, cell * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.label;
  ctx.font = `bold ${Math.max(9, cell * 0.18)}px "Space Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(symbol, 0, cell * 0.01);

  ctx.restore();
}

export function drawHalfWave(ctx, cell, piece, isFixed) {
  drawWavePlate(ctx, cell, piece, isFixed, SETTINGS.colors.halfWave, "½");
}

export function drawQuarterWave(ctx, cell, piece, isFixed) {
  drawWavePlate(ctx, cell, piece, isFixed, SETTINGS.colors.quarterWave, "¼");
}


/* A round mount, the base most optics stand on. Fixed (bolted-down)
   pieces get a bronze one. Expects the pen already moved to the cell's
   centre. */
function drawMount(ctx, cell, isFixed, size = 0.3) {
  const c = SETTINGS.colors;
  ctx.fillStyle = isFixed ? c.mountFixed : c.mount;
  ctx.strokeStyle = c.housingEdge;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, cell * size, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}


/* A polarizing beam splitter: like the beam splitter cube, but tinted
   amber, with small — and | marks showing what it sorts. */
export function drawPBS(ctx, cell, piece, isFixed) {
  const c = SETTINGS.colors;
  ctx.save();
  ctx.translate(piece.col * cell + cell / 2, piece.row * cell + cell / 2);
  drawMount(ctx, cell, isFixed);

  const s = cell * 0.22;
  ctx.fillStyle = c.pbsGlass;
  ctx.strokeStyle = c.pbsEdge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(-s, -s, s * 2, s * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = c.mirrorFace;
  ctx.lineWidth = 2;
  if (piece.angle === 45) line(ctx, -s, s, s, -s);
  else line(ctx, -s, -s, s, s);

  // tiny — and | in the two empty corners
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = c.pbsEdge;
  const k = s * 0.5;
  if (piece.angle === 45) {
    line(ctx, -s * 0.85, -s * 0.5, -s * 0.85 + k, -s * 0.5);   // — top-left
    line(ctx, s * 0.6, s * 0.3, s * 0.6, s * 0.3 + k);         // | bottom-right
  } else {
    line(ctx, -s * 0.85, s * 0.5, -s * 0.85 + k, s * 0.5);     // — bottom-left
    line(ctx, s * 0.6, -s * 0.8, s * 0.6, -s * 0.8 + k);       // | top-right
  }
  ctx.restore();
}


/* A calcite crystal: a pale, slanted rhombus (calcite's natural
   shape). Turning it (45° ↔ 135°) mirrors the slant, and swaps which
   side the upright beam is pushed to. */
export function drawDisplacer(ctx, cell, piece, isFixed) {
  const c = SETTINGS.colors;
  ctx.save();
  ctx.translate(piece.col * cell + cell / 2, piece.row * cell + cell / 2);
  drawMount(ctx, cell, isFixed, 0.33);

  const s = cell * 0.24;
  const flip = piece.angle === 45 ? 1 : -1;
  ctx.fillStyle = c.calcite;
  ctx.strokeStyle = c.calciteEdge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-s * flip, s * 0.7);
  ctx.lineTo(-s * 0.4 * flip, -s * 0.7);
  ctx.lineTo(s * flip, -s * 0.7);
  ctx.lineTo(s * 0.4 * flip, s * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // two faint inner lines: the "double image" calcite is famous for
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1;
  line(ctx, -s * 0.3, -s * 0.15, s * 0.3, -s * 0.15);
  line(ctx, -s * 0.3, s * 0.15, s * 0.3, s * 0.15);
  ctx.restore();
}


/* A prism: a glass triangle with a little rainbow along one face.
   Turned over (135°) it points the other way, sending green and blue
   to the opposite sides. */
export function drawPrism(ctx, cell, piece, isFixed) {
  const c = SETTINGS.colors;
  ctx.save();
  ctx.translate(piece.col * cell + cell / 2, piece.row * cell + cell / 2);
  drawMount(ctx, cell, isFixed, 0.33);

  const s = cell * 0.26;
  const flip = piece.angle === 45 ? 1 : -1;
  ctx.fillStyle = c.glass;
  ctx.strokeStyle = c.glassEdge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -s * flip);
  ctx.lineTo(s * 0.95, s * 0.75 * flip);
  ctx.lineTo(-s * 0.95, s * 0.75 * flip);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // rainbow fan on the right face
  ["red", "green", "blue"].forEach((name, i) => {
    ctx.strokeStyle = drawColour([name]);
    ctx.lineWidth = 2;
    const t = 0.35 + i * 0.2;
    line(ctx, s * 0.95 * t, (-s + (s * 1.75) * t) * flip, s * 0.95 * t + s * 0.35, (-s + (s * 1.75) * t) * flip + (i - 1) * s * 0.18 * flip);
  });
  ctx.restore();
}


/* A dichroic mirror: like a mirror, but its face is the colour it
   reflects. */
function drawDichroic(ctx, cell, piece, isFixed, colour) {
  const c = SETTINGS.colors;
  ctx.save();
  ctx.translate(piece.col * cell + cell / 2, piece.row * cell + cell / 2);
  drawMount(ctx, cell, isFixed);

  ctx.rotate((-piece.angle * Math.PI) / 180);
  const length = cell * 0.78;
  const thickness = cell * 0.11;
  ctx.fillStyle = c.mirrorBack;
  ctx.fillRect(-length / 2, -thickness / 2, length, thickness);
  ctx.fillStyle = drawColour([colour]);
  ctx.fillRect(-length / 2, -thickness / 2, length, thickness * 0.55);
  ctx.restore();
}


/* Fluorescent dye: a small dish of coloured liquid, in the colour the
   dye looks (its "looks" in physics/pieces.js). */
export function drawDye(ctx, cell, piece, isFixed) {
  const c = SETTINGS.colors;
  const looks = PIECES[piece.type].looks;
  ctx.save();
  ctx.translate(piece.col * cell + cell / 2, piece.row * cell + cell / 2);
  drawMount(ctx, cell, isFixed);

  ctx.fillStyle = looks;
  ctx.shadowColor = looks;
  ctx.shadowBlur = cell * 0.15;
  ctx.beginPath();
  ctx.arc(0, 0, cell * 0.19, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = c.dyeEdge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}


/* A Wollaston prism: a square made of two crystal wedges, split along
   the diagonal and tinted slightly differently, with two short lines
   fanning out to show the two beams leaving in different directions. */
export function drawWollaston(ctx, cell, piece, isFixed) {
  const c = SETTINGS.colors;
  ctx.save();
  ctx.translate(piece.col * cell + cell / 2, piece.row * cell + cell / 2);
  drawMount(ctx, cell, isFixed, 0.33);

  const s = cell * 0.22;
  const flip = piece.angle === 45 ? 1 : -1;

  // the two wedges
  ctx.fillStyle = c.calcite;
  ctx.beginPath();
  ctx.moveTo(-s, -s * flip);
  ctx.lineTo(s, -s * flip);
  ctx.lineTo(-s, s * flip);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.glass;
  ctx.beginPath();
  ctx.moveTo(s, -s * flip);
  ctx.lineTo(s, s * flip);
  ctx.lineTo(-s, s * flip);
  ctx.closePath();
  ctx.fill();

  // outline and the glued diagonal
  ctx.strokeStyle = c.calciteEdge;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-s, -s, s * 2, s * 2);
  line(ctx, s, -s * flip, -s, s * flip);
  ctx.restore();
}


/* ---------------------------------------------------------------------
   PIECE_DRAWERS — which function draws which piece type.
   The names on the left must match the names in physics/pieces.js.
   --------------------------------------------------------------------- */
const PIECE_DRAWERS = {
  mirror: drawMirror,
  splitter: drawSplitter,
  polarizer: drawPolarizer,
  halfwave: drawHalfWave,
  quarterwave: drawQuarterWave,
  pbs: drawPBS,
  displacer: drawDisplacer,
  prism: drawPrism,
  dye: drawDye,
  "dye-orange": drawDye,
  wollaston: drawWollaston,
  "dichroic-red": (ctx, cell, piece, isFixed) => drawDichroic(ctx, cell, piece, isFixed, "red"),
  "dichroic-green": (ctx, cell, piece, isFixed) => drawDichroic(ctx, cell, piece, isFixed, "green"),
  "dichroic-blue": (ctx, cell, piece, isFixed) => drawDichroic(ctx, cell, piece, isFixed, "blue"),
};

/* Draw any placed or fixed piece by looking up its type above. */
export function drawPiece(ctx, cell, piece, isFixed) {
  const draw = PIECE_DRAWERS[piece.type];
  if (draw) draw(ctx, cell, piece, isFixed);
}
