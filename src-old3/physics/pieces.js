/* =====================================================================
   LASER MAZE  —  physics/pieces.js
   ---------------------------------------------------------------------
   The optical pieces a player can place, and what each one does to
   the beam. To add a new piece (a wave plate, say), add one more entry
   here, plus a drawing function in drawing/parts.js.

   Every piece answers one question, in its "split" function:
     "A beam arrives travelling in this direction, with this
      polarization. What comes out?"
   The answer is a list of outgoing beams, each with
     direction  where it goes
     share      how much of the light it carries (1 = all, 0.5 = half)
     pol        its polarization afterwards (see below)

   ANGLES
   Angles are in degrees, measured from the horizontal, turning
   anticlockwise:   0° —    45° /    90° |    135° \

   For mirrors and splitters the angle is how the surface sits on the
   table. For polarizers it is the direction of the polarizer's axis.

   POLARIZATION ("pol")
   Light is a wave, and its electric field wiggles side to side as it
   travels. The polarization is the direction of that wiggle, as seen
   looking straight along the beam:
     0    wiggles flat, parallel to the table
     90   wiggles straight up and down
     45, 135   diagonal
     null unpolarized: a jumble of every direction, like sunlight
   ===================================================================== */

export const PIECES = {
  mirror: {
    label: "Mirror",

    // Tapping a placed piece steps through these angles in order.
    // One more tap after the last angle picks it back up.
    angles: [45, 135],

    // Law of reflection: angle in = angle out. A mirror at 45° to the
    // beam turns it by exactly 90°; all the light goes the new way.
    // (Real mirrors can nudge the polarization slightly; here they don't.)
    split(direction, angle, pol) {
      return [{ direction: reflect(direction, angle), share: 1, pol }];
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
        { direction: direction, share: 0.5, pol },                  // passes through
        { direction: reflect(direction, angle), share: 0.5, pol },  // reflects
      ];
    },
  },

  polarizer: {
    label: "Polarizer",

    // A polarizer can be turned to four positions: — / | \
    angles: [0, 45, 90, 135],

    // A polarizer only lets through the part of the wave that wiggles
    // along its axis. The beam keeps going straight, but:
    //   • unpolarized light loses half its power
    //   • polarized light keeps cos²(difference in angle) of its power
    //     — this is Malus's law (1809):
    //        same angle     → cos²0°  = 1   (all of it)
    //        45° apart      → cos²45° = 0.5 (half)
    //        90° apart      → cos²90° = 0   (none)
    // Either way, what comes out is polarized along the axis.
    split(direction, angle, pol) {
      let share;
      if (pol === null) {
        share = 0.5;
      } else {
        const difference = ((pol - angle) * Math.PI) / 180;   // in radians
        share = Math.cos(difference) ** 2;
      }
      return [{ direction, share, pol: angle }];
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
