/* =====================================================================
   LASER MAZE  —  physics/pieces.js
   ---------------------------------------------------------------------
   The optical pieces a player can place, and what each one does to
   the beam. To add a new piece, add one more entry here, plus a
   drawing function in drawing/parts.js.

   Every piece answers one question, in its "split" function:
     "A beam arrives travelling in this direction, with this
      polarization. What comes out?"
   The answer is a list of outgoing beams, each with
     direction  where it goes
     share      how much of the light it carries (1 = all, 0.5 = half)
     pol        its polarization afterwards

   ANGLES
   Angles are in degrees, measured from the horizontal, turning
   anticlockwise:   0° —    45° /    90° |    135° \
   For mirrors and splitters the angle is how the surface sits on the
   table. For polarizers and wave plates it's the direction of their axis.

   The polarization rules themselves live in physics/polarization.js.
   ===================================================================== */

import {
  reflectPol, throughPolarizer, halfWave, quarterWave,
} from "./polarization.js";


export const PIECES = {
  mirror: {
    label: "Mirror",

    // Tapping a placed piece steps through these angles in order.
    // One more tap after the last angle picks it back up.
    angles: [45, 135],

    // Law of reflection: angle in = angle out. A mirror at 45° to the
    // beam turns it by exactly 90°; all the light goes the new way.
    // Reflection also flips circular light from R to L and back.
    split(direction, angle, pol) {
      return [{ direction: reflect(direction, angle), share: 1, pol: reflectPol(pol) }];
    },
  },

  splitter: {
    label: "Beam splitter",
    angles: [45, 135],

    // A 50:50 beam splitter is a glass cube with a half-silvered
    // surface inside. Half the light passes straight through; the
    // other half reflects, exactly as it would from a mirror.
    split(direction, angle, pol) {
      return [
        { direction: direction, share: 0.5, pol },                               // passes through
        { direction: reflect(direction, angle), share: 0.5, pol: reflectPol(pol) }, // reflects
      ];
    },
  },

  polarizer: {
    label: "Polarizer",
    angles: [0, 45, 90, 135],

    // Only lets through the part of the wave wiggling along its axis
    // (Malus's law). What comes out is polarized along the axis.
    split(direction, angle, pol) {
      return [{ direction, share: throughPolarizer(pol, angle), pol: angle }];
    },
  },

  halfwave: {
    label: "Half-wave plate",
    angles: [0, 45, 90, 135],

    // Turns the polarization without losing any light.
    split(direction, angle, pol) {
      return [{ direction, share: 1, pol: halfWave(pol, angle) }];
    },
  },

  quarterwave: {
    label: "Quarter-wave plate",
    angles: [0, 45, 90, 135],

    // Turns linear light into circular light (and back), without
    // losing any light.
    split(direction, angle, pol) {
      return [{ direction, share: 1, pol: quarterWave(pol, angle) }];
    },
  },
};


/* ---------------------------------------------------------------------
   reflect — which way a beam goes after bouncing off a surface at 45°
   or 135°. Shared by the mirror and the beam splitter.
   --------------------------------------------------------------------- */

// Surface like  /   e.g. a beam travelling right is sent up.
const REFLECT_45 = { right: "up", up: "right", left: "down", down: "left" };

// Surface like  \   e.g. a beam travelling right is sent down.
const REFLECT_135 = { right: "down", down: "right", left: "up", up: "left" };

function reflect(direction, angle) {
  return angle === 45 ? REFLECT_45[direction] : REFLECT_135[direction];
}
