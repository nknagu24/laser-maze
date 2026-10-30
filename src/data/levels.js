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
                Optional: color: "white" (or "green", "blue") sets the
                light's colour. Without it, the laser is red.
     detectors  the targets; the level is solved when ALL are lit.
                Add  need: 0.5  to a detector to make it need at least
                50% of the laser's light (need: 1 means all of it).
                Add  max: 0.5  to make it a delicate sample that can
                take at most 50%. need and max together set a range;
                need: 0.25, max: 0.25 means exactly 25%.
                Add  accepts: "R"  (or "L", 0, 45, 90, 135) to make a
                detector count only that polarization, as if it had a
                filter in front.
                Add  color: "green"  (or "red", "blue") to make it count
                only that colour; color: "white" means it needs red,
                green AND blue to arrive.
     walls      blocks that stop the beam (can be an empty list: [])
     fixed      pieces already bolted to the table; the player can't
                move or turn them (optional; leave out if none)
     tray       the pieces the player gets, e.g. { mirror: 2 }
                or { mirror: 1, splitter: 2 }. The first one listed is
                selected when the level opens.
     par        the fewest pieces that solve the level. Solving with
                par or fewer earns ★★★, one more earns ★★, more ★.
                Leave it out and the level gives no stars, just "Solved".
     tutorial   (training levels only) the guided steps; see below
     note       a short explanation shown under the board

   Every level needs its own unique name: saved stars are stored under
   the name, so renaming a level resets its stars for visitors.

   Piece types: "mirror", "splitter", "polarizer", "wollaston",
   "halfwave", "quarterwave", "pbs", "displacer", "prism", "dye"
   (yellow, glows green), "dye-orange" (glows red), "dichroic-red",
   "dichroic-green" and "dichroic-blue" (see physics/pieces.js).
   In a tray, names with a dash need quotes: { "dichroic-green": 1 }.
   Angles: 0 looks like  —   45 like  /   90 like  |   135 like  \
   Mirrors and splitters use 45 or 135; the others can use all four.

   TRAINING STEPS
   A training level has a "tutorial" list. Each step shows its "say"
   text in a bubble and waits for one thing:
     next: "Next"                      a button in the bubble to press
     select: "splitter"                pick that piece in the tray
     place: { row, col, type }         put that piece on the glowing hole
     turn: { row, col, until: 135 }    tap the piece until it reaches
                                       that angle (an arrow shows how)
   Taps anywhere else show a short "not there" pop-up.
   Any step can also show an animated light wave in its bubble:
     wave: { input: 45, element: { type: "polarizer", angle: 0 } }
     wave: { input: 45, crystal: { retard: 90 } }
   (see drawing/wave.js for what it draws).

   Guided levels in chapter 0 are called "Training": they're always
   open, and Chapter 1 opens even if the player skips them. Guided
   levels inside other chapters are called "Guides": they unlock in
   order like ordinary levels.
   ===================================================================== */

// Shortcuts for writing a straight line of walls:
//   wallRow(4, [0, 1, 2])  → walls at row 4, columns 0, 1 and 2
//   wallCol(3, [5, 6])     → walls at column 3, rows 5 and 6
const wallRow = (row, cols) => cols.map((col) => ({ row, col }));
const wallCol = (col, rows) => rows.map((row) => ({ row, col }));


/* Chapter titles, shown on the level-select screen. */
export const CHAPTERS = {
  0: "Training",
  1: "Reflection",
  2: "Splitting",
  3: "Polarization",
  4: "Birefringence",
  5: "Colour",
};


