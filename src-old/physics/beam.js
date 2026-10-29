/* =====================================================================
   LASER MAZE  —  physics/beam.js
   ---------------------------------------------------------------------
   The physics of the game: given a level and the pieces on the table,
   where does the light go? This file never draws anything. It only
   works out the beam's path and reports which detectors are lit.

   Positions here are measured in "cells", not pixels:
     x = 0.5, y = 0.5 is the centre of the top-left cell,
     x = 1.0 is the border between the first and second column.
   The drawing files multiply by the cell size to turn them into pixels.
   ===================================================================== */

import { PIECES } from "./pieces.js";


/* How one step in each direction changes the row and column.
   Rows count downwards, so going "up" means row − 1. */
export const DIRECTIONS = {
  up:    { dRow: -1, dCol:  0 },
  down:  { dRow:  1, dCol:  0 },
  left:  { dRow:  0, dCol: -1 },
  right: { dRow:  0, dCol:  1 },
};

// Safety limit: a beam may take at most this many steps, so it can
// never bounce around between mirrors forever.
const MAX_STEPS = 200;


/* ---------------------------------------------------------------------
   traceBeam — follows the laser beam one cell at a time.

   level   the level from levels.js (laser, detectors, walls)
   pieces  every piece on the table: the level's fixed pieces plus
           the ones the player placed. Each looks like
           { row: 2, col: 5, type: "mirror", angle: 45 }

   It returns:
     segments      the straight pieces of beam to draw, each with a
                   "from" point and a "to" point (in cell units)
     litDetectors  which detectors the beam reached (by their position
                   in the level's detector list: 0, 1, 2 …)
   --------------------------------------------------------------------- */
export function traceBeam(level, pieces, rows, cols) {
  const segments = [];
  const litDetectors = new Set();

  // Start inside the laser's own cell, heading the way it faces.
  let row = level.laser.row;
  let col = level.laser.col;
  let direction = level.laser.facing;          // "up", "down", …
  let start = { x: col + 0.5, y: row + 0.5 };

  for (let step = 0; step < MAX_STEPS; step++) {
    const move = DIRECTIONS[direction];
    const nextRow = row + move.dRow;
    const nextCol = col + move.dCol;

    // 1) Would the next step leave the table, or run into a wall or
    //    the laser itself? Then the beam stops at this cell's border.
    const offTable =
      nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols;

    if (offTable || isBlocker(level, nextRow, nextCol)) {
      const edge = {
        x: col + 0.5 + move.dCol * 0.5,
        y: row + 0.5 + move.dRow * 0.5,
      };
      segments.push({ from: start, to: edge });
      return { segments, litDetectors };
    }

    // 2) Otherwise, move into the next cell.
    row = nextRow;
    col = nextCol;
    const centre = { x: col + 0.5, y: row + 0.5 };

    // 3) Is there a detector here? It absorbs the beam and lights up.
    const detector = findAt(level.detectors, row, col);
    if (detector !== -1) {
      segments.push({ from: start, to: centre });
      litDetectors.add(detector);
      return { segments, litDetectors };
    }

    // 4) Is there a piece here? Ask it which way the beam goes next.
    //    The beam bends at the cell's centre, so the current straight
    //    segment ends here and a new one begins.
    const pieceIndex = findAt(pieces, row, col);
    if (pieceIndex !== -1) {
      const piece = pieces[pieceIndex];
      const newDirection = PIECES[piece.type].redirect(direction, piece.angle);
      if (newDirection !== direction) {
        segments.push({ from: start, to: centre });
        start = centre;
        direction = newDirection;
      }
    }
  }

  // Only reached if the safety limit kicks in.
  segments.push({ from: start, to: { x: col + 0.5, y: row + 0.5 } });
  return { segments, litDetectors };
}


/* A level is solved when every one of its detectors is lit. */
export function isSolved(level, litDetectors) {
  return litDetectors.size === level.detectors.length;
}


/* ---- small helpers -------------------------------------------------- */

// Finds the item sitting at (row, col) in a list such as level.walls.
// Returns its position in the list, or −1 if nothing is there.
export function findAt(list = [], row, col) {
  return list.findIndex((item) => item.row === row && item.col === col);
}

// Walls and the laser's own body stop the beam.
function isBlocker(level, row, col) {
  const hitsLaser = level.laser.row === row && level.laser.col === col;
  return hitsLaser || findAt(level.walls, row, col) !== -1;
}
