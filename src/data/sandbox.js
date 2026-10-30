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
  // Not something you place: the explanation behind the small i next
  // to "Laser polarization" in the Sandbox panel.
  polarization: {
    label: "Polarization",
    about: "Light is a wave, and polarization is the direction its electric field wiggles as it travels.\n\nH (horizontal), V (vertical), D (diagonal) and A (anti-diagonal) are linear polarizations: the wiggle stays along one line. R and L are circular: the wiggle spins round, right- or left-handed, as the light moves. \"none\" is unpolarized light, like sunlight: a jumble of every direction.",
    wave: { input: 45 },
    more: "These letters are the standard names physicists use, especially in quantum optics, where single photons are sent as H, V, D or A to share secret keys.\n\nYou meet polarized light all the time without noticing. Light from the blue sky is partly polarized, and bees use that pattern to navigate. Light reflected off water and roads is mostly horizontal, which is why polarized sunglasses cut glare. And most lasers, like the one on this table, give out polarized light.",
  },

  // One explanation per polarization button (the small i on each).
  "pol-0": {
    label: "Horizontal (H)",
    about: "The electric field wiggles side to side, parallel to the table.\n\nLight reflected off water or a road is mostly horizontal, which is why polarized sunglasses are made to block it.",
    wave: { input: 0 },
  },
  "pol-90": {
    label: "Vertical (V)",
    about: "The electric field wiggles up and down.\n\nPolarized sunglasses let vertical light through while blocking the horizontal glare from water and roads.",
    wave: { input: 90 },
  },
  "pol-45": {
    label: "Diagonal (D)",
    about: "The wiggle is tilted at 45°. It's horizontal and vertical wiggling together, in step, in equal amounts.\n\nThat's why a horizontal (or a vertical) polarizer lets exactly half of it through.",
    wave: { input: 45 },
  },
  "pol-135": {
    label: "Anti-diagonal (A)",
    about: "Tilted the other way, at 135°. It's also half horizontal and half vertical, but with one of them flipped.\n\nD and A are at right angles to each other, so a diagonal polarizer blocks anti-diagonal light completely.",
    wave: { input: 135 },
  },
  "pol-R": {
    label: "Right circular (R)",
    about: "The wiggle spins round as the light travels, tracing a corkscrew.\n\nA quarter-wave plate turns straight-line light into circular light. Every mirror swaps R and L, so counting bounces matters.",
    wave: { input: "R" },
  },
  "pol-L": {
    label: "Left circular (L)",
    about: "Like R, but spinning the other way round.\n\nTurn a quarter-wave plate by 90° and it makes L instead of R. A mirror turns L back into R.",
    wave: { input: "L" },
  },
  "pol-none": {
    label: "Unpolarized",
    about: "A jumble of every direction, changing all the time, like sunlight or the light from a bulb.\n\nAny polarizer, turned any way, lets through exactly half of it, and what comes out is polarized.",
  },

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
