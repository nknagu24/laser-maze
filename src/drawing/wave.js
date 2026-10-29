/* =====================================================================
   LASER MAZE  —  drawing/wave.js
   ---------------------------------------------------------------------
   The animated light wave shown inside guide bubbles.

   WHAT IT SHOWS
   Light is an electromagnetic wave. We draw its electric field: the
   red curve wiggling around the grey line (the beam), with thin
   "stems" from the line to the curve, like a textbook picture. The
   picture is slightly 3D: "up" is up, and "flat" (parallel to the
   table) is drawn going diagonally into the screen.

   Two small circles at the top show the same wave "looking straight
   along the beam", exactly like the badges on the game board:
       in   the light before the optic
       out  the light after it
   A line means linear polarization; a circle means circular.

   Optionally an optic sits in the middle (polarizer, ½ or ¼ wave
   plate). What comes out is worked out with the SAME physics the game
   uses (physics/polarization.js), so the picture can never disagree
   with the game.

   HOW TO USE IT (from a level's training step in data/levels.js):
     wave: { input: 45, element: { type: "polarizer", angle: 0 } }
   input:   0, 45, 90, 135, "R" or "L"
   element: optional; type "polarizer", "halfwave" or "quarterwave"

   Or, to show WHY wave plates work (birefringence):
     wave: { input: 45, crystal: { retard: 90 } }
   Inside the crystal the wave is drawn as its two parts, flat (pale,
   dashed) and upright (solid), which travel at different speeds, so
   one gets ahead of the other. retard: how far ahead it ends up, in
   degrees of a wave: 90 makes circular light (a ¼ wave plate), 180
   turns the polarization (a ½ wave plate).
   ===================================================================== */

import { SETTINGS } from "../settings.js";
import {
  throughPolarizer, halfWave, quarterWave, isCircular,
} from "../physics/polarization.js";


/* ---------------------------------------------------------------------
   Settings for the picture
   --------------------------------------------------------------------- */
const LOOK = {
  background: "#1c1f26",   // same dark as the optical table
  axis: "#5a6170",         // the beam's centre line
  wave: "#ff4d4d",         // the electric field
  text: "#c9d1dc",         // small labels
  wavesAcross: 2.5,        // how many wavelengths fit across the picture
  speed: 0.5,              // wave cycles per second (slow, to follow by eye)
  heightRatio: 0.55,       // picture height = width × this
};

const NAMES = {
  polarizer: "Polarizer",
  halfwave: "½ wave plate",
  quarterwave: "¼ wave plate",
};


/* What an optic does: the polarization and brightness that come out. */
function afterElement(pol, element) {
  if (!element) return { pol, amplitude: 1 };
  if (element.type === "polarizer") {
    // Power goes as amplitude², so amplitude = √(share of power).
    return { pol: element.angle, amplitude: Math.sqrt(throughPolarizer(pol, element.angle)) };
  }
  if (element.type === "halfwave") return { pol: halfWave(pol, element.angle), amplitude: 1 };
  if (element.type === "quarterwave") return { pol: quarterWave(pol, element.angle), amplitude: 1 };
  return { pol, amplitude: 1 };
}

/* The electric field across the beam at one moment, as two numbers:
   h = the "flat" part, v = the "up" part.
   phase moves along the wave and with time.
   Circular light keeps the same length but turns round; it is drawn
   about 0.71× as tall as linear light carrying the same power. */
function field(pol, amplitude, phase) {
  if (isCircular(pol)) {
    const r = amplitude * Math.SQRT1_2;
    const turn = pol === "R" ? -1 : 1;
    return { h: r * Math.cos(phase), v: turn * r * Math.sin(phase) };
  }
  const a = (pol * Math.PI) / 180;
  const size = amplitude * Math.cos(phase);
  return { h: size * Math.cos(a), v: size * Math.sin(a) };
}


/* ---------------------------------------------------------------------
   Playing the animation
   Only one wave plays at a time (there is only one bubble).
   --------------------------------------------------------------------- */