export const LEVELS = [
  /* ---------------- Training ---------------- */
  {
    name: "First Steps",
    chapter: 0,
    laser: { row: 4, col: 7, facing: "left" },
    detectors: [{ row: 0, col: 3 }],
    walls: [],
    tray: { mirror: 1 },
    note: "Mirrors turn the beam by 90°. Tap a mirror to turn it; tap it once more to pick it up.",
    tutorial: [
      {
        say: "Welcome to the optical table! The laser on the right shoots a beam of light. Your goal: get the light into the detector at the top.",
        next: "Next",
      },
      {
        say: "Light travels in straight lines, so we need to steer it. Tap the glowing hole to place a mirror there.",
        place: { row: 4, col: 3, type: "mirror" },
      },
      {
        say: "The mirror turned the beam, but the wrong way: it goes down. Tap the mirror again to turn it.",
        turn: { row: 4, col: 3, until: 135 },
      },
      {
        say: "The detector glows green: solved! Tip: tapping a mirror once more picks it up, and Reset clears the table.",
        next: "Got it",
      },
    ],
  },
  {
    name: "Using the Tray",
    chapter: 0,
    laser: { row: 3, col: 0, facing: "right" },
    detectors: [{ row: 3, col: 7 }, { row: 0, col: 4 }],
    walls: [],
    tray: { mirror: 1, splitter: 1 },
    note: "The tray under the table holds the optics for each level. Tap one to choose it before placing it.",
    tutorial: [
      {
        say: "This time there are two detectors, and the tray below the table holds two kinds of optics.",
        next: "Next",
      },
      {
        say: "Tap the glowing Beam splitter card in the tray to choose it.",
        select: "splitter",
      },
      {
        say: "Now tap the glowing hole to place the beam splitter.",
        place: { row: 3, col: 4, type: "splitter" },
      },
      {
        say: "A beam splitter sends half the light straight on and half sideways. The number on each detector shows how much light it gets: 50% each.",
        next: "Next",
      },
      {
        say: "Solve levels with as few optics as possible to earn ★★★. Tap ⓘ any time to read about the physics. Have fun!",
        next: "Start playing",
      },
    ],
  },

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
    name: "Meet Polarization",
    chapter: 3,
    laser: { row: 3, col: 0, facing: "right" },
    detectors: [{ row: 3, col: 7, need: 0.5, max: 0.5 }],
    walls: [],
    tray: { polarizer: 1 },
    note: "A polarizer only passes the part of the wave wiggling along its lines: 45° apart lets through cos²45° = half the power (Malus's law). Physicists dim lasers this way to protect delicate samples.",
    tutorial: [
      {
        say: "Light is a wave. Its electric field (red) wiggles from side to side as it travels along the beam. The direction of that wiggle is called its polarization.",
        wave: { input: 90 },
        next: "Next",
      },
      {
        say: "The little circles show the same wiggle as if you looked straight down the beam. Our laser's light wiggles flat, parallel to the table: that's the — badge on the beam.",
        wave: { input: 0 },
        next: "Next",
      },
      {
        say: "A polarizer only lets through the part of the wiggle along its lines. Here diagonal light meets a flat polarizer: what comes out is flat, and carries half the power.",
        wave: { input: 45, element: { type: "polarizer", angle: 0 } },
        next: "Next",
      },
      {
        say: "Your turn. This delicate sample needs exactly 50%. Place the polarizer on the glowing hole.",
        place: { row: 3, col: 3, type: "polarizer" },
      },
      {
        say: "Its lines are flat, like the light, so everything gets through: too bright! Tap it to turn it to /.",
        turn: { row: 3, col: 3, until: 45 },
      },
      {
        say: "Exactly half! 45° apart passes half the power. Turned upright (|) it would block everything: try it after this lesson.",
        wave: { input: 0, element: { type: "polarizer", angle: 45 } },
        next: "Got it",
      },
    ],
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
    name: "Fork in the Road",
    chapter: 3,
    laser: { row: 3, col: 0, facing: "right", polarization: "none" },
    detectors: [{ row: 0, col: 4, accepts: 90, need: 0.5 }, { row: 7, col: 4, accepts: 0, need: 0.5 }],
    walls: [],
    tray: { wollaston: 1, polarizer: 1 },
    par: 1,
    note: "A Wollaston prism splits light by polarization and sends both parts off at an angle, one each way. Astronomers use them to measure the polarization of starlight.",
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

  /* ---- Chapter 3, part two: wave plates ---- */
  {
    name: "Wave Plates",
    chapter: 3,
    laser: { row: 3, col: 0, facing: "right" },
    detectors: [{ row: 3, col: 7, accepts: "R", need: 1 }],
    walls: [],
    tray: { halfwave: 1, quarterwave: 1 },
    note: "A quarter-wave plate with its axis 45° from the light's polarization makes circular light. Turn it the other way and it spins the other way.",
    tutorial: [
      {
        say: "Wave plates are made of special crystals. Instead of throwing light away like a polarizer, they change its polarization, so no power is lost.",
        next: "Next",
      },
      {
        say: "A half-wave plate (½) turns the polarization. Here, with its axis at 45°, it turns flat light upright, at full strength.",
        wave: { input: 0, element: { type: "halfwave", angle: 45 } },
        next: "Next",
      },
      {
        say: "A quarter-wave plate (¼) does something stranger: the wiggle starts to spin round as the wave travels. This is circular polarization, shown on the beam as R or L.",
        wave: { input: 0, element: { type: "quarterwave", angle: 135 } },
        next: "Next",
      },
      {
        say: "This detector only counts right-handed (R) light. Tap the glowing quarter-wave plate card in the tray.",
        select: "quarterwave",
      },
      {
        say: "Place it on the glowing hole.",
        place: { row: 3, col: 3, type: "quarterwave" },
      },
      {
        say: "Its axis is flat, like the light, so nothing changes yet. Keep tapping it until the light comes out as R.",
        turn: { row: 3, col: 3, until: 135 },
      },
      {
        say: "Right-handed light: 100%! At the opposite angle you'd get L. And watch out: every mirror flips R and L.",
        wave: { input: 0, element: { type: "quarterwave", angle: 135 } },
        next: "Got it",
      },
    ],
  },
  {
    name: "Turning Light",
    chapter: 3,
    laser: { row: 3, col: 0, facing: "right" },
    detectors: [{ row: 3, col: 7, need: 1 }],
    walls: [],
    fixed: [{ row: 3, col: 6, type: "polarizer", angle: 90 }],
    tray: { halfwave: 1, polarizer: 1 },
    par: 1,
    note: "A polarizer can only turn light by throwing some away. A half-wave plate turns it for free: with its axis at 45°, flat light comes out upright, at full power.",
  },
  {
    name: "Left and Right",
    chapter: 3,
    laser: { row: 6, col: 0, facing: "right" },
    detectors: [{ row: 6, col: 7, accepts: "R", need: 0.5 }, { row: 1, col: 4, accepts: "L", need: 0.5 }],
    walls: [],
    tray: { quarterwave: 2, splitter: 1 },
    par: 2,
    note: "One detector wants right-handed light, the other left-handed. Here's a trick: reflection reverses the spin, so a single beam splitter can serve both.",
  },
  {
    name: "Mirror Flip",
    chapter: 3,
    laser: { row: 6, col: 0, facing: "right" },
    detectors: [{ row: 1, col: 5, accepts: "R", need: 1 }],
    walls: [],
    fixed: [{ row: 6, col: 1, type: "quarterwave", angle: 135 }],
    tray: { mirror: 3, halfwave: 1 },
    par: 2,
    note: "Every mirror flips circular light between R and L, so the number of bounces matters. In helicity-resolved experiments, physicists count every mirror between the wave plate and the sample.",
  },

  /* ---------------- Chapter 4: Birefringence ---------------- */
  {
    name: "Double Refraction",
    chapter: 4,
    laser: { row: 3, col: 0, facing: "right", polarization: 45 },
    detectors: [{ row: 3, col: 7, need: 0.5 }, { row: 0, col: 3, need: 0.5 }],
    walls: [],
    tray: { pbs: 1 },
    note: "A polarizing beam splitter sends flat light straight on and reflects upright light. Diagonal light is half of each.",
    tutorial: [
      {
        say: "Some crystals, like calcite and quartz, are birefringent: light wiggling one way travels slower than light wiggling the other way. Inside, the wave splits into two parts that drift apart.",
        wave: { input: 45, crystal: { retard: 90 } },
        next: "Next",
      },
      {
        say: "That's how wave plates work! A crystal just thick enough for one part to get a quarter of a wave ahead makes circular light. Half a wave ahead turns the polarization.",
        wave: { input: 45, crystal: { retard: 180 } },
        next: "Next",
      },
      {
        say: "Birefringent crystals can also send the two parts different ways. A polarizing beam splitter (PBS) does just that. Place it on the glowing hole.",
        place: { row: 3, col: 3, type: "pbs" },
      },
      {
        say: "The flat part went straight on and the upright part reflected. Our light is diagonal, so it's half flat and half upright: 50% each.",
        next: "Got it",
      },
    ],
  },
  {
    name: "Even Split",
    chapter: 4,
    laser: { row: 3, col: 0, facing: "right" },
    detectors: [{ row: 3, col: 7, need: 0.5 }, { row: 0, col: 4, need: 0.5 }],
    walls: [],
    fixed: [{ row: 3, col: 4, type: "pbs", angle: 45 }],
    tray: { halfwave: 1, quarterwave: 1 },
    par: 1,
    note: "Flat light all goes straight through a PBS. Make it circular first, and it splits evenly: circular light is half flat and half upright.",
  },
  {
    name: "Optical Switch",
    chapter: 4,
    laser: { row: 3, col: 0, facing: "right" },
    detectors: [{ row: 0, col: 4, need: 1 }],
    walls: [],
    fixed: [{ row: 3, col: 4, type: "pbs", angle: 45 }],
    tray: { halfwave: 1, polarizer: 1 },
    par: 1,
    note: "Turn the polarization and the PBS sends all the light the other way. Labs switch beams like this, without moving a single mirror.",
  },
  {
    name: "Both Upright",
    chapter: 4,
    laser: { row: 6, col: 0, facing: "right", polarization: "none" },
    detectors: [{ row: 6, col: 7, accepts: 90, need: 0.5 }, { row: 0, col: 5, accepts: 90, need: 0.5 }],
    walls: [],
    tray: { pbs: 1, mirror: 2, halfwave: 1 },
    par: 2,
    note: "A PBS splits unpolarized light into two beams with opposite polarizations. A half-wave plate can then turn one to match the other.",
  },
  {
    name: "Seeing Double",
    chapter: 4,
    laser: { row: 3, col: 0, facing: "right", polarization: 45 },
    detectors: [{ row: 3, col: 7, need: 0.5 }, { row: 2, col: 7, need: 0.5 }],
    walls: [],
    tray: { displacer: 1 },
    par: 1,
    note: "Calcite pushes the upright part of the light sideways, so one beam becomes two side by side. That's why writing seen through calcite appears twice.",
  },
  {
    name: "Back Together",
    chapter: 4,
    laser: { row: 3, col: 0, facing: "right", polarization: 45 },
    detectors: [{ row: 3, col: 7, need: 1 }],
    walls: [],
    fixed: [{ row: 3, col: 2, type: "displacer", angle: 45 }],
    tray: { displacer: 1 },
    par: 1,
    note: "A second crystal, turned the other way, pushes the beam back. Pairs of calcite crystals like this are used to split and recombine beams with great precision.",
  },

  /* ---------------- Chapter 5: Colour ---------------- */
  {
    name: "Colours of Light",
    chapter: 5,
    laser: { row: 3, col: 0, facing: "right", color: "white" },
    detectors: [{ row: 3, col: 7, color: "red" }, { row: 7, col: 3, color: "green" }, { row: 0, col: 3, color: "blue" }],
    walls: [],
    tray: { prism: 1 },
    note: "A prism splits white light into its colours. The coloured dot on each detector shows which colour it wants.",
    tutorial: [
      {
        say: "This laser makes white light. White light is really a mix of colours; on this table we use three: red, green and blue.",
        next: "Next",
      },
      {
        say: "Glass bends blue light a little more than red, so a prism fans white light out into its colours. Place the prism on the glowing hole.",
        place: { row: 3, col: 3, type: "prism" },
      },
      {
        say: "The colours split up, but green and blue went the wrong way round. The dot on each detector shows the colour it wants. Tap the prism to turn it over.",
        turn: { row: 3, col: 3, until: 135 },
      },
      {
        say: "Every colour found its detector! Raindrops do the same thing as prisms: that's how rainbows form. Each colour carries a third of the white light.",
        next: "Got it",
      },
    ],
  },
  {
    name: "Rainbow Routing",
    chapter: 5,
    laser: { row: 4, col: 0, facing: "right", color: "white" },
    detectors: [{ row: 4, col: 7, color: "red" }, { row: 0, col: 6, color: "green" }, { row: 7, col: 5, color: "blue" }],
    walls: [],
    tray: { prism: 1, mirror: 3 },
    par: 2,
    note: "Where you put the prism decides where each colour can go. Spectrometers use a prism or a grating this way to measure the colours in light.",
  },
  {
    name: "Pick a Colour",
    chapter: 5,
    laser: { row: 3, col: 0, facing: "right", color: "white" },
    detectors: [{ row: 0, col: 3, color: "green" }, { row: 7, col: 5, color: "blue" }, { row: 3, col: 7, color: "red" }],
    walls: [],
    tray: { "dichroic-green": 1, "dichroic-blue": 1, mirror: 1 },
    par: 2,
    note: "A dichroic mirror reflects one colour and lets the rest through. Microscopes and projectors use them to separate and combine colours.",
  },
  {
    name: "Glow",
    chapter: 5,
    laser: { row: 3, col: 0, facing: "right", color: "blue" },
    detectors: [{ row: 6, col: 2, color: "green", need: 0.25 }],
    walls: [],
    tray: { dye: 1, mirror: 2 },
    par: 1,
    note: "The dye absorbs blue light and glows green in every direction. This is fluorescence: highlighter pens and glow sticks work the same way.",
  },
  {
    name: "Which Dye?",
    chapter: 5,
    laser: { row: 3, col: 0, facing: "right", color: "green" },
    detectors: [{ row: 0, col: 5, color: "red", need: 0.25 }],
    walls: [],
    tray: { dye: 1, "dye-orange": 1, mirror: 1 },
    par: 1,
    note: "You can tell which light will make a dye glow from its colour: it absorbs the colours it doesn't show. The orange dye soaks up green; the yellow one doesn't.",
  },
  {
    name: "White Again",
    chapter: 5,
    laser: { row: 3, col: 0, facing: "right", color: "white" },
    detectors: [{ row: 3, col: 7, color: "white" }],
    walls: [],
    fixed: [{ row: 3, col: 2, type: "prism", angle: 45 }],
    tray: { mirror: 4, "dichroic-green": 1, "dichroic-blue": 1 },
    par: 6,
    note: "Newton did this in 1666: he split sunlight with one prism and put the colours back together, proving white light is a mix of colours, not something pure.",
  },
];
