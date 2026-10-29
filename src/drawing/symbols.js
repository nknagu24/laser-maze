/* =====================================================================
   LASER MAZE  —  drawing/symbols.js
   ---------------------------------------------------------------------
   The small round polarization badge, used in two places:
     • along polarized beams (drawing/board.js)
     • on detectors that only accept one polarization (drawing/parts.js)

   What the badge shows, as if looking straight along the beam:
     linear   a tick at the angle:  0° —   45° /   90° |   135° \
     "R"      the letter R (right-handed circular light)
     "L"      the letter L (left-handed circular light)
   (Letters read far better than tiny spinning arrows at this size.)
   ===================================================================== */

import { SETTINGS } from "../settings.js";
import { line } from "./canvas.js";

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

  if (pol === "R" || pol === "L") {
    ctx.font = `bold ${Math.max(8, radius * 1.4)}px "Space Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pol, x, y + radius * 0.08);
  } else {
    // A tick at the angle. Canvas y points down, so we flip the sign.
    const a = (-pol * Math.PI) / 180;
    const half = radius * 0.65;
    const dx = Math.cos(a) * half;
    const dy = Math.sin(a) * half;
    line(ctx, x - dx, y - dy, x + dx, y + dy);
  }

  ctx.restore();
}
