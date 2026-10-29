/* =====================================================================
   LASER MAZE  —  physics/pieces.js
   ---------------------------------------------------------------------
   The optical pieces a player can place, and what each one does to
   the beam. To add a new piece later (a beam splitter, a polarizer…)
   we add one more entry here, plus a drawing function in drawing/parts.js.

   Angles are in degrees, measured the way physicists do: from the
   horizontal, turning anticlockwise.
       45°  looks like  /
      135°  looks like  \
   ===================================================================== */

export const PIECES = {
  mirror: {
    label: "Mirror",

    // Tapping a placed mirror steps through these angles in order.
    // One more tap after the last angle picks the mirror back up.
    angles: [45, 135],

    // redirect: the beam arrives travelling in `direction`.
    // Which direction does it leave in?
    //
    // Law of reflection: angle in = angle out. A mirror at 45° to the
    // beam therefore turns it by exactly 90°. The two tables below
    // list every case for the two mirror angles.
    redirect(direction, angle) {
      if (angle === 45) return MIRROR_45[direction];
      return MIRROR_135[direction];
    },
  },
};

// Mirror like  /   e.g. a beam travelling right is sent up.
const MIRROR_45 = { right: "up", up: "right", left: "down", down: "left" };

// Mirror like  \   e.g. a beam travelling right is sent down.
const MIRROR_135 = { right: "down", down: "right", left: "up", up: "left" };
