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
import { drawPolBadge, polarizationName } from "./symbols.js";
import { drawColour } from "../physics/colour.js";


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
   half the power is noticeably dimmer, a quarter dimmer still.

   Polarized beams also get small ticks showing their polarization,
   one on every border between cells (see drawPolarizationTicks). */
export function drawBeam(ctx, cell, segments, showPolarization = true) {
  const c = SETTINGS.colors;
  // Each layer: how wide, how blurred, how see-through, and whether it
  // uses the beam's own colour or the bright core colour.
  const layers = [
    { width: 0.22, blur: 0.4, alpha: 0.45, core: false },   // glow
    { width: 0.06, blur: 0,   alpha: 1,    core: false },   // beam
    { width: 0.02, blur: 0,   alpha: 1,    core: true },    // bright centre
  ];

  ctx.save();
  ctx.lineCap = "round";
  for (const layer of layers) {
    ctx.lineWidth = cell * layer.width;
    ctx.shadowBlur = cell * layer.blur;
    for (const seg of segments) {
      // The beam's colour: red for a red laser, mixed for several
      // colours together (see physics/colour.js).
      const colour = seg.colours ? drawColour(seg.colours) : c.beam;
      ctx.strokeStyle = layer.core ? c.beamCore : colour;
      ctx.shadowColor = colour;

      // Brightness: full power → fully opaque; weaker → more see-through,
      // but never fainter than 30% so every beam stays visible.
      ctx.globalAlpha = (0.3 + 0.7 * seg.power) * layer.alpha;

      // Segments are in cell units; multiply by cell to get pixels.
      line(ctx, seg.from.x * cell, seg.from.y * cell,
                seg.to.x * cell,   seg.to.y * cell);
    }
  }
  ctx.restore();

  if (showPolarization) drawPolarizationTicks(ctx, cell, segments);
}


/* ---------------------------------------------------------------------
   drawPolarizationTicks — a small round badge on each cell border along
   a polarized beam, showing its polarization as if you were looking
   straight along the beam (see drawing/symbols.js for what each badge
   looks like). Unpolarized beams (pol = null) get no badges.

   Each polarization's name ("Horizontal (H)"…) is written ONCE on the
   board, beside the middle badge of the longest stretch of beam that
   has it. When light is split or joined later, the same polarization
   isn't named again, which keeps the table tidy. Turn names off with
   showPolarizationNames in settings.js.
   --------------------------------------------------------------------- */
function drawPolarizationTicks(ctx, cell, segments) {
  ctx.save();
  const radius = cell * 0.12;   // size of each badge

  // How many badges already sit at each spot. When two beams with
  // different polarizations share a path (after calcite rejoins them,
  // say), their badges are placed side by side instead of on top of
  // each other, so both letters stay visible.
  const used = new Map();

  // For each polarization, the longest stretch of beam that has it:
  // that's where its name goes (more room, away from short hops).
  const best = new Map();

  for (const seg of segments) {
    if (seg.pol === null || seg.pol === undefined) continue;
    ctx.globalAlpha = 0.3 + 0.7 * seg.power;

    // Walk along the segment, stopping at every whole-number position
    // (the borders between cells), but not at the very ends.
    const horizontal = seg.from.y === seg.to.y;
    const a1 = horizontal ? seg.from.x : seg.from.y;
    const a2 = horizontal ? seg.to.x : seg.to.y;
    const lo = Math.min(a1, a2);
    const hi = Math.max(a1, a2);

    const spots = [];
    for (let p = Math.floor(lo) + 1; p < hi; p++) {
      let x = (horizontal ? p : seg.from.x) * cell;
      let y = (horizontal ? seg.from.y : p) * cell;

      // Shift along the beam if another badge is already here.
      const key = `${x},${y}`;
      const already = used.get(key) || 0;
      used.set(key, already + 1);
      if (horizontal) x += already * radius * 2.3;
      else y += already * radius * 2.3;

      drawPolBadge(ctx, x, y, radius, seg.pol);
      spots.push({ x, y });
    }

    const previous = best.get(seg.pol);
    if (spots.length > 0 && (!previous || spots.length > previous.spots.length)) {
      best.set(seg.pol, { spots, horizontal });
    }
  }

  // Names: each polarization once, near the middle of its longest
  // stretch. If that spot would overlap a name already written (two
  // beams sharing a path), try the other side of the beam, then the
  // neighbouring badges, until it fits.
  if (SETTINGS.showPolarizationNames) {
    ctx.globalAlpha = 1;
    const placed = [];   // boxes of names already written
    for (const [pol, { spots, horizontal }] of best) {
      const middle = Math.floor((spots.length - 1) / 2);
      // badges in order: middle first, then working outwards
      const order = [...spots.keys()].sort((i, j) => Math.abs(i - middle) - Math.abs(j - middle));
      let done = false;
      for (const i of order) {
        for (const side of [1, -1]) {
          const box = polNameBox(ctx, cell, spots[i].x, spots[i].y, radius, pol, horizontal, side);
          if (box && !placed.some((other) => overlaps(box, other))) {
            drawPolName(ctx, cell, box, pol);
            placed.push(box);
            done = true;
            break;
          }
        }
        if (done) break;
      }
    }
  }
  ctx.restore();
}


/* Where a polarization's name would go beside a badge, as a box
   { x, y, width, height } (x, y = its centre). side 1 puts it above a
   left-right beam (or right of an up-down beam); side −1 the other way. */
function polNameBox(ctx, cell, x, y, radius, pol, horizontal, side) {
  const text = polarizationName(pol);
  if (!text) return null;
  const fontSize = Math.max(8, cell * 0.14);
  ctx.save();
  ctx.font = `${fontSize}px "Space Mono", monospace`;
  const width = ctx.measureText(text).width + fontSize * 0.8;
  ctx.restore();
  const height = fontSize * 1.35;

  if (horizontal) {
    return { x, y: y - side * (radius + height * 0.75), width, height, fontSize };
  }
  return { x: x + side * (radius + width / 2 + 3), y, width, height, fontSize };
}

/* Do two boxes overlap? (with a 2-pixel margin) */
function overlaps(a, b) {
  return (
    Math.abs(a.x - b.x) * 2 < a.width + b.width + 4 &&
    Math.abs(a.y - b.y) * 2 < a.height + b.height + 4
  );
}

/* Writes a polarization's name in its box, on a small dark pill so it
   reads over the table. */
function drawPolName(ctx, cell, box, pol) {
  const c = SETTINGS.colors;
  ctx.save();
  ctx.font = `${box.fontSize}px "Space Mono", monospace`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = c.labelPill;
  ctx.beginPath();
  ctx.roundRect(box.x - box.width / 2, box.y - box.height / 2, box.width, box.height, box.height / 2);
  ctx.fill();
  ctx.fillStyle = c.polTicks;
  ctx.fillText(polarizationName(pol), box.x, box.y + box.fontSize * 0.05);
  ctx.restore();
}
