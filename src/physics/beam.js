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
   one splitter, 0.25 after two, and so on. Since Chapter 3 it also
   carries a polarization, "pol" (see physics/pieces.js), and since
   Chapter 5 a list of colours (see physics/colour.js).

   Positions here are measured in "cells", not pixels:
     x = 0.5, y = 0.5 is the centre of the top-left cell,
     x = 1.0 is the border between the first and second column.
   The drawing files multiply by the cell size to turn them into pixels.
   ===================================================================== */

import { PIECES } from "./pieces.js";
import { acceptedShare } from "./polarization.js";
import { coloursOf, shareOf, ALL_COLOURS } from "./colour.js";


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
                    "from" point, a "to" point (in cell units), the
                    "power" of the light along it and its "pol"
     detectorPower  how much light each detector counts, in the same
                    order as the level's detector list, e.g. [0.5, 0.25]
     arrived        how much light reached each detector before any
                    polarization or colour filtering (for helpful messages)
     seen           which colours reached each detector (a Set each)
   --------------------------------------------------------------------- */
export function traceBeam(level, pieces, rows, cols) {
  const segments = [];
  const detectorPower = level.detectors.map(() => 0);
  const arrived = level.detectors.map(() => 0);
  const seen = level.detectors.map(() => new Set());

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
    pol: laserPolarization(level.laser),
    colours: coloursOf(level.laser.color),
  }];

  let steps = 0;

  while (todo.length > 0 && steps < MAX_STEPS) {
    const beam = todo.shift();             // take the first beam on the list
    let { row, col, direction } = beam;
    const { power, pol, colours } = beam;
    let start = { x: col + 0.5, y: row + 0.5 };

    // A beam pushed sideways by calcite first steps sideways one cell,
    // then turns back to its real direction ("then").
    let then = beam.then || null;

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
        segments.push({ from: start, to: edge, power, pol, colours });
        break;
      }

      // 2) Otherwise, move into the next cell.
      row = nextRow;
      col = nextCol;
      const centre = { x: col + 0.5, y: row + 0.5 };

      // Finished the sideways step? Turn back to the real direction.
      if (then) {
        segments.push({ from: start, to: centre, power, pol, colours });
        start = centre;
        direction = then;
        then = null;
      }

      // Already been here, going this way, with this polarization?
      // Then stop (see "visited").
      const key = `${row},${col},${direction},${pol},${colours.join("+")}`;
      if (visited.has(key)) {
        segments.push({ from: start, to: centre, power, pol, colours });
        break;
      }
      visited.add(key);

      // 3) A detector absorbs the beam and adds its power to the
      //    reading: all of it, or only the polarization it accepts.
      const detector = findAt(level.detectors, row, col);
      if (detector !== -1) {
        segments.push({ from: start, to: centre, power, pol, colours });
        const d = level.detectors[detector];
        // A coloured detector only counts its own colour.
        const colourShare = d.color && d.color !== "white" ? shareOf(colours, [d.color]) : 1;
        detectorPower[detector] += power * colourShare * acceptedShare(d, pol);
        arrived[detector] += power;
        colours.forEach((c) => seen[detector].add(c));
        break;
      }

      // 4) A piece: ask it what comes out.
      const pieceIndex = findAt(pieces, row, col);
      if (pieceIndex !== -1) {
        const piece = pieces[pieceIndex];
        const outputs = PIECES[piece.type].split(direction, piece.angle, { pol, colours });

        // The beam we were following ends here...
        segments.push({ from: start, to: centre, power, pol, colours });

        // ...and each output becomes a new beam on the to-do list,
        // starting from this cell, with its share of the power.
        for (const out of outputs) {
          const newPower = power * out.share;
          if (newPower >= FAINTEST) {
            todo.push({
              row,
              col,
              direction: out.shift || out.direction,   // sideways first, if shifted
              then: out.shift ? out.direction : null,
              power: newPower,
              pol: out.pol,
              colours: out.colours || colours,
            });
          }
        }
        break;
      }
    }
  }

  return { segments, detectorPower, arrived, seen };
}


/* ---------------------------------------------------------------------
   The laser's polarization, from the level. Lasers are polarized
   (0° unless the level says otherwise). polarization: "none" gives
   an unpolarized source; "R" or "L" a circularly polarized one.
   --------------------------------------------------------------------- */
function laserPolarization(laser) {
  if (laser.polarization === "none") return null;
  return laser.polarization ?? 0;
}


/* ---------------------------------------------------------------------
   Is a detector happy?
     need: 0.5       it needs AT LEAST 50% of the laser's light
     max: 0.5        it can take AT MOST 50% (a delicate sample)
     color: "green"  it only counts green light
     color: "white"  it needs red, green AND blue to arrive
   Detectors with none of these are happy with any light at all.
   --------------------------------------------------------------------- */

// The tiny 0.0001 forgives rounding, e.g. 0.25 + 0.25 + 0.5 = 0.99999…
const ROUNDING = 0.0001;

export function detectorNeed(detector) {
  return detector.need || FAINTEST;
}

export function hasEnough(detector, power) {
  return power + ROUNDING >= detectorNeed(detector);
}

export function hasTooMuch(detector, power) {
  return detector.max !== undefined && power - ROUNDING > detector.max;
}

/* For a white detector: which colours are still missing. */
export function missingColours(detector, seenColours) {
  if (detector.color !== "white") return [];
  return ALL_COLOURS.filter((c) => !seenColours || !seenColours.has(c));
}

export function isDetectorLit(detector, power, seenColours) {
  return (
    hasEnough(detector, power) &&
    !hasTooMuch(detector, power) &&
    missingColours(detector, seenColours).length === 0
  );
}

/* A level is solved when it has detectors and every one is happy. */
export function isSolved(level, detectorPower, seen) {
  return (
    level.detectors.length > 0 &&
    level.detectors.every((d, i) => isDetectorLit(d, detectorPower[i], seen && seen[i]))
  );
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
