/* =====================================================================
   LASER MAZE  —  physics/pieces.js
   ---------------------------------------------------------------------
   The optical pieces a player can place, and what each one does to
   the beam. To add a new piece later (a polarizer, a wave plate…)
   we add one more entry here, plus a drawing function in
   drawing/parts.js.

   Angles are in degrees, measured the way physicists do: from the
   horizontal, turning anticlockwise.
       45°  looks like  /
      135°  looks like  \

   Every piece answers one question, in its "split" function:
     "A beam arrives travelling in this direction. What comes out?"
   The answer is a list of outgoing beams, each with a direction and
   a "share" of the light: 1 means all of it, 0.5 means half.
   ===================================================================== */

export const PIECES = {
  mirror: {
    label: "Mirror",

    // Tapping a placed piece steps through these angles in order.
    // One more tap after the last angle picks it back up.
    angles: [45, 135],

    // Law of reflection: angle in = angle out. A mirror at 45° to the
    // beam therefore turns it by exactly 90°, and all the light goes
    // the new way.
    split(direction, angle) {
      return [{ direction: reflect(direction, angle), share: 1 }];
    },
  },

  splitter: {
    label: "Beam splitter",
    angles: [45, 135],

    // A 50:50 beam splitter is a glass cube with a half-silvered
    // surface inside. Half the light passes straight through; the
    // other half reflects, exactly as it would from a mirror.
    split(direction, angle) {
      return [
        { direction: direction, share: 0.5 },                  // passes through
        { direction: reflect(direction, angle), share: 0.5 },  // reflects
      ];
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