let running = null;   // the requestAnimationFrame handle, or null

export function playWave(canvas, scene) {
  stopWave();
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startTime = performance.now();

  const frame = () => {
    // A still picture for visitors who prefer less motion.
    const seconds = calm ? 0.15 : (performance.now() - startTime) / 1000;
    drawWave(canvas, scene, seconds);
    if (!calm) running = requestAnimationFrame(frame);
  };
  frame();
}

export function stopWave() {
  if (running !== null) cancelAnimationFrame(running);
  running = null;
}


/* ---------------------------------------------------------------------
   Drawing one frame
   --------------------------------------------------------------------- */
function drawWave(canvas, scene, seconds) {
  // Size the canvas to its box on the page, sharp on every screen.
  const width = canvas.clientWidth;
  if (width === 0) return;
  const height = Math.round(width * LOOK.heightRatio);
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(width * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.height = height + "px";
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Background
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = LOOK.background;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 8);
  ctx.fill();

  // Where things go
  const left = width * 0.04;
  const right = width * 0.96;
  const axisY = height * 0.62;
  const size = height * 0.26;                    // wave height for amplitude 1
  // The "flat" direction, drawn going diagonally down-right, a bit
  // shorter than "up" (as things further away look in 3D). Kept small
  // enough sideways that the wave never folds back on itself.
  const depth = { x: 0.35 * size, y: 0.3 * size };
  const middle = (left + right) / 2;

  // 3D → screen: a point at distance x along the beam, with field (h, v).
  const toScreen = (x, h, v) => ({ x: x + h * depth.x, y: axisY - v * size + h * depth.y });

  // Birefringence pictures are drawn by their own function.
  if (scene.crystal) {
    drawCrystalScene(ctx, scene, { width, height, left, right, axisY, size, middle, toScreen, seconds });
    return;
  }

  // What enters and what leaves.
  const input = { pol: scene.input, amplitude: 1 };
  const output = afterElement(scene.input, scene.element);
  const element = scene.element;

  // The beam's centre line
  ctx.strokeStyle = LOOK.axis;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(left, axisY);
  ctx.lineTo(right, axisY);
  ctx.stroke();
  ctx.setLineDash([]);

  // The wave: phase = k·x − ω·t makes it travel to the right.
  const k = (Math.PI * 2 * LOOK.wavesAcross) / (right - left);
  const omega = Math.PI * 2 * LOOK.speed;
  const lightAt = (x) => (element && x > middle ? output : input);

  // Draw the far half of the optic first, so the wave passes "through" it.
  if (element) drawElement(ctx, element, middle, toScreen, size, "back");

  // stems
  ctx.strokeStyle = LOOK.wave;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  for (let x = left; x <= right; x += 7) {
    const light = lightAt(x);
    const f = field(light.pol, light.amplitude, k * (x - left) - omega * seconds);
    const p = toScreen(x, f.h, f.v);
    ctx.beginPath();
    ctx.moveTo(x, axisY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  // the curve
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2;
  ctx.beginPath();
  let started = false;
  for (let x = left; x <= right; x += 2) {
    const light = lightAt(x);
    const f = field(light.pol, light.amplitude, k * (x - left) - omega * seconds);
    const p = toScreen(x, f.h, f.v);
    // Lift the pen where the light changes at the optic.
    if (element && Math.abs(x - middle) < 2) started = false;
    if (!started) {
      ctx.moveTo(p.x, p.y);
      started = true;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
  ctx.stroke();

  // The near half of the optic, and its name.
  if (element) drawElement(ctx, element, middle, toScreen, size, "front");

  // The two "looking along the beam" views.
  const r = height * 0.15;
  drawEndOn(ctx, left + r + 2, r + 4, r, input, -omega * seconds, "in");
  drawEndOn(ctx, right - r - 2, r + 4, r, output, k * (right - left) - omega * seconds, "out");
}


/* The optic, seen at a slight angle: a disc standing across the beam.
   part: "back" draws a faint fill, "front" draws the outline, its axis
   line(s) and its name. */
function drawElement(ctx, element, x, toScreen, size, part) {
  const c = SETTINGS.colors;
  const radius = 1.1;    // in wave-height units

  // The disc's rim: a circle in the (flat, up) plane, projected.
  const rim = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    rim.push(toScreen(x, radius * Math.cos(a), radius * Math.sin(a)));
  }

  const fill = {
    polarizer: c.filter,
    halfwave: c.halfWave,
    quarterwave: c.quarterWave,
  }[element.type];

  ctx.save();
  ctx.beginPath();
  rim.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();

  if (part === "back") {
    ctx.fillStyle = fill;
    ctx.globalAlpha = 0.75;
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.strokeStyle = c.filterLines;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Axis line(s) across the disc, at the optic's angle.
  ctx.clip();
  const a = (element.angle * Math.PI) / 180;
  const along = { h: Math.cos(a), v: Math.sin(a) };
  const across = { h: -Math.sin(a), v: Math.cos(a) };
  const offsets = element.type === "polarizer" ? [-0.75, -0.4, 0, 0.4, 0.75] : [0];
  ctx.strokeStyle = c.filterLines;
  for (const o of offsets) {
    ctx.lineWidth = o === 0 ? 2 : 1;
    ctx.globalAlpha = o === 0 ? 1 : 0.6;
    const p1 = toScreen(x, o * across.h - radius * along.h, o * across.v - radius * along.v);
    const p2 = toScreen(x, o * across.h + radius * along.h, o * across.v + radius * along.v);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  ctx.restore();

  // Name, above the disc
  const top = toScreen(x, 0, radius);
  ctx.save();
  ctx.fillStyle = LOOK.text;
  ctx.font = `${Math.max(9, size * 0.3)}px "Space Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(NAMES[element.type], x, top.y - 3);
  ctx.restore();
}


/* A small circle showing the field as if looking along the beam:
   its path (a line or a circle) and an arrow for "right now". */
function drawEndOn(ctx, cx, cy, r, light, phase, label) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.strokeStyle = LOOK.axis;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const s = r * 0.8;   // radius for amplitude 1

  // the path the field's tip traces
  ctx.strokeStyle = LOOK.wave;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (isCircular(light.pol)) {
    ctx.arc(cx, cy, s * light.amplitude * Math.SQRT1_2, 0, Math.PI * 2);
  } else if (light.amplitude > 0.01) {
    const a = (light.pol * Math.PI) / 180;
    ctx.moveTo(cx - Math.cos(a) * s * light.amplitude, cy + Math.sin(a) * s * light.amplitude);
    ctx.lineTo(cx + Math.cos(a) * s * light.amplitude, cy - Math.sin(a) * s * light.amplitude);
  }
  ctx.stroke();

  // the field right now (screen y points down, so "up" is minus)
  const f = field(light.pol, light.amplitude, phase);
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + f.h * s, cy - f.v * s);
  ctx.stroke();
  ctx.fillStyle = LOOK.wave;
  ctx.beginPath();
  ctx.arc(cx + f.h * s, cy - f.v * s, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // label beside the circle ("in" on the left one, "out" on the right)
  ctx.fillStyle = LOOK.text;
  ctx.font = `${Math.max(9, r * 0.55)}px "Space Mono", monospace`;
  ctx.textBaseline = "middle";
  ctx.textAlign = label === "in" ? "left" : "right";
  const tx = label === "in" ? cx + r + 5 : cx - r - 5;
  ctx.fillText(isCircular(light.pol) ? `${label}: ${light.pol}` : label, tx, cy);
  ctx.restore();
}



/* ---------------------------------------------------------------------
   drawCrystalScene — a birefringent crystal in the middle third.

   Before it: ordinary linear light at the input angle.
   Inside it: the light drawn as its two parts, flat (h) and upright (v).
     The upright part gradually gets ahead: its phase shift grows from
     0 at the entrance to "retard" at the exit.
   After it: the two parts recombined, now shifted, which makes
     circular light (90°) or turned light (180°).
   The "out" label uses the same rules as the game's wave plates, so
   the picture and the game always agree.
   --------------------------------------------------------------------- */
function drawCrystalScene(ctx, scene, g) {
  const { left, right, axisY, size, toScreen, seconds, height } = g;
  const a = (scene.input * Math.PI) / 180;
  const ah = Math.cos(a);                 // how much of the light is flat
  const av = Math.sin(a);                 // how much is upright
  const retard = (scene.crystal.retard * Math.PI) / 180;
  const x0 = left + (right - left) * 0.33;   // crystal entrance
  const x1 = left + (right - left) * 0.67;   // crystal exit

  const k = (Math.PI * 2 * LOOK.wavesAcross) / (right - left);
  const omega = Math.PI * 2 * LOOK.speed;
  const shiftAt = (x) => (x < x0 ? 0 : x > x1 ? retard : (retard * (x - x0)) / (x1 - x0));
  const parts = (x) => {
    const phase = k * (x - left) - omega * seconds;
    return { h: ah * Math.cos(phase), v: av * Math.cos(phase + shiftAt(x)) };
  };

  // The crystal: a pale see-through block around the beam.
  const c = SETTINGS.colors;
  const blockTop = axisY - size * 1.25;
  const blockBottom = axisY + size * 1.25;
  ctx.save();
  ctx.fillStyle = c.calcite;
  ctx.strokeStyle = c.calciteEdge;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.roundRect(x0, blockTop, x1 - x0, blockBottom - blockTop, 4);
  ctx.fill();
  ctx.globalAlpha = 0.9;
  ctx.stroke();
  ctx.restore();

  // Stems and curves. Outside the crystal: the whole field.
  // Inside: the two parts, drawn separately.
  const drawCurve = (pick, colour, dashed, from, to) => {
    ctx.save();
    ctx.strokeStyle = colour;
    ctx.lineWidth = 2;
    if (dashed) ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (let x = from; x <= to; x += 2) {
      const f = pick(parts(x));
      const p = toScreen(x, f.h, f.v);
      if (x === from) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  };

  // stems everywhere (faint), showing the full field
  ctx.save();
  ctx.strokeStyle = LOOK.wave;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1;
  for (let x = left; x <= right; x += 7) {
    if (x > x0 && x < x1) continue;
    const f = parts(x);
    const p = toScreen(x, f.h, f.v);
    ctx.beginPath();
    ctx.moveTo(x, axisY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  ctx.restore();

  drawCurve((f) => f, LOOK.wave, false, left, x0);                       // before
  drawCurve((f) => ({ h: f.h, v: 0 }), "#ffb3b3", true, x0, x1);          // flat part
  drawCurve((f) => ({ h: 0, v: f.v }), LOOK.wave, false, x0, x1);         // upright part
  drawCurve((f) => f, LOOK.wave, false, x1, right);                       // after

  // a small label inside the bottom of the crystal
  ctx.save();
  ctx.fillStyle = LOOK.text;
  ctx.font = `${Math.max(8, size * 0.26)}px "Space Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("two speeds", (x0 + x1) / 2, blockBottom - 3);
  ctx.restore();

  // end-on views: in (linear), out (whatever the shift made)
  const r = height * 0.15;
  const outPol = scene.crystal.retard === 90 ? quarterWave(scene.input, 0)
               : scene.crystal.retard === 180 ? halfWave(scene.input, 0)
               : null;
  drawEndOn(ctx, left + r + 2, r + 4, r, { pol: scene.input, amplitude: 1 }, -omega * seconds, "in");
  if (outPol !== null) {
    drawEndOn(ctx, right - r - 2, r + 4, r, { pol: outPol, amplitude: 1 }, k * (right - left) - omega * seconds, "out");
  }
}
