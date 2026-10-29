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

/* ---------------------------------------------------------------------
   sandboxTap — the Sandbox's extra moves. Returns true if it handled
   the tap:
     • tapping the laser turns it a quarter turn clockwise
     • tapping a detector removes it
     • with "Detector" chosen, tapping an empty hole places one
   --------------------------------------------------------------------- */
const NEXT_FACING = { right: "down", down: "left", left: "up", up: "right" };

function sandboxTap(level, row, col) {
  if (level.laser.row === row && level.laser.col === col) {
    level.laser.facing = NEXT_FACING[level.laser.facing];
    return true;
  }

  const detector = findAt(level.detectors, row, col);
  if (detector !== -1) {
    level.detectors.splice(detector, 1);
    return true;
  }

  if (state.selected === "detector") {
    const free = findAt(state.placed, row, col) === -1 && !isTakenByLevel(level, row, col);
    if (free) level.detectors.push({ row, col });
    return true;
  }

  return false;
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
  // Sandbox extras: turn the laser, and place or remove detectors.
  if (level.sandbox && sandboxTap(level, row, col)) return;

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
