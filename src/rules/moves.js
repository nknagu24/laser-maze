/* =====================================================================
   LASER MAZE  —  rules/moves.js
   ---------------------------------------------------------------------
   What the player is allowed to do on the table: where pieces may go,
   how many are left in the tray, and what a tap does.
   ===================================================================== */

import { PIECES } from "../physics/pieces.js";
import { findAt } from "../physics/beam.js";
import { state } from "../state.js";


/* Is this cell taken by something the level put there (laser,
   detector, wall or fixed piece)? Players can't place on those. */
export function isTakenByLevel(level, row, col) {
  return (
    (level.laser.row === row && level.laser.col === col) ||
    findAt(level.detectors, row, col) !== -1 ||
    findAt(level.walls, row, col) !== -1 ||
    findAt(level.fixed, row, col) !== -1
  );
}

/* How many of this piece type are still in the tray? */
export function piecesLeft(level, type) {
  const given = level.tray[type] || 0;
  const used = state.placed.filter((p) => p.type === type).length;
  return given - used;
}

/* The player tapped the cell (row, col). Decide what happens:
     • a placed piece → turn it to its next angle, or pick it up
       after its last angle
     • an empty hole  → place the selected tray piece there
     • anything else  → nothing */
export function handleTap(level, row, col) {
  const index = findAt(state.placed, row, col);

  if (index !== -1) {
    const piece = state.placed[index];
    const angles = PIECES[piece.type].angles;
    const next = angles.indexOf(piece.angle) + 1;
    if (next < angles.length) {
      piece.angle = angles[next];          // turn it
    } else {
      state.placed.splice(index, 1);       // pick it up (back to tray)
    }
    return;
  }

  if (isTakenByLevel(level, row, col)) return;
  if (!state.selected || piecesLeft(level, state.selected) <= 0) return;

  state.placed.push({
    row,
    col,
    type: state.selected,
    angle: PIECES[state.selected].angles[0],   // starts at its first angle
  });
}
