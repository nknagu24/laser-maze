/* =====================================================================
   LASER MAZE  —  data/levels.js
   ---------------------------------------------------------------------
   Every level is one block between { and }, separated by commas.
   Rows go DOWN from 0 (top) to 7 (bottom).
   Columns go ACROSS from 0 (left) to 7 (right).

   What each line means:
     name       the title shown above the board
     chapter    which chapter it belongs to (1 = Reflection)
     laser      where the laser sits, and which way it shoots:
                "up", "down", "left" or "right".
                Optional: polarization: 90 (or 0, 45, 135) sets the
                light's polarization; "R" or "L" makes it circular;
                "none" makes an unpolarized source. Without it, the
                light is at 0°.
     detectors  the targets; the level is solved when ALL are lit.
                Add  need: 0.5  to a detector to make it need at least
                50% of the laser's light (need: 1 means all of it).
                Add  max: 0.5  to make it a delicate sample that can
                take at most 50%. need and max together set a range;
                need: 0.25, max: 0.25 means exactly 25%.
                Add  accepts: "R"  (or "L", 0, 45, 90, 135) to make a
                detector count only that polarization, as if it had a
                filter in front.
     walls      blocks that stop the beam (can be an empty list: [])
     fixed      pieces already bolted to the table; the player can't
                move or turn them (optional; leave out if none)
     tray       the pieces the player gets, e.g. { mirror: 2 }
                or { mirror: 1, splitter: 2 }. The first one listed is
                selected when the level opens.
     par        the fewest pieces that solve the level. Solving with
                par or fewer earns ★★★, one more earns ★★, more ★
     note       a short explanation shown under the board

   Every level needs its own unique name: saved stars are stored under
   the name, so renaming a level resets its stars for visitors.

   Piece types: "mirror", "splitter", "polarizer", "halfwave" and
   "quarterwave" (see physics/pieces.js).
   Angles: 0 looks like  —   45 like  /   90 like  |   135 like  \
   Mirrors and splitters use 45 or 135; the others can use all four.
   ===================================================================== */

// Shortcuts for writing a straight line of walls:
//   wallRow(4, [0, 1, 2])  → walls at row 4, columns 0, 1 and 2
//   wallCol(3, [5, 6])     → walls at column 3, rows 5 and 6
const wallRow = (row, cols) => cols.map((col) => ({ row, col }));
const wallCol = (col, rows) => rows.map((row) => ({ row, col }));


/* Chapter titles, shown on the level-select screen. */
export const CHAPTERS = {
  1: "Reflection",
  2: "Splitting",
  3: "Polarization",
  4: "Wave plates",
};


