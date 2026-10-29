/* =====================================================================
   LASER MAZE  —  data/sandbox.js
   ---------------------------------------------------------------------
   The Sandbox: an empty table with every optic, as many as you like,
   and no goal. Players can also place detectors to measure the light,
   and change the laser's colour and polarization from the panel.

   This one "level" is changed while the player uses it (detectors are
   added, the laser is turned), so the game starts with a fresh copy
   each time the Sandbox opens: see freshSandbox() below.
   ===================================================================== */

import { PIECES } from "../physics/pieces.js";

/* Extra things the Sandbox tray offers that aren't optics. */
export const SANDBOX_EXTRAS = {
  detector: {
    label: "Detector",
    short: "Detector",
    about: "In the Sandbox you can place detectors anywhere to measure how much light arrives. Tap a placed detector to remove it.",
  },
};

export function freshSandbox() {
  // Every optic, with no limit (Infinity), plus detectors.
  const tray = { detector: Infinity };
  for (const type of Object.keys(PIECES)) tray[type] = Infinity;

  return {
    name: "Sandbox",
    sandbox: true,
    laser: { row: 3, col: 0, facing: "right", color: "red", polarization: 0 },
    detectors: [],
    walls: [],
    tray,
    note: "Every optic, as many as you like, and no goal. Place detectors to measure the light, tap the laser to turn it, and change its colour and polarization in the panel. Experiment!",
  };
}
