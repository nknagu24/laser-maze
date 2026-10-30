/* =====================================================================
   LASER MAZE  —  drawing/symbols.js
   ---------------------------------------------------------------------
   The small round polarization badge, used in two places:
     • along polarized beams (drawing/board.js)
     • on detectors that only accept one polarization (drawing/parts.js)

   What the badge shows: the polarization's standard letter, the same
   letters physicists use:
     H  horizontal (0°)       V  vertical (90°)
     D  diagonal (45°)        A  anti-diagonal (135°)
     R  right circular        L  left circular
   ===================================================================== */

import { SETTINGS } from "../settings.js";

/* The standard one-letter name physicists use for each polarization. */
export function polarizationLetter(pol) {
  const letters = { 0: "H", 45: "D", 90: "V", 135: "A", R: "R", L: "L" };
  return letters[pol] || "";
}

/* The name of a polarization, written beside the badges on the beam,
   with its letter in brackets. */
export function polarizationName(pol) {
  const names = {
    0: "Horizontal (H)",
    45: "Diagonal (D)",
    90: "Vertical (V)",
    135: "Anti-diagonal (A)",
    R: "Right circular (R)",
    L: "Left circular (L)",
  };
  return names[pol] || "";
}

/* x, y: the badge's centre in pixels.  radius: its size in pixels. */
export function drawPolBadge(ctx, x, y, radius, pol) {
  const c = SETTINGS.colors;
  ctx.save();

  // the dark disc
  ctx.fillStyle = c.polBadge;
  ctx.strokeStyle = c.polTicks;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = c.polTicks;
  ctx.fillStyle = c.polTicks;
  ctx.lineWidth = Math.max(1.5, radius * 0.25);
  ctx.lineCap = "round";

  // The polarization's standard letter: H, V, D, A, R or L.
  ctx.font = `bold ${Math.max(8, radius * 1.4)}px "Space Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(polarizationLetter(pol), x, y + radius * 0.08);

  ctx.restore();
}