export const LEVELS = [
  /* ---------------- Chapter 1: Reflection ---------------- */
  {
    name: "First Bounce",
    chapter: 1,
    laser: { row: 6, col: 0, facing: "right" },
    detectors: [{ row: 1, col: 4 }],
    walls: [],
    tray: { mirror: 2 },
    par: 1,
    note: "Angle in equals angle out. A mirror at 45° turns the beam by exactly 90°.",
  },
  {
    name: "Periscope",
    chapter: 1,
    laser: { row: 6, col: 0, facing: "right" },
    detectors: [{ row: 2, col: 7 }],
    walls: wallRow(4, [0, 1, 2, 4, 5, 6, 7]),
    tray: { mirror: 3 },
    par: 2,
    note: "Two parallel mirrors shift a beam sideways without changing its direction. Submarine periscopes work exactly this way.",
  },
  {
    name: "Around the Block",
    chapter: 1,
    laser: { row: 1, col: 0, facing: "right" },
    detectors: [{ row: 1, col: 7 }],
    walls: [{ row: 1, col: 4 }],
    tray: { mirror: 4 },
    par: 3,
    note: "Each mirror turns the beam a quarter turn. Getting back on course takes more than one.",
  },
  {
    name: "U-Turn",
    chapter: 1,
    laser: { row: 3, col: 6, facing: "left" },
    detectors: [{ row: 3, col: 7 }],
    walls: wallRow(2, [6, 7]),
    tray: { mirror: 4 },
    par: 3,
    note: "Three quarter turns bring the beam all the way round. Optical setups fold long beam paths into small tables like this.",
  },
  {
    name: "Switchback",
    chapter: 1,
    laser: { row: 0, col: 0, facing: "down" },
    detectors: [{ row: 7, col: 7 }],
    walls: [...wallRow(2, [0, 1, 2, 3, 4, 5, 6]), ...wallRow(5, [1, 2, 3, 4, 5, 6, 7])],
    fixed: [{ row: 4, col: 7, type: "mirror", angle: 45 }],
    tray: { mirror: 5 },
    par: 4,
    note: "Pump–probe experiments fold the probe beam like this on a delay line. Every extra 0.3 mm of path delays the pulse by one picosecond.",
  },

  /* ---------------- Chapter 2: Splitting ---------------- */
  {
    name: "Half and Half",
    chapter: 2,
    laser: { row: 3, col: 0, facing: "right" },
    detectors: [{ row: 3, col: 7 }, { row: 0, col: 4 }],
    walls: [],
    tray: { splitter: 2 },
    par: 1,
    note: "A beam splitter lets half the light pass straight through and reflects the other half. Each detector reads 50%.",
  },
  {
    name: "Three Ways",
    chapter: 2,
    laser: { row: 4, col: 0, facing: "right" },
    detectors: [{ row: 0, col: 3 }, { row: 7, col: 5 }, { row: 4, col: 7 }],
    walls: [],
    tray: { splitter: 3 },
    par: 2,
    note: "Split twice and the light is shared 50% + 25% + 25%. It still adds up to 100%: light can be divided, but never created.",
  },
  {
    name: "Power Budget",
    chapter: 2,
    laser: { row: 7, col: 0, facing: "right" },
    detectors: [{ row: 7, col: 7, need: 0.5 }, { row: 0, col: 2 }, { row: 3, col: 6 }],
    walls: [],
    tray: { splitter: 3, mirror: 1 },
    par: 2,
    note: "The order of the splits matters. Give the detector that needs 50% its share first, then divide what's left.",
  },
  {
    name: "Pump and Probe",
    chapter: 2,
    laser: { row: 3, col: 0, facing: "right" },
    detectors: [{ row: 3, col: 7, need: 1 }],
    walls: [],
    fixed: [{ row: 3, col: 2, type: "splitter", angle: 45 }],
    tray: { mirror: 3 },
    par: 2,
    note: "In a pump–probe experiment one laser pulse is split in two: the pump excites the sample and the probe checks on it a moment later. Both halves must meet at the sample.",
  },

  /* ---------------- Chapter 3: Polarization ---------------- */
  {
    name: "Attenuator",
    chapter: 3,
    laser: { row: 3, col: 0, facing: "right" },
    detectors: [{ row: 3, col: 7, need: 0.5, max: 0.5 }],
    walls: [],
    tray: { polarizer: 1 },
    par: 1,
    note: "The ticks on the beam show its polarization. A polarizer turned 45° away from it lets through cos²45° = half (Malus's law). Physicists dim lasers this way to protect delicate samples.",
  },
  {
    name: "Sunlight",
    chapter: 3,
    laser: { row: 1, col: 0, facing: "right", polarization: "none" },
    detectors: [{ row: 1, col: 7, need: 0.5, max: 0.5 }],
    walls: [],
    tray: { polarizer: 1 },
    par: 1,
    note: "This source is unpolarized, like sunlight: no ticks, because it wiggles every which way. Any polarizer keeps exactly half, whichever way you turn it. Try them all.",
  },
  {
    name: "Crossed Polarizers",
    chapter: 3,
    laser: { row: 3, col: 0, facing: "right" },
    detectors: [{ row: 3, col: 7 }],
    walls: [],
    fixed: [{ row: 3, col: 5, type: "polarizer", angle: 90 }],
    tray: { polarizer: 1 },
    par: 1,
    note: "Polarizers at 90° to each other block everything. Yet adding a third one between them, at 45°, lets light through! A polarizer doesn't only filter light; it turns what passes to its own angle.",
  },
  {
    name: "Two Analyzers",
    chapter: 3,
    laser: { row: 4, col: 0, facing: "right" },
    detectors: [{ row: 4, col: 7 }, { row: 0, col: 3 }],
    walls: [{ row: 0, col: 2 }, { row: 0, col: 4 }, { row: 3, col: 7 }, { row: 5, col: 7 }],
    fixed: [
      { row: 4, col: 6, type: "polarizer", angle: 0 },
      { row: 1, col: 3, type: "polarizer", angle: 90 },
    ],
    tray: { splitter: 1, polarizer: 1, mirror: 1 },
    par: 2,
    note: "Each detector hides behind its own polarizer, one flat and one upright. Polarizers used this way are called analyzers: they let a detector measure only one polarization.",
  },
  {
    name: "Exact Dose",
    chapter: 3,
    laser: { row: 6, col: 0, facing: "right" },
    detectors: [{ row: 6, col: 7, need: 0.5 }, { row: 1, col: 3, need: 0.25, max: 0.25 }],
    walls: [],
    tray: { splitter: 1, polarizer: 2 },
    par: 2,
    note: "One sample needs at least half the light; the other must get exactly 25%. Split the beam, then dim just one arm with a polarizer.",
  },

  /* ---------------- Chapter 4: Wave plates ---------------- */
  {
    name: "Turning Light",
    chapter: 4,
    laser: { row: 3, col: 0, facing: "right" },
    detectors: [{ row: 3, col: 7, need: 1 }],
    walls: [],
    fixed: [{ row: 3, col: 6, type: "polarizer", angle: 90 }],
    tray: { halfwave: 1, polarizer: 1 },
    par: 1,
    note: "A polarizer can only turn light by throwing some away. A half-wave plate turns it for free: with its axis at 45°, flat light comes out upright, at full power.",
  },
  {
    name: "Going Circular",
    chapter: 4,
    laser: { row: 3, col: 0, facing: "right" },
    detectors: [{ row: 3, col: 7, accepts: "R", need: 1 }],
    walls: [],
    tray: { quarterwave: 1 },
    par: 1,
    note: "A quarter-wave plate with its axis 45° from the light's polarization makes circular light: the wiggle spins round as it travels. Turn the plate the other way and it spins the other way.",
  },
  {
    name: "Left and Right",
    chapter: 4,
    laser: { row: 6, col: 0, facing: "right" },
    detectors: [{ row: 6, col: 7, accepts: "R", need: 0.5 }, { row: 1, col: 4, accepts: "L", need: 0.5 }],
    walls: [],
    tray: { quarterwave: 2, splitter: 1 },
    par: 2,
    note: "One detector wants right-handed light, the other left-handed. Here's a trick: reflection reverses the spin, so a single beam splitter can serve both.",
  },
  {
    name: "Mirror Flip",
    chapter: 4,
    laser: { row: 6, col: 0, facing: "right" },
    detectors: [{ row: 1, col: 5, accepts: "R", need: 1 }],
    walls: [],
    fixed: [{ row: 6, col: 1, type: "quarterwave", angle: 135 }],
    tray: { mirror: 3, halfwave: 1 },
    par: 2,
    note: "Every mirror flips circular light between R and L, so the number of bounces matters. In helicity-resolved experiments, physicists count every mirror between the wave plate and the sample.",
  },
];
