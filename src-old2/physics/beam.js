/* =====================================================================
   LASER MAZE  —  physics/beam.js
   ---------------------------------------------------------------------
   The physics of the game: given a level and the pieces on the table,
   where does the light go, and how much of it reaches each detector?
   This file never draws anything.

   Since Chapter 2, one laser can become several beams (a beam splitter
   makes two). So instead of following a single beam, we keep a
   "to-do list" of beams. We follow the first one until it stops; if
   it hits a splitter, the new beam it creates is added to the list.
   When the list is empty, we're done.

   Every beam carries a "power": 1 straight out of the laser, 0.5 after
   one splitter, 0.25 after two, and so on.

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

// Safety limit: the total number of steps all beams together may take.
const MAX_STEPS = 1000;

// Beams weaker than this are too faint to matter; we stop following them.
const FAINTEST = 0.01;


/* ---------------------------------------------------------------------
   traceBeam — follows every beam one cell at a time.

   level   the level from data/levels.js (laser, detectors, walls)
   pieces  every piece on the table: the level's fixed pieces plus
           the ones the player placed. Each looks like
           { row: 2, col: 5, type: "mirror", angle: 45 }

   It returns:
     segments       the straight pieces of beam to draw, each with a
                    "from" point, a "to" point (in cell units) and the
                    "power" of the light along it
     detectorPower  how much light reached each detector, in the same
                    order as the level's detector list, e.g. [0.5, 0.25]
   --------------------------------------------------------------------- */
export function traceBeam(level, pieces, rows, cols) {
  const segments = [];
  const detectorPower = level.detectors.map(() => 0);

  // Every (cell, direction) a beam has already passed through. If a
  // beam arrives somewhere the same way a beam already did, its path
  // from here on is already traced, so we stop. This also stops beams
  // going round in circles between splitters forever.
  const visited = new Set();

  // The to-do list, starting with the beam leaving the laser.
  const todo = [{
    row: level.laser.row,
    col: level.laser.col,
    direction: level.laser.facing,
    power: 1,
  }];

  let steps = 0;

  while (todo.length > 0 && steps < MAX_STEPS) {
    const beam = todo.shift();             // take the first beam on the list
    let { row, col, direction } = beam;
    const power = beam.power;
    let start = { x: col + 0.5, y: row + 0.5 };

    // Follow this one beam until it stops.
    while (steps < MAX_STEPS) {
      steps++;
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
        segments.push({ from: start, to: edge, power });
        break;
      }

      // 2) Otherwise, move into the next cell.
      row = nextRow;
      col = nextCol;
      const centre = { x: col + 0.5, y: row + 0.5 };

      // Already been here, going this way? Then stop (see "visited").
      const key = `${row},${col},${direction}`;
      if (visited.has(key)) {
        segments.push({ from: start, to: centre, power });
        break;
      }
      visited.add(key);

      // 3) A detector absorbs the beam and adds its power to the reading.
      const detector = findAt(level.detectors, row, col);
      if (detector !== -1) {
        segments.push({ from: start, to: centre, power });
        detectorPower[detector] += power;
        break;
      }

      // 4) A piece: ask it what comes out.
      const pieceIndex = findAt(pieces, row, col);
      if (pieceIndex !== -1) {
        const piece = pieces[pieceIndex];
        const outputs = PIECES[piece.type].split(direction, piece.angle);

        // The beam we were following ends here...
        segments.push({ from: start, to: centre, power });

        // ...and each output becomes a new beam on the to-do list,
        // starting from this cell, with its share of the power.
        for (const out of outputs) {
          const newPower = power * out.share;
          if (newPower >= FAINTEST) {
            todo.push({ row, col, direction: out.direction, power: newPower });
          }
        }
        break;
      }
    }
  }

  return { segments, detectorPower };
}


/* ---------------------------------------------------------------------
   Is a detector happy? It needs at least "need" of the light (for
   example need: 0.5 means 50%). Detectors without a "need" are happy
   with any light at all.
   --------------------------------------------------------------------- */
export function detectorNeed(detector) {
  return detector.need || FAINTEST;
}

export function isDetectorLit(detector, power) {
  // The tiny 0.0001 forgives rounding, e.g. 0.25 + 0.25 + 0.5 = 0.99999…
  return power + 0.0001 >= detectorNeed(detector);
}

/* A level is solved when every one of its detectors is happy. */
export function isSolved(level, detectorPower) {
  return level.detectors.every((d, i) => isDetectorLit(d, detectorPower[i]));
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
